from datetime import date, datetime, timedelta, timezone
from typing import Optional

from fastapi import Header
from sqlalchemy.orm import Session

from app.models import UserActivity

EMPTY_STREAK = {"count": 0, "last": None, "dates": []}


def utc_today() -> str:
    return datetime.now(timezone.utc).date().isoformat()


def parse_activity_date(value: Optional[str]) -> str:
    if not value:
        return utc_today()
    raw = value.strip()[:10]
    try:
        parsed = date.fromisoformat(raw)
    except ValueError:
        return utc_today()
    today = date.fromisoformat(utc_today())
    if parsed > today + timedelta(days=1):
        return utc_today()
    return parsed.isoformat()


def get_local_date(x_local_date: Optional[str] = Header(default=None, alias="X-Local-Date")) -> str:
    return parse_activity_date(x_local_date)


def activity_dates(db: Session, user_id: int) -> list[str]:
    rows = (
        db.query(UserActivity.activity_date)
        .filter(UserActivity.user_id == user_id)
        .order_by(UserActivity.activity_date.asc())
        .all()
    )
    return [row[0] for row in rows]


def compute_streak(dates: list[str], today: str) -> dict:
    unique = sorted({d for d in dates if d})
    if not unique:
        return {**EMPTY_STREAK}

    last = unique[-1]
    yesterday = (date.fromisoformat(today) - timedelta(days=1)).isoformat()
    if last not in (today, yesterday):
        return {"count": 0, "last": last, "dates": unique[-60:]}

    count = 1
    cursor = date.fromisoformat(last)
    seen = set(unique)
    while True:
        prev = (cursor - timedelta(days=1)).isoformat()
        if prev not in seen:
            break
        count += 1
        cursor = date.fromisoformat(prev)

    return {"count": count, "last": last, "dates": unique[-60:]}


def record_activity(db: Session, user_id: int, local_date: Optional[str] = None) -> dict:
    day = parse_activity_date(local_date)
    exists = (
        db.query(UserActivity)
        .filter(UserActivity.user_id == user_id, UserActivity.activity_date == day)
        .first()
    )
    if not exists:
        db.add(UserActivity(user_id=user_id, activity_date=day))
        db.flush()
    return get_streak(db, user_id, day)


def get_streak(db: Session, user_id: int, local_date: Optional[str] = None) -> dict:
    today = parse_activity_date(local_date)
    return compute_streak(activity_dates(db, user_id), today)
