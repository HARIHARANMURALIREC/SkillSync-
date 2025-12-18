"""
Custom AI Engine: Learning Path Generator
Uses graph-based algorithms (NetworkX) to generate personalized learning paths.
"""

import networkx as nx
from typing import List, Dict
from datetime import datetime, timedelta

# Skill dependency graph (prerequisites)
SKILL_DEPENDENCIES = {
    "React": ["JavaScript", "HTML", "CSS"],
    "Node.js": ["JavaScript"],
    "TypeScript": ["JavaScript"],
    "Machine Learning": ["Python", "Statistics"],
    "Deep Learning": ["Machine Learning", "Python"],
    "API Design": ["Python", "Database"],
    "System Design": ["Database", "API Design"],
    "State Management": ["React", "JavaScript"],
    "Data Visualization": ["Python", "Statistics"],
    "Pandas": ["Python"],
    "NumPy": ["Python"],
}

# Learning resources database - Real open-source resources
LEARNING_RESOURCES = {
    "Python": [
        {"title": "Python Official Tutorial", "type": "article", "url": "https://docs.python.org/3/tutorial/", "estimated_hours": 12},
        {"title": "Real Python Tutorials", "type": "article", "url": "https://realpython.com/", "estimated_hours": 10},
        {"title": "Python Practice - LeetCode", "type": "practice", "url": "https://leetcode.com/problemset/all/?topicSlugs=python", "estimated_hours": 8},
        {"title": "Python Exercises - HackerRank", "type": "practice", "url": "https://www.hackerrank.com/domains/python", "estimated_hours": 6},
        {"title": "Python for Everybody (Coursera)", "type": "course", "url": "https://www.coursera.org/specializations/python", "estimated_hours": 20},
    ],
    "JavaScript": [
        {"title": "MDN JavaScript Guide", "type": "article", "url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide", "estimated_hours": 15},
        {"title": "JavaScript.info - Modern Tutorial", "type": "article", "url": "https://javascript.info/", "estimated_hours": 20},
        {"title": "FreeCodeCamp JavaScript Course", "type": "course", "url": "https://www.freecodecamp.org/learn/javascript-algorithms-and-data-structures/", "estimated_hours": 30},
        {"title": "JavaScript Practice - Codewars", "type": "practice", "url": "https://www.codewars.com/kata/search/javascript", "estimated_hours": 10},
        {"title": "30 Days of JavaScript (GitHub)", "type": "practice", "url": "https://github.com/Asabeneh/30-Days-Of-JavaScript", "estimated_hours": 15},
    ],
    "React": [
        {"title": "React Official Documentation", "type": "article", "url": "https://react.dev/learn", "estimated_hours": 20},
        {"title": "React Tutorial - Build Tic-Tac-Toe", "type": "practice", "url": "https://react.dev/learn/tutorial-tic-tac-toe", "estimated_hours": 4},
        {"title": "FreeCodeCamp React Course", "type": "course", "url": "https://www.freecodecamp.org/learn/front-end-development-libraries/", "estimated_hours": 25},
        {"title": "React Projects (GitHub)", "type": "practice", "url": "https://github.com/Asabeneh/30-Days-Of-React", "estimated_hours": 20},
        {"title": "React Patterns & Best Practices", "type": "article", "url": "https://reactpatterns.com/", "estimated_hours": 6},
    ],
    "Node.js": [
        {"title": "Node.js Official Documentation", "type": "article", "url": "https://nodejs.org/en/docs/guides/", "estimated_hours": 12},
        {"title": "Node.js Best Practices (GitHub)", "type": "article", "url": "https://github.com/goldbergyoni/nodebestpractices", "estimated_hours": 8},
        {"title": "FreeCodeCamp Node.js Course", "type": "course", "url": "https://www.freecodecamp.org/learn/back-end-development-and-apis/", "estimated_hours": 30},
        {"title": "Node.js Practice Projects", "type": "practice", "url": "https://github.com/topics/nodejs-projects", "estimated_hours": 15},
    ],
    "TypeScript": [
        {"title": "TypeScript Handbook", "type": "article", "url": "https://www.typescriptlang.org/docs/handbook/intro.html", "estimated_hours": 15},
        {"title": "TypeScript Deep Dive (GitHub)", "type": "article", "url": "https://github.com/basarat/typescript-book", "estimated_hours": 12},
        {"title": "TypeScript Exercises", "type": "practice", "url": "https://typescript-exercises.github.io/", "estimated_hours": 10},
    ],
    "Machine Learning": [
        {"title": "Scikit-learn User Guide", "type": "article", "url": "https://scikit-learn.org/stable/user_guide.html", "estimated_hours": 15},
        {"title": "Machine Learning Course (Andrew Ng)", "type": "course", "url": "https://www.coursera.org/learn/machine-learning", "estimated_hours": 60},
        {"title": "ML Projects (GitHub)", "type": "practice", "url": "https://github.com/topics/machine-learning-projects", "estimated_hours": 20},
        {"title": "Kaggle Learn - Machine Learning", "type": "course", "url": "https://www.kaggle.com/learn/intro-to-machine-learning", "estimated_hours": 10},
    ],
    "Deep Learning": [
        {"title": "Deep Learning Book (Ian Goodfellow)", "type": "article", "url": "https://www.deeplearningbook.org/", "estimated_hours": 40},
        {"title": "Fast.ai Practical Deep Learning", "type": "course", "url": "https://course.fast.ai/", "estimated_hours": 50},
        {"title": "PyTorch Tutorials", "type": "article", "url": "https://pytorch.org/tutorials/", "estimated_hours": 20},
        {"title": "TensorFlow Tutorials", "type": "article", "url": "https://www.tensorflow.org/tutorials", "estimated_hours": 20},
    ],
    "Statistics": [
        {"title": "Think Stats (Open Book)", "type": "article", "url": "https://greenteapress.com/thinkstats2/thinkstats2.pdf", "estimated_hours": 25},
        {"title": "Khan Academy Statistics", "type": "course", "url": "https://www.khanacademy.org/math/statistics-probability", "estimated_hours": 30},
        {"title": "Statistics for Data Science", "type": "article", "url": "https://www.kaggle.com/learn/intro-to-statistics", "estimated_hours": 8},
    ],
    "Database": [
        {"title": "SQL Tutorial - W3Schools", "type": "article", "url": "https://www.w3schools.com/sql/", "estimated_hours": 10},
        {"title": "SQL Practice - LeetCode Database", "type": "practice", "url": "https://leetcode.com/problemset/database/", "estimated_hours": 12},
        {"title": "PostgreSQL Tutorial", "type": "article", "url": "https://www.postgresqltutorial.com/", "estimated_hours": 15},
        {"title": "Database Design Fundamentals", "type": "article", "url": "https://www.lucidchart.com/pages/database-diagram/database-design", "estimated_hours": 6},
    ],
    "SQL": [
        {"title": "SQL Tutorial - W3Schools", "type": "article", "url": "https://www.w3schools.com/sql/", "estimated_hours": 10},
        {"title": "SQL Practice - LeetCode Database", "type": "practice", "url": "https://leetcode.com/problemset/database/", "estimated_hours": 12},
        {"title": "SQLBolt - Interactive SQL Tutorial", "type": "practice", "url": "https://sqlbolt.com/", "estimated_hours": 8},
    ],
    "CSS": [
        {"title": "MDN CSS Guide", "type": "article", "url": "https://developer.mozilla.org/en-US/docs/Web/CSS", "estimated_hours": 15},
        {"title": "CSS-Tricks Complete Guide", "type": "article", "url": "https://css-tricks.com/guides/", "estimated_hours": 12},
        {"title": "FreeCodeCamp CSS Course", "type": "course", "url": "https://www.freecodecamp.org/learn/2022/responsive-web-design/", "estimated_hours": 20},
    ],
    "HTML": [
        {"title": "MDN HTML Guide", "type": "article", "url": "https://developer.mozilla.org/en-US/docs/Web/HTML", "estimated_hours": 10},
        {"title": "HTML5 Tutorial", "type": "article", "url": "https://www.w3schools.com/html/", "estimated_hours": 8},
    ],
    "State Management": [
        {"title": "Redux Official Documentation", "type": "article", "url": "https://redux.js.org/introduction/getting-started", "estimated_hours": 12},
        {"title": "Zustand Documentation", "type": "article", "url": "https://github.com/pmndrs/zustand", "estimated_hours": 6},
        {"title": "React Context API Guide", "type": "article", "url": "https://react.dev/learn/passing-data-deeply-with-context", "estimated_hours": 4},
    ],
    "UI/UX": [
        {"title": "Material Design Guidelines", "type": "article", "url": "https://m3.material.io/", "estimated_hours": 10},
        {"title": "UX Design Principles", "type": "article", "url": "https://www.interaction-design.org/literature/topics/ux-design", "estimated_hours": 8},
    ],
    "Testing": [
        {"title": "Jest Documentation", "type": "article", "url": "https://jestjs.io/docs/getting-started", "estimated_hours": 8},
        {"title": "React Testing Library", "type": "article", "url": "https://testing-library.com/docs/react-testing-library/intro/", "estimated_hours": 6},
    ],
    "API Design": [
        {"title": "REST API Tutorial", "type": "article", "url": "https://restfulapi.net/", "estimated_hours": 10},
        {"title": "FastAPI Documentation", "type": "article", "url": "https://fastapi.tiangolo.com/", "estimated_hours": 15},
        {"title": "API Design Best Practices", "type": "article", "url": "https://github.com/microsoft/api-guidelines", "estimated_hours": 6},
    ],
    "System Design": [
        {"title": "System Design Primer (GitHub)", "type": "article", "url": "https://github.com/donnemartin/system-design-primer", "estimated_hours": 30},
        {"title": "High Scalability Blog", "type": "article", "url": "http://highscalability.com/", "estimated_hours": 12},
    ],
    "DevOps": [
        {"title": "Docker Documentation", "type": "article", "url": "https://docs.docker.com/get-started/", "estimated_hours": 10},
        {"title": "Kubernetes Tutorial", "type": "article", "url": "https://kubernetes.io/docs/tutorials/", "estimated_hours": 20},
        {"title": "GitHub Actions Documentation", "type": "article", "url": "https://docs.github.com/en/actions", "estimated_hours": 8},
    ],
    "Security": [
        {"title": "OWASP Top 10", "type": "article", "url": "https://owasp.org/www-project-top-ten/", "estimated_hours": 8},
        {"title": "Web Security Basics", "type": "article", "url": "https://developer.mozilla.org/en-US/docs/Web/Security", "estimated_hours": 10},
    ],
    "Caching": [
        {"title": "Redis Documentation", "type": "article", "url": "https://redis.io/docs/getting-started/", "estimated_hours": 8},
        {"title": "Caching Strategies", "type": "article", "url": "https://aws.amazon.com/caching/best-practices/", "estimated_hours": 6},
    ],
    "Data Visualization": [
        {"title": "Matplotlib Tutorial", "type": "article", "url": "https://matplotlib.org/stable/tutorials/index.html", "estimated_hours": 10},
        {"title": "D3.js Documentation", "type": "article", "url": "https://d3js.org/getting-started", "estimated_hours": 15},
        {"title": "Plotly Python Tutorial", "type": "article", "url": "https://plotly.com/python/", "estimated_hours": 8},
    ],
    "Pandas": [
        {"title": "Pandas Documentation", "type": "article", "url": "https://pandas.pydata.org/docs/user_guide/index.html", "estimated_hours": 15},
        {"title": "10 Minutes to Pandas", "type": "article", "url": "https://pandas.pydata.org/docs/user_guide/10min.html", "estimated_hours": 2},
        {"title": "Pandas Practice Exercises", "type": "practice", "url": "https://github.com/guipsamora/pandas_exercises", "estimated_hours": 10},
    ],
    "NumPy": [
        {"title": "NumPy User Guide", "type": "article", "url": "https://numpy.org/doc/stable/user/index.html", "estimated_hours": 12},
        {"title": "NumPy Tutorial", "type": "article", "url": "https://www.w3schools.com/python/numpy/numpy_intro.asp", "estimated_hours": 6},
    ],
    "Algorithms": [
        {"title": "LeetCode Algorithm Problems", "type": "practice", "url": "https://leetcode.com/problemset/all/", "estimated_hours": 30},
        {"title": "Algorithm Visualizations", "type": "article", "url": "https://visualgo.net/en", "estimated_hours": 10},
        {"title": "Grokking Algorithms Book", "type": "article", "url": "https://github.com/egonSchiele/grokking_algorithms", "estimated_hours": 15},
    ],
    "Git": [
        {"title": "Git Official Documentation", "type": "article", "url": "https://git-scm.com/doc", "estimated_hours": 10},
        {"title": "GitHub Learning Lab", "type": "practice", "url": "https://lab.github.com/", "estimated_hours": 8},
        {"title": "Atlassian Git Tutorials", "type": "article", "url": "https://www.atlassian.com/git/tutorials", "estimated_hours": 6},
    ],
}

