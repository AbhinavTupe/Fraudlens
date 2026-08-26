from __future__ import annotations

from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.auth import get_current_user, require_roles
from app.dependencies import get_db
from app.models import User
from app.models.enums import UserRole
from app.schemas.fraud_alert import FraudAlertCreate, FraudAlertRead, FraudAlertUpdate
from app.services.fraud_alert_service import FraudAlertNotFoundError, FraudAlertService

router = APIRouter(prefix="/fraud-alerts", tags=["fraud-alerts"])


@router.get("", response_model=list[FraudAlertRead])
def list_alerts(
    db: Annotated[Session, Depends(get_db)],
    _: Annotated[User, Depends(require_roles(UserRole.ADMIN, UserRole.ANALYST, UserRole.INVESTIGATOR, UserRole.REVIEWER))],
    limit: int = 100,
    offset: int = 0,
) -> list[FraudAlertRead]:
    repo = FraudAlertService()
    return repo.fraud_alert_repo.get_multi(db, limit=limit, offset=offset)


@router.get("/{alert_id}", response_model=FraudAlertRead)
def get_alert(
    db: Annotated[Session, Depends(get_db)],
    _: Annotated[User, Depends(require_roles(UserRole.ADMIN, UserRole.ANALYST, UserRole.INVESTIGATOR, UserRole.REVIEWER))],
    alert_id: UUID,
) -> FraudAlertRead:
    service = FraudAlertService()
    try:
        return service.get_alert(db, alert_id)
    except FraudAlertNotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc


@router.post("", response_model=FraudAlertRead, status_code=status.HTTP_201_CREATED)
def create_alert(
    db: Annotated[Session, Depends(get_db)],
    _: Annotated[User, Depends(require_roles(UserRole.ADMIN, UserRole.ANALYST, UserRole.INVESTIGATOR, UserRole.REVIEWER))],
    payload: FraudAlertCreate,
) -> FraudAlertRead:
    service = FraudAlertService()
    return service.create_alert(
        db,
        transaction_id=payload.transaction_id,
        prediction_id=payload.prediction_id,
        severity=payload.severity,
        status=payload.status,
    )


@router.patch("/{alert_id}", response_model=FraudAlertRead)
def update_alert_status(
    db: Annotated[Session, Depends(get_db)],
    _: Annotated[User, Depends(require_roles(UserRole.ADMIN, UserRole.REVIEWER))],
    alert_id: UUID,
    payload: FraudAlertUpdate,
) -> FraudAlertRead:
    service = FraudAlertService()
    if payload.status is None:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="status is required")
    try:
        return service.update_status(db, alert_id, payload.status)
    except FraudAlertNotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc
