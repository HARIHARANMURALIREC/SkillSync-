"""
Ollama AI Engine: Skill Gap Analyzer

Career skill targets come from Ollama (cached per career). Gap numbers,
priority, and explanations are computed locally so the dashboard stays fast.
"""

from typing import Dict, List, Optional

from fastapi import HTTPException
from pydantic import BaseModel, ConfigDict, Field

from app.ai.ollama_client import chat_json

_CACHE: Dict[str, object] = {
    "career_goal": None,
    "skills_key": None,
    "requirements": {},
    "readiness": None,
    "gaps": None,
    "gaps_key": None,
}

_REQUIREMENTS_BY_CAREER: Dict[str, dict] = {}

FALLBACK_REQUIREMENTS = {
    "Software Engineer": {
        "Python": 8.0, "JavaScript": 7.5, "React": 7.0, "Node.js": 6.5,
        "Database": 6.0, "System Design": 5.5, "Algorithms": 8.0, "Git": 7.0,
    },
    "Data Scientist": {
        "Python": 9.0, "Machine Learning": 8.5, "Statistics": 8.0, "SQL": 7.5,
        "Data Visualization": 7.0, "Deep Learning": 7.5, "Pandas": 8.5, "NumPy": 8.0,
    },
    "Frontend Developer": {
        "JavaScript": 8.5, "React": 9.0, "TypeScript": 7.5, "CSS": 8.0,
        "HTML": 8.5, "State Management": 7.0, "UI/UX": 6.5, "Testing": 6.0,
    },
    "Backend Developer": {
        "Python": 8.0, "Node.js": 7.5, "API Design": 8.0, "Database": 8.5,
        "System Design": 7.5, "DevOps": 6.5, "Security": 7.0, "Caching": 6.0,
    },
    "Full Stack Developer": {
        "Python": 7.5, "JavaScript": 8.0, "React": 7.5, "Node.js": 7.0,
        "Database": 7.5, "API Design": 7.5, "System Design": 6.5, "DevOps": 6.0,
    },
}


class CareerRequirementsResult(BaseModel):
    model_config = ConfigDict(extra="ignore")

    requirements: Dict[str, float] = Field(default_factory=dict)


def _skills_key(user_skills: dict) -> tuple:
    return tuple(sorted((k, round(float(v), 2)) for k, v in (user_skills or {}).items()))


def get_cached_readiness(user_skills: dict) -> Optional[dict]:
    if _CACHE["readiness"] and _CACHE["skills_key"] == _skills_key(user_skills):
        return _CACHE["readiness"]
    return None


def peek_cached_requirements(career_goal: str) -> Optional[dict]:
    if not career_goal:
        return None
    return _REQUIREMENTS_BY_CAREER.get(career_goal)


def get_career_requirements(career_goal: str, known_skills: Optional[List[str]] = None) -> dict:
    """Get target skill levels for a career role (Ollama, cached)."""
    if not career_goal:
        return {}

    cached = _REQUIREMENTS_BY_CAREER.get(career_goal)
    if cached:
        _CACHE["career_goal"] = career_goal
        _CACHE["requirements"] = cached
        return cached

    known = ""
    if known_skills:
        known = f" Use only these skill names: {', '.join(known_skills[:12])}."

    try:
        result = chat_json(
            system=(
                "You map careers to skill targets. "
                "Return compact JSON: {\"requirements\": {\"Skill\": 8.0}}. "
                "6 to 8 skills, levels 5-10."
                f"{known}"
            ),
            user=f"Career: {career_goal}",
            schema=CareerRequirementsResult,
            timeout=25.0,
            num_predict=220,
            retries=1,
        )
        requirements = {name: float(level) for name, level in result.requirements.items()}
    except HTTPException:
        requirements = dict(FALLBACK_REQUIREMENTS.get(career_goal, {}))
        if not requirements and known_skills:
            requirements = {skill: 7.0 for skill in known_skills[:8]}
        if not requirements:
            requirements = dict(FALLBACK_REQUIREMENTS["Software Engineer"])

    _REQUIREMENTS_BY_CAREER[career_goal] = requirements
    _CACHE["career_goal"] = career_goal
    _CACHE["requirements"] = requirements
    return requirements


def _priority_for(gap: float, target_level: float) -> str:
    if gap > 5.0 or target_level >= 8.0:
        return "High"
    if gap > 2.5:
        return "Medium"
    return "Low"


def _explain_gap(
    skill_name: str,
    current_level: float,
    target_level: float,
    gap: float,
    priority: str,
    career_goal: str,
) -> List[str]:
    explanation = []
    if current_level == 0.0:
        explanation.append("Not yet assessed")
    else:
        percentage = (current_level / target_level) * 100 if target_level else 0
        explanation.append(f"Current level: {current_level:.1f}/10 ({percentage:.0f}% of target)")
    explanation.append(f"Target for {career_goal}: {target_level}/10")
    if gap > 0:
        explanation.append(f"Gap: {gap:.1f} points")
    else:
        explanation.append("Target already achieved")
    if priority == "High":
        explanation.append("High priority for this role")
    return explanation


def _readiness_from_requirements(user_skills: dict, requirements: dict) -> dict:
    if not requirements:
        return {
            "score": 0,
            "completed_skills": 0,
            "total_skills": 0,
            "missing_skills": [],
        }

    total_skills = len(requirements)
    completed_skills = 0
    missing_skills = []

    for skill_name, target_level in requirements.items():
        current_level = float(user_skills.get(skill_name, 0.0))
        threshold = target_level * 0.8
        if current_level >= threshold:
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


