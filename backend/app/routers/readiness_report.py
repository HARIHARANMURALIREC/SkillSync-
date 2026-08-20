import uuid

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.auth import get_current_user
from app.database import get_db
from app.models import ReadinessReport, User
from app.report_builder import build_readiness_snapshot
from app.schemas import (
    ReadinessReportCreateResponse,
    ReadinessReportPublicResponse,
    ReadinessReportSnapshot,
)
from app.streak import get_local_date

router = APIRouter(prefix="/api/readiness-report", tags=["readiness-report"])


@router.post("", response_model=ReadinessReportCreateResponse)
def create_readiness_report(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    local_date: str = Depends(get_local_date),
):
    snapshot = build_readiness_snapshot(db, current_user, local_date)
    token = str(uuid.uuid4())
    row = ReadinessReport(user_id=current_user.id, share_token=token, snapshot=snapshot)
    db.add(row)
    db.commit()
    db.refresh(row)
    return ReadinessReportCreateResponse(
        share_token=token,
        share_path=f"/r/{token}",
        snapshot=ReadinessReportSnapshot(**snapshot),
        created_at=row.created_at,
    )


@router.get("/latest", response_model=ReadinessReportCreateResponse)
def get_latest_report(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    row = (
        db.query(ReadinessReport)
        .filter(ReadinessReport.user_id == current_user.id)
        .order_by(ReadinessReport.created_at.desc())
        .first()
    )
    if not row:
        raise HTTPException(status_code=404, detail="No report generated yet.")
    return ReadinessReportCreateResponse(
        share_token=row.share_token,
        share_path=f"/r/{row.share_token}",
        snapshot=ReadinessReportSnapshot(**row.snapshot),
        created_at=row.created_at,
    )


@router.get("/public/{token}", response_model=ReadinessReportPublicResponse)
def get_public_report(token: str, db: Session = Depends(get_db)):
    row = db.query(ReadinessReport).filter(ReadinessReport.share_token == token).first()
    if not row:
        raise HTTPException(status_code=404, detail="Report not found.")
    return ReadinessReportPublicResponse(
        snapshot=ReadinessReportSnapshot(**row.snapshot),
        created_at=row.created_at,
    )
