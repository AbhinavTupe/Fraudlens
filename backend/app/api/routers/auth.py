from __future__ import annotations

from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, ConfigDict
from sqlalchemy.orm import Session

from app.api.auth import create_access_token, verify_password
from app.dependencies import get_db
from app.models import User
from app.models.enums import UserRole
from app.schemas.user import UserRead
from app.services.user_service import UserService

router = APIRouter(tags=["auth"])


class LoginRequest(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    email: str
    password: str


class LoginResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    access_token: str
    token_type: str = "bearer"
    user: UserRead


@router.post("/login", response_model=LoginResponse)
def login(
    payload: LoginRequest,
    db: Annotated[Session, Depends(get_db)],
) -> LoginResponse:
    service = UserService()
    try:
        user = service.get_user_by_email(db, payload.email)
    except Exception as exc:  # pragma: no cover - handled by the API response below
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        ) from exc

    if not verify_password(payload.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    token = create_access_token(user.email, UserRole(user.role))
    return LoginResponse(access_token=token, user=user)