def build_skill_graph(skill_gaps: List[Dict]) -> nx.DiGraph:
    """Build a directed graph of skill dependencies."""
    G = nx.DiGraph()
    
    # Add all skills from gaps
    skills_to_learn = [gap["skill_name"] for gap in skill_gaps if gap["gap"] > 0]
    
    for skill in skills_to_learn:
        G.add_node(skill)
    
    # Add dependencies
    for skill in skills_to_learn:
        if skill in SKILL_DEPENDENCIES:
            for prereq in SKILL_DEPENDENCIES[skill]:
                if prereq in skills_to_learn or prereq in [s["skill_name"] for s in skill_gaps]:
                    G.add_edge(prereq, skill)
    
    return G

def generate_learning_path_explanation(skill_name: str, skill_gap: Dict, skill_gaps: List[Dict]) -> List[str]:
    """Generate explanation for why a skill is in the learning path."""
    explanation = []
    
    # Priority explanation
    if skill_gap["priority"] == "High":
        explanation.append(f"High priority skill for your career goal")
    elif skill_gap["priority"] == "Medium":
        explanation.append(f"Medium priority skill")
    
    # Gap explanation
    if skill_gap["gap"] > 5.0:
        explanation.append(f"Large skill gap: {skill_gap['gap']:.1f} points")
    elif skill_gap["gap"] > 2.5:
        explanation.append(f"Moderate skill gap: {skill_gap['gap']:.1f} points")
    else:
        explanation.append(f"Small skill gap: {skill_gap['gap']:.1f} points")
    
    # Dependency explanation
    if skill_name in SKILL_DEPENDENCIES:
        prerequisites = SKILL_DEPENDENCIES[skill_name]
        existing_prereqs = [p for p in prerequisites if any(g["skill_name"] == p for g in skill_gaps)]
        if existing_prereqs:
            explanation.append(f"Prerequisites: {', '.join(existing_prereqs[:2])}")
    
    return explanation

