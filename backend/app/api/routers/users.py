from __future__ import annotations

from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.auth import get_current_user, require_roles
from app.dependencies import get_db
from app.models import User
from app.models.enums import UserRole
from app.schemas.user import UserRead, UserUpdate
from app.services.user_service import UserNotFoundError, UserService

router = APIRouter(prefix="/users", tags=["users"])


@router.get("", response_model=list[UserRead])
def list_users(
    db: Annotated[Session, Depends(get_db)],
    _: Annotated[User, Depends(require_roles(UserRole.ADMIN, UserRole.REVIEWER))],
    limit: int = 100,
    offset: int = 0,
) -> list[UserRead]:
    service = UserService()
    return service.user_repo.get_multi(db, limit=limit, offset=offset)


@router.get("/{user_id}", response_model=UserRead)
def get_user(
    db: Annotated[Session, Depends(get_db)],
    _: Annotated[User, Depends(require_roles(UserRole.ADMIN, UserRole.REVIEWER))],
    user_id: UUID,
) -> UserRead:
    service = UserService()
    try:
        return service.get_user_by_id(db, user_id)
    except UserNotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc


@router.patch("/{user_id}", response_model=UserRead)
def update_user_role(
    db: Annotated[Session, Depends(get_db)],
    _: Annotated[User, Depends(require_roles(UserRole.ADMIN))],
    user_id: UUID,
    payload: UserUpdate,
) -> UserRead:
    service = UserService()
    if payload.role is None:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="role is required")
    try:
        return service.update_user_role(db, user_id, role=payload.role)
    except UserNotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc
