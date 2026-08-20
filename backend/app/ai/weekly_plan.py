"""Generate and cache a structured weekly learning focus plan."""

from datetime import date, timedelta
from typing import Dict, List, Optional

from sqlalchemy.orm import Session

from app.ai.coach import build_coach_context
from app.ai.gap_analyzer import calculate_skill_gaps
from app.ai.ollama_client import chat_json
from app.schemas import WeeklyPlanLLMResult
from app.models import User, WeeklyPlan


def monday_of(d: date) -> str:
    start = d - timedelta(days=d.weekday())
    return start.isoformat()


def _heuristic_plan(user: User, skill_gaps: List[dict], stale_skills: List[str]) -> dict:
    focus_skill = stale_skills[0] if stale_skills else None
    if not focus_skill and skill_gaps:
        focus_skill = skill_gaps[0]["skill_name"]
    if not focus_skill:
        focus_skill = "your career goal setup"

    hours = max(2, min(8, (user.hours_per_week or 10) // 2))
    plan = []
    for gap in skill_gaps[:3]:
        plan.append({
            "skill": gap["skill_name"],
            "hours": float(hours),
            "action": f"Close the gap from {gap['current_level']:.1f} toward {gap['target_level']:.1f}",
        })
    if not plan:
        plan = [{"skill": "Profile", "hours": 1.0, "action": "Set a career goal and take a first assessment"}]

    return {
        "focus": f"This week, prioritize {focus_skill} and keep momentum on your learning path.",
        "plan": plan,
        "check_in": "Complete one assessment or one teach-back by mid-week.",
        "next": "Reassess stale skills and adapt your path if progress stalls.",
    }


def generate_weekly_plan(
    db: Session,
    user: User,
    user_skills: Dict[str, float],
    skill_gaps: List[dict],
    path_summary: Optional[dict],
    stale_skills: List[str],
    week_start: Optional[str] = None,
) -> WeeklyPlan:
    ws = week_start or monday_of(date.today())
    existing = (
        db.query(WeeklyPlan)
        .filter(WeeklyPlan.user_id == user.id, WeeklyPlan.week_start == ws)
        .first()
    )
    if existing:
        return existing

    context = build_coach_context(user, user_skills, skill_gaps, path_summary)
    if stale_skills:
        context += f"\nStale skills needing recert: {', '.join(stale_skills[:5])}"

    system = (
        "Return JSON only with keys: focus (string), plan (array of {skill, hours, action}), "
        "check_in (string), next (string). Use only skills from context. Max 3 plan items."
    )
    payload = None
    try:
        result = chat_json(
            system=system,
            user=context,
            schema=WeeklyPlanLLMResult,
            timeout=25.0,
            num_predict=400,
            retries=1,
        )
        payload = {
            "focus": result.focus,
            "plan": [item.model_dump() for item in result.plan],
            "check_in": result.check_in,
            "next": result.next,
        }
    except Exception:
        payload = None

    if not payload or not isinstance(payload, dict):
        payload = _heuristic_plan(user, skill_gaps, stale_skills)

    plan_items = payload.get("plan") or []
    if not isinstance(plan_items, list):
        plan_items = []

    row = WeeklyPlan(
        user_id=user.id,
        week_start=ws,
        focus=str(payload.get("focus") or _heuristic_plan(user, skill_gaps, stale_skills)["focus"]),
        plan_items=plan_items[:3],
        check_in=str(payload.get("check_in") or "Complete one learning resource with teach-back."),
        next_step=str(payload.get("next") or "Review gaps and schedule a recert if any skill is stale."),
    )
    db.add(row)
    db.flush()
    return row


def weekly_plan_to_dict(plan: WeeklyPlan) -> dict:
    items = plan.plan_items or []
    return {
        "week_start": plan.week_start,
        "focus": plan.focus,
        "plan": items,
        "check_in": plan.check_in,
        "next_step": plan.next_step,
        "generated_at": plan.generated_at.isoformat() if plan.generated_at else None,
    }