def calculate_skill_gaps(user_skills: dict, career_goal: str) -> list:
    """
    Calculate skill gaps between the user's current levels and career requirements.
    """
    if not career_goal:
        return []

    cache_key = (career_goal, _skills_key(user_skills or {}))
    if _CACHE.get("gaps_key") == cache_key and _CACHE.get("gaps") is not None:
        return _CACHE["gaps"]

    requirements = get_career_requirements(career_goal)
    user_skills = user_skills or {}
    gaps = []

    for skill_name, target_level in requirements.items():
        current_level = float(user_skills.get(skill_name, 0.0))
        gap = round(target_level - current_level, 2)
        priority = _priority_for(gap, target_level)
        gaps.append({
            "skill_name": skill_name,
            "current_level": current_level,
            "target_level": float(target_level),
            "gap": gap,
            "priority": priority,
            "explanation": _explain_gap(
                skill_name, current_level, target_level, gap, priority, career_goal
            ),
        })

    for skill_name, current_level in user_skills.items():
        if skill_name in requirements:
            continue
        gaps.append({
            "skill_name": skill_name,
            "current_level": float(current_level),
            "target_level": float(current_level),
            "gap": 0.0,
            "priority": "Low",
            "explanation": [
                f"Current level: {current_level:.1f}/10",
                "Not required for this career role",
                "Bonus skill",
            ],
        })

    priority_order = {"High": 3, "Medium": 2, "Low": 1}
    gaps.sort(key=lambda x: (priority_order.get(x["priority"], 0), -x["gap"]), reverse=True)

    readiness = _readiness_from_requirements(user_skills, requirements)
    _CACHE["career_goal"] = career_goal
    _CACHE["skills_key"] = cache_key[1]
    _CACHE["requirements"] = requirements
    _CACHE["readiness"] = readiness
    _CACHE["gaps_key"] = cache_key
    _CACHE["gaps"] = gaps
    return gaps


def get_skill_gap_summary(gaps: list) -> dict:
    """Generate summary statistics for skill gaps."""
    high_priority = [g for g in gaps if g["priority"] == "High"]
    medium_priority = [g for g in gaps if g["priority"] == "Medium"]
    low_priority = [g for g in gaps if g["priority"] == "Low"]

    positive_gaps = [g for g in gaps if g["gap"] > 0]
    total_gap = sum(g["gap"] for g in positive_gaps)
    avg_gap = total_gap / len(positive_gaps) if positive_gaps else 0

    return {
        "total_skills": len(gaps),
        "high_priority_gaps": len(high_priority),
        "medium_priority_gaps": len(medium_priority),
        "low_priority_gaps": len(low_priority),
        "total_gap_points": round(total_gap, 2),
        "average_gap": round(avg_gap, 2)
    }


PRESET_ROLES = list(FALLBACK_REQUIREMENTS.keys())


def compute_career_fork(user_skills: dict, current_goal: Optional[str], hours_per_week: int = 10) -> dict:
    """Compare readiness across preset roles and name the cheaper adjacent pivot."""
    skills = user_skills or {}
    hours = max(int(hours_per_week or 10), 1)
    role_rows = []

    for role in PRESET_ROLES:
        requirements = FALLBACK_REQUIREMENTS.get(role) or get_career_requirements(role)
        readiness = _readiness_from_requirements(skills, requirements)
        total_gap = round(sum(
            max(0.0, float(target) - float(skills.get(name, 0.0)))
            for name, target in requirements.items()
        ), 2)
        missing = sorted(
            readiness.get("missing_skills") or [],
            key=lambda item: item.get("gap", 0),
            reverse=True,
        )
        role_rows.append({
            "role": role,
            "score": float(readiness.get("score") or 0),
            "total_gap": total_gap,
            "blocking_skills": [item["skill"] for item in missing[:3]],
        })

    current = next((row for row in role_rows if row["role"] == current_goal), None)
    others = [row for row in role_rows if row["role"] != current_goal]
    best = max(others, key=lambda row: (row["score"], -row["total_gap"])) if others else None

    weeks_saved = 0.0
    if current and best:
        weeks_saved = round(max(0.0, current["total_gap"] - best["total_gap"]) / hours, 1)

    if current and best and best["score"] > current["score"]:
        message = (
            f"You are {current['score']:.0f}% toward {current['role']}, but "
            f"{best['score']:.0f}% toward {best['role']}. Switching saves about {weeks_saved:g} weeks."
        )
    elif current:
        message = f"Stay on {current['role']} — it is already your strongest fit among the five roles."
        best = current
        weeks_saved = 0.0
    elif best:
        message = f"{best['role']} is the closest fit from your current scores."
    else:
        message = "Take assessments to see which role is the cheaper pivot."

    return {
        "current_role": current["role"] if current else current_goal,
        "current_score": current["score"] if current else 0.0,
        "best_adjacent": None if (best and current and best["role"] == current["role"]) else (best["role"] if best else None),
        "best_score": best["score"] if best else 0.0,
        "weeks_saved": weeks_saved,
        "blocking_skills": (current or best or {}).get("blocking_skills") or [],
        "message": message,
        "roles": [{"role": row["role"], "score": row["score"]} for row in role_rows],
    }
