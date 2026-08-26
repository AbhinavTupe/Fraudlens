from __future__ import annotations

from datetime import datetime, timedelta, timezone
from typing import Annotated, Optional

import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from passlib.context import CryptContext
from sqlalchemy.orm import Session

from app.config import get_settings
from app.dependencies import get_db
from app.models import User
from app.models.enums import UserRole
from app.services.user_service import UserNotFoundError, UserService

security = HTTPBearer(auto_error=False)
settings = get_settings()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(password: str, hashed_password: str) -> bool:
    if not hashed_password:
        return False
    try:
        return pwd_context.verify(password, hashed_password)
    except Exception:
        return password == hashed_password


def create_access_token(email: str, role: UserRole, expires_minutes: Optional[int] = None) -> str:
    now = datetime.now(timezone.utc)
    expiration_minutes = expires_minutes or settings.ACCESS_TOKEN_EXPIRE_MINUTES
    payload = {
        "sub": email,
        "role": role.value,
        "exp": int((now + timedelta(minutes=expiration_minutes)).timestamp()),
    }
    return jwt.encode(payload, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def _unauthorized(detail: str = "Authentication required") -> HTTPException:
    return HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail=detail,
        headers={"WWW-Authenticate": "Bearer"},
    )


def get_current_user(
    credentials: Annotated[HTTPAuthorizationCredentials | None, Depends(security)],
    db: Annotated[Session, Depends(get_db)],
) -> User:
    if credentials is None or not credentials.credentials:
        raise _unauthorized()

    try:
        payload = jwt.decode(
            credentials.credentials,
            settings.SECRET_KEY,
            algorithms=[settings.ALGORITHM],
        )
    except jwt.ExpiredSignatureError as exc:
        raise _unauthorized("Token has expired") from exc
    except jwt.InvalidTokenError as exc:
        raise _unauthorized("Invalid authentication token") from exc

    email = payload.get("sub")
    if not email:
        raise _unauthorized("Invalid authentication token")

    service = UserService()
    try:
        user = service.get_user_by_email(db, str(email))
    except UserNotFoundError as exc:
        raise _unauthorized("Authentication failed") from exc

    try:
        service.validate_account(db, user=user)
    except UserNotFoundError as exc:
        raise _unauthorized(str(exc)) from exc

    return user


def require_roles(*allowed_roles: UserRole):
    def dependency(current_user: Annotated[User, Depends(get_current_user)]) -> User:
        if current_user.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Insufficient permissions",
            )
        return current_user

    return dependency
