from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User, Assessment, MCQQuestion
from app.schemas import MCQQuestionResponse, AssessmentSubmission, AssessmentResult
from app.auth import get_current_user
from app.ai.skill_evaluator import calculate_skill_score, classify_skill_level, generate_assessment_breakdown
from app.ai.gap_analyzer import get_career_requirements

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
    # Get questions
    questions = db.query(MCQQuestion).filter(MCQQuestion.skill_name == submission.skill_name).all()
    
    if not questions:
        raise HTTPException(status_code=404, detail="No questions found for this skill")
    
    # Prepare questions data
    questions_data = []
    for q in questions:
        questions_data.append({
            "id": q.id,
            "correct_answer": q.correct_answer,
            "difficulty": q.difficulty
        })
    
    # Calculate score
    score = calculate_skill_score(questions_data, submission.answers)
    level = classify_skill_level(score)
    
    # Generate breakdown
    breakdown = generate_assessment_breakdown(questions_data, submission.answers, score)
    
    # Save assessment
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

@router.get("/skills")
def get_available_skills(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get list of available skills for assessment, filtered by career goal."""
    # Get all skills with questions in database
    all_skills_with_questions = db.query(MCQQuestion.skill_name).distinct().all()
    available_skills = [s[0] for s in all_skills_with_questions]
    
    # If user has a career goal, filter skills based on career requirements
    if current_user.career_goal:
        career_requirements = get_career_requirements(current_user.career_goal)
        required_skills = set(career_requirements.keys())
        
        # Return only skills that are both in career requirements AND have questions available
        filtered_skills = [skill for skill in available_skills if skill in required_skills]
        return filtered_skills
    
    # If no career goal set, return all available skills
    return available_skills

