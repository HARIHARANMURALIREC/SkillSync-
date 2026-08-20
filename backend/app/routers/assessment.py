from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import func
from sqlalchemy.orm import Session
import random
from app.database import get_db
from app.models import User, Assessment, MCQQuestion
from app.schemas import (
    MCQQuestionResponse,
    AssessmentSubmission,
    AssessmentResult,
    SkillInfo,
    AssessmentHistoryEntry,
    RecertResult,
)
from app.auth import get_current_user
from app.streak import get_local_date, record_activity
from app.ai.skill_evaluator import calculate_skill_score, classify_skill_level, generate_assessment_breakdown
from app.ai.gap_analyzer import peek_cached_requirements
from app.freshness import compute_freshness

router = APIRouter(prefix="/api/assessment", tags=["assessment"])

@router.get("/questions/{skill_name}", response_model=list[MCQQuestionResponse])
def get_questions(
    skill_name: str,
    recert: bool = Query(False),
    db: Session = Depends(get_db),
):
    """Get MCQ questions for a skill."""
    questions = db.query(MCQQuestion).filter(MCQQuestion.skill_name == skill_name).all()
    
    if not questions:
        raise HTTPException(status_code=404, detail="No questions found for this skill")

    if recert:
        questions = random.sample(questions, k=min(3, len(questions)))
    
    result = []
    for q in questions:
        options = []
        for idx, option_text in enumerate(q.options):
            options.append({"id": idx, "text": option_text})
        
        result.append(MCQQuestionResponse(
            id=q.id,
            skill_name=q.skill_name,
            question_text=q.question_text,
            options=options,
            difficulty=q.difficulty
        ))
    
    return result

@router.post("/submit", response_model=AssessmentResult)
def submit_assessment(
    submission: AssessmentSubmission,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    local_date: str = Depends(get_local_date),
):
    """Submit assessment answers and get results."""
    questions = db.query(MCQQuestion).filter(MCQQuestion.skill_name == submission.skill_name).all()
    
    if not questions:
        raise HTTPException(status_code=404, detail="No questions found for this skill")
    
    questions_data = []
    for q in questions:
        questions_data.append({
            "id": q.id,
            "correct_answer": q.correct_answer,
            "difficulty": q.difficulty
        })
    
    score = calculate_skill_score(questions_data, submission.answers)
    level = classify_skill_level(score)
    
    breakdown = generate_assessment_breakdown(
        questions_data,
        submission.answers,
        score,
        skill_name=submission.skill_name,
    )
    
    assessment = Assessment(
        user_id=current_user.id,
        skill_name=submission.skill_name,
        score=score,
        level=level,
        answers=submission.answers
    )
    db.add(assessment)
    record_activity(db, current_user.id, local_date)
    db.commit()
    
    return AssessmentResult(
        skill_name=submission.skill_name,
        score=score,
        level=level,
        breakdown=breakdown
    )

@router.get("/skills", response_model=list[SkillInfo])
def get_available_skills(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get skills available for assessment with metadata."""
    counts = dict(
        db.query(MCQQuestion.skill_name, func.count(MCQQuestion.id))
        .group_by(MCQQuestion.skill_name)
        .all()
    )

    recommended_skills: set[str] = set()
    if current_user.career_goal:
        career_requirements = peek_cached_requirements(current_user.career_goal)
        if career_requirements:
            recommended_skills = set(career_requirements.keys())

    skills = [
        SkillInfo(
            name=skill_name,
            question_count=count,
            recommended=skill_name in recommended_skills,
        )
        for skill_name, count in counts.items()
    ]

    if recommended_skills:
        filtered = [s for s in skills if s.recommended]
        if filtered:
            skills = filtered

    skills.sort(key=lambda s: (not s.recommended, s.name))

    user_skills = {}
    for row in db.query(Assessment).filter(Assessment.user_id == current_user.id).all():
        if row.skill_name not in user_skills or row.score > user_skills[row.skill_name]:
            user_skills[row.skill_name] = row.score
    fresh_map = {item["skill_name"]: item for item in compute_freshness(db, current_user.id, user_skills)}
    for skill in skills:
        item = fresh_map.get(skill.name)
        if item:
            skill.freshness = item["status"]
            skill.days_stale = item["days_stale"]

    return skills

@router.get("/history", response_model=list[AssessmentHistoryEntry])
def get_assessment_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get assessment history for the current user."""
    assessments = (
        db.query(Assessment)
        .filter(Assessment.user_id == current_user.id)
        .order_by(Assessment.created_at.asc())
        .all()
    )

    return [
        AssessmentHistoryEntry(
            skill_name=a.skill_name,
            score=a.score,
            level=a.level,
            created_at=a.created_at,
        )
        for a in assessments
    ]


@router.post("/recert", response_model=RecertResult)
def recert_skill(
    submission: AssessmentSubmission,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    local_date: str = Depends(get_local_date),
):
    """Three-question recert. Pass stores the new score; fail drops best score by 0.5."""
    question_ids = list(submission.answers.keys())
    if not question_ids or len(question_ids) > 3:
        raise HTTPException(status_code=400, detail="Recert needs at most 3 answers.")

    questions = (
        db.query(MCQQuestion)
        .filter(
            MCQQuestion.skill_name == submission.skill_name,
            MCQQuestion.id.in_(question_ids),
        )
        .all()
    )
    if len(questions) != len(question_ids):
        raise HTTPException(status_code=400, detail="Invalid recert questions.")

    questions_data = [
        {"id": q.id, "correct_answer": q.correct_answer, "difficulty": q.difficulty}
        for q in questions
    ]
    recert_score = calculate_skill_score(questions_data, submission.answers)
    passed = recert_score >= 6.0

    previous = (
        db.query(Assessment)
        .filter(
            Assessment.user_id == current_user.id,
            Assessment.skill_name == submission.skill_name,
        )
        .order_by(Assessment.score.desc())
        .first()
    )
    previous_best = previous.score if previous else recert_score
    stored = recert_score if passed else round(max(0.0, previous_best - 0.5), 2)
    level = classify_skill_level(stored)
    breakdown = generate_assessment_breakdown(
        questions_data,
        submission.answers,
        recert_score,
        skill_name=submission.skill_name,
    )
    db.add(Assessment(
        user_id=current_user.id,
        skill_name=submission.skill_name,
        score=stored,
        level=level,
        answers=submission.answers,
    ))
    record_activity(db, current_user.id, local_date)
    db.commit()
    return RecertResult(
        skill_name=submission.skill_name,
        score=recert_score,
        stored_score=stored,
        level=level,
        passed=passed,
        breakdown=breakdown,
    )
