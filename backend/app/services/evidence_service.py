from __future__ import annotations

import os
from typing import Optional
from uuid import UUID

from sqlalchemy.orm import Session

from app.crud.evidence import EvidenceRepository
from app.crud.user import UserRepository
from app.models import Evidence


class EvidenceValidationError(Exception):
    pass


class EvidenceService:
    def __init__(self, evidence_repo: Optional[EvidenceRepository] = None, user_repo: Optional[UserRepository] = None) -> None:
        self.evidence_repo = evidence_repo or EvidenceRepository()
        self.user_repo = user_repo or UserRepository()

    def validate_evidence(self, *, filename: str, file_size: Optional[int], file_type: Optional[str]) -> None:
        if not filename:
            raise EvidenceValidationError("Evidence filename is required")
        if file_size is not None and file_size < 0:
            raise EvidenceValidationError("Evidence file size cannot be negative")
        if file_type and "/" not in file_type:
            raise EvidenceValidationError("Evidence file type is invalid")

    def create_evidence(self, db: Session, *, case_id: UUID, filename: str, file_path: str, file_type: Optional[str], uploaded_by: Optional[UUID], file_size: Optional[int]) -> Evidence:
        self.validate_evidence(filename=filename, file_size=file_size, file_type=file_type)
        if uploaded_by is not None and self.user_repo.get_by_id(db, uploaded_by) is None:
            raise EvidenceValidationError(f"Uploader {uploaded_by} was not found")
        payload = {
            "case_id": case_id,
            "filename": filename,
            "file_path": file_path,
            "file_type": file_type,
            "uploaded_by": uploaded_by,
            "file_size": file_size,
        }
        return self.evidence_repo.create(db, payload)

    def get_evidence(self, db: Session, evidence_id: UUID) -> Evidence:
        evidence = self.evidence_repo.get_by_id(db, evidence_id)
        if evidence is None:
            raise EvidenceValidationError(f"Evidence {evidence_id} was not found")
        return evidence
