from datetime import datetime, timezone
from typing import Optional

from sqlalchemy.orm import Session

from app.models import Assessment, LearningPath, TeachBack

AGING_DAYS = 7
STALE_DAYS = 14


def _aware(dt: Optional[datetime]) -> Optional[datetime]:
    if dt is None:
        return None
    if dt.tzinfo is None:
        return dt.replace(tzinfo=timezone.utc)
    return dt


def compute_freshness(db: Session, user_id: int, user_skills: dict) -> list[dict]:
    now = datetime.now(timezone.utc)
    last_touch: dict[str, datetime] = {}

    assessments = db.query(Assessment).filter(Assessment.user_id == user_id).all()
    for row in assessments:
        stamp = _aware(row.created_at)
        if not stamp:
            continue
        prev = last_touch.get(row.skill_name)
        if not prev or stamp > prev:
            last_touch[row.skill_name] = stamp

    passed = (
        db.query(TeachBack, LearningPath)
        .join(
            LearningPath,
            (LearningPath.user_id == TeachBack.user_id)
            & (LearningPath.week_number == TeachBack.week_number),
        )
        .filter(TeachBack.user_id == user_id, TeachBack.passed.is_(True))
        .all()
    )
    for teach, path in passed:
        stamp = _aware(teach.created_at)
        if not stamp:
            continue
        prev = last_touch.get(path.skill_name)
        if not prev or stamp > prev:
            last_touch[path.skill_name] = stamp

    skills = sorted(set(user_skills.keys()) | set(last_touch.keys()))
    items = []
    for skill in skills:
        stamp = last_touch.get(skill)
        if not stamp:
            items.append({
                "skill_name": skill,
                "last_touch": None,
                "status": "stale",
                "days_stale": STALE_DAYS,
            })
            continue
        days = max(0, (now - stamp).days)
        if days >= STALE_DAYS:
            status = "stale"
        elif days >= AGING_DAYS:
            status = "aging"
        else:
            status = "fresh"
        items.append({
            "skill_name": skill,
            "last_touch": stamp.isoformat(),
            "status": status,
            "days_stale": days,
        })
    items.sort(key=lambda item: ({"stale": 0, "aging": 1, "fresh": 2}.get(item["status"], 3), -item["days_stale"]))
    return items
