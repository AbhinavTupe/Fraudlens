from __future__ import annotations

from typing import Optional
from uuid import UUID

from sqlalchemy.orm import Session

from app.crud.investigation_case import InvestigationCaseRepository
from app.crud.fraud_alert import FraudAlertRepository
from app.models import InvestigationCase
from app.models.enums import CaseStatus, Priority


class InvestigationNotFoundError(Exception):
    pass


class InvalidCaseTransitionError(Exception):
    pass


class InvestigationService:
    def __init__(self, investigation_repo: Optional[InvestigationCaseRepository] = None, fraud_alert_repo: Optional[FraudAlertRepository] = None) -> None:
        self.investigation_repo = investigation_repo or InvestigationCaseRepository()
        self.fraud_alert_repo = fraud_alert_repo or FraudAlertRepository()

    def get_case(self, db: Session, case_id: UUID) -> InvestigationCase:
        case = self.investigation_repo.get_by_id(db, case_id)
        if case is None:
            raise InvestigationNotFoundError(f"Investigation case {case_id} was not found")
        return case

    def open_case(self, db: Session, *, fraud_alert_id: UUID, title: str, description: Optional[str], assigned_to: Optional[UUID] = None, priority: Priority = Priority.MEDIUM) -> InvestigationCase:
        payload = {
            "fraud_alert_id": fraud_alert_id,
            "case_number": None,
            "title": title,
            "description": description,
            "status": CaseStatus.OPEN,
            "priority": priority,
            "assigned_to": assigned_to,
            "opened_at": __import__("datetime").datetime.utcnow(),
            "closed_at": None,
            "resolution": None,
        }
        return self.investigation_repo.create(db, payload)

    def transition_status(self, db: Session, case_id: UUID, status: CaseStatus) -> InvestigationCase:
        case = self.get_case(db, case_id)
        current = case.status
        if current == CaseStatus.RESOLVED and status != CaseStatus.RESOLVED:
            raise InvalidCaseTransitionError("Resolved cases cannot be reopened with this service")
        if current == CaseStatus.OPEN and status not in {CaseStatus.OPEN, CaseStatus.UNDER_INVESTIGATION, CaseStatus.RESOLVED}:
            raise InvalidCaseTransitionError("Invalid case transition")
        if current == CaseStatus.UNDER_INVESTIGATION and status not in {CaseStatus.UNDER_INVESTIGATION, CaseStatus.ESCALATED, CaseStatus.RESOLVED}:
            raise InvalidCaseTransitionError("Invalid case transition")
        if current == CaseStatus.ESCALATED and status not in {CaseStatus.ESCALATED, CaseStatus.RESOLVED}:
            raise InvalidCaseTransitionError("Invalid case transition")
        return self.investigation_repo.update(db, case, {"status": status})
