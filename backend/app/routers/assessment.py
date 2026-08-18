from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User, Assessment, MCQQuestion
from app.schemas import (
    MCQQuestionResponse,
    AssessmentSubmission,
    AssessmentResult,
    SkillInfo,
    AssessmentHistoryEntry,
)
from app.auth import get_current_user
from app.ai.skill_evaluator import calculate_skill_score, classify_skill_level, generate_assessment_breakdown
from app.ai.gap_analyzer import peek_cached_requirements

router = APIRouter(prefix="/api/assessment", tags=["assessment"])

@router.get("/questions/{skill_name}", response_model=list[MCQQuestionResponse])
def get_questions(skill_name: str, db: Session = Depends(get_db)):
    """Get MCQ questions for a skill."""
    questions = db.query(MCQQuestion).filter(MCQQuestion.skill_name == skill_name).all()
    
    if not questions:
        raise HTTPException(status_code=404, detail="No questions found for this skill")
    
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
    db: Session = Depends(get_db)
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
