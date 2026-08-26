from __future__ import annotations

from typing import Optional

from sqlalchemy.orm import Session

from app.crud.user import UserRepository
from app.models import User
from app.models.enums import UserRole, UserStatus


class UserNotFoundError(Exception):
    pass


class DuplicateUserError(Exception):
    pass


class UserService:
    def __init__(self, user_repo: Optional[UserRepository] = None) -> None:
        self.user_repo = user_repo or UserRepository()

    def get_user_by_id(self, db: Session, user_id) -> User:
        user = self.user_repo.get_by_id(db, user_id)
        if user is None:
            raise UserNotFoundError(f"User {user_id} was not found")
        return user

    def get_user_by_email(self, db: Session, email: str) -> User:
        user = self.user_repo.get_by_email(db, email)
        if user is None:
            raise UserNotFoundError(f"User with email {email} was not found")
        return user

    def create_user(self, db: Session, *, full_name: str, email: str, password_hash: str, role: UserRole, status: UserStatus = UserStatus.PENDING) -> User:
        if self.user_repo.get_by_email(db, email) is not None:
            raise DuplicateUserError(f"User with email {email} already exists")
        payload = {
            "full_name": full_name,
            "email": email,
            "password_hash": password_hash,
            "role": role,
            "status": status,
        }
        return self.user_repo.create(db, payload)

    def validate_account(self, db: Session, *, user: User) -> User:
        if user.status is UserStatus.DEACTIVATED:
            raise UserNotFoundError("User account is deactivated")
        return user

    def update_user_role(self, db: Session, user_id, *, role: UserRole) -> User:
        user = self.get_user_by_id(db, user_id)
        self.user_repo.update(db, user, {"role": role})
        return user
