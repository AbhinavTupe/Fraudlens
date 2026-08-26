from __future__ import annotations

from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.dependencies import get_db
from app.services.dashboard_service import DashboardService

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


@router.get("", response_model=dict)
def get_dashboard_summary(
    db: Annotated[Session, Depends(get_db)],
) -> dict:
    service = DashboardService()
    return service.get_dashboard_summary(db)
