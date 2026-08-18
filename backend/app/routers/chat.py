from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User, Assessment, LearningPath, LearningProgress
from app.schemas import ChatRequest, ChatResponse
from app.auth import get_current_user
from app.ai.gap_analyzer import calculate_skill_gaps
from app.ai.coach import chat_with_coach

router = APIRouter(prefix="/api/chat", tags=["chat"])

RESOURCE_LIMIT = 10


def _path_summary(db: Session, user_id: int) -> dict:
    learning_paths = db.query(LearningPath).filter(LearningPath.user_id == user_id).all()
    if not learning_paths:
        return {"resources_completed": 0, "total_resources": 0, "overall_pct": 0.0}

    weeks: dict = {}
    for lp in learning_paths:
        if lp.week_number not in weeks:
            weeks[lp.week_number] = []
        weeks[lp.week_number].extend(lp.resources or [])

    completed = {
        (r.week_number, r.resource_index)
        for r in db.query(LearningProgress).filter(LearningProgress.user_id == user_id).all()
    }

    total = sum(min(len(r), RESOURCE_LIMIT) for r in weeks.values())
    done = sum(
        sum(1 for idx in range(min(len(resources), RESOURCE_LIMIT)) if (week_num, idx) in completed)
        for week_num, resources in weeks.items()
    )
    pct = round((done / total) * 100, 1) if total else 0.0
    return {"resources_completed": done, "total_resources": total, "overall_pct": pct}


@router.post("", response_model=ChatResponse)
def chat(
    request: ChatRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
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

    path_summary = _path_summary(db, current_user.id)
    messages = [m.model_dump() for m in request.messages]

    reply = chat_with_coach(
        user=current_user,
        user_skills=user_skills,
        skill_gaps=skill_gaps,
        messages=messages,
        path_summary=path_summary,
    )

    return ChatResponse(reply=reply)
