from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Dict, List
from app.database import get_db
from app.models import User, Assessment, LearningPath, SkillGap
from app.schemas import LearningPathResponse, WeeklyLearningPath, LearningResource, LearningPathAdaptationResponse
from app.auth import get_current_user
from app.ai.gap_analyzer import calculate_skill_gaps, get_career_requirements
from app.ai.learning_path_engine import generate_learning_path
from app.ai.recommender import adapt_learning_path

router = APIRouter(prefix="/api/learning-path", tags=["learning-path"])

@router.post("/generate", response_model=LearningPathResponse)
def generate_path(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Generate personalized learning path."""
    if not current_user.career_goal:
        raise HTTPException(status_code=400, detail="Please set your career goal first")
    
    # Get user assessments
    assessments = db.query(Assessment).filter(Assessment.user_id == current_user.id).all()
    
    # Build user skills dict
    user_skills = {}
    for assessment in assessments:
        if assessment.skill_name not in user_skills:
            user_skills[assessment.skill_name] = assessment.score
        else:
            if assessment.score > user_skills[assessment.skill_name]:
                user_skills[assessment.skill_name] = assessment.score
    
    # Calculate skill gaps
    gaps = calculate_skill_gaps(user_skills, current_user.career_goal)
    
    # Generate learning path
    weekly_paths_data = generate_learning_path(gaps, current_user.hours_per_week)
    
    # Clear existing learning paths
    db.query(LearningPath).filter(LearningPath.user_id == current_user.id).delete()
    
    # Save new learning paths
    weekly_paths = []
    for week_data in weekly_paths_data:
        for skill_name in week_data.get("skills", [week_data["skill_name"]]):
            learning_path = LearningPath(
                user_id=current_user.id,
                skill_name=skill_name,
                week_number=week_data["week_number"],
                resources=week_data["resources"],
                estimated_hours=week_data["estimated_hours"] / len(week_data.get("skills", [1]))
            )
            db.add(learning_path)
        
        # Convert resources - ensure they have all required fields
        resources = []
        for r in week_data["resources"]:
            if isinstance(r, dict):
                # Ensure all required fields are present
                resource = {
                    "title": r.get("title", "Untitled Resource"),
                    "type": r.get("type", "course"),
                    "url": r.get("url"),
                    "estimated_hours": r.get("estimated_hours", 1.0)
                }
                resources.append(LearningResource(**resource))
            else:
                resources.append(r)
        
        weekly_paths.append(WeeklyLearningPath(
            week_number=week_data["week_number"],
            skill_name=week_data["skill_name"],
            resources=resources,
            estimated_hours=week_data["estimated_hours"],
            status="pending",
            explanation=week_data.get("explanation", [])
        ))
    
    db.commit()
    
    return LearningPathResponse(
        total_weeks=len(weekly_paths),
        weekly_paths=weekly_paths
    )

class ProgressUpdate(BaseModel):
    skill_name: str
    progress_percentage: float  # 0-100

@router.post("/adapt", response_model=LearningPathAdaptationResponse)
def adapt_path(
    progress_updates: list[ProgressUpdate],
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Adapt learning path based on user progress."""
    if not current_user.career_goal:
        raise HTTPException(status_code=400, detail="Please set your career goal first")
    
    # Get current learning path
    learning_paths = db.query(LearningPath).filter(
        LearningPath.user_id == current_user.id
    ).order_by(LearningPath.week_number).all()
    
    if not learning_paths:
        raise HTTPException(status_code=404, detail="No learning path found. Please generate one first.")
    
    # Convert progress updates to dict
    progress_data = {update.skill_name: update.progress_percentage for update in progress_updates}
    
    # Group current path by week
    weeks_dict = {}
    for lp in learning_paths:
        week_num = lp.week_number
        if week_num not in weeks_dict:
            weeks_dict[week_num] = {
                "week_number": week_num,
                "skills": [],
                "resources": [],
                "total_hours": 0.0,
                "status": lp.status
            }
        weeks_dict[week_num]["skills"].append(lp.skill_name)
        weeks_dict[week_num]["resources"].extend(lp.resources or [])
        weeks_dict[week_num]["total_hours"] += lp.estimated_hours
    
    current_path = []
    for week_num in sorted(weeks_dict.keys()):
        week_data = weeks_dict[week_num]
        current_path.append({
            "week_number": week_data["week_number"],
            "skill_name": week_data["skills"][0] if len(week_data["skills"]) == 1 else "Multiple Skills",
            "skills": week_data["skills"],
            "resources": week_data["resources"],
            "estimated_hours": week_data["total_hours"],
            "status": week_data["status"]
        })
    
    # Adapt the path
    adaptation_result = adapt_learning_path(current_path, progress_data, current_user.hours_per_week)
    
    # Save adapted path
    db.query(LearningPath).filter(LearningPath.user_id == current_user.id).delete()
    
    adapted_paths = adaptation_result["adapted_path"]
    weekly_paths = []
    
    for week_data in adapted_paths:
        for skill_name in week_data.get("skills", [week_data.get("skill_name", "")]):
            learning_path = LearningPath(
                user_id=current_user.id,
                skill_name=skill_name,
                week_number=week_data["week_number"],
                resources=week_data.get("resources", []),
                estimated_hours=week_data.get("estimated_hours", 0) / len(week_data.get("skills", [1])),
                status=week_data.get("status", "pending")
            )
            db.add(learning_path)
        
        # Convert resources
        resources = []
        for r in week_data.get("resources", []):
            if isinstance(r, dict):
                resource = {
                    "title": r.get("title", "Untitled Resource"),
                    "type": r.get("type", "course"),
                    "url": r.get("url"),
                    "estimated_hours": r.get("estimated_hours", 1.0)
                }
                resources.append(LearningResource(**resource))
            else:
                resources.append(r)
        
        weekly_paths.append(WeeklyLearningPath(
            week_number=week_data["week_number"],
            skill_name=week_data.get("skill_name", ""),
            resources=resources[:10],
            estimated_hours=week_data.get("estimated_hours", 0),
            status=week_data.get("status", "pending"),
            is_revised=week_data.get("is_revision", False)
        ))
    
    db.commit()
    
    adapted_response = LearningPathResponse(
        total_weeks=len(weekly_paths),
        weekly_paths=weekly_paths
    )
    
    return LearningPathAdaptationResponse(
        adapted_path=adapted_response,
        explanation=adaptation_result["changes"]
    )

@router.get("", response_model=LearningPathResponse)
def get_learning_path(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get current user's learning path."""
    learning_paths = db.query(LearningPath).filter(
        LearningPath.user_id == current_user.id
    ).order_by(LearningPath.week_number).all()
    
    if not learning_paths:
        raise HTTPException(status_code=404, detail="No learning path found. Please generate one first.")
    
    # Group by week
    weeks_dict = {}
    for lp in learning_paths:
        week_num = lp.week_number
        if week_num not in weeks_dict:
            weeks_dict[week_num] = {
                "week_number": week_num,
                "skills": [],
                "resources": [],
                "total_hours": 0.0,
                "status": lp.status
            }
        
        weeks_dict[week_num]["skills"].append(lp.skill_name)
        weeks_dict[week_num]["resources"].extend(lp.resources or [])
        weeks_dict[week_num]["total_hours"] += lp.estimated_hours
    
    weekly_paths = []
    for week_num in sorted(weeks_dict.keys()):
        week_data = weeks_dict[week_num]
        # Convert resource dicts to LearningResource objects
        resources = [LearningResource(**r) if isinstance(r, dict) else LearningResource(**r) for r in week_data["resources"]]
        
        # Try to get explanation from week_data, otherwise default to empty list
        week_explanation = week_data.get("explanation", [])
        if not week_explanation:
            week_explanation = []
        
        weekly_paths.append(WeeklyLearningPath(
            week_number=week_data["week_number"],
            skill_name=week_data["skills"][0] if len(week_data["skills"]) == 1 else "Multiple Skills",
            resources=resources[:10],  # Limit resources per week
            estimated_hours=week_data["total_hours"],
            status=week_data["status"],
            explanation=week_explanation
        ))
    
    return LearningPathResponse(
        total_weeks=len(weekly_paths),
        weekly_paths=weekly_paths
    )

