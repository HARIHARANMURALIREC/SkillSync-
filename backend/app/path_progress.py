from sqlalchemy.orm import Session

from app.models import LearningPath, LearningProgress

RESOURCE_LIMIT = 10


def compute_path_completion(db: Session, user_id: int) -> dict:
    learning_paths = db.query(LearningPath).filter(LearningPath.user_id == user_id).all()
    if not learning_paths:
        return {
            "path_completion_pct": 0.0,
            "resources_completed": 0,
            "total_resources": 0,
        }

    weeks_dict: dict = {}
    for lp in learning_paths:
        week_num = lp.week_number
        if week_num not in weeks_dict:
            weeks_dict[week_num] = {"resources": []}
        weeks_dict[week_num]["resources"].extend(lp.resources or [])

    completed_rows = db.query(LearningProgress).filter(LearningProgress.user_id == user_id).all()
    completed = {(r.week_number, r.resource_index) for r in completed_rows}

    total_resources = 0
    resources_completed = 0
    for week_num, week_data in weeks_dict.items():
        resource_count = min(len(week_data["resources"]), RESOURCE_LIMIT)
        total_resources += resource_count
        resources_completed += sum(
            1 for idx in range(resource_count) if (week_num, idx) in completed
        )

    overall_pct = round((resources_completed / total_resources) * 100, 1) if total_resources else 0.0
    return {
        "path_completion_pct": overall_pct,
        "resources_completed": resources_completed,
        "total_resources": total_resources,
    }


def path_summary(db: Session, user_id: int) -> dict:
    """Compact path stats for coach and weekly plan context."""
    result = compute_path_completion(db, user_id)
    return {
        "resources_completed": result["resources_completed"],
        "total_resources": result["total_resources"],
        "overall_pct": result["path_completion_pct"],
    }
