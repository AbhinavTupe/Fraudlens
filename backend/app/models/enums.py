from enum import StrEnum


class UserRole(StrEnum):
    ADMIN = "admin"
    ANALYST = "analyst"
    INVESTIGATOR = "investigator"
    REVIEWER = "reviewer"


class UserStatus(StrEnum):
    ACTIVE = "active"
    PENDING = "pending"
    SUSPENDED = "suspended"
    DEACTIVATED = "deactivated"


class TransactionStatus(StrEnum):
    PENDING = "pending"
    APPROVED = "approved"
    DECLINED = "declined"
    REQUIRES_REVIEW = "requires_review"


class RiskLevel(StrEnum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class AlertSeverity(StrEnum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class AlertStatus(StrEnum):
    OPEN = "open"
    ACKNOWLEDGED = "acknowledged"
    RESOLVED = "resolved"
    CLOSED = "closed"


class CaseStatus(StrEnum):
    OPEN = "open"
    UNDER_INVESTIGATION = "under_investigation"
    ESCALATED = "escalated"
    RESOLVED = "resolved"


class Priority(StrEnum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"


class TrainingJobStatus(StrEnum):
    QUEUED = "queued"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"