def calculate_skill_difficulty(skill_name: str, gap: float) -> float:
    """Calculate learning difficulty for a skill based on gap and complexity."""
    base_difficulty = 1.0
    
    # Adjust based on gap size
    if gap > 7.0:
        base_difficulty = 3.0
    elif gap > 4.0:
        base_difficulty = 2.0
    
    # Adjust based on skill complexity (hardcoded for demo)
    complex_skills = ["Machine Learning", "Deep Learning", "System Design", "Algorithms"]
    if skill_name in complex_skills:
        base_difficulty += 1.0
    
    return base_difficulty

def generate_learning_path(skill_gaps: List[Dict], hours_per_week: int) -> List[Dict]:
    """
    Generate a personalized learning path using topological sort.
    
    Returns weekly learning schedule.
    """
    if not skill_gaps or hours_per_week <= 0:
        return []
    
    # Filter only skills with gaps
    skills_to_learn = [gap for gap in skill_gaps if gap["gap"] > 0 and gap["priority"] != "Low"]
    
    if not skills_to_learn:
        return []
    
    # Build dependency graph
    G = build_skill_graph(skill_gaps)
    
    # Topological sort to get learning order
    try:
        learning_order = list(nx.topological_sort(G))
    except nx.NetworkXError:
        # If cycle exists, use priority-based order
        learning_order = sorted([g["skill_name"] for g in skills_to_learn], 
                               key=lambda s: next((g["priority"] for g in skills_to_learn if g["skill_name"] == s), "Low"))
    
    # Ensure all skills are in the order
    for skill_gap in skills_to_learn:
        if skill_gap["skill_name"] not in learning_order:
            learning_order.append(skill_gap["skill_name"])
    
    # Allocate skills to weeks
    weekly_paths = []
    current_week = 1
    current_week_hours = 0.0
    current_week_skills = []
    
    for skill_name in learning_order:
        skill_gap = next((g for g in skills_to_learn if g["skill_name"] == skill_name), None)
        if not skill_gap:
            continue
        
        # Get resources for this skill
        resources = LEARNING_RESOURCES.get(skill_name, [
            {"title": f"{skill_name} Learning Resources", "type": "course", "url": f"https://example.com/{skill_name.lower()}", "estimated_hours": 10}
        ])
        
        # Calculate total hours needed (based on gap and difficulty)
        difficulty = calculate_skill_difficulty(skill_name, skill_gap["gap"])
        estimated_hours = max(8.0, skill_gap["gap"] * difficulty)
        
        # If adding this skill exceeds weekly hours, start a new week
        if current_week_hours + estimated_hours > hours_per_week and current_week_skills:
            # Generate explanations for skills in this week
            week_explanations = []
            for skill in current_week_skills:
                skill_gap_obj = next((g for g in skills_to_learn if g["skill_name"] == skill), None)
                if skill_gap_obj:
                    skill_explanations = generate_learning_path_explanation(skill, skill_gap_obj, skill_gaps)
                    week_explanations.extend(skill_explanations)
            
            # Deduplicate and limit explanations
            unique_explanations = []
            seen = set()
            for exp in week_explanations:
                if exp not in seen:
                    unique_explanations.append(exp)
                    seen.add(exp)
                    if len(unique_explanations) >= 3:
                        break
            
            # Save current week
            weekly_paths.append({
                "week_number": current_week,
                "skill_name": current_week_skills[0] if len(current_week_skills) == 1 else "Multiple Skills",
                "skills": current_week_skills.copy(),
                "resources": sum([LEARNING_RESOURCES.get(s, []) for s in current_week_skills], []),
                "estimated_hours": current_week_hours,
                "explanation": unique_explanations if unique_explanations else []
            })
            current_week += 1
            current_week_hours = 0.0
            current_week_skills = []
        
        # Add skill to current week
        current_week_skills.append(skill_name)
        current_week_hours += estimated_hours
        
        # If this skill alone exceeds weekly hours, make it its own week
        if estimated_hours > hours_per_week:
            explanation = generate_learning_path_explanation(skill_name, skill_gap, skill_gaps)
            weekly_paths.append({
                "week_number": current_week,
                "skill_name": skill_name,
                "skills": [skill_name],
                "resources": resources,
                "estimated_hours": estimated_hours,
                "explanation": explanation
            })
            current_week += 1
            current_week_hours = 0.0
            current_week_skills = []
    
    # Add remaining skills from last week
    if current_week_skills:
        all_resources = []
        week_explanations = []
        for skill in current_week_skills:
            all_resources.extend(LEARNING_RESOURCES.get(skill, []))
            skill_gap_obj = next((g for g in skills_to_learn if g["skill_name"] == skill), None)
            if skill_gap_obj:
                skill_explanations = generate_learning_path_explanation(skill, skill_gap_obj, skill_gaps)
                week_explanations.extend(skill_explanations)
        
        # Deduplicate and limit explanations
        unique_explanations = []
        seen = set()
        for exp in week_explanations:
            if exp not in seen:
                unique_explanations.append(exp)
                seen.add(exp)
                if len(unique_explanations) >= 3:
                    break
        
        weekly_paths.append({
            "week_number": current_week,
            "skill_name": current_week_skills[0] if len(current_week_skills) == 1 else "Multiple Skills",
            "skills": current_week_skills,
            "resources": all_resources,
            "estimated_hours": current_week_hours,
            "explanation": unique_explanations if unique_explanations else []
        })
    
    return weekly_paths

