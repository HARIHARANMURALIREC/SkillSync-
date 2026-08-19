"""
Learning path generator.

The LLM chooses week order and skills. Resource URLs always come from a
curated catalog of real docs and courses so links never go to invented pages.
"""

from typing import List, Optional
from urllib.parse import urlparse

from fastapi import HTTPException
from pydantic import BaseModel, ConfigDict, Field

from app.ai.ollama_client import chat_json

LEARNING_RESOURCES = {
    "Python": [
        {"title": "Python Official Tutorial", "type": "article", "url": "https://docs.python.org/3/tutorial/", "estimated_hours": 8},
        {"title": "Real Python Tutorials", "type": "article", "url": "https://realpython.com/", "estimated_hours": 6},
        {"title": "Python for Everybody (Coursera)", "type": "course", "url": "https://www.coursera.org/specializations/python", "estimated_hours": 10},
    ],
    "JavaScript": [
        {"title": "JavaScript.info Modern Tutorial", "type": "article", "url": "https://javascript.info/", "estimated_hours": 8},
        {"title": "MDN JavaScript Guide", "type": "article", "url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide", "estimated_hours": 6},
        {"title": "freeCodeCamp JavaScript", "type": "course", "url": "https://www.freecodecamp.org/learn/javascript-algorithms-and-data-structures-v8/", "estimated_hours": 10},
    ],
    "React": [
        {"title": "React Official Learn Guide", "type": "article", "url": "https://react.dev/learn", "estimated_hours": 8},
        {"title": "React Tic-Tac-Toe Tutorial", "type": "practice", "url": "https://react.dev/learn/tutorial-tic-tac-toe", "estimated_hours": 4},
        {"title": "freeCodeCamp Front End Libraries", "type": "course", "url": "https://www.freecodecamp.org/learn/front-end-development-libraries/", "estimated_hours": 10},
    ],
    "Node.js": [
        {"title": "Node.js Learn Guide", "type": "article", "url": "https://nodejs.org/en/learn/getting-started/introduction-to-nodejs", "estimated_hours": 6},
        {"title": "Node.js Best Practices", "type": "article", "url": "https://github.com/goldbergyoni/nodebestpractices", "estimated_hours": 6},
        {"title": "freeCodeCamp Back End APIs", "type": "course", "url": "https://www.freecodecamp.org/learn/back-end-development-and-apis/", "estimated_hours": 10},
    ],
    "TypeScript": [
        {"title": "TypeScript Handbook", "type": "article", "url": "https://www.typescriptlang.org/docs/handbook/intro.html", "estimated_hours": 8},
        {"title": "TypeScript Deep Dive", "type": "article", "url": "https://github.com/basarat/typescript-book", "estimated_hours": 6},
        {"title": "TypeScript Exercises", "type": "practice", "url": "https://typescript-exercises.github.io/", "estimated_hours": 4},
    ],
    "HTML": [
        {"title": "MDN HTML Guide", "type": "article", "url": "https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Structuring_content", "estimated_hours": 6},
        {"title": "MDN HTML Elements", "type": "article", "url": "https://developer.mozilla.org/en-US/docs/Web/HTML", "estimated_hours": 4},
    ],
    "CSS": [
        {"title": "MDN CSS Guide", "type": "article", "url": "https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Styling_basics", "estimated_hours": 6},
        {"title": "freeCodeCamp Responsive Web Design", "type": "course", "url": "https://www.freecodecamp.org/learn/2022/responsive-web-design/", "estimated_hours": 8},
        {"title": "CSS-Tricks Guides", "type": "article", "url": "https://css-tricks.com/guides/", "estimated_hours": 4},
    ],
    "SQL": [
        {"title": "SQLBolt Interactive Tutorial", "type": "practice", "url": "https://sqlbolt.com/", "estimated_hours": 5},
        {"title": "LeetCode Database Practice", "type": "practice", "url": "https://leetcode.com/problemset/database/", "estimated_hours": 6},
        {"title": "W3Schools SQL Tutorial", "type": "article", "url": "https://www.w3schools.com/sql/", "estimated_hours": 5},
    ],
    "Database": [
        {"title": "PostgreSQL Official Tutorial", "type": "article", "url": "https://www.postgresql.org/docs/current/tutorial.html", "estimated_hours": 6},
        {"title": "PostgreSQL Tutorial", "type": "article", "url": "https://www.postgresqltutorial.com/", "estimated_hours": 6},
        {"title": "SQLBolt Interactive Tutorial", "type": "practice", "url": "https://sqlbolt.com/", "estimated_hours": 4},
    ],
    "Git": [
        {"title": "Pro Git Book", "type": "article", "url": "https://git-scm.com/book/en/v2", "estimated_hours": 8},
        {"title": "Git Official Documentation", "type": "article", "url": "https://git-scm.com/doc", "estimated_hours": 4},
        {"title": "Atlassian Git Tutorials", "type": "article", "url": "https://www.atlassian.com/git/tutorials", "estimated_hours": 4},
    ],
    "Algorithms": [
        {"title": "Khan Academy Algorithms", "type": "course", "url": "https://www.khanacademy.org/computing/computer-science/algorithms", "estimated_hours": 8},
        {"title": "VisuAlgo Visualizations", "type": "practice", "url": "https://visualgo.net/en", "estimated_hours": 4},
        {"title": "LeetCode Problem Set", "type": "practice", "url": "https://leetcode.com/problemset/", "estimated_hours": 8},
    ],
    "System Design": [
        {"title": "System Design Primer", "type": "article", "url": "https://github.com/donnemartin/system-design-primer", "estimated_hours": 10},
        {"title": "AWS Architecture Center", "type": "article", "url": "https://aws.amazon.com/architecture/", "estimated_hours": 6},
    ],
    "API Design": [
        {"title": "FastAPI Documentation", "type": "article", "url": "https://fastapi.tiangolo.com/tutorial/", "estimated_hours": 8},
        {"title": "REST API Tutorial", "type": "article", "url": "https://restfulapi.net/", "estimated_hours": 5},
        {"title": "Microsoft REST API Guidelines", "type": "article", "url": "https://github.com/microsoft/api-guidelines", "estimated_hours": 4},
    ],
    "DevOps": [
        {"title": "Docker Get Started", "type": "article", "url": "https://docs.docker.com/get-started/", "estimated_hours": 6},
        {"title": "Kubernetes Tutorials", "type": "article", "url": "https://kubernetes.io/docs/tutorials/", "estimated_hours": 8},
        {"title": "GitHub Actions Docs", "type": "article", "url": "https://docs.github.com/en/actions", "estimated_hours": 4},
    ],
    "Testing": [
        {"title": "Jest Getting Started", "type": "article", "url": "https://jestjs.io/docs/getting-started", "estimated_hours": 4},
        {"title": "React Testing Library", "type": "article", "url": "https://testing-library.com/docs/react-testing-library/intro/", "estimated_hours": 4},
    ],
    "Machine Learning": [
        {"title": "Google ML Crash Course", "type": "course", "url": "https://developers.google.com/machine-learning/crash-course", "estimated_hours": 10},
        {"title": "Kaggle Intro to Machine Learning", "type": "course", "url": "https://www.kaggle.com/learn/intro-to-machine-learning", "estimated_hours": 6},
        {"title": "scikit-learn User Guide", "type": "article", "url": "https://scikit-learn.org/stable/user_guide.html", "estimated_hours": 8},
    ],
    "Deep Learning": [
        {"title": "fast.ai Practical Deep Learning", "type": "course", "url": "https://course.fast.ai/", "estimated_hours": 12},
        {"title": "PyTorch Tutorials", "type": "article", "url": "https://pytorch.org/tutorials/", "estimated_hours": 8},
        {"title": "TensorFlow Tutorials", "type": "article", "url": "https://www.tensorflow.org/tutorials", "estimated_hours": 8},
    ],
    "Statistics": [
        {"title": "Khan Academy Statistics", "type": "course", "url": "https://www.khanacademy.org/math/statistics-probability", "estimated_hours": 8},
        {"title": "Kaggle Intro to Statistics", "type": "course", "url": "https://www.kaggle.com/learn/intro-to-statistics", "estimated_hours": 5},
    ],
    "Pandas": [
        {"title": "10 Minutes to pandas", "type": "article", "url": "https://pandas.pydata.org/docs/user_guide/10min.html", "estimated_hours": 2},
        {"title": "pandas User Guide", "type": "article", "url": "https://pandas.pydata.org/docs/user_guide/index.html", "estimated_hours": 8},
    ],
    "NumPy": [
        {"title": "NumPy Absolute Beginners", "type": "article", "url": "https://numpy.org/doc/stable/user/absolute_beginners.html", "estimated_hours": 4},
        {"title": "NumPy User Guide", "type": "article", "url": "https://numpy.org/doc/stable/user/index.html", "estimated_hours": 6},
    ],
    "State Management": [
        {"title": "React Context Guide", "type": "article", "url": "https://react.dev/learn/passing-data-deeply-with-context", "estimated_hours": 3},
        {"title": "Redux Getting Started", "type": "article", "url": "https://redux.js.org/introduction/getting-started", "estimated_hours": 5},
    ],
    "UI/UX": [
        {"title": "Material Design 3", "type": "article", "url": "https://m3.material.io/", "estimated_hours": 4},
        {"title": "MDN Accessibility", "type": "article", "url": "https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Accessibility", "estimated_hours": 4},
    ],
    "Security": [
        {"title": "OWASP Top 10", "type": "article", "url": "https://owasp.org/www-project-top-ten/", "estimated_hours": 4},
        {"title": "MDN Web Security", "type": "article", "url": "https://developer.mozilla.org/en-US/docs/Web/Security", "estimated_hours": 5},
    ],
    "Caching": [
        {"title": "Redis Getting Started", "type": "article", "url": "https://redis.io/docs/latest/get-started/", "estimated_hours": 4},
        {"title": "MDN HTTP Caching", "type": "article", "url": "https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Caching", "estimated_hours": 3},
    ],
    "Data Visualization": [
        {"title": "Matplotlib Tutorials", "type": "article", "url": "https://matplotlib.org/stable/tutorials/index.html", "estimated_hours": 5},
        {"title": "Plotly Python", "type": "article", "url": "https://plotly.com/python/", "estimated_hours": 4},
    ],
}

# Backward-compatible alias used by older imports
DEFAULT_RESOURCES = {
    skill: items[0]["url"] for skill, items in LEARNING_RESOURCES.items()
}

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


def _catalog_key(skill_name: str) -> Optional[str]:
    name = (skill_name or "").strip()
    if not name:
        return None
    if name in LEARNING_RESOURCES:
        return name
    lower = name.lower()
    for key in LEARNING_RESOURCES:
        if key.lower() in lower or lower in key.lower():
            return key
    return None


def resources_for_skill(skill_name: str, limit: int = 2) -> List[dict]:
    key = _catalog_key(skill_name)
    if not key:
        query = (skill_name or "programming").replace(" ", "+")
        return [{
            "title": f"{skill_name} on MDN / docs search",
            "type": "article",
            "url": f"https://developer.mozilla.org/en-US/search?q={query}",
            "estimated_hours": 4.0,
        }]
    return [dict(item) for item in LEARNING_RESOURCES[key][:limit]]


def _default_resource(skill_name: str) -> dict:
    return resources_for_skill(skill_name, limit=1)[0]


def _is_trusted_url(url: Optional[str]) -> bool:
    if not url or not url.startswith("https://"):
        return False
    host = (urlparse(url).hostname or "").lower()
    if not host:
        return False
    return any(host == part or host.endswith("." + part) for part in _TRUSTED_HOST_PARTS)


