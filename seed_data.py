"""
Seed demo data for SkillSync application.
Run this script to populate the database with sample questions and data.
"""

import sys
import os

# Add the parent directory to the path so we can import app modules
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

import sys
import os

# Add the parent directory to the path so we can import app modules
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy.orm import Session
from app.database import SessionLocal, engine
from app.models import Base, MCQQuestion, User
from app.auth import get_password_hash

# Initialize database
Base.metadata.create_all(bind=engine)
db = SessionLocal()

def seed_mcq_questions():
    """Seed MCQ questions for various skills."""
    
    questions_data = [
        # Python Questions
        {
            "skill_name": "Python",
            "question_text": "What is the output of: print(2 ** 3)?",
            "options": ["6", "8", "9", "5"],
            "correct_answer": 1,
            "difficulty": 2,
            "explanation": "The ** operator is exponentiation. 2 ** 3 = 8"
        },
        {
            "skill_name": "Python",
            "question_text": "Which method is used to add an item to a list?",
            "options": ["append()", "add()", "insert()", "push()"],
            "correct_answer": 0,
            "difficulty": 1,
            "explanation": "append() adds an item to the end of a list"
        },
        {
            "skill_name": "Python",
            "question_text": "What is a decorator in Python?",
            "options": [
                "A function that modifies other functions",
                "A type of variable",
                "A loop construct",
                "A data structure"
            ],
            "correct_answer": 0,
            "difficulty": 4,
            "explanation": "Decorators are functions that modify the behavior of other functions"
        },
        {
            "skill_name": "Python",
            "question_text": "How do you create a virtual environment?",
            "options": [
                "python -m venv env",
                "python create env",
                "pip install venv",
                "virtualenv create"
            ],
            "correct_answer": 0,
            "difficulty": 2,
            "explanation": "python -m venv env creates a virtual environment named 'env'"
        },
        {
            "skill_name": "Python",
            "question_text": "What is list comprehension?",
            "options": [
                "A way to create lists concisely",
                "A sorting algorithm",
                "A data structure",
                "A type of loop"
            ],
            "correct_answer": 0,
            "difficulty": 3,
            "explanation": "List comprehension provides a concise way to create lists"
        },
        
        # JavaScript Questions
        {
            "skill_name": "JavaScript",
            "question_text": "What is the difference between let and var?",
            "options": [
                "let has block scope, var has function scope",
                "No difference",
                "var is newer",
                "let is deprecated"
            ],
            "correct_answer": 0,
            "difficulty": 2,
            "explanation": "let has block scope, var has function scope"
        },
        {
            "skill_name": "JavaScript",
            "question_text": "What is a closure?",
            "options": [
                "A function with access to outer scope variables",
                "A type of loop",
                "A data structure",
                "A method"
            ],
            "correct_answer": 0,
            "difficulty": 4,
            "explanation": "Closures allow functions to access variables from outer scopes"
        },
        {
            "skill_name": "JavaScript",
            "question_text": "What does '===' check?",
            "options": [
                "Value and type equality",
                "Only value equality",
                "Only type equality",
                "Reference equality"
            ],
            "correct_answer": 0,
            "difficulty": 2,
            "explanation": "=== checks both value and type equality (strict equality)"
        },
        
        # React Questions
        {
            "skill_name": "React",
            "question_text": "What is JSX?",
            "options": [
                "JavaScript XML syntax extension",
                "A JavaScript library",
                "A CSS framework",
                "A database"
            ],
            "correct_answer": 0,
            "difficulty": 2,
            "explanation": "JSX is a syntax extension that allows writing HTML-like code in JavaScript"
        },
        {
            "skill_name": "React",
            "question_text": "What are React Hooks?",
            "options": [
                "Functions that let you use state and lifecycle in functional components",
                "React components",
                "React libraries",
                "React utilities"
            ],
            "correct_answer": 0,
            "difficulty": 3,
            "explanation": "Hooks allow functional components to use state and lifecycle features"
        },
        {
            "skill_name": "React",
            "question_text": "What is the purpose of useEffect?",
            "options": [
                "To perform side effects in functional components",
                "To manage state",
                "To render components",
                "To handle events"
            ],
            "correct_answer": 0,
            "difficulty": 3,
            "explanation": "useEffect handles side effects like API calls, subscriptions, etc."
        },
        
        # Machine Learning Questions
        {
            "skill_name": "Machine Learning",
            "question_text": "What is overfitting?",
            "options": [
                "Model performs well on training data but poorly on test data",
                "Model performs poorly on training data",
                "Model trains too slowly",
                "Model uses too much memory"
            ],
            "correct_answer": 0,
            "difficulty": 3,
            "explanation": "Overfitting occurs when a model learns training data too well, including noise"
        },
        {
            "skill_name": "Machine Learning",
            "question_text": "What is cross-validation used for?",
            "options": [
                "To assess model performance",
                "To train the model",
                "To preprocess data",
                "To deploy the model"
            ],
            "correct_answer": 0,
            "difficulty": 3,
            "explanation": "Cross-validation helps assess how well a model generalizes"
        },
        
        # Statistics Questions
        {
            "skill_name": "Statistics",
            "question_text": "What is the mean?",
            "options": [
                "Average of all values",
                "Middle value when sorted",
                "Most frequent value",
                "Difference between max and min"
            ],
            "correct_answer": 0,
            "difficulty": 1,
            "explanation": "Mean is the arithmetic average of all values"
        },
        {
            "skill_name": "Statistics",
            "question_text": "What is standard deviation?",
            "options": [
                "Measure of data spread",
                "Average value",
                "Maximum value",
                "Minimum value"
            ],
            "correct_answer": 0,
            "difficulty": 3,
            "explanation": "Standard deviation measures how spread out values are from the mean"
        },
        
        # Database Questions
        {
            "skill_name": "Database",
            "question_text": "What is a primary key?",
            "options": [
                "Unique identifier for a row",
                "Foreign key reference",
                "Index on a column",
                "Constraint on data type"
            ],
            "correct_answer": 0,
            "difficulty": 2,
            "explanation": "Primary key uniquely identifies each row in a table"
        },
        {
            "skill_name": "Database",
            "question_text": "What is normalization?",
            "options": [
                "Organizing data to reduce redundancy",
                "Scaling databases",
                "Backing up data",
                "Encrypting data"
            ],
            "correct_answer": 0,
            "difficulty": 4,
            "explanation": "Normalization organizes data to minimize redundancy and dependency"
        },
    ]
    
    # Clear existing questions (optional - comment out to keep existing)
    # db.query(MCQQuestion).delete()
    
    # Add questions
    for q_data in questions_data:
        question = MCQQuestion(**q_data)
        db.add(question)
    
    db.commit()
    print(f"Seeded {len(questions_data)} MCQ questions")

def seed_demo_user():
    """Create a demo user for testing."""
    demo_email = "demo@skillsync.com"
    existing_user = db.query(User).filter(User.email == demo_email).first()
    
    if not existing_user:
        demo_user = User(
            email=demo_email,
            hashed_password=get_password_hash("demo123"),
            full_name="Demo User",
            career_goal="Software Engineer",
            hours_per_week=10
        )
        db.add(demo_user)
        db.commit()
        print("Created demo user: demo@skillsync.com / demo123")
    else:
        print("Demo user already exists")

if __name__ == "__main__":
    print("Seeding database...")
    seed_mcq_questions()
    seed_demo_user()
    print("Database seeded successfully!")

