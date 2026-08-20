from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User, Assessment, SkillGap, LearningPath, LearningProgress
from app.schemas import DashboardResponse, UserResponse, SkillRadarData, SkillGapResponse, CareerReadinessResponse, StreakResponse, CareerForkResponse, FreshnessItem, WeeklyPlanItem, WeeklyPlanResponse
from app.auth import get_current_user
from app.streak import get_local_date, record_activity
from app.ai.gap_analyzer import calculate_skill_gaps, get_skill_gap_summary, get_career_requirements, compute_career_fork
from app.ai.recommender import calculate_career_readiness
from app.freshness import compute_freshness
from app.ai.weekly_plan import generate_weekly_plan, monday_of
from datetime import date
from app.path_progress import compute_path_completion, path_summary

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])

RESOURCE_LIMIT = 10


@router.get("", response_model=DashboardResponse)
def get_dashboard(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    local_date: str = Depends(get_local_date),
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

    path_completion = compute_path_completion(db, current_user.id)

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

    streak = record_activity(db, current_user.id, local_date)
    career_fork = compute_career_fork(
        user_skills,
        current_user.career_goal,
        current_user.hours_per_week or 10,
    )
    freshness = compute_freshness(db, current_user.id, user_skills)
    stale = [f["skill_name"] for f in freshness if f.get("status") == "stale"]

    weekly_plan_row = None
    if current_user.career_goal or user_skills:
        plan = generate_weekly_plan(
            db,
            current_user,
            user_skills,
            [g.model_dump() for g in skill_gaps] if skill_gaps else [],
            path_summary(db, current_user.id),
            stale,
            monday_of(date.today()),
        )
        weekly_plan_row = WeeklyPlanResponse(
            week_start=plan.week_start,
            focus=plan.focus,
            plan=[WeeklyPlanItem(**item) for item in (plan.plan_items or [])],
            check_in=plan.check_in,
            next_step=plan.next_step,
            generated_at=plan.generated_at,
        )

    db.commit()

    return DashboardResponse(
        user=UserResponse.model_validate(current_user),
        skill_radar=skill_radar,
        skill_gaps=skill_gaps,
        progress_summary=progress_summary,
        career_readiness=career_readiness,
        streak=StreakResponse(**streak),
        career_fork=CareerForkResponse(**career_fork),
        freshness=[FreshnessItem(**item) for item in freshness],
        weekly_plan=weekly_plan_row,
    )
