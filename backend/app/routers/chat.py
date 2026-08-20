from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User, Assessment, CoachMessage, WeeklyPlan
from app.path_progress import path_summary
from app.schemas import ChatRequest, ChatResponse
from app.auth import get_current_user
from app.streak import get_local_date, record_activity
from app.ai.gap_analyzer import calculate_skill_gaps
from app.ai.coach import chat_with_coach
from app.ai.weekly_plan import generate_weekly_plan, monday_of
from app.freshness import compute_freshness
from datetime import date

router = APIRouter(prefix="/api/chat", tags=["chat"])


def _load_db_history(db: Session, user_id: int, limit: int = 20) -> list[dict]:
    rows = (
        db.query(CoachMessage)
        .filter(CoachMessage.user_id == user_id)
        .order_by(CoachMessage.created_at.desc())
        .limit(limit)
        .all()
    )
    return [{"role": r.role, "content": r.content} for r in reversed(rows)]


def _weekly_plan_snippet(db: Session, user: User) -> str | None:
    ws = monday_of(date.today())
    row = (
        db.query(WeeklyPlan)
        .filter(WeeklyPlan.user_id == user.id, WeeklyPlan.week_start == ws)
        .first()
    )
    if not row:
        return None
    lines = [f"Weekly focus: {row.focus}"]
    for item in row.plan_items or []:
        lines.append(f"  - {item.get('skill')} ({item.get('hours')}h): {item.get('action')}")
    lines.append(f"Check-in: {row.check_in}")
    return "\n".join(lines)


@router.post("", response_model=ChatResponse)
def chat(
    request: ChatRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    local_date: str = Depends(get_local_date),
):
    """Chat with the AI career coach."""
    assessments = db.query(Assessment).filter(Assessment.user_id == current_user.id).all()

    user_skills: dict = {}
    for assessment in assessments:
        if assessment.skill_name not in user_skills:
            user_skills[assessment.skill_name] = assessment.score
        elif assessment.score > user_skills[assessment.skill_name]:
            user_skills[assessment.skill_name] = assessment.score

    skill_gaps = []
    if current_user.career_goal:
        skill_gaps = calculate_skill_gaps(user_skills, current_user.career_goal)

    path_summary_data = path_summary(db, current_user.id)
    messages = [m.model_dump() for m in request.messages]
    db_history = _load_db_history(db, current_user.id)
    plan_snippet = _weekly_plan_snippet(db, current_user)

    reply = chat_with_coach(
        user=current_user,
        user_skills=user_skills,
        skill_gaps=skill_gaps,
        messages=messages,
        path_summary=path_summary_data,
        db_history=db_history,
        weekly_plan_snippet=plan_snippet,
    )

    last_user = messages[-1] if messages else None
    if last_user and last_user.get("role") == "user":
        db.add(CoachMessage(user_id=current_user.id, role="user", content=last_user["content"]))
    db.add(CoachMessage(user_id=current_user.id, role="assistant", content=reply))

    record_activity(db, current_user.id, local_date)
    db.commit()

    return ChatResponse(reply=reply)
