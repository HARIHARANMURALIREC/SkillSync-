"""
Custom AI Engine: Progress Recommender
Rule-based system for adaptive learning suggestions.
"""

from typing import List, Dict, Any

def get_learning_recommendation(current_level: float, target_level: float, recent_progress: float = 0.0) -> str:
    """
    Generate learning recommendation based on current progress.
    
    Returns: "advance", "reinforce", "continue"
    """
    gap = target_level - current_level
    
    # If gap is very small, suggest advancing to next skill
    if gap < 1.0:
        return "advance"
    
    # If recent progress is negative or stagnant, suggest reinforcement
    if recent_progress < 0.1:
        return "reinforce"
    
    # If making good progress, continue current path
    if recent_progress >= 0.5:
        return "continue"
    
    # Default: continue
    return "continue"

def calculate_progress_velocity(assessments: list) -> float:
    """
    Calculate how fast user is progressing.
    Returns velocity score (0-1).
    """
    if len(assessments) < 2:
        return 0.5  # Default moderate progress
    
    # Sort by date
    sorted_assessments = sorted(assessments, key=lambda x: x.get('created_at', ''))
    
    # Calculate average improvement
    improvements = []
    for i in range(1, len(sorted_assessments)):
        if sorted_assessments[i]['skill_name'] == sorted_assessments[i-1]['skill_name']:
            improvement = sorted_assessments[i]['score'] - sorted_assessments[i-1]['score']
            improvements.append(improvement)
    
    if not improvements:
        return 0.5
    
    avg_improvement = sum(improvements) / len(improvements)
    
    # Normalize to 0-1 (assuming max improvement of 2 points per assessment)
    velocity = min(1.0, max(0.0, (avg_improvement + 2.0) / 4.0))
    
    return velocity

def adapt_learning_path(learning_path: List[Dict], progress_data: Dict[str, float], hours_per_week: int) -> Dict[str, Any]:
    """
    Adapt learning path based on user progress and performance.
    
    Rules:
    - If progress < 40% → insert revision week for that skill
    - If progress > 80% → accelerate next skill (reduce time)
    - Maintain prerequisite order
    
    Args:
        learning_path: Current learning path (list of weekly paths)
        progress_data: Dict mapping skill_name -> progress_percentage (0-100)
        hours_per_week: User's available hours per week
    
    Returns:
        Dict with:
            - adapted_path: Updated learning path
            - changes: List of explanations for changes made
    """
    changes = []
    final_path = []
    
    for week_idx, week in enumerate(learning_path):
        week_skills = week.get("skills", [week.get("skill_name")])
        week_copy = {**week}  # Copy to avoid modifying original
        week_modified = False
        
        # Check each skill in the week
        for skill_name in week_skills:
            progress = progress_data.get(skill_name, 0.0)
            
            # Rule 1: Progress < 40% → Insert revision week
            if progress > 0 and progress < 40:
                changes.append(f"Added revision week for {skill_name} (current progress: {progress:.1f}%)")
                week_modified = True
                
                # Add current week first
                final_path.append(week_copy)
                
                # Insert a revision week right after
                revision_week = {
                    "week_number": week["week_number"],  # Will be renumbered
                    "skill_name": f"{skill_name} (Revision)",
                    "skills": [skill_name],
                    "resources": week.get("resources", []),
                    "estimated_hours": max(week.get("estimated_hours", 0) * 0.5, 4.0),
                    "status": week.get("status", "pending"),
                    "is_revision": True
                }
                final_path.append(revision_week)
                break  # Only add one revision per week
            
            # Rule 2: Progress > 80% → Accelerate (reduce time by 20%)
            elif progress > 80:
                if not week_modified:  # Only modify once per week
                    week_copy["estimated_hours"] = week.get("estimated_hours", 0) * 0.8
                    changes.append(f"Accelerated {skill_name} schedule (progress: {progress:.1f}%)")
                    week_modified = True
        
        # If no modifications, add original week
        if not week_modified:
            final_path.append(week_copy)
    
    # Renumber weeks sequentially
    for idx, week in enumerate(final_path):
        week["week_number"] = idx + 1
    
    # If no changes were made, return original path
    if not changes:
        changes.append("No changes needed - you're on track!")
        return {
            "adapted_path": learning_path,
            "changes": changes
        }
    
    return {
        "adapted_path": final_path,
        "changes": changes
    }

def calculate_career_readiness(user_skills: Dict[str, float], career_requirements: Dict[str, float]) -> Dict[str, Any]:
    """
    Calculate how close user is to their target career role.
    
    Formula: readiness = (completed_skills / total_required_skills) * 100
    A skill is considered "completed" if current_level >= target_level * 0.8 (80% threshold)
    
    Returns:
        Dict with:
            - score: Readiness percentage (0-100)
            - completed_skills: Number of skills meeting threshold
            - total_skills: Total required skills
            - missing_skills: List of skills below threshold
    """
    if not career_requirements:
        return {
            "score": 0,
            "completed_skills": 0,
            "total_skills": 0,
            "missing_skills": []
        }
    
    total_skills = len(career_requirements)
    completed_skills = 0
    missing_skills = []
    
    for skill_name, target_level in career_requirements.items():
        current_level = user_skills.get(skill_name, 0.0)
        threshold = target_level * 0.8  # 80% of target level
        
        if current_level >= threshold:
            completed_skills += 1
        else:
            missing_skills.append({
                "skill": skill_name,
                "current": current_level,
                "target": target_level,
                "gap": round(target_level - current_level, 2)
            })
    
    readiness_score = (completed_skills / total_skills) * 100 if total_skills > 0 else 0
    
    return {
        "score": round(readiness_score, 1),
        "completed_skills": completed_skills,
        "total_skills": total_skills,
        "missing_skills": missing_skills
    }

