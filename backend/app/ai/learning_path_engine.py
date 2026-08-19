"""
Learning path generator.

The LLM chooses weeks, skills, and resource titles/URLs. Only https links on
known education/docs hosts are kept. There is no per-skill URL catalog.
"""

from typing import List, Optional
from urllib.parse import quote_plus, urlparse

import httpx
from fastapi import HTTPException
from pydantic import BaseModel, ConfigDict, Field

from app.ai.ollama_client import chat_json

_url_client = httpx.Client(timeout=httpx.Timeout(4.0, connect=2.0), follow_redirects=True)
_url_ok_cache: dict[str, bool] = {}

_TRUSTED_HOST_PARTS = (
    "python.org",
    "realpython.com",
    "javascript.info",
    "mozilla.org",
    "react.dev",
    "nodejs.org",
    "typescriptlang.org",
    "freecodecamp.org",
    "coursera.org",
    "kaggle.com",
    "scikit-learn.org",
    "developers.google.com",
    "fast.ai",
    "pytorch.org",
    "tensorflow.org",
    "khanacademy.org",
    "w3schools.com",
    "leetcode.com",
    "sqlbolt.com",
    "postgresql.org",
    "postgresqltutorial.com",
    "git-scm.com",
    "atlassian.com",
    "github.com",
    "visualgo.net",
    "docker.com",
    "kubernetes.io",
    "jestjs.io",
    "testing-library.com",
    "fastapi.tiangolo.com",
    "restfulapi.net",
    "owasp.org",
    "redis.io",
    "amazon.com",
    "aws.amazon.com",
    "pandas.pydata.org",
    "numpy.org",
    "redux.js.org",
    "material.io",
    "matplotlib.org",
    "plotly.com",
    "css-tricks.com",
    "youtube.com",
    "youtu.be",
    "edx.org",
    "codecademy.com",
    "udemy.com",
    "huggingface.co",
    "vuejs.org",
    "angular.dev",
    "nextjs.org",
    "expressjs.com",
    "djangoproject.com",
    "flask.palletsprojects.com",
    "learn.microsoft.com",
    "developer.android.com",
    "go.dev",
    "rust-lang.org",
    "roadmap.sh",
    "theodinproject.com",
    "wikipedia.org",
    "duckduckgo.com",
)

_ALLOWED_HOSTS_HINT = (
    "python.org, docs.python.org, react.dev, developer.mozilla.org, javascript.info, "
    "nodejs.org, typescriptlang.org, freecodecamp.org, realpython.com, git-scm.com, "
    "fastapi.tiangolo.com, postgresql.org, docker.com, kubernetes.io, pytorch.org, "
    "tensorflow.org, scikit-learn.org, kaggle.com, coursera.org, khanacademy.org, "
    "github.com, leetcode.com, sqlbolt.com, owasp.org, redis.io, pandas.pydata.org, "
    "numpy.org, youtube.com"
)


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


def search_resources_for_skill(skill_name: str, limit: int = 2) -> List[dict]:
    """Last-resort links: search pages, not a curated catalog."""
    skill = (skill_name or "programming").strip() or "programming"
    query = quote_plus(f"{skill} official tutorial documentation")
    items = [
        {
            "title": f"Search MDN for {skill}",
            "type": "article",
            "url": f"https://developer.mozilla.org/en-US/search?q={quote_plus(skill)}",
            "estimated_hours": 4.0,
        },
        {
            "title": f"Find {skill} docs",
            "type": "article",
            "url": f"https://duckduckgo.com/?q={query}",
            "estimated_hours": 3.0,
        },
    ]
    return items[:limit]


def resources_for_skill(skill_name: str, limit: int = 2) -> List[dict]:
    """Alias used by coach/recommender fallbacks."""
    return search_resources_for_skill(skill_name, limit=limit)


def _is_trusted_url(url: Optional[str]) -> bool:
    if not url or not str(url).startswith("https://"):
        return False
    host = (urlparse(str(url)).hostname or "").lower()
    if not host:
        return False
    return any(host == part or host.endswith("." + part) for part in _TRUSTED_HOST_PARTS)


