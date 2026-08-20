from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, ConfigDict
from sqlalchemy.orm import Session

from app.auth import get_current_user
from app.database import get_db
from app.models import LearningPath, LearningProgress, TeachBack, User
from app.schemas import TeachbackResponse, TeachbackStart, TeachbackSubmit
from app.streak import get_local_date, record_activity
from app.ai.ollama_client import chat_json

router = APIRouter(prefix="/api/teachback", tags=["teachback"])

PASS_SCORE = 6.0


class TeachbackScore(BaseModel):
    model_config = ConfigDict(extra="ignore")

    score: float = 0
    miss: str = ""
    feedback: str = ""


def _week_and_resource(db: Session, user_id: int, week_number: int, resource_index: int):
    rows = db.query(LearningPath).filter(
        LearningPath.user_id == user_id,
        LearningPath.week_number == week_number,
    ).all()
    if not rows:
        raise HTTPException(status_code=404, detail="Week not found in learning path.")
    resources = []
    for row in rows:
        resources.extend(row.resources or [])
    if resource_index < 0 or resource_index >= len(resources):
        raise HTTPException(status_code=400, detail="Invalid resource index.")
    resource = resources[resource_index] if isinstance(resources[resource_index], dict) else {}
    skill_name = rows[0].skill_name
    title = resource.get("title") or "this resource"
    return skill_name, title, resource


def _prompt_for(skill_name: str, title: str) -> str:
    return (
        f"In four short sentences, explain “{title}” ({skill_name}) to a junior engineer. "
        "Cover what it is, why it matters for the role, and one mistake beginners make."
    )


def _heuristic_score(answer: str) -> TeachbackScore:
    text = (answer or "").strip()
    words = len(text.split())
    if words < 20:
        return TeachbackScore(
            score=3.0,
            miss="Too thin — name the concept and one concrete example.",
            feedback="Add what it is, why it matters, and a beginner pitfall.",
        )
    if words < 40:
        return TeachbackScore(
            score=5.5,
            miss="Missing a beginner pitfall or a concrete example.",
            feedback="Almost — add one mistake juniors make and you will pass.",
        )
    return TeachbackScore(
        score=7.5,
        miss="",
        feedback="Clear enough to count as retrieval. Resource marked complete.",
    )


def _complete_resource(db: Session, user_id: int, week_number: int, resource_index: int, local_date: str):
    existing = db.query(LearningProgress).filter(
        LearningProgress.user_id == user_id,
        LearningProgress.week_number == week_number,
        LearningProgress.resource_index == resource_index,
    ).first()
    if not existing:
        db.add(LearningProgress(
            user_id=user_id,
            week_number=week_number,
            resource_index=resource_index,
        ))
    record_activity(db, user_id, local_date)


@router.post("/start", response_model=TeachbackResponse)
def start_teachback(
    body: TeachbackStart,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    skill_name, title, _ = _week_and_resource(
        db, current_user.id, body.week_number, body.resource_index
    )
    prompt = _prompt_for(skill_name, title)
    passed = db.query(TeachBack).filter(
        TeachBack.user_id == current_user.id,
        TeachBack.week_number == body.week_number,
        TeachBack.resource_index == body.resource_index,
        TeachBack.passed.is_(True),
    ).first()
    if passed:
        return TeachbackResponse(
            prompt=prompt,
            week_number=body.week_number,
            resource_index=body.resource_index,
            resource_title=title,
            skill_name=skill_name,
            score=passed.score,
            passed=True,
            feedback=passed.feedback,
        )
    return TeachbackResponse(
        prompt=prompt,
        week_number=body.week_number,
        resource_index=body.resource_index,
        resource_title=title,
        skill_name=skill_name,
    )


@router.post("/submit", response_model=TeachbackResponse)
def submit_teachback(
    body: TeachbackSubmit,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    local_date: str = Depends(get_local_date),
):
    skill_name, title, _ = _week_and_resource(
        db, current_user.id, body.week_number, body.resource_index
    )
    prompt = _prompt_for(skill_name, title)
    answer = (body.answer or "").strip()
    if len(answer) < 12:
        raise HTTPException(status_code=400, detail="Write a short explanation before submitting.")

    try:
        result = chat_json(
            system=(
                "Score a junior-level explanation 0-10. Return JSON only: "
                "{\"score\":7.0,\"miss\":\"one missing idea\",\"feedback\":\"one sentence\"}. "
                "Pass is 6 or higher. Be strict if the answer is generic."
            ),
            user=f"Skill: {skill_name}. Resource: {title}. Prompt: {prompt}. Answer: {answer}",
            schema=TeachbackScore,
            timeout=25.0,
            num_predict=180,
            retries=1,
        )
    except Exception:
        result = _heuristic_score(answer)

    passed = float(result.score) >= PASS_SCORE
    row = TeachBack(
        user_id=current_user.id,
        week_number=body.week_number,
        resource_index=body.resource_index,
        prompt=prompt,
        answer=answer,
        score=float(result.score),
        feedback=result.feedback or result.miss,
        passed=passed,
    )
    db.add(row)
    if passed:
        _complete_resource(db, current_user.id, body.week_number, body.resource_index, local_date)
    db.commit()

    return TeachbackResponse(
        prompt=prompt,
        week_number=body.week_number,
        resource_index=body.resource_index,
        resource_title=title,
        skill_name=skill_name,
        score=float(result.score),
        passed=passed,
        feedback=result.feedback,
        miss=None if passed else (result.miss or result.feedback),
    )
