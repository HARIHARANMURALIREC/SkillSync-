"""
Custom AI Engine: Skill Gap Analyzer
Compares user's assessed skills against career role requirements.
"""

# Career role skill requirements (target levels 0-10)
CAREER_ROLE_REQUIREMENTS = {
    "Software Engineer": {
        "Python": 8.0,
        "JavaScript": 7.5,
        "React": 7.0,
        "Node.js": 6.5,
        "Database": 6.0,
        "System Design": 5.5,
        "Algorithms": 8.0,
        "Git": 7.0,
    },
    "Data Scientist": {
        "Python": 9.0,
        "Machine Learning": 8.5,
        "Statistics": 8.0,
        "SQL": 7.5,
        "Data Visualization": 7.0,
        "Deep Learning": 7.5,
        "Pandas": 8.5,
        "NumPy": 8.0,
    },
    "Frontend Developer": {
        "JavaScript": 8.5,
        "React": 9.0,
        "TypeScript": 7.5,
        "CSS": 8.0,
        "HTML": 8.5,
        "State Management": 7.0,
        "UI/UX": 6.5,
        "Testing": 6.0,
    },
    "Backend Developer": {
        "Python": 8.0,
        "Node.js": 7.5,
        "API Design": 8.0,
        "Database": 8.5,
        "System Design": 7.5,
        "DevOps": 6.5,
        "Security": 7.0,
        "Caching": 6.0,
    },
    "Full Stack Developer": {
        "Python": 7.5,
        "JavaScript": 8.0,
        "React": 7.5,
        "Node.js": 7.0,
        "Database": 7.5,
        "API Design": 7.5,
        "System Design": 6.5,
        "DevOps": 6.0,
    },
}

def get_career_requirements(career_goal: str) -> dict:
    """Get target skill levels for a career role."""
    return CAREER_ROLE_REQUIREMENTS.get(career_goal, {})

def calculate_skill_gaps(user_skills: dict, career_goal: str) -> list:
    """
    Calculate skill gaps between user's current levels and career requirements.
    
    Returns list of gap dictionaries with priority levels and explanations.
    """
    requirements = get_career_requirements(career_goal)
    
    if not requirements:
        return []
    
    gaps = []
    
    # Calculate gaps for skills in requirements
    for skill_name, target_level in requirements.items():
        current_level = user_skills.get(skill_name, 0.0)
        gap = target_level - current_level
        
        # Determine priority based on gap magnitude and target level
        if gap > 5.0 or target_level >= 8.0:
            priority = "High"
        elif gap > 2.5:
            priority = "Medium"
        else:
            priority = "Low"
        
        # Generate explanation for this skill gap
        explanation = []
        if current_level == 0.0:
            explanation.append(f"Not yet assessed")
        else:
            percentage = (current_level / target_level) * 100
            explanation.append(f"Current level: {current_level:.1f}/10 ({percentage:.0f}% of target)")
            
        explanation.append(f"Target level required: {target_level}/10")
        explanation.append(f"Required for {career_goal} role")
        
        if gap > 0:
            explanation.append(f"Gap: {gap:.1f} points to reach target")
        else:
            explanation.append("Target already achieved!")
        
        if priority == "High":
            explanation.append("High priority - critical skill for this role")
        elif priority == "Medium":
            explanation.append("Medium priority - important skill")
        
        gaps.append({
            "skill_name": skill_name,
            "current_level": current_level,
            "target_level": target_level,
            "gap": round(gap, 2),
            "priority": priority,
            "explanation": explanation
        })
    
    # Also include skills user has but aren't in requirements (with low priority)
    for skill_name, current_level in user_skills.items():
        if skill_name not in requirements:
            gaps.append({
                "skill_name": skill_name,
                "current_level": current_level,
                "target_level": current_level,  # No target gap
                "gap": 0.0,
                "priority": "Low",
                "explanation": [
                    f"Current level: {current_level:.1f}/10",
                    "Not required for this career role",
                    "Bonus skill"
                ]
            })
    
    # Sort by priority and gap (descending)
    priority_order = {"High": 3, "Medium": 2, "Low": 1}
    gaps.sort(key=lambda x: (priority_order.get(x["priority"], 0), -x["gap"]), reverse=True)
    
    return gaps

def get_skill_gap_summary(gaps: list) -> dict:
    """Generate summary statistics for skill gaps."""
    high_priority = [g for g in gaps if g["priority"] == "High"]
    medium_priority = [g for g in gaps if g["priority"] == "Medium"]
    low_priority = [g for g in gaps if g["priority"] == "Low"]
    
    total_gap = sum(g["gap"] for g in gaps if g["gap"] > 0)
    avg_gap = total_gap / len([g for g in gaps if g["gap"] > 0]) if any(g["gap"] > 0 for g in gaps) else 0
    
    return {
        "total_skills": len(gaps),
        "high_priority_gaps": len(high_priority),
        "medium_priority_gaps": len(medium_priority),
        "low_priority_gaps": len(low_priority),
        "total_gap_points": round(total_gap, 2),
        "average_gap": round(avg_gap, 2)
    }