def _url_is_usable(url: Optional[str]) -> bool:
    """Trusted host plus a cheap existence check. 404s are dropped; timeouts keep the link."""
    if not _is_trusted_url(url):
        return False
    if url in _url_ok_cache:
        return _url_ok_cache[url]
    ok = True
    try:
        response = _url_client.head(url)
        if response.status_code in (404, 410):
            ok = False
        elif response.status_code == 405:
            response = _url_client.get(url, headers={"Range": "bytes=0-0"})
            ok = response.status_code not in (404, 410)
    except Exception:
        ok = True
    _url_ok_cache[url] = ok
    return ok


def _normalize_resource(resource: dict) -> dict:
    hours = resource.get("estimated_hours") or 4.0
    return {
        "title": str(resource.get("title") or "Learning resource").strip()[:160],
        "type": resource.get("type") if resource.get("type") in ("article", "course", "practice", "video") else "article",
        "url": resource.get("url"),
        "estimated_hours": float(hours),
    }


def sanitize_week_resources(skill_name: str, resources: Optional[list], limit: int = 2) -> List[dict]:
    """Keep AI-chosen https links on known hosts. Fill gaps with search URLs only."""
    kept: List[dict] = []
    seen: set[str] = set()

    for resource in resources or []:
        if not isinstance(resource, dict):
            continue
        url = resource.get("url")
        if not url or not _url_is_usable(url) or url in seen:
            continue
        kept.append(_normalize_resource(resource))
        seen.add(url)
        if len(kept) >= limit:
            return kept

    for item in search_resources_for_skill(skill_name, limit=limit):
        if len(kept) >= limit:
            break
        if item["url"] in seen:
            continue
        kept.append(dict(item))
        seen.add(item["url"])
    return kept[:limit]


def resources_from_model(skill_name: str, resources: Optional[list], limit: int = 2) -> List[dict]:
    raw = []
    for resource in resources or []:
        if hasattr(resource, "model_dump"):
            raw.append(resource.model_dump())
        elif isinstance(resource, dict):
            raw.append(resource)
    return sanitize_week_resources(skill_name, raw, limit=limit)


def _fallback_path(skill_gaps: List[dict], hours_per_week: int) -> List[dict]:
    weekly_paths = []
    for index, gap in enumerate(skill_gaps[:4], start=1):
        skill_name = gap.get("skill") or gap.get("skill_name") or f"Skill {index}"
        weekly_paths.append({
            "week_number": index,
            "skill_name": skill_name,
            "skills": [skill_name],
            "resources": search_resources_for_skill(skill_name, limit=2),
            "estimated_hours": float(hours_per_week),
            "explanation": [
                f"Priority: {gap.get('priority', 'Medium')}",
                f"Close a {gap.get('gap', 0)} point gap in {skill_name}",
            ],
        })
    return weekly_paths


def generate_learning_path(skill_gaps: List[dict], hours_per_week: int) -> List[dict]:
    """Generate a weekly path. The LLM picks skills and resources; URLs are verified."""
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
                "Return ONLY a complete JSON object: "
                "{\"weekly_paths\":[{\"week_number\":1,\"skill_name\":\"Python\","
                "\"skills\":[\"Python\"],\"estimated_hours\":8,"
                "\"explanation\":[\"Foundation skill\"],"
                "\"resources\":[{\"title\":\"Python Official Tutorial\",\"type\":\"article\","
                "\"url\":\"https://docs.python.org/3/tutorial/\",\"estimated_hours\":6}]}]}. "
                "Exactly 4 weeks, one skill per week. Each week MUST include 2 resources. "
                "Choose real public https URLs on official docs or well-known education sites "
                f"({_ALLOWED_HOSTS_HINT}). Never invent paths. "
                "Prefer canonical tutorial/docs homepages you are sure exist."
            ),
            user=f"Hours/week: {hours_per_week}. Gaps: {compact_gaps}",
            schema=LearningPathResult,
            timeout=75.0,
            num_predict=1600,
            retries=1,
        )
    except HTTPException:
        return _fallback_path(compact_gaps, hours_per_week)

    weekly_paths = []
    for index, week in enumerate(result.weekly_paths[:4], start=1):
        skills = week.skills or [week.skill_name]
        skill_name = week.skill_name or skills[0]
        weekly_paths.append({
            "week_number": week.week_number or index,
            "skill_name": skill_name,
            "skills": skills,
            "resources": resources_from_model(skill_name, week.resources, limit=2),
            "estimated_hours": float(week.estimated_hours or hours_per_week),
            "explanation": (week.explanation or [])[:2],
        })

    return weekly_paths or _fallback_path(compact_gaps, hours_per_week)
