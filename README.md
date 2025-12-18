# SkillSync - AI-Powered Personalized Learning Path Generator

A complete full-stack web application that generates personalized learning paths using custom AI algorithms (no external LLM APIs).

## Features

- 🎯 **Skill Assessment**: MCQ-based skill assessments with weighted scoring
- 📊 **Skill Gap Analysis**: Compare your skills against career role requirements
- 🗺️ **Learning Path Generation**: AI-powered personalized learning paths using graph algorithms (NetworkX)
- 📈 **Progress Tracking**: Visual dashboards with radar charts and progress cards
- 🔐 **JWT Authentication**: Secure user authentication and protected routes
- 🎨 **Modern UI**: Clean, professional interface built with React and Tailwind CSS

## Tech Stack

### Backend
- **FastAPI** - Modern Python web framework
- **SQLAlchemy** - ORM for database operations
- **SQLite** - Database (can be switched to PostgreSQL)
- **JWT** - Authentication
- **NetworkX** - Graph algorithms for learning path generation
- **Pydantic** - Data validation

### Frontend
- **React 18** - UI library
- **Vite** - Build tool
- **Tailwind CSS** - Utility-first CSS framework
- **React Router** - Navigation
- **Recharts** - Charting library
- **Axios** - HTTP client

### AI/Intelligence (Custom-Built)
- **Rule-based skill evaluation** - Weighted scoring algorithms
- **Graph-based learning paths** - Topological sorting for skill dependencies
- **Skill gap analysis** - Priority-based gap calculation
- **Progress recommendations** - Adaptive learning suggestions

## Project Structure

```
SkillSync-V1/
├── backend/
│   ├── app/
│   │   ├── ai/
│   │   │   ├── skill_evaluator.py      # MCQ scoring and skill level classification
│   │   │   ├── gap_analyzer.py         # Skill gap analysis vs career requirements
│   │   │   ├── learning_path_engine.py # Graph-based learning path generation
│   │   │   └── recommender.py          # Progress-based recommendations
│   │   ├── routers/
│   │   │   ├── auth.py                 # Authentication endpoints
│   │   │   ├── assessment.py           # MCQ assessment endpoints
│   │   │   ├── dashboard.py            # Dashboard data endpoint
│   │   │   ├── learning_path.py        # Learning path endpoints
│   │   │   └── profile.py              # User profile endpoints
│   │   ├── database.py                 # Database configuration
│   │   ├── models.py                   # SQLAlchemy models
│   │   ├── schemas.py                  # Pydantic schemas
│   │   ├── auth.py                     # JWT authentication
│   │   └── main.py                     # FastAPI app
│   ├── requirements.txt
│   └── seed_data.py                    # Database seeding script
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── Signup.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Assessment.jsx
│   │   │   ├── MCQTest.jsx
│   │   │   ├── AssessmentResult.jsx
│   │   │   ├── LearningPath.jsx
│   │   │   └── Profile.jsx
│   │   ├── components/
│   │   │   ├── Sidebar.jsx
│   │   │   ├── Navbar.jsx
│   │   │   ├── ProtectedRoute.jsx
│   │   │   ├── RadarChart.jsx
│   │   │   ├── SkillGapTable.jsx
│   │   │   ├── ProgressCards.jsx
│   │   │   └── LoadingSkeleton.jsx
│   │   ├── services/
│   │   │   ├── api.js                  # Axios configuration
│   │   │   └── auth.js                 # Auth service
│   │   ├── context/
│   │   │   └── AuthContext.jsx         # Auth state management
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── package.json
│   └── vite.config.js
└── README.md
```

## Setup Instructions

### Prerequisites
- Python 3.8+
- Node.js 16+
- npm or yarn

### Backend Setup

1. **Navigate to backend directory:**
```bash
cd backend
```

2. **Create virtual environment (recommended):**
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. **Install dependencies:**
```bash
pip install -r requirements.txt
```

4. **Seed the database:**
```bash
python seed_data.py
```

5. **Run the server:**
```bash
uvicorn app.main:app --reload --port 8000
```

The API will be available at `http://localhost:8000`

API Documentation: `http://localhost:8000/docs`

### Frontend Setup

1. **Navigate to frontend directory:**
```bash
cd frontend
```

2. **Install dependencies:**
```bash
npm install
```

3. **Run the development server:**
```bash
npm run dev
```

The frontend will be available at `http://localhost:5173`

## Demo Flow

1. **Signup/Login**: Create an account or login with demo credentials
   - Demo user: `demo@skillsync.com` / `demo123`

2. **Set Career Goal**: Go to Profile and set your career goal (e.g., "Software Engineer")

3. **Take Assessment**: Navigate to Assessment and take MCQ tests for different skills

4. **View Dashboard**: See your skill levels, gaps, and progress

5. **Generate Learning Path**: Generate a personalized learning path based on your skill gaps

6. **Track Progress**: Monitor your learning journey through the dashboard

## Custom AI Algorithms

### Skill Evaluator (`skill_evaluator.py`)
- Weighted scoring based on question difficulty
- Normalizes scores to 0-10 scale
- Rule-based classification (Beginner/Intermediate/Advanced)

### Gap Analyzer (`gap_analyzer.py`)
- Compares user skills against career role requirements
- Calculates gaps and assigns priorities (High/Medium/Low)
- Uses predefined skill requirement mappings

### Learning Path Engine (`learning_path_engine.py`)
- Builds skill dependency graphs using NetworkX
- Uses topological sort to determine learning order
- Allocates skills to weeks based on available hours
- Considers skill difficulty and prerequisites

### Recommender (`recommender.py`)
- Rule-based progress recommendations
- Adaptive suggestions based on learning velocity
- Returns: "advance", "reinforce", or "continue"

## Database Schema

- **users**: User accounts and preferences
- **assessments**: Skill assessment results
- **skill_gaps**: Calculated skill gaps
- **learning_paths**: Weekly learning paths
- **mcq_questions**: Assessment questions

## API Endpoints

### Authentication
- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login (returns JWT)
- `GET /api/auth/me` - Get current user

### Assessment
- `GET /api/assessment/skills` - Get available skills
- `GET /api/assessment/questions/{skill_name}` - Get questions for a skill
- `POST /api/assessment/submit` - Submit assessment answers

### Dashboard
- `GET /api/dashboard` - Get dashboard data (skills, gaps, progress)

### Learning Path
- `GET /api/learning-path` - Get current learning path
- `POST /api/learning-path/generate` - Generate new learning path

### Profile
- `GET /api/profile` - Get user profile
- `PUT /api/profile` - Update user profile

## Environment Variables

Create a `.env` file in the backend directory:

```env
DATABASE_URL=sqlite:///./skillsync.db
SECRET_KEY=your-secret-key-here
```

For production, use a strong SECRET_KEY and consider PostgreSQL.

## Notes

- All AI intelligence is custom-built (no external LLM APIs)
- Uses deterministic algorithms for explainable results
- Learning paths are generated using graph algorithms (NetworkX)
- Skill levels are classified using transparent rule-based logic

## License

MIT License