def sanitize_week_resources(skill_name: str, resources: Optional[list], limit: int = 2) -> List[dict]:
    """Keep only real https links; otherwise swap in catalog resources."""
    catalog = resources_for_skill(skill_name, limit=max(limit, 2))
    kept: List[dict] = []
    for resource in resources or []:
        if not isinstance(resource, dict):
            continue
        url = resource.get("url")
        if _is_trusted_url(url):
            kept.append({
                "title": resource.get("title") or catalog[0]["title"],
                "type": resource.get("type") if resource.get("type") in ("article", "course", "practice", "video") else "article",
                "url": url,
                "estimated_hours": float(resource.get("estimated_hours") or catalog[0]["estimated_hours"]),
            })
        if len(kept) >= limit:
            break
    if kept:
        return kept[:limit]
    return catalog[:limit]


def _fallback_path(skill_gaps: List[dict], hours_per_week: int) -> List[dict]:
    weekly_paths = []
    for index, gap in enumerate(skill_gaps[:4], start=1):
        skill_name = gap.get("skill") or gap.get("skill_name") or f"Skill {index}"
        weekly_paths.append({
            "week_number": index,
            "skill_name": skill_name,
            "skills": [skill_name],
            "resources": resources_for_skill(skill_name, limit=2),
            "estimated_hours": float(hours_per_week),
            "explanation": [
                f"Priority: {gap.get('priority', 'Medium')}",
                f"Close a {gap.get('gap', 0)} point gap in {skill_name}",
            ],
        })
    return weekly_paths


def generate_learning_path(skill_gaps: List[dict], hours_per_week: int) -> List[dict]:
    """Generate a weekly path. Skills may come from the LLM; links come from the catalog."""
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
                "\"skills\":[\"Python\"],\"estimated_hours\":8,"
                "\"explanation\":[\"Foundation skill\"]}]}. "
                "Exactly 4 week objects. One skill per week. Do not include resource URLs."
            ),
            user=f"Hours/week: {hours_per_week}. Gaps: {compact_gaps}",
            schema=LearningPathResult,
            timeout=60.0,
            num_predict=700,
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
            "resources": resources_for_skill(skill_name, limit=2),
            "estimated_hours": float(week.estimated_hours or hours_per_week),
            "explanation": (week.explanation or [])[:2],
        })

    return weekly_paths or _fallback_path(compact_gaps, hours_per_week)
