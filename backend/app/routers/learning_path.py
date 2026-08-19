from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Dict, List, Set, Tuple
from app.database import get_db
from app.models import User, Assessment, LearningPath, LearningProgress
from app.schemas import (
    LearningPathResponse,
    WeeklyLearningPath,
    LearningResource,
    LearningPathAdaptationResponse,
    ProgressToggle,
    LearningProgressResponse,
    ProgressItem,
)
from app.auth import get_current_user
from app.streak import get_local_date, record_activity
from app.ai.gap_analyzer import calculate_skill_gaps, get_career_requirements
from app.ai.learning_path_engine import generate_learning_path, sanitize_week_resources
from app.ai.recommender import adapt_learning_path

router = APIRouter(prefix="/api/learning-path", tags=["learning-path"])

RESOURCE_LIMIT = 10


def _dedupe_resources(resources: list) -> list:
    seen = set()
    deduped = []
    for resource in resources or []:
        if not isinstance(resource, dict) or not resource.get("title"):
            continue
        key = (resource.get("title"), resource.get("url"))
        if key in seen:
            continue
        seen.add(key)
        deduped.append(resource)
    return deduped


def _ensure_week_resources(resources: list, skill_name: str) -> list:
    return sanitize_week_resources(skill_name, resources, limit=min(RESOURCE_LIMIT, 3))


def _group_paths_by_week(learning_paths: list) -> Dict[int, dict]:
    weeks_dict: Dict[int, dict] = {}
    for lp in learning_paths:
        week_num = lp.week_number
        if week_num not in weeks_dict:
            weeks_dict[week_num] = {
                "week_number": week_num,
                "skills": [],
                "resources": [],
                "total_hours": 0.0,
                "status": lp.status,
            }
        weeks_dict[week_num]["skills"].append(lp.skill_name)
        weeks_dict[week_num]["resources"].extend(lp.resources or [])
        weeks_dict[week_num]["total_hours"] += lp.estimated_hours

    for week_num, week_data in weeks_dict.items():
        skill_name = week_data["skills"][0] if week_data["skills"] else "Skill"
        week_data["resources"] = _ensure_week_resources(week_data["resources"], skill_name)

    return weeks_dict


def _get_completed_set(db: Session, user_id: int) -> Set[Tuple[int, int]]:
    rows = db.query(LearningProgress).filter(LearningProgress.user_id == user_id).all()
    return {(r.week_number, r.resource_index) for r in rows}


def _completed_indices_for_week(week_number: int, completed: Set[Tuple[int, int]]) -> List[int]:
    return sorted(idx for w, idx in completed if w == week_number)


def _compute_progress_stats(weeks_dict: Dict[int, dict], completed: Set[Tuple[int, int]]) -> dict:
    total_resources = 0
    resources_completed = 0
    week_status: Dict[int, str] = {}

    for week_num, week_data in weeks_dict.items():
        resource_count = min(len(week_data["resources"]), RESOURCE_LIMIT)
        total_resources += resource_count
        week_completed = sum(
            1 for idx in range(resource_count)
            if (week_num, idx) in completed
        )
        resources_completed += week_completed

        if resource_count == 0:
            week_status[week_num] = week_data.get("status", "pending")
        elif week_completed == 0:
            week_status[week_num] = "pending"
        elif week_completed >= resource_count:
            week_status[week_num] = "completed"
        else:
            week_status[week_num] = "in_progress"

    overall_pct = round((resources_completed / total_resources) * 100, 1) if total_resources else 0.0
    return {
        "week_status": week_status,
        "overall_pct": overall_pct,
        "resources_completed": resources_completed,
        "total_resources": total_resources,
    }


def _build_weekly_paths(weeks_dict: Dict[int, dict], completed: Set[Tuple[int, int]]) -> List[WeeklyLearningPath]:
    weekly_paths = []
    stats = _compute_progress_stats(weeks_dict, completed)

    for week_num in sorted(weeks_dict.keys()):
        week_data = weeks_dict[week_num]
        resources_raw = week_data["resources"][:RESOURCE_LIMIT]
        resources = [
            LearningResource(**r) if isinstance(r, dict) else LearningResource(**r)
            for r in resources_raw
        ]

        weekly_paths.append(WeeklyLearningPath(
            week_number=week_data["week_number"],
            skill_name=week_data["skills"][0] if len(week_data["skills"]) == 1 else "Multiple Skills",
            resources=resources,
            estimated_hours=week_data["total_hours"],
            status=stats["week_status"].get(week_num, week_data.get("status", "pending")),
            explanation=week_data.get("explanation", []) or [],
            completed_resources=_completed_indices_for_week(week_num, completed),
        ))

    return weekly_paths


