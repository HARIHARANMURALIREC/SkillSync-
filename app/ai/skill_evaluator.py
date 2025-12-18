"""
Custom AI Engine: Skill Evaluator
Evaluates MCQ assessment answers and calculates skill levels using weighted scoring.
"""

def calculate_skill_score(questions: list, answers: dict, question_weights: dict = None) -> float:
    """
    Calculate normalized skill score (0-10) from MCQ answers.
    
    Uses weighted scoring based on question difficulty.
    Higher difficulty questions have more weight.
    """
    if not questions or not answers:
        return 0.0
    
    # Default weights: difficulty level determines weight
    if question_weights is None:
        question_weights = {}
    
    total_weight = 0.0
    correct_weight = 0.0
    
    for q in questions:
        q_id = q['id']
        difficulty = q.get('difficulty', 3)  # Default difficulty 3
        weight = question_weights.get(q_id, difficulty)  # Use custom weight or difficulty
        
        total_weight += weight
        
        if q_id in answers and answers[q_id] == q['correct_answer']:
            correct_weight += weight
    
    if total_weight == 0:
        return 0.0
    
    # Calculate raw score (0-1)
    raw_score = correct_weight / total_weight
    
    # Normalize to 0-10 scale
    normalized_score = raw_score * 10.0
    
    return round(normalized_score, 2)

def classify_skill_level(score: float) -> str:
    """
    Rule-based classification of skill level.
    Transparent and explainable mapping.
    """
    if score >= 7.5:
        return "Advanced"
    elif score >= 4.5:
        return "Intermediate"
    else:
        return "Beginner"

def generate_assessment_breakdown(questions: list, answers: dict, score: float) -> dict:
    """
    Generate detailed breakdown of assessment results.
    """
    total_questions = len(questions)
    correct_count = sum(1 for q in questions if answers.get(q['id']) == q['correct_answer'])
    
    difficulty_stats = {
        "1": {"total": 0, "correct": 0},
        "2": {"total": 0, "correct": 0},
        "3": {"total": 0, "correct": 0},
        "4": {"total": 0, "correct": 0},
        "5": {"total": 0, "correct": 0},
    }
    
    for q in questions:
        diff = str(q.get('difficulty', 3))
        difficulty_stats[diff]["total"] += 1
        if answers.get(q['id']) == q['correct_answer']:
            difficulty_stats[diff]["correct"] += 1
    
    accuracy_by_difficulty = {}
    for diff, stats in difficulty_stats.items():
        if stats["total"] > 0:
            accuracy_by_difficulty[f"difficulty_{diff}"] = {
                "accuracy": round((stats["correct"] / stats["total"]) * 100, 1),
                "correct": stats["correct"],
                "total": stats["total"]
            }
    
    return {
        "total_questions": total_questions,
        "correct_answers": correct_count,
        "overall_accuracy": round((correct_count / total_questions) * 100, 1) if total_questions > 0 else 0,
        "score": score,
        "level": classify_skill_level(score),
        "accuracy_by_difficulty": accuracy_by_difficulty
    }

