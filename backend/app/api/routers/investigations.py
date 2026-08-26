from __future__ import annotations

from typing import Annotated, Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.auth import get_current_user, require_roles
from app.dependencies import get_db
from app.models import User
from app.models.enums import CaseStatus, Priority, UserRole
from app.schemas.investigation_case import InvestigationCaseCreate, InvestigationCaseRead, InvestigationCaseUpdate
from app.services.investigation_service import InvalidCaseTransitionError, InvestigationNotFoundError, InvestigationService

router = APIRouter(prefix="/investigations", tags=["investigations"])


@router.get("", response_model=list[InvestigationCaseRead])
def list_cases(
    db: Annotated[Session, Depends(get_db)],
    _: Annotated[User, Depends(require_roles(UserRole.ADMIN, UserRole.INVESTIGATOR, UserRole.REVIEWER))],
    limit: int = 100,
    offset: int = 0,
) -> list[InvestigationCaseRead]:
    repo = InvestigationService()
    return repo.investigation_repo.get_multi(db, limit=limit, offset=offset)


@router.get("/{case_id}", response_model=InvestigationCaseRead)
def get_case(
    db: Annotated[Session, Depends(get_db)],
    _: Annotated[User, Depends(require_roles(UserRole.ADMIN, UserRole.INVESTIGATOR, UserRole.REVIEWER))],
    case_id: UUID,
) -> InvestigationCaseRead:
    service = InvestigationService()
    try:
        return service.get_case(db, case_id)
    except InvestigationNotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc


@router.post("", response_model=InvestigationCaseRead, status_code=status.HTTP_201_CREATED)
def open_case(
    db: Annotated[Session, Depends(get_db)],
    _: Annotated[User, Depends(require_roles(UserRole.ADMIN, UserRole.INVESTIGATOR, UserRole.REVIEWER))],
    payload: InvestigationCaseCreate,
) -> InvestigationCaseRead:
    service = InvestigationService()
    try:
        return service.open_case(
            db,
            fraud_alert_id=payload.fraud_alert_id,
            title=payload.title or "Investigation",
            description=payload.description,
            assigned_to=payload.assigned_to,
            priority=payload.priority,
        )
    except InvestigationNotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc


@router.patch("/{case_id}", response_model=InvestigationCaseRead)
def transition_case(
    db: Annotated[Session, Depends(get_db)],
    _: Annotated[User, Depends(require_roles(UserRole.ADMIN, UserRole.INVESTIGATOR, UserRole.REVIEWER))],
    case_id: UUID,
    payload: InvestigationCaseUpdate,
) -> InvestigationCaseRead:
    service = InvestigationService()
    if payload.status is None:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="status is required")
    try:
        return service.transition_status(db, case_id, payload.status)
    except InvestigationNotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc
    except InvalidCaseTransitionError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc
