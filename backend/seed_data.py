"""
Seed demo data for SkillSync application.
Run this script to populate the database with sample questions and data.
"""

import sys
import os
import argparse

# Add the parent directory to the path so we can import app modules
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy.orm import Session
from app.database import SessionLocal, engine
from app.models import Base, MCQQuestion, User
from app.auth import get_password_hash

# Initialize database
Base.metadata.create_all(bind=engine)
db = SessionLocal()

def seed_mcq_questions(reset: bool = False):
    """Seed MCQ questions for various skills."""
    if reset:
        db.query(MCQQuestion).delete()
        db.commit()
        print("Cleared existing MCQ questions")
    
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

        # Node.js
        {
            "skill_name": "Node.js",
            "question_text": "What is the purpose of package.json?",
            "options": ["Project metadata and dependencies", "Runtime config only", "Database schema", "Build output"],
            "correct_answer": 0,
            "difficulty": 2,
            "explanation": "package.json defines project metadata, scripts, and dependencies"
        },
        {
            "skill_name": "Node.js",
            "question_text": "Which module is used for file system operations?",
            "options": ["fs", "http", "path", "os"],
            "correct_answer": 0,
            "difficulty": 2,
            "explanation": "The fs module provides file system APIs"
        },
        {
            "skill_name": "Node.js",
            "question_text": "What does npm install do?",
            "options": ["Installs dependencies from package.json", "Starts the server", "Runs tests", "Builds the app"],
            "correct_answer": 0,
            "difficulty": 1,
            "explanation": "npm install reads package.json and installs listed dependencies"
        },
        {
            "skill_name": "Node.js",
            "question_text": "What is the event loop in Node.js?",
            "options": ["Handles async callbacks", "A loop statement", "A database driver", "A testing tool"],
            "correct_answer": 0,
            "difficulty": 4,
            "explanation": "The event loop processes async operations and callbacks"
        },

        # TypeScript
        {
            "skill_name": "TypeScript",
            "question_text": "What is TypeScript primarily used for?",
            "options": ["Static typing for JavaScript", "Styling web pages", "Database queries", "Mobile apps"],
            "correct_answer": 0,
            "difficulty": 1,
            "explanation": "TypeScript adds static types to JavaScript"
        },
        {
            "skill_name": "TypeScript",
            "question_text": "Which keyword defines an interface?",
            "options": ["interface", "type", "struct", "class"],
            "correct_answer": 0,
            "difficulty": 2,
            "explanation": "interface defines object shape contracts in TypeScript"
        },
        {
            "skill_name": "TypeScript",
            "question_text": "What does 'as' do in TypeScript?",
            "options": ["Type assertion", "Import alias", "Async keyword", "Array spread"],
            "correct_answer": 0,
            "difficulty": 3,
            "explanation": "as is used for type assertions"
        },
        {
            "skill_name": "TypeScript",
            "question_text": "Which type represents any value?",
            "options": ["any", "void", "never", "unknown"],
            "correct_answer": 0,
            "difficulty": 2,
            "explanation": "any disables type checking for a value"
        },

        # SQL
        {
            "skill_name": "SQL",
            "question_text": "Which clause filters rows in SELECT?",
            "options": ["WHERE", "GROUP BY", "ORDER BY", "HAVING"],
            "correct_answer": 0,
            "difficulty": 2,
            "explanation": "WHERE filters rows before grouping"
        },
        {
            "skill_name": "SQL",
            "question_text": "What does JOIN do?",
            "options": ["Combines rows from tables", "Deletes rows", "Creates indexes", "Updates schema"],
            "correct_answer": 0,
            "difficulty": 3,
            "explanation": "JOIN combines related rows across tables"
        },
        {
            "skill_name": "SQL",
            "question_text": "Which command adds a new row?",
            "options": ["INSERT", "UPDATE", "SELECT", "ALTER"],
            "correct_answer": 0,
            "difficulty": 1,
            "explanation": "INSERT adds new records to a table"
        },
        {
            "skill_name": "SQL",
            "question_text": "What is an index used for?",
            "options": ["Speed up queries", "Encrypt data", "Backup tables", "Validate types"],
            "correct_answer": 0,
            "difficulty": 3,
            "explanation": "Indexes improve query lookup performance"
        },

        # Git
        {
            "skill_name": "Git",
            "question_text": "What does git commit do?",
            "options": ["Records a snapshot of changes", "Pushes to remote", "Merges branches", "Clones a repo"],
            "correct_answer": 0,
            "difficulty": 1,
            "explanation": "commit saves staged changes to local history"
        },
        {
            "skill_name": "Git",
            "question_text": "Which command creates a new branch?",
            "options": ["git branch", "git clone", "git pull", "git log"],
            "correct_answer": 0,
            "difficulty": 2,
            "explanation": "git branch creates a new branch pointer"
        },
        {
            "skill_name": "Git",
            "question_text": "What is a merge conflict?",
            "options": ["Overlapping changes that Git cannot auto-resolve", "A deleted branch", "A failed push", "A corrupt commit"],
            "correct_answer": 0,
            "difficulty": 3,
            "explanation": "Conflicts occur when changes overlap and need manual resolution"
        },
        {
            "skill_name": "Git",
            "question_text": "What does git stash do?",
            "options": ["Temporarily saves uncommitted changes", "Deletes commits", "Tags a release", "Rebases history"],
            "correct_answer": 0,
            "difficulty": 3,
            "explanation": "stash stores working directory changes for later"
        },

        # Algorithms
        {
            "skill_name": "Algorithms",
            "question_text": "What is Big O notation?",
            "options": ["Describes algorithm complexity", "A sorting algorithm", "A data structure", "A hash function"],
            "correct_answer": 0,
            "difficulty": 3,
            "explanation": "Big O describes growth rate of time or space complexity"
        },
        {
            "skill_name": "Algorithms",
            "question_text": "Which structure uses LIFO?",
            "options": ["Stack", "Queue", "Tree", "Graph"],
            "correct_answer": 0,
            "difficulty": 2,
            "explanation": "Stack is Last In, First Out"
        },
        {
            "skill_name": "Algorithms",
            "question_text": "Binary search requires what property?",
            "options": ["Sorted input", "Unique elements", "Even length", "Hashable keys"],
            "correct_answer": 0,
            "difficulty": 3,
            "explanation": "Binary search needs sorted data to halve the search space"
        },
        {
            "skill_name": "Algorithms",
            "question_text": "What is dynamic programming?",
            "options": ["Breaking problems into overlapping subproblems", "Parallel execution", "Randomized search", "Greedy selection"],
            "correct_answer": 0,
            "difficulty": 4,
            "explanation": "DP solves subproblems once and reuses results"
        },

        # CSS
        {
            "skill_name": "CSS",
            "question_text": "Which property controls element spacing inside the border?",
            "options": ["padding", "margin", "border", "gap"],
            "correct_answer": 0,
            "difficulty": 1,
            "explanation": "padding is space inside the border box"
        },
        {
            "skill_name": "CSS",
            "question_text": "What does display: flex do?",
            "options": ["Enables flexbox layout", "Hides element", "Adds animation", "Sets font"],
            "correct_answer": 0,
            "difficulty": 2,
            "explanation": "flex creates a flex container for children"
        },
        {
            "skill_name": "CSS",
            "question_text": "Which unit is relative to root font size?",
            "options": ["rem", "em", "px", "vh"],
            "correct_answer": 0,
            "difficulty": 2,
            "explanation": "rem is relative to the root element font size"
        },

        # HTML
        {
            "skill_name": "HTML",
            "question_text": "Which tag defines the largest heading?",
            "options": ["h1", "header", "title", "head"],
            "correct_answer": 0,
            "difficulty": 1,
            "explanation": "h1 is the top-level heading element"
        },
        {
            "skill_name": "HTML",
            "question_text": "What is the purpose of alt on img?",
            "options": ["Alternative text for accessibility", "Image alignment", "Animation delay", "Aspect ratio"],
            "correct_answer": 0,
            "difficulty": 2,
            "explanation": "alt provides text when image cannot be displayed"
        },
        {
            "skill_name": "HTML",
            "question_text": "Which attribute makes a link open in new tab?",
            "options": ["target=\"_blank\"", "href=\"new\"", "rel=\"open\"", "tab=\"new\""],
            "correct_answer": 0,
            "difficulty": 2,
            "explanation": "target=_blank opens the link in a new browsing context"
        },

        # Pandas
        {
            "skill_name": "Pandas",
            "question_text": "What is a DataFrame?",
            "options": ["2D labeled data structure", "A CSV file", "A plot type", "A database"],
            "correct_answer": 0,
            "difficulty": 2,
            "explanation": "DataFrame is a 2D table with labeled axes"
        },
        {
            "skill_name": "Pandas",
            "question_text": "Which method reads a CSV file?",
            "options": ["read_csv", "load_csv", "import_csv", "open_csv"],
            "correct_answer": 0,
            "difficulty": 1,
            "explanation": "pd.read_csv loads CSV data into a DataFrame"
        },
        {
            "skill_name": "Pandas",
            "question_text": "What does df.groupby do?",
            "options": ["Groups rows for aggregation", "Sorts columns", "Deletes nulls", "Merges files"],
            "correct_answer": 0,
            "difficulty": 3,
            "explanation": "groupby splits data into groups for summary operations"
        },

        # NumPy
        {
            "skill_name": "NumPy",
            "question_text": "What is a NumPy ndarray?",
            "options": ["N-dimensional array", "A string buffer", "A file format", "A web framework"],
            "correct_answer": 0,
            "difficulty": 2,
            "explanation": "ndarray is NumPy's core n-dimensional array type"
        },
        {
            "skill_name": "NumPy",
            "question_text": "Which function creates an array of zeros?",
            "options": ["np.zeros", "np.empty", "np.ones", "np.array"],
            "correct_answer": 0,
            "difficulty": 1,
            "explanation": "np.zeros creates an array filled with zeros"
        },
        {
            "skill_name": "NumPy",
            "question_text": "What does vectorization mean in NumPy?",
            "options": ["Operations on whole arrays without Python loops", "GPU rendering", "File compression", "Type conversion"],
            "correct_answer": 0,
            "difficulty": 3,
            "explanation": "Vectorized ops apply element-wise on arrays efficiently"
        },

        # API Design
        {
            "skill_name": "API Design",
            "question_text": "Which HTTP method is typically used to create a resource?",
            "options": ["POST", "GET", "DELETE", "OPTIONS"],
            "correct_answer": 0,
            "difficulty": 2,
            "explanation": "POST commonly creates new resources"
        },
        {
            "skill_name": "API Design",
            "question_text": "What is REST?",
            "options": ["Architectural style using HTTP resources", "A database", "A JS framework", "A caching layer"],
            "correct_answer": 0,
            "difficulty": 2,
            "explanation": "REST uses HTTP verbs on resource URLs"
        },
        {
            "skill_name": "API Design",
            "question_text": "What does 404 mean?",
            "options": ["Resource not found", "Unauthorized", "Server error", "Success"],
            "correct_answer": 0,
            "difficulty": 1,
            "explanation": "404 indicates the requested resource was not found"
        },
        {
            "skill_name": "API Design",
            "question_text": "Why use versioning in APIs?",
            "options": ["Backward compatibility", "Faster queries", "Smaller payloads", "Encryption"],
            "correct_answer": 0,
            "difficulty": 3,
            "explanation": "Versioning lets clients migrate without breaking changes"
        },

        # System Design
        {
            "skill_name": "System Design",
            "question_text": "What is horizontal scaling?",
            "options": ["Adding more servers", "Upgrading CPU on one server", "Compressing data", "Caching only"],
            "correct_answer": 0,
            "difficulty": 3,
            "explanation": "Horizontal scaling adds more machines to handle load"
        },
        {
            "skill_name": "System Design",
            "question_text": "What is a load balancer used for?",
            "options": ["Distributes traffic across servers", "Stores sessions", "Encrypts traffic", "Indexes databases"],
            "correct_answer": 0,
            "difficulty": 2,
            "explanation": "Load balancers spread requests across backends"
        },
        {
            "skill_name": "System Design",
            "question_text": "What is caching primarily used for?",
            "options": ["Reduce latency and load", "Backup data", "Authenticate users", "Parse JSON"],
            "correct_answer": 0,
            "difficulty": 2,
            "explanation": "Caching stores frequently accessed data closer to consumers"
        },

        # DevOps
        {
            "skill_name": "DevOps",
            "question_text": "What is CI?",
            "options": ["Continuous Integration", "Central Index", "Code Injection", "Cluster Instance"],
            "correct_answer": 0,
            "difficulty": 2,
            "explanation": "CI automates building and testing on each change"
        },
        {
            "skill_name": "DevOps",
            "question_text": "What does a container provide?",
            "options": ["Isolated runtime environment", "Physical server", "DNS record", "SQL database"],
            "correct_answer": 0,
            "difficulty": 2,
            "explanation": "Containers package app and dependencies with isolation"
        },
        {
            "skill_name": "DevOps",
            "question_text": "What is Kubernetes used for?",
            "options": ["Orchestrating containers", "Writing CSS", "Unit testing", "Email delivery"],
            "correct_answer": 0,
            "difficulty": 3,
            "explanation": "Kubernetes manages container deployment and scaling"
        },

        # Testing
        {
            "skill_name": "Testing",
            "question_text": "What is a unit test?",
            "options": ["Tests a small isolated piece of code", "Tests entire UI manually", "Load test", "Security audit"],
            "correct_answer": 0,
            "difficulty": 2,
            "explanation": "Unit tests verify individual functions or modules"
        },
        {
            "skill_name": "Testing",
            "question_text": "What is mocking in tests?",
            "options": ["Replacing dependencies with controlled fakes", "Deleting test data", "Skipping failures", "Random input"],
            "correct_answer": 0,
            "difficulty": 3,
            "explanation": "Mocks simulate dependencies for predictable tests"
        },
        {
            "skill_name": "Testing",
            "question_text": "What does TDD stand for?",
            "options": ["Test-Driven Development", "Total Data Design", "Typed Domain Model", "Task Dispatch Daemon"],
            "correct_answer": 0,
            "difficulty": 2,
            "explanation": "TDD writes tests before implementation"
        },
    ]
    
    existing_keys = {
        (q.skill_name, q.question_text)
        for q in db.query(MCQQuestion.skill_name, MCQQuestion.question_text).all()
    }

    added = 0
    for q_data in questions_data:
        key = (q_data["skill_name"], q_data["question_text"])
        if key not in existing_keys:
            db.add(MCQQuestion(**q_data))
            added += 1

    db.commit()
    print(f"Seeded {added} new MCQ questions ({len(questions_data)} total in seed file)")

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
    parser = argparse.ArgumentParser(description="Seed SkillSync database")
    parser.add_argument("--reset", action="store_true", help="Clear MCQ questions before seeding")
    args = parser.parse_args()

    print("Seeding database...")
    seed_mcq_questions(reset=args.reset)
    seed_demo_user()
    print("Database seeded successfully!")

