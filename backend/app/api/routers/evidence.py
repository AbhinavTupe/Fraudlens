from __future__ import annotations

from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.auth import get_current_user, require_roles
from app.dependencies import get_db
from app.models import User
from app.models.enums import UserRole
from app.schemas.evidence import EvidenceRead
from app.services.evidence_service import EvidenceService, EvidenceValidationError

router = APIRouter(prefix="/evidence", tags=["evidence"])


@router.get("", response_model=list[EvidenceRead])
def list_evidence(
    db: Annotated[Session, Depends(get_db)],
    _: Annotated[User, Depends(require_roles(UserRole.ADMIN, UserRole.INVESTIGATOR, UserRole.REVIEWER))],
    limit: int = 100,
    offset: int = 0,
) -> list[EvidenceRead]:
    repo = EvidenceService()
    return repo.evidence_repo.get_multi(db, limit=limit, offset=offset)


@router.get("/{evidence_id}", response_model=EvidenceRead)
def get_evidence(
    db: Annotated[Session, Depends(get_db)],
    _: Annotated[User, Depends(require_roles(UserRole.ADMIN, UserRole.INVESTIGATOR, UserRole.REVIEWER))],
    evidence_id: UUID,
) -> EvidenceRead:
    service = EvidenceService()
    try:
        return service.get_evidence(db, evidence_id)
    except EvidenceValidationError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc


