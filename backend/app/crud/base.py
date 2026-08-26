from __future__ import annotations

from typing import Any, Generic, Iterable, List, Optional, Type, TypeVar
from sqlalchemy import select, func
from sqlalchemy.orm import Session

ModelType = TypeVar("ModelType")


class BaseRepository(Generic[ModelType]):
    """Generic repository providing common CRUD operations.

    Methods accept a SQLAlchemy `Session` instance and operate using
    SQLAlchemy 2.0 style `select()` statements.
    """

    model: Type[ModelType]

    def __init__(self, model: Type[ModelType]) -> None:
        self.model = model

    def create(self, db: Session, obj_in: dict, commit: bool = True) -> ModelType:
        obj = self.model(**obj_in)
        db.add(obj)
        if commit:
            db.commit()
            db.refresh(obj)
        else:
            db.flush()
            db.refresh(obj)
        return obj

    def get_by_id(self, db: Session, id: Any) -> Optional[ModelType]:
        stmt = select(self.model).where(self.model.id == id)
        return db.scalars(stmt).one_or_none()

    def get(self, db: Session, **filters: Any) -> Optional[ModelType]:
        stmt = select(self.model)
        for k, v in filters.items():
            stmt = stmt.where(getattr(self.model, k) == v)
        return db.scalars(stmt).one_or_none()

    def get_multi(self, db: Session, limit: int = 100, offset: int = 0) -> List[ModelType]:
        stmt = select(self.model).limit(limit).offset(offset)
        return list(db.scalars(stmt).all())

    def update(self, db: Session, db_obj: ModelType, obj_in: dict, commit: bool = True) -> ModelType:
        for k, v in obj_in.items():
            if hasattr(db_obj, k):
                setattr(db_obj, k, v)
        db.add(db_obj)
        if commit:
            db.commit()
            db.refresh(db_obj)
        else:
            db.flush()
            db.refresh(db_obj)
        return db_obj

    def add(self, db: Session, obj: ModelType) -> ModelType:
        db.add(obj)
        return obj

    def flush(self, db: Session) -> None:
        db.flush()

    def refresh(self, db: Session, obj: ModelType) -> ModelType:
        db.refresh(obj)
        return obj

    def commit(self, db: Session) -> None:
        db.commit()

    def rollback(self, db: Session) -> None:
        db.rollback()

    def delete(self, db: Session, id: Any, commit: bool = True) -> Optional[ModelType]:
        obj = self.get_by_id(db, id)
        if obj is None:
            return None
        db.delete(obj)
        if commit:
            db.commit()
        return obj

    def exists(self, db: Session, **filters: Any) -> bool:
        stmt = select(func.count()).select_from(self.model)
        for k, v in filters.items():
            stmt = stmt.where(getattr(self.model, k) == v)
        cnt = db.scalar(stmt)
        return bool(cnt)

    def count(self, db: Session, **filters: Any) -> int:
        stmt = select(func.count()).select_from(self.model)
        for k, v in filters.items():
            stmt = stmt.where(getattr(self.model, k) == v)
        return int(db.scalar(stmt) or 0)

    def paginate(self, db: Session, limit: int = 25, offset: int = 0, order_by: Optional[Any] = None) -> List[ModelType]:
        stmt = select(self.model)
        if order_by is not None:
            stmt = stmt.order_by(order_by)
        stmt = stmt.limit(limit).offset(offset)
        return list(db.scalars(stmt).all())
