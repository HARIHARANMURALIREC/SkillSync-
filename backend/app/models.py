from sqlalchemy import Column, Integer, String, Float, Boolean, JSON, DateTime, ForeignKey, Text, UniqueConstraint
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String, nullable=True)
    career_goal = Column(String, nullable=True)  # e.g., "Software Engineer", "Data Scientist"
    hours_per_week = Column(Integer, default=10)  # Available hours for learning
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    assessments = relationship("Assessment", back_populates="user")
    learning_paths = relationship("LearningPath", back_populates="user")

class Assessment(Base):
    __tablename__ = "assessments"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    skill_name = Column(String, nullable=False)
    score = Column(Float, nullable=False)  # 0-10 normalized score
    level = Column(String, nullable=False)  # "Beginner", "Intermediate", "Advanced"
    answers = Column(JSON, nullable=True)  # Store question-answer pairs
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    user = relationship("User", back_populates="assessments")

class SkillGap(Base):
    __tablename__ = "skill_gaps"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    skill_name = Column(String, nullable=False)
    current_level = Column(Float, nullable=False)  # 0-10
    target_level = Column(Float, nullable=False)  # 0-10
    gap = Column(Float, nullable=False)  # target - current
    priority = Column(String, nullable=False)  # "High", "Medium", "Low"
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    user = relationship("User")

class LearningPath(Base):
    __tablename__ = "learning_paths"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    skill_name = Column(String, nullable=False)
    week_number = Column(Integer, nullable=False)
    resources = Column(JSON, nullable=True)  # List of resources
    status = Column(String, default="pending")  # "pending", "in_progress", "completed"
    estimated_hours = Column(Float, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    user = relationship("User", back_populates="learning_paths")

class LearningProgress(Base):
    __tablename__ = "learning_progress"
    __table_args__ = (
        UniqueConstraint("user_id", "week_number", "resource_index", name="uq_learning_progress"),
    )

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    week_number = Column(Integer, nullable=False)
    resource_index = Column(Integer, nullable=False)
    completed_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User")


class UserActivity(Base):
    """One calendar day of learning activity per user (streak heat map)."""
    __tablename__ = "user_activity"
    __table_args__ = (
        UniqueConstraint("user_id", "activity_date", name="uq_user_activity_day"),
    )

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    activity_date = Column(String, nullable=False)  # YYYY-MM-DD in the user's local calendar
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User")


class TeachBack(Base):
    __tablename__ = "teachbacks"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    week_number = Column(Integer, nullable=False)
    resource_index = Column(Integer, nullable=False)
    prompt = Column(Text, nullable=False)
    answer = Column(Text, nullable=True)
    score = Column(Float, nullable=True)
    feedback = Column(Text, nullable=True)
    passed = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User")


class MCQQuestion(Base):
    __tablename__ = "mcq_questions"
    
    id = Column(Integer, primary_key=True, index=True)
    skill_name = Column(String, nullable=False)
    question_text = Column(Text, nullable=False)
    options = Column(JSON, nullable=False)  # List of options
    correct_answer = Column(Integer, nullable=False)  # Index of correct option
    difficulty = Column(Integer, nullable=False)  # 1-5
    explanation = Column(Text, nullable=True)


class ReadinessReport(Base):
    __tablename__ = "readiness_reports"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    share_token = Column(String, unique=True, index=True, nullable=False)
    snapshot = Column(JSON, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    expires_at = Column(DateTime(timezone=True), nullable=True)

    user = relationship("User")


class CoachMessage(Base):
    __tablename__ = "coach_messages"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    role = Column(String, nullable=False)  # user | assistant
    content = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User")


class WeeklyPlan(Base):
    __tablename__ = "weekly_plans"
    __table_args__ = (
        UniqueConstraint("user_id", "week_start", name="uq_weekly_plan_user_week"),
    )

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    week_start = Column(String, nullable=False)  # YYYY-MM-DD (Monday)
    focus = Column(Text, nullable=False)
    plan_items = Column(JSON, nullable=False)  # [{skill, hours, action}]
    check_in = Column(Text, nullable=False)
    next_step = Column(Text, nullable=False)
    generated_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User")

