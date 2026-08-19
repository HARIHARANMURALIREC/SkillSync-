from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.auth import get_current_user
from app.database import get_db
from app.models import User
from app.schemas import StreakResponse
from app.streak import get_local_date, get_streak, record_activity

router = APIRouter(prefix="/api/streak", tags=["streak"])


@router.get("", response_model=StreakResponse)
def read_streak(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    local_date: str = Depends(get_local_date),
):
    return StreakResponse(**get_streak(db, current_user.id, local_date))


@router.post("", response_model=StreakResponse)
@router.post("/ping", response_model=StreakResponse)
def ping_streak(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    local_date: str = Depends(get_local_date),
):
    streak = record_activity(db, current_user.id, local_date)
    db.commit()
    return StreakResponse(**streak)
