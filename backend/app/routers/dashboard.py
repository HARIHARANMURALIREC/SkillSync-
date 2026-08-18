from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User, Assessment, SkillGap, LearningPath, LearningProgress
from app.schemas import DashboardResponse, UserResponse, SkillRadarData, SkillGapResponse, CareerReadinessResponse
from app.auth import get_current_user
from app.ai.gap_analyzer import calculate_skill_gaps, get_skill_gap_summary, get_career_requirements
from app.ai.recommender import calculate_career_readiness

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])

RESOURCE_LIMIT = 10


def _compute_path_completion(db: Session, user_id: int) -> dict:
    learning_paths = db.query(LearningPath).filter(LearningPath.user_id == user_id).all()
    if not learning_paths:
        return {
            "path_completion_pct": 0.0,
            "resources_completed": 0,
            "total_resources": 0,
        }

    weeks_dict: dict = {}
    for lp in learning_paths:
        week_num = lp.week_number
        if week_num not in weeks_dict:
            weeks_dict[week_num] = {"resources": []}
        weeks_dict[week_num]["resources"].extend(lp.resources or [])

    completed_rows = db.query(LearningProgress).filter(LearningProgress.user_id == user_id).all()
    completed = {(r.week_number, r.resource_index) for r in completed_rows}

    total_resources = 0
    resources_completed = 0
    for week_num, week_data in weeks_dict.items():
        resource_count = min(len(week_data["resources"]), RESOURCE_LIMIT)
        total_resources += resource_count
        resources_completed += sum(
            1 for idx in range(resource_count) if (week_num, idx) in completed
        )

    overall_pct = round((resources_completed / total_resources) * 100, 1) if total_resources else 0.0
    return {
        "path_completion_pct": overall_pct,
        "resources_completed": resources_completed,
        "total_resources": total_resources,
    }


@router.get("", response_model=DashboardResponse)
def get_dashboard(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get dashboard data for current user."""
    assessments = db.query(Assessment).filter(Assessment.user_id == current_user.id).all()

    user_skills = {}
    for assessment in assessments:
        if assessment.skill_name not in user_skills:
            user_skills[assessment.skill_name] = assessment.score
        else:
            if assessment.score > user_skills[assessment.skill_name]:
                user_skills[assessment.skill_name] = assessment.score

    skill_gaps = []
    if current_user.career_goal:
        gaps = calculate_skill_gaps(user_skills, current_user.career_goal)

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

    skill_radar = [
        SkillRadarData(skill_name=skill, level=level)
        for skill, level in user_skills.items()
    ]

    path_completion = _compute_path_completion(db, current_user.id)

    progress_summary = {
        "total_assessments": len(assessments),
        "skills_assessed": len(user_skills),
        "gap_summary": get_skill_gap_summary([g.model_dump() for g in skill_gaps]) if skill_gaps else {},
        "path_completion_pct": path_completion["path_completion_pct"],
        "resources_completed": path_completion["resources_completed"],
        "total_resources": path_completion["total_resources"],
    }

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
