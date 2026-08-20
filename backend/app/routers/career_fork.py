from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.auth import get_current_user
from app.database import get_db
from app.models import Assessment, User
from app.schemas import CareerForkResponse
from app.ai.gap_analyzer import compute_career_fork

router = APIRouter(prefix="/api/career-fork", tags=["career-fork"])


def _user_skills(db: Session, user_id: int) -> dict:
    skills = {}
    for row in db.query(Assessment).filter(Assessment.user_id == user_id).all():
        if row.skill_name not in skills or row.score > skills[row.skill_name]:
            skills[row.skill_name] = row.score
    return skills


@router.get("", response_model=CareerForkResponse)
def get_career_fork(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    skills = _user_skills(db, current_user.id)
    return CareerForkResponse(**compute_career_fork(
        skills,
        current_user.career_goal,
        current_user.hours_per_week or 10,
    ))
