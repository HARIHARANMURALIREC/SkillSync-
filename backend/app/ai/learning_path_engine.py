"""
Ollama AI Engine: Learning Path Generator

Builds a compact weekly learning path with the local LLM.
"""

from typing import List, Optional

from fastapi import HTTPException
from pydantic import BaseModel, ConfigDict, Field

from app.ai.ollama_client import chat_json

DEFAULT_RESOURCES = {
    "Python": "https://docs.python.org/3/tutorial/",
    "JavaScript": "https://javascript.info/",
    "React": "https://react.dev/learn",
    "HTML": "https://developer.mozilla.org/en-US/docs/Web/HTML",
    "CSS": "https://developer.mozilla.org/en-US/docs/Web/CSS",
    "TypeScript": "https://www.typescriptlang.org/docs/",
    "Node.js": "https://nodejs.org/en/learn",
    "SQL": "https://sqlbolt.com/",
    "Database": "https://www.postgresql.org/docs/current/tutorial.html",
    "Git": "https://git-scm.com/doc",
    "Algorithms": "https://www.khanacademy.org/computing/computer-science/algorithms",
    "System Design": "https://github.com/donnemartin/system-design-primer",
    "API Design": "https://swagger.io/resources/articles/best-practices-in-api-design/",
    "DevOps": "https://docs.docker.com/get-started/",
    "Testing": "https://jestjs.io/docs/getting-started",
    "Machine Learning": "https://developers.google.com/machine-learning/crash-course",
    "Statistics": "https://www.khanacademy.org/math/statistics-probability",
    "Pandas": "https://pandas.pydata.org/docs/getting_started/index.html",
    "NumPy": "https://numpy.org/doc/stable/user/absolute_beginners.html",
}


class ResourceItem(BaseModel):
    model_config = ConfigDict(extra="ignore")

    title: str = "Learning resource"
    type: str = "article"
    url: Optional[str] = None
    estimated_hours: float = 1.0


class WeekItem(BaseModel):
    model_config = ConfigDict(extra="ignore")

    week_number: int = 1
    skill_name: str = "Skill"
    skills: List[str] = Field(default_factory=list)
    resources: List[ResourceItem] = Field(default_factory=list)
    estimated_hours: float = 8.0
    explanation: List[str] = Field(default_factory=list)


class LearningPathResult(BaseModel):
    model_config = ConfigDict(extra="ignore")

    weekly_paths: List[WeekItem] = Field(default_factory=list)


def _default_resource(skill_name: str) -> dict:
    url = DEFAULT_RESOURCES.get(skill_name, f"https://www.google.com/search?q={skill_name}+tutorial")
    return {
        "title": f"{skill_name} tutorial",
        "type": "article",
        "url": url,
        "estimated_hours": 6.0,
    }


def _fallback_path(skill_gaps: List[dict], hours_per_week: int) -> List[dict]:
    weekly_paths = []
    for index, gap in enumerate(skill_gaps[:4], start=1):
        skill_name = gap.get("skill") or gap.get("skill_name") or f"Skill {index}"
        weekly_paths.append({
            "week_number": index,
            "skill_name": skill_name,
            "skills": [skill_name],
            "resources": [_default_resource(skill_name)],
            "estimated_hours": float(hours_per_week),
            "explanation": [
                f"Priority: {gap.get('priority', 'Medium')}",
                f"Close a {gap.get('gap', 0)} point gap in {skill_name}",
            ],
        })
    return weekly_paths


def generate_learning_path(skill_gaps: List[dict], hours_per_week: int) -> List[dict]:
    """
    Generate a personalized learning path with Ollama.

    Returns a weekly learning schedule matching the existing router shape.
    """
    if not skill_gaps or hours_per_week <= 0:
        return []

    skills_to_learn = [
        gap for gap in skill_gaps
        if gap.get("gap", 0) > 0 and gap.get("priority") != "Low"
    ]
    if not skills_to_learn:
        skills_to_learn = [gap for gap in skill_gaps if gap.get("gap", 0) > 0]
    if not skills_to_learn:
        return []

    compact_gaps = [
        {
            "skill": g["skill_name"],
            "gap": g.get("gap", 0),
            "priority": g.get("priority", "Medium"),
        }
        for g in skills_to_learn[:4]
    ]

    try:
        result = chat_json(
            system=(
                "Return ONLY a complete JSON object with this shape: "
                "{\"weekly_paths\":[{\"week_number\":1,\"skill_name\":\"Python\","
                "\"skills\":[\"Python\"],\"resources\":[{\"title\":\"Python Tutorial\","
                "\"type\":\"article\",\"url\":\"https://docs.python.org/3/tutorial/\","
                "\"estimated_hours\":6}],\"estimated_hours\":8,"
                "\"explanation\":[\"Foundation skill\"]}]}. "
                "Exactly 4 week objects. One skill and one resource per week. "
                "Keep strings short. Close every brace."
            ),
            user=f"Hours/week: {hours_per_week}. Gaps: {compact_gaps}",
            schema=LearningPathResult,
            timeout=60.0,
            num_predict=900,
            retries=1,
        )
    except HTTPException:
        return _fallback_path(compact_gaps, hours_per_week)

    weekly_paths = []
    for index, week in enumerate(result.weekly_paths[:4], start=1):
        skills = week.skills or [week.skill_name]
        resources = []
        for resource in week.resources[:2]:
            resource_type = resource.type if resource.type in ("article", "course", "practice", "video") else "article"
            resources.append({
                "title": resource.title or "Untitled Resource",
                "type": resource_type,
                "url": resource.url,
                "estimated_hours": float(resource.estimated_hours or 1.0),
            })
        if not resources:
            resources = [_default_resource(week.skill_name or skills[0])]
        weekly_paths.append({
            "week_number": week.week_number or index,
            "skill_name": week.skill_name or skills[0],
            "skills": skills,
            "resources": resources,
            "estimated_hours": float(week.estimated_hours or hours_per_week),
            "explanation": (week.explanation or [])[:2],
        })

    return weekly_paths or _fallback_path(compact_gaps, hours_per_week)
