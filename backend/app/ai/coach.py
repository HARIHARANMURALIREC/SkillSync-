from typing import Dict, List, Optional

from app.models import User
from app.ai.ollama_client import chat_text


def build_coach_context(
    user: User,
    user_skills: Dict[str, float],
    skill_gaps: List[dict],
    path_summary: Optional[dict] = None,
) -> str:
    """Build context string for the career coach system prompt."""
    lines = [
        f"User: {user.full_name or user.email}",
        f"Career goal: {user.career_goal or 'Not set'}",
        f"Hours per week for learning: {user.hours_per_week}",
    ]

    if user_skills:
        top_skills = sorted(user_skills.items(), key=lambda x: x[1], reverse=True)[:5]
        lines.append("Recent assessment scores (0-10):")
        for skill, score in top_skills:
            lines.append(f"  - {skill}: {score:.1f}")
    else:
        lines.append("No assessments completed yet.")

    if skill_gaps:
        top_gaps = sorted(skill_gaps, key=lambda g: g.get("gap", 0), reverse=True)[:3]
        lines.append("Top skill gaps:")
        for gap in top_gaps:
            lines.append(
                f"  - {gap['skill_name']}: current {gap['current_level']:.1f}, "
                f"target {gap['target_level']:.1f}, gap {gap['gap']:.1f} ({gap['priority']})"
            )

    if path_summary:
        lines.append(
            f"Learning path progress: {path_summary.get('resources_completed', 0)}/"
            f"{path_summary.get('total_resources', 0)} resources "
            f"({path_summary.get('overall_pct', 0):.0f}%)"
        )

    return "\n".join(lines)


def coach_system_prompt(context: str) -> str:
    return (
        "You are SkillSync's AI career coach.\n"
        "Write a short, scannable reply. Never use markdown tables, pipes (|), or HTML.\n"
        "Do not invent scores, hours, or gaps that are not in USER CONTEXT.\n"
        "Respect hours per week. Suggest at most 3 actions.\n"
        "Use this exact layout with blank lines between sections:\n\n"
        "Focus\n"
        "One sentence on the week's priority.\n\n"
        "Plan\n"
        "- Skill (Xh): one resource and one action\n"
        "- Skill (Xh): one resource and one action\n"
        "- Skill (Xh): one resource and one action\n\n"
        "Check-in\n"
        "- One measurable target (quiz score, module, or hours)\n\n"
        "Next\n"
        "One sentence for the following week.\n\n"
        "Keep the whole reply under 160 words. No emojis.\n\n"
        f"USER CONTEXT:\n{context}"
    )


def _normalize_coach_reply(text: str) -> str:
    """Turn accidental markdown tables into bullets and tidy whitespace."""
    lines = [line.rstrip() for line in (text or "").splitlines()]
    cleaned: List[str] = []
    for line in lines:
        stripped = line.strip()
        if not stripped:
            if cleaned and cleaned[-1] != "":
                cleaned.append("")
            continue
        if set(stripped.replace("|", "").replace("-", "").replace(":", "").replace(" ", "")) == set():
            continue
        if stripped.startswith("|") and stripped.endswith("|"):
            cells = [c.strip() for c in stripped.strip("|").split("|") if c.strip()]
            cells = [c for c in cells if c not in ("Time (hrs)", "Topic", "Action", "Resource")]
            if len(cells) >= 2:
                cleaned.append("- " + " — ".join(cells))
            continue
        cleaned.append(stripped)
    return "\n".join(cleaned).strip()


def chat_with_coach(
    user: User,
    user_skills: Dict[str, float],
    skill_gaps: List[dict],
    messages: List[dict],
    path_summary: Optional[dict] = None,
) -> str:
    """Run a coach chat turn with fresh context."""
    context = build_coach_context(user, user_skills, skill_gaps, path_summary)
    system = coach_system_prompt(context)

    recent = messages[-10:] if len(messages) > 10 else messages
    reply = chat_text(system=system, messages=recent, temperature=0.2, num_predict=1800)
    return _normalize_coach_reply(reply) or "I'm having trouble forming a response. Please try again."
