"""Build a shareable readiness report snapshot from user progress data."""

from datetime import datetime, timezone

from sqlalchemy.orm import Session

from app.models import Assessment, TeachBack, User
from app.ai.gap_analyzer import calculate_skill_gaps, compute_career_fork
from app.ai.recommender import calculate_career_readiness
from app.ai.gap_analyzer import get_career_requirements
from app.freshness import compute_freshness
from app.streak import get_streak
from app.path_progress import compute_path_completion


def _score_level(score: float) -> str:
    if score >= 7.5:
        return "Advanced"
    if score >= 4.5:
        return "Intermediate"
    return "Beginner"


def build_readiness_snapshot(db: Session, user: User, local_date: str | None = None) -> dict:
    assessments = db.query(Assessment).filter(Assessment.user_id == user.id).all()

    user_skills: dict[str, float] = {}
    for row in assessments:
        if row.skill_name not in user_skills or row.score > user_skills[row.skill_name]:
            user_skills[row.skill_name] = row.score

    gaps = []
    if user.career_goal:
        gaps = calculate_skill_gaps(user_skills, user.career_goal)

    high_gaps = sorted(
        [g for g in gaps if g.get("priority") == "High"],
        key=lambda g: g.get("gap", 0),
        reverse=True,
    )[:3]
    if len(high_gaps) < 3:
        rest = sorted(gaps, key=lambda g: g.get("gap", 0), reverse=True)
        seen = {g["skill_name"] for g in high_gaps}
        for g in rest:
            if g["skill_name"] not in seen:
                high_gaps.append(g)
                seen.add(g["skill_name"])
            if len(high_gaps) >= 3:
                break

    readiness_score = 0.0
    completed_skills = 0
    total_skills = 0
    if user.career_goal:
        req = get_career_requirements(user.career_goal)
        ready = calculate_career_readiness(user_skills, req)
        readiness_score = ready.get("score", 0)
        completed_skills = ready.get("completed_skills", 0)
        total_skills = ready.get("total_skills", 0)

    path = compute_path_completion(db, user.id)
    streak = get_streak(db, user.id, local_date)
    freshness = compute_freshness(db, user.id, user_skills)
    fresh_counts = {"fresh": 0, "aging": 0, "stale": 0}
    for item in freshness:
        status = item.get("status", "fresh")
        if status in fresh_counts:
            fresh_counts[status] += 1

    teachback_passed = (
        db.query(TeachBack)
        .filter(TeachBack.user_id == user.id, TeachBack.passed.is_(True))
        .count()
    )

    fork = compute_career_fork(user_skills, user.career_goal, user.hours_per_week or 10)

    top_skills = sorted(user_skills.items(), key=lambda x: x[1], reverse=True)[:5]

    display = (user.full_name or "SkillSync learner").split("@")[0]

    return {
        "display_name": display,
        "career_goal": user.career_goal,
        "readiness_score": round(readiness_score, 1),
        "completed_skills": completed_skills,
        "total_skills": total_skills,
        "top_gaps": [
            {
                "skill_name": g["skill_name"],
                "current_level": g["current_level"],
                "target_level": g["target_level"],
                "priority": g["priority"],
            }
            for g in high_gaps[:3]
        ],
        "top_skills": [
            {"skill_name": s, "score": sc, "level": _score_level(sc)}
            for s, sc in top_skills
        ],
        "path_completion_pct": path["path_completion_pct"],
        "resources_completed": path["resources_completed"],
        "total_resources": path["total_resources"],
        "streak_days": streak.get("count", 0),
        "freshness_summary": fresh_counts,
        "teachback_passed": teachback_passed,
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "fork_message": fork.get("message") or None,
    }
