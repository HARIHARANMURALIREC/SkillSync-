from pydantic import BaseModel, EmailStr, ConfigDict
from typing import Optional, List, Dict, Any
from datetime import datetime

# Auth Schemas
class UserSignup(BaseModel):
    email: EmailStr
    password: str
    full_name: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    email: str
    full_name: Optional[str]
    career_goal: Optional[str]
    hours_per_week: int

class SignupResponse(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse

# Assessment Schemas
class MCQOption(BaseModel):
    id: int
    text: str

class MCQQuestionResponse(BaseModel):
    id: int
    skill_name: str
    question_text: str
    options: List[MCQOption]
    difficulty: int

class AssessmentSubmission(BaseModel):
    skill_name: str
    answers: Dict[int, int]  # question_id -> selected_option_index

class AssessmentResult(BaseModel):
    skill_name: str
    score: float
    level: str
    breakdown: Dict[str, Any]

# Dashboard Schemas
class SkillGapResponse(BaseModel):
    skill_name: str
    current_level: float
    target_level: float
    gap: float
    priority: str
    explanation: Optional[List[str]] = None

class SkillRadarData(BaseModel):
    skill_name: str
    level: float

class CareerReadinessResponse(BaseModel):
    score: float
    completed_skills: int
    total_skills: int
    missing_skills: List[Dict[str, Any]]

class DashboardResponse(BaseModel):
    user: UserResponse
    skill_radar: List[SkillRadarData]
    skill_gaps: List[SkillGapResponse]
    progress_summary: Dict[str, Any]
    career_readiness: Optional[CareerReadinessResponse] = None

# Learning Path Schemas
class LearningResource(BaseModel):
    title: str
    type: str  # "video", "article", "course", "practice"
    url: Optional[str] = None
    estimated_hours: float

class WeeklyLearningPath(BaseModel):
    week_number: int
    skill_name: str
    resources: List[LearningResource]
    estimated_hours: float
    status: str
    is_revised: Optional[bool] = False
    explanation: Optional[List[str]] = None

class LearningPathResponse(BaseModel):
    total_weeks: int
    weekly_paths: List[WeeklyLearningPath]

class LearningPathAdaptationResponse(BaseModel):
    adapted_path: LearningPathResponse
    explanation: List[str]

# Profile Schemas
class ProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    career_goal: Optional[str] = None
    hours_per_week: Optional[int] = None

