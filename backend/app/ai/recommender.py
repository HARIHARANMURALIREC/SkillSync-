"""
Ollama AI Engine: Progress Recommender

Career readiness is computed from cached targets. Path adaptation uses a
short Ollama call.
"""

from typing import Any, Dict, List

from pydantic import BaseModel, ConfigDict, Field

from app.ai.gap_analyzer import get_cached_readiness
from app.ai.learning_path_engine import ResourceItem, resources_from_model, search_resources_for_skill
from app.ai.ollama_client import chat_json


class AdaptedWeek(BaseModel):
    model_config = ConfigDict(extra="ignore")

    week_number: int = 1
    skill_name: str = "Skill"
    skills: List[str] = Field(default_factory=list)
    resources: List[ResourceItem] = Field(default_factory=list)
    estimated_hours: float = 8.0
    status: str = "pending"
    is_revision: bool = False
    explanation: List[str] = Field(default_factory=list)


class AdaptationResult(BaseModel):
    model_config = ConfigDict(extra="ignore")

    adapted_path: List[AdaptedWeek] = Field(default_factory=list)
    changes: List[str] = Field(default_factory=list)


def get_learning_recommendation(current_level: float, target_level: float, recent_progress: float = 0.0) -> str:
    """Generate a short learning recommendation from progress signals."""
    gap = target_level - current_level
    if gap < 1.0:
        return "advance"
    if recent_progress < 0.1:
        return "reinforce"
    if recent_progress >= 0.5:
        return "continue"
    return "continue"


def calculate_progress_velocity(assessments: list) -> float:
    """Calculate how fast the user is progressing. Returns velocity (0-1)."""
    if len(assessments) < 2:
        return 0.5

    sorted_assessments = sorted(assessments, key=lambda x: x.get('created_at', ''))

    improvements = []
    for i in range(1, len(sorted_assessments)):
        if sorted_assessments[i]['skill_name'] == sorted_assessments[i-1]['skill_name']:
            improvement = sorted_assessments[i]['score'] - sorted_assessments[i-1]['score']
            improvements.append(improvement)

    if not improvements:
        return 0.5

    avg_improvement = sum(improvements) / len(improvements)
    velocity = min(1.0, max(0.0, (avg_improvement + 2.0) / 4.0))
    return velocity


def adapt_learning_path(
    learning_path: List[Dict],
    progress_data: Dict[str, float],
    hours_per_week: int,
) -> Dict[str, Any]:
    """Adapt the learning path based on user progress using Ollama."""
    compact_path = []
    for week in learning_path[:6]:
        compact_path.append({
            "week": week.get("week_number"),
            "skill": week.get("skill_name"),
            "hours": week.get("estimated_hours", 0),
        })

    original_by_week = {
        week.get("week_number"): week.get("resources") or []
        for week in learning_path
    }
    original_by_skill = {
        week.get("skill_name"): week.get("resources") or []
        for week in learning_path
    }

    result = chat_json(
        system=(
            "Adapt a learning path. Return compact JSON: "
            "{\"adapted_path\":[{\"week_number\":1,\"skill_name\":\"Python\","
            "\"skills\":[\"Python\"],\"resources\":[{\"title\":\"Python docs\","
            "\"type\":\"article\",\"url\":\"https://docs.python.org/3/tutorial/\","
            "\"estimated_hours\":6}],\"estimated_hours\":8,"
            "\"status\":\"pending\",\"is_revision\":false,\"explanation\":[\"...\"]}],"
            "\"changes\":[\"Added revision week for Python\"]}. "
            "Each week MUST include 2 resources with real https URLs on official docs "
            "(python.org, react.dev, MDN, freecodecamp.org, github.com, kaggle.com). "
            "Never invent URLs. If progress < 40 insert a revision week. "
            "If progress > 80 shorten hours. Keep at most 5 weeks."
        ),
        user=f"Hours/week: {hours_per_week}. Progress: {progress_data}. Path: {compact_path}",
        schema=AdaptationResult,
        timeout=50.0,
        num_predict=1200,
        retries=1,
    )

    adapted_path = []
    for index, week in enumerate(result.adapted_path[:6], start=1):
        skills = week.skills or [week.skill_name]
        resources = resources_from_model(week.skill_name or skills[0], week.resources, limit=2)
        if not resources:
            week_num = week.week_number or index
            resources = list(original_by_week.get(week_num) or original_by_skill.get(week.skill_name) or [])
            resources = resources_from_model(week.skill_name or skills[0], resources, limit=2)
        if not resources:
            resources = search_resources_for_skill(week.skill_name or skills[0], limit=2)
        adapted_path.append({
            "week_number": week.week_number or index,
            "skill_name": week.skill_name or skills[0],
            "skills": skills,
            "resources": resources,
            "estimated_hours": float(week.estimated_hours or hours_per_week),
            "status": week.status or "pending",
            "is_revision": bool(week.is_revision),
            "explanation": (week.explanation or [])[:2],
        })

    changes = result.changes or ["Path updated based on your recent progress."]
    return {
        "adapted_path": adapted_path,
        "changes": changes,
    }


def calculate_career_readiness(
    user_skills: Dict[str, float],
    career_requirements: Dict[str, float],
) -> Dict[str, Any]:
    """Career readiness from cached Ollama targets (no extra LLM call)."""
    cached = get_cached_readiness(user_skills or {})
    if cached:
        return cached

    if not career_requirements:
        return {
            "score": 0,
            "completed_skills": 0,
            "total_skills": 0,
            "missing_skills": [],
        }

    total_skills = len(career_requirements)
    completed_skills = 0
    missing_skills = []

    for skill_name, target_level in career_requirements.items():
        current_level = float((user_skills or {}).get(skill_name, 0.0))
        if current_level >= target_level * 0.8:
            completed_skills += 1
        else:
            missing_skills.append({
                "skill": skill_name,
                "current": current_level,
                "target": target_level,
                "gap": round(target_level - current_level, 2),
            })

    return {
        "score": round((completed_skills / total_skills) * 100, 1) if total_skills else 0,
        "completed_skills": completed_skills,
        "total_skills": total_skills,
        "missing_skills": missing_skills,
    }