def _update_week_status_in_db(db: Session, user_id: int, week_number: int, status: str):
    rows = db.query(LearningPath).filter(
        LearningPath.user_id == user_id,
        LearningPath.week_number == week_number,
    ).all()
    for row in rows:
        row.status = status


@router.post("/generate", response_model=LearningPathResponse)
def generate_path(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Generate personalized learning path."""
    if not current_user.career_goal:
        raise HTTPException(status_code=400, detail="Please set your career goal first")

    assessments = db.query(Assessment).filter(Assessment.user_id == current_user.id).all()

    user_skills = {}
    for assessment in assessments:
        if assessment.skill_name not in user_skills:
            user_skills[assessment.skill_name] = assessment.score
        else:
            if assessment.score > user_skills[assessment.skill_name]:
                user_skills[assessment.skill_name] = assessment.score

    gaps = calculate_skill_gaps(user_skills, current_user.career_goal)
    weekly_paths_data = generate_learning_path(gaps, current_user.hours_per_week)

    db.query(LearningPath).filter(LearningPath.user_id == current_user.id).delete()
    db.query(LearningProgress).filter(LearningProgress.user_id == current_user.id).delete()

    weekly_paths = []
    for week_data in weekly_paths_data:
        for skill_name in week_data.get("skills", [week_data["skill_name"]]):
            learning_path = LearningPath(
                user_id=current_user.id,
                skill_name=skill_name,
                week_number=week_data["week_number"],
                resources=week_data["resources"],
                estimated_hours=week_data["estimated_hours"] / len(week_data.get("skills", [1]))
            )
            db.add(learning_path)

        resources = []
        for r in week_data["resources"]:
            if isinstance(r, dict):
                resource = {
                    "title": r.get("title", "Untitled Resource"),
                    "type": r.get("type", "course"),
                    "url": r.get("url"),
                    "estimated_hours": r.get("estimated_hours", 1.0)
                }
                resources.append(LearningResource(**resource))
            else:
                resources.append(r)

        weekly_paths.append(WeeklyLearningPath(
            week_number=week_data["week_number"],
            skill_name=week_data["skill_name"],
            resources=resources,
            estimated_hours=week_data["estimated_hours"],
            status="pending",
            explanation=week_data.get("explanation", []),
            completed_resources=[],
        ))

    db.commit()

    return LearningPathResponse(
        total_weeks=len(weekly_paths),
        weekly_paths=weekly_paths
    )

class ProgressUpdate(BaseModel):
    skill_name: str
    progress_percentage: float

@router.post("/adapt", response_model=LearningPathAdaptationResponse)
def adapt_path(
    progress_updates: list[ProgressUpdate],
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Adapt learning path based on user progress."""
    if not current_user.career_goal:
        raise HTTPException(status_code=400, detail="Please set your career goal first")

    learning_paths = db.query(LearningPath).filter(
        LearningPath.user_id == current_user.id
    ).order_by(LearningPath.week_number).all()

    if not learning_paths:
        raise HTTPException(status_code=404, detail="No learning path found. Please generate one first.")

    progress_data = {update.skill_name: update.progress_percentage for update in progress_updates}

    weeks_dict = _group_paths_by_week(learning_paths)
    current_path = []
    for week_num in sorted(weeks_dict.keys()):
        week_data = weeks_dict[week_num]
        current_path.append({
            "week_number": week_data["week_number"],
            "skill_name": week_data["skills"][0] if len(week_data["skills"]) == 1 else "Multiple Skills",
            "skills": week_data["skills"],
            "resources": week_data["resources"],
            "estimated_hours": week_data["total_hours"],
            "status": week_data["status"]
        })

    adaptation_result = adapt_learning_path(current_path, progress_data, current_user.hours_per_week)

    db.query(LearningPath).filter(LearningPath.user_id == current_user.id).delete()

    adapted_paths = adaptation_result["adapted_path"]
    weekly_paths = []

    for week_data in adapted_paths:
        week_resources = _ensure_week_resources(
            week_data.get("resources", []),
            week_data.get("skill_name") or week_data.get("skills", ["Skill"])[0],
        )
        for skill_name in week_data.get("skills", [week_data.get("skill_name", "")]):
            learning_path = LearningPath(
                user_id=current_user.id,
                skill_name=skill_name,
                week_number=week_data["week_number"],
                resources=week_resources,
                estimated_hours=week_data.get("estimated_hours", 0) / len(week_data.get("skills", [1])),
                status=week_data.get("status", "pending")
            )
            db.add(learning_path)

        resources = [
            LearningResource(**r) if isinstance(r, dict) else r
            for r in week_resources
        ]

        weekly_paths.append(WeeklyLearningPath(
            week_number=week_data["week_number"],
            skill_name=week_data.get("skill_name", ""),
            resources=resources[:RESOURCE_LIMIT],
            estimated_hours=week_data.get("estimated_hours", 0),
            status=week_data.get("status", "pending"),
            is_revised=week_data.get("is_revision", False),
            completed_resources=[],
        ))

    db.commit()

    adapted_response = LearningPathResponse(
        total_weeks=len(weekly_paths),
        weekly_paths=weekly_paths
    )

    return LearningPathAdaptationResponse(
        adapted_path=adapted_response,
        explanation=adaptation_result["changes"]
    )


@router.get("/progress", response_model=LearningProgressResponse)
def get_progress(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get learning path progress for the current user."""
    learning_paths = db.query(LearningPath).filter(
        LearningPath.user_id == current_user.id
    ).order_by(LearningPath.week_number).all()

    if not learning_paths:
        raise HTTPException(status_code=404, detail="No learning path found.")

    weeks_dict = _group_paths_by_week(learning_paths)
    completed = _get_completed_set(db, current_user.id)
    stats = _compute_progress_stats(weeks_dict, completed)

    return LearningProgressResponse(
        completed=[
            ProgressItem(week_number=w, resource_index=idx)
            for w, idx in sorted(completed)
        ],
        week_status=stats["week_status"],
        overall_pct=stats["overall_pct"],
        resources_completed=stats["resources_completed"],
        total_resources=stats["total_resources"],
    )


@router.post("/progress", response_model=LearningProgressResponse)
def toggle_progress(
    toggle: ProgressToggle,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    local_date: str = Depends(get_local_date),
):
    """Toggle completion of a learning resource."""
    learning_paths = db.query(LearningPath).filter(
        LearningPath.user_id == current_user.id,
        LearningPath.week_number == toggle.week_number,
    ).all()

    if not learning_paths:
        raise HTTPException(status_code=404, detail="Week not found in learning path.")

    weeks_dict = _group_paths_by_week(
        db.query(LearningPath).filter(LearningPath.user_id == current_user.id).all()
    )
    week_data = weeks_dict.get(toggle.week_number)
    if not week_data:
        raise HTTPException(status_code=404, detail="Week not found.")

    resource_count = min(len(week_data["resources"]), RESOURCE_LIMIT)
    if toggle.resource_index < 0 or toggle.resource_index >= resource_count:
        raise HTTPException(status_code=400, detail="Invalid resource index.")

    existing = db.query(LearningProgress).filter(
        LearningProgress.user_id == current_user.id,
        LearningProgress.week_number == toggle.week_number,
        LearningProgress.resource_index == toggle.resource_index,
    ).first()

    if toggle.completed:
        if not existing:
            db.add(LearningProgress(
                user_id=current_user.id,
                week_number=toggle.week_number,
                resource_index=toggle.resource_index,
            ))
        record_activity(db, current_user.id, local_date)
    else:
        if existing:
            db.delete(existing)

    completed = _get_completed_set(db, current_user.id)
    db.flush()
    completed = _get_completed_set(db, current_user.id)
    stats = _compute_progress_stats(weeks_dict, completed)

    for week_num, status in stats["week_status"].items():
        _update_week_status_in_db(db, current_user.id, week_num, status)

    db.commit()

    completed = _get_completed_set(db, current_user.id)
    stats = _compute_progress_stats(weeks_dict, completed)

    return LearningProgressResponse(
        completed=[
            ProgressItem(week_number=w, resource_index=idx)
            for w, idx in sorted(completed)
        ],
        week_status=stats["week_status"],
        overall_pct=stats["overall_pct"],
        resources_completed=stats["resources_completed"],
        total_resources=stats["total_resources"],
    )


@router.get("", response_model=LearningPathResponse)
def get_learning_path(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get current user's learning path."""
    learning_paths = db.query(LearningPath).filter(
        LearningPath.user_id == current_user.id
    ).order_by(LearningPath.week_number).all()

    if not learning_paths:
        raise HTTPException(status_code=404, detail="No learning path found. Please generate one first.")

    weeks_dict = _group_paths_by_week(learning_paths)
    completed = _get_completed_set(db, current_user.id)
    weekly_paths = _build_weekly_paths(weeks_dict, completed)

    return LearningPathResponse(
        total_weeks=len(weekly_paths),
        weekly_paths=weekly_paths
    )
