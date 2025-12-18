from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User, Assessment, SkillGap
from app.schemas import DashboardResponse, UserResponse, SkillRadarData, SkillGapResponse, CareerReadinessResponse
from app.auth import get_current_user
from app.ai.gap_analyzer import calculate_skill_gaps, get_skill_gap_summary, get_career_requirements
from app.ai.recommender import calculate_career_readiness

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])

@router.get("", response_model=DashboardResponse)
def get_dashboard(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get dashboard data for current user."""
    # Get user assessments
    assessments = db.query(Assessment).filter(Assessment.user_id == current_user.id).all()
    
    # Build user skills dict
    user_skills = {}
    for assessment in assessments:
        # Use latest assessment for each skill
        if assessment.skill_name not in user_skills:
            user_skills[assessment.skill_name] = assessment.score
        else:
            # Keep highest score
            if assessment.score > user_skills[assessment.skill_name]:
                user_skills[assessment.skill_name] = assessment.score
    
    # Calculate skill gaps
    skill_gaps = []
    if current_user.career_goal:
        gaps = calculate_skill_gaps(user_skills, current_user.career_goal)
        
        # Save/update skill gaps in database
        for gap in gaps:
            existing_gap = db.query(SkillGap).filter(
                SkillGap.user_id == current_user.id,
                SkillGap.skill_name == gap["skill_name"]
            ).first()
            
            if existing_gap:
                existing_gap.current_level = gap["current_level"]
                existing_gap.target_level = gap["target_level"]
                existing_gap.gap = gap["gap"]
                existing_gap.priority = gap["priority"]
            else:
                new_gap = SkillGap(
                    user_id=current_user.id,
                    skill_name=gap["skill_name"],
                    current_level=gap["current_level"],
                    target_level=gap["target_level"],
                    gap=gap["gap"],
                    priority=gap["priority"]
                )
                db.add(new_gap)
        
        db.commit()
        
        skill_gaps = [SkillGapResponse(**gap) for gap in gaps]
    
    # Build skill radar data (all assessed skills)
    skill_radar = [SkillRadarData(skill_name=skill, level=level) 
                   for skill, level in user_skills.items()]
    
    # Progress summary
    progress_summary = {
        "total_assessments": len(assessments),
        "skills_assessed": len(user_skills),
        "gap_summary": get_skill_gap_summary([g.model_dump() for g in skill_gaps]) if skill_gaps else {}
    }
    
    # Calculate career readiness
    career_readiness = None
    if current_user.career_goal:
        requirements = get_career_requirements(current_user.career_goal)
        readiness_data = calculate_career_readiness(user_skills, requirements)
        career_readiness = CareerReadinessResponse(**readiness_data)
    
    return DashboardResponse(
        user=UserResponse.model_validate(current_user),
        skill_radar=skill_radar,
        skill_gaps=skill_gaps,
        progress_summary=progress_summary,
        career_readiness=career_readiness
    )

