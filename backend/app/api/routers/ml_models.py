from __future__ import annotations

from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.auth import get_current_user, require_roles
from app.dependencies import get_db
from app.models import User
from app.models.enums import UserRole
from app.schemas.ml_model import MLModelRead
from app.services.ml_model_service import MLModelNotAvailableError, MLModelService

router = APIRouter(prefix="/ml-models", tags=["ml-models"])


@router.get("", response_model=list[MLModelRead])
def list_models(
    db: Annotated[Session, Depends(get_db)],
    _: Annotated[User, Depends(require_roles(UserRole.ADMIN, UserRole.ANALYST, UserRole.INVESTIGATOR, UserRole.REVIEWER))],
    limit: int = 100,
    offset: int = 0,
) -> list[MLModelRead]:
    repo = MLModelService()
    return repo.ml_model_repo.get_multi(db, limit=limit, offset=offset)


@router.get("/{model_id}", response_model=MLModelRead)
def get_model(
    db: Annotated[Session, Depends(get_db)],
    _: Annotated[User, Depends(require_roles(UserRole.ADMIN, UserRole.ANALYST, UserRole.INVESTIGATOR, UserRole.REVIEWER))],
    model_id: UUID,
) -> MLModelRead:
    service = MLModelService()
    model = service.ml_model_repo.get_by_id(db, model_id)
    if model is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="ML model was not found")
    return model


@router.get("/active", response_model=MLModelRead)
def get_active_model(
    db: Annotated[Session, Depends(get_db)],
    _: Annotated[User, Depends(require_roles(UserRole.ADMIN, UserRole.ANALYST, UserRole.INVESTIGATOR, UserRole.REVIEWER))],
) -> MLModelRead:
    service = MLModelService()
    try:
        return service.get_active_model(db)
    except MLModelNotAvailableError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc
