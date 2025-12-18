from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User
from app.schemas import ProfileUpdate, UserResponse
from app.auth import get_current_user

router = APIRouter(prefix="/api/profile", tags=["profile"])

@router.get("", response_model=UserResponse)
def get_profile(
    current_user: User = Depends(get_current_user)
):
    """Get current user profile."""
    return current_user

@router.put("", response_model=UserResponse)
def update_profile(
    profile_data: ProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update user profile."""
    if profile_data.full_name is not None:
        current_user.full_name = profile_data.full_name
    if profile_data.career_goal is not None:
        current_user.career_goal = profile_data.career_goal
    if profile_data.hours_per_week is not None:
        current_user.hours_per_week = profile_data.hours_per_week
    
    db.commit()
    db.refresh(current_user)
    
    return current_user

