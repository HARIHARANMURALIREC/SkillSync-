"""Coach weekly plan and persisted chat history."""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.auth import get_current_user
from app.database import get_db
from app.models import Assessment, CoachMessage, User
from app.schemas import ChatMessage, CoachHistoryResponse, WeeklyPlanItem, WeeklyPlanResponse
from app.ai.gap_analyzer import calculate_skill_gaps
from app.ai.weekly_plan import generate_weekly_plan, monday_of
from app.path_progress import path_summary
from app.freshness import compute_freshness
from datetime import date

router = APIRouter(prefix="/api/coach", tags=["coach"])


def _user_skills(db: Session, user_id: int) -> dict:
    assessments = db.query(Assessment).filter(Assessment.user_id == user_id).all()
    skills: dict = {}
    for row in assessments:
        if row.skill_name not in skills or row.score > skills[row.skill_name]:
            skills[row.skill_name] = row.score
    return skills


@router.get("/weekly-plan", response_model=WeeklyPlanResponse)
def get_weekly_plan(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    user_skills = _user_skills(db, current_user.id)
    skill_gaps = []
    if current_user.career_goal:
        skill_gaps = calculate_skill_gaps(user_skills, current_user.career_goal)
    freshness = compute_freshness(db, current_user.id, user_skills)
    stale = [f["skill_name"] for f in freshness if f.get("status") == "stale"]
    path_data = path_summary(db, current_user.id)

    plan = generate_weekly_plan(
        db,
        current_user,
        user_skills,
        skill_gaps,
        path_data,
        stale,
        monday_of(date.today()),
    )
    db.commit()
    db.refresh(plan)

    items = [WeeklyPlanItem(**item) for item in (plan.plan_items or [])]
    return WeeklyPlanResponse(
        week_start=plan.week_start,
        focus=plan.focus,
        plan=items,
        check_in=plan.check_in,
        next_step=plan.next_step,
        generated_at=plan.generated_at,
    )


@router.get("/history", response_model=CoachHistoryResponse)
def get_coach_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    rows = (
        db.query(CoachMessage)
        .filter(CoachMessage.user_id == current_user.id)
        .order_by(CoachMessage.created_at.asc())
        .limit(40)
        .all()
    )
    return CoachHistoryResponse(
        messages=[ChatMessage(role=r.role, content=r.content) for r in rows]
    )


@router.delete("/history")
def clear_coach_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    db.query(CoachMessage).filter(CoachMessage.user_id == current_user.id).delete()
    db.commit()
    return {"ok": True}
