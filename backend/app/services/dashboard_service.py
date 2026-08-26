from __future__ import annotations

from sqlalchemy.orm import Session

from app.crud.fraud_alert import FraudAlertRepository
from app.crud.investigation_case import InvestigationCaseRepository
from app.crud.transaction import TransactionRepository
from app.crud.user import UserRepository
from app.models.enums import AlertStatus, CaseStatus


class DashboardService:
    def __init__(self, transaction_repo: TransactionRepository | None = None, fraud_alert_repo: FraudAlertRepository | None = None, investigation_repo: InvestigationCaseRepository | None = None, user_repo: UserRepository | None = None) -> None:
        self.transaction_repo = transaction_repo or TransactionRepository()
        self.fraud_alert_repo = fraud_alert_repo or FraudAlertRepository()
        self.investigation_repo = investigation_repo or InvestigationCaseRepository()
        self.user_repo = user_repo or UserRepository()

    def get_dashboard_summary(self, db: Session) -> dict:
        return {
            "transaction_count": self.transaction_repo.count(db),
            "fraud_alert_count": self.fraud_alert_repo.count(db),
            "investigation_count": self.investigation_repo.count(db),
            "user_count": self.user_repo.count(db),
        }
