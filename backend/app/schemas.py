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

class SkillInfo(BaseModel):
    name: str
    question_count: int
    recommended: bool
    freshness: Optional[str] = None
    days_stale: int = 0

class AssessmentHistoryEntry(BaseModel):
    skill_name: str
    score: float
    level: str
    created_at: datetime

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

class StreakResponse(BaseModel):
    count: int
    last: Optional[str] = None
    dates: List[str] = []

class CareerForkRole(BaseModel):
    role: str
    score: float

class CareerForkResponse(BaseModel):
    current_role: Optional[str] = None
    current_score: float = 0
    best_adjacent: Optional[str] = None
    best_score: float = 0
    weeks_saved: float = 0
    blocking_skills: List[str] = []
    message: str = ""
    roles: List[CareerForkRole] = []

class FreshnessItem(BaseModel):
    skill_name: str
    last_touch: Optional[str] = None
    status: str
    days_stale: int = 0

class DashboardResponse(BaseModel):
    user: UserResponse
    skill_radar: List[SkillRadarData]
    skill_gaps: List[SkillGapResponse]
    progress_summary: Dict[str, Any]
    career_readiness: Optional[CareerReadinessResponse] = None
    streak: Optional[StreakResponse] = None
    career_fork: Optional[CareerForkResponse] = None
    freshness: List[FreshnessItem] = []
    weekly_plan: Optional["WeeklyPlanResponse"] = None

class TeachbackStart(BaseModel):
    week_number: int
    resource_index: int

class TeachbackSubmit(BaseModel):
    week_number: int
    resource_index: int
    answer: str

class TeachbackResponse(BaseModel):
    prompt: str
    week_number: int
    resource_index: int
    resource_title: Optional[str] = None
    skill_name: Optional[str] = None
    score: Optional[float] = None
    passed: Optional[bool] = None
    feedback: Optional[str] = None
    miss: Optional[str] = None

class RecertResult(BaseModel):
    skill_name: str
    score: float
    stored_score: float
    level: str
    passed: bool
    breakdown: Dict[str, Any]

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
    completed_resources: Optional[List[int]] = None

class ProgressToggle(BaseModel):
    week_number: int
    resource_index: int
    completed: bool

class ProgressItem(BaseModel):
    week_number: int
    resource_index: int

class LearningProgressResponse(BaseModel):
    completed: List[ProgressItem]
    week_status: Dict[int, str]
    overall_pct: float
    resources_completed: int
    total_resources: int

class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    messages: List[ChatMessage]

class ChatResponse(BaseModel):
    reply: str

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


# Readiness Report
class ReportSkillSummary(BaseModel):
    skill_name: str
    score: float
    level: str

class ReportGapSummary(BaseModel):
    skill_name: str
    current_level: float
    target_level: float
    priority: str

class FreshnessSummary(BaseModel):
    fresh: int = 0
    aging: int = 0
    stale: int = 0

class ReadinessReportSnapshot(BaseModel):
    display_name: str
    career_goal: Optional[str] = None
    readiness_score: float = 0
    completed_skills: int = 0
    total_skills: int = 0
    top_gaps: List[ReportGapSummary] = []
    top_skills: List[ReportSkillSummary] = []
    path_completion_pct: float = 0
    resources_completed: int = 0
    total_resources: int = 0
    streak_days: int = 0
    freshness_summary: FreshnessSummary = FreshnessSummary()
    teachback_passed: int = 0
    generated_at: str
    fork_message: Optional[str] = None

class ReadinessReportCreateResponse(BaseModel):
    share_token: str
    share_path: str
    snapshot: ReadinessReportSnapshot
    created_at: datetime

class ReadinessReportPublicResponse(BaseModel):
    snapshot: ReadinessReportSnapshot
    created_at: datetime


# Coach Memory + Weekly Plan
class WeeklyPlanItem(BaseModel):
    skill: str
    hours: float
    action: str

class WeeklyPlanResponse(BaseModel):
    week_start: str
    focus: str
    plan: List[WeeklyPlanItem]
    check_in: str
    next_step: str
    generated_at: Optional[datetime] = None


class WeeklyPlanLLMResult(BaseModel):
    focus: str
    plan: List[WeeklyPlanItem] = []
    check_in: str
    next: str

class CoachHistoryResponse(BaseModel):
    messages: List[ChatMessage]

DashboardResponse.model_rebuild()

