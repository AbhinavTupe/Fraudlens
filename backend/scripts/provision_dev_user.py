from __future__ import annotations

import os
from typing import Optional

from sqlalchemy.orm import Session

from app.api.auth import hash_password
from app.models import User
from app.models.enums import UserRole, UserStatus
from app.services.user_service import UserService


def provision_development_user(db: Optional[Session] = None, *, email: str = "dev@fraudlens.local") -> User:
    if db is None:
        from app.db.session import SessionLocal

        db = SessionLocal()
        close_db = True
    else:
        close_db = False

    try:
        service = UserService()
        existing = service.user_repo.get_by_email(db, email)
        if existing is not None:
            return existing

        full_name = os.getenv("FRAUDLENS_DEV_USER_NAME", "FraudLens Dev User")
        password_value = os.getenv("FRAUDLENS_DEV_PASSWORD", "dev-user-placeholder")
        password_hash = os.getenv("FRAUDLENS_DEV_PASSWORD_HASH") or hash_password(password_value)
        role = UserRole.ADMIN
        status = UserStatus.ACTIVE

        return service.create_user(
            db,
            full_name=full_name,
            email=email,
            password_hash=password_hash,
            role=role,
            status=status,
        )
    finally:
        if close_db:
            db.close()
