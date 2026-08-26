from __future__ import annotations

from datetime import datetime
from uuid import uuid4
from decimal import Decimal
import traceback
import json

import sys
from pathlib import Path

# Ensure repository root is on sys.path so `app` imports work when run from scripts/
repo_root = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(repo_root))

from app import schemas
from app.models import (
    User,
    Setting,
    ActivityLog,
    Transaction,
    Prediction,
    FraudAlert,
    InvestigationCase,
    Evidence,
    CaseComment,
    MLModel,
    TrainingJob,
    FeatureImportance,
)
from app.models.enums import (
    UserRole,
    UserStatus,
    TransactionStatus,
    AlertSeverity,
    AlertStatus,
    CaseStatus,
    Priority,
    TrainingJobStatus,
)

RESULTS = {}
forbidden = {"password_hash", "hashed_password", "artifact_path", "logs_path", "file_path", "internal_backend_metadata"}

now = datetime.utcnow()

# Helper to record result
def record(name, ok, details=None):
    RESULTS[name] = {"ok": ok, "details": details}

# Build representative ORM instances
try:
    # Feature importance
    fi = FeatureImportance()
    fi.id = uuid4(); fi.model_id = uuid4(); fi.feature_name = "f1"; fi.importance = 0.5; fi.rank = 1; fi.created_at = now; fi.updated_at = now

    # Training job
    tj = TrainingJob()
    tj.id = uuid4(); tj.model_id = uuid4(); tj.started_at = now; tj.completed_at = now; tj.status = TrainingJobStatus.COMPLETED
    tj.parameters_json = {"lr": 0.01}; tj.metrics_json = {"acc": 0.9}; tj.epoch_count = 10
    tj.training_accuracy = 0.92; tj.validation_accuracy = 0.9; tj.training_loss = None; tj.validation_loss = None
    tj.artifact_path = "/tmp/artifact"; tj.logs_path = "/tmp/logs"; tj.created_at = now; tj.updated_at = now

    # ML Model with nested lists
    ml = MLModel()
    ml.id = uuid4(); ml.name = "m1"; ml.version = "v1"; ml.algorithm = "xgboost"; ml.is_active = True; ml.accuracy = 0.9
    ml.training_jobs = [tj]; ml.feature_importances = [fi]; ml.created_at = now; ml.updated_at = now
    # Link back
    tj.model = ml
    fi.model = ml

    # User
    user = User()
    user.id = uuid4(); user.full_name = "Test User"; user.email = "test@example.com"; user.password_hash = "secret"
    user.role = UserRole.ANALYST; user.status = UserStatus.ACTIVE; user.last_login = now; user.created_at = now; user.updated_at = now

    # Setting
    setting = Setting()
    setting.id = uuid4(); setting.user_id = user.id; setting.theme = "dark"; setting.notification_preferences = "all"; setting.dashboard_preferences = "default"
    setting.created_at = now; setting.updated_at = now
    user.setting = setting

    # ActivityLog
    act = ActivityLog()
    act.id = uuid4(); act.user_id = user.id; act.action = "login"; act.resource = "auth"; act.details = "ok"; act.ip_address = "1.2.3.4"; act.user_agent = "ua"; act.created_at = now; act.updated_at = now
    act.user = user

    # Prediction
    pred = Prediction()
    pred.id = uuid4(); pred.transaction_id = uuid4(); pred.fraud_probability = 0.7; pred.predicted_label = "fraud"; pred.model_version = "v1"; pred.inference_time_ms = 120; pred.threshold_used = 0.5; pred.created_at = now; pred.updated_at = now

    # Transaction
    tx = Transaction()
    tx.id = uuid4(); tx.transaction_reference = "ref1"; tx.amount = Decimal("100.00"); tx.currency = "USD"; tx.transaction_timestamp = now; tx.status = TransactionStatus.PENDING; tx.created_at = now; tx.updated_at = now
    tx.prediction = pred

    # Evidence
    ev = Evidence()
    ev.id = uuid4(); ev.case_id = uuid4(); ev.filename = "e.pdf"; ev.file_type = "pdf"; ev.uploaded_by = user.id; ev.file_size = 1234; ev.uploaded_at = now; ev.created_at = now; ev.updated_at = now

    # CaseComment
    cc = CaseComment()
    cc.id = uuid4(); cc.case_id = uuid4(); cc.author_id = user.id; cc.comment = "note"; cc.created_at = now; cc.updated_at = now

    # InvestigationCase
    ic = InvestigationCase()
    ic.id = uuid4(); ic.fraud_alert_id = uuid4(); ic.case_number = "C-1"; ic.title = "T"; ic.description = "desc"; ic.status = CaseStatus.OPEN; ic.priority = Priority.MEDIUM
    ic.assigned_to = user.id; ic.opened_at = now; ic.closed_at = None; ic.resolution = None; ic.created_at = now; ic.updated_at = now
    ic.evidences = [ev]
    ic.comments = [cc]

    # FraudAlert
    fa = FraudAlert()
    fa.id = uuid4(); fa.transaction_id = tx.id; fa.prediction_id = pred.id; fa.severity = AlertSeverity.HIGH; fa.status = AlertStatus.OPEN; fa.assigned_to = user.id; fa.reviewed_at = None; fa.resolution_notes = None; fa.created_at = now; fa.updated_at = now
    fa.investigation_case = ic

    # Wire relationships
    user.transactions = [tx]
    user.activity_logs = [act]
    user.assigned_alerts = [fa]
    user.investigation_cases = [ic]
    user.evidences = [ev]
    user.case_comments = [cc]

except Exception as e:
    print("Error building ORM instances:")
    traceback.print_exc()
    raise

# Mapping of schema names to (schema class, orm instance)
CHECKS = [
    ("UserRead", schemas.UserRead, user),
    ("SettingRead", schemas.SettingRead, setting),
    ("ActivityLogRead", schemas.ActivityLogRead, act),
    ("TransactionRead", schemas.TransactionRead, tx),
    ("PredictionRead", schemas.PredictionRead, pred),
    ("FraudAlertRead", schemas.FraudAlertRead, fa),
    ("InvestigationCaseRead", schemas.InvestigationCaseRead, ic),
    ("EvidenceRead", schemas.EvidenceRead, ev),
    ("CaseCommentRead", schemas.CaseCommentRead, cc),
    ("MLModelRead", schemas.MLModelRead, ml),
    ("TrainingJobRead", schemas.TrainingJobRead, tj),
    ("FeatureImportanceRead", schemas.FeatureImportanceRead, fi),
]

final_ok = True
failures = {}

# Ensure forward refs are resolved by attempting model_rebuild on all Read schema classes
read_class_names = [
    "UserRead",
    "SettingRead",
    "ActivityLogRead",
    "TransactionRead",
    "PredictionRead",
    "FraudAlertRead",
    "InvestigationCaseRead",
    "EvidenceRead",
    "CaseCommentRead",
    "MLModelRead",
    "TrainingJobRead",
    "FeatureImportanceRead",
]
for _ in range(3):
    for n in read_class_names:
        if hasattr(schemas, n):
            try:
                getattr(schemas, n).model_rebuild()
            except Exception:
                # ignore rebuild errors on first passes; final validation will catch unresolved cases
                pass
# Ensure InvestigationCaseRead is rebuilt before FraudAlertRead to resolve their forward refs
if hasattr(schemas, "InvestigationCaseRead"):
    try:
        schemas.InvestigationCaseRead.model_rebuild()
    except Exception:
        pass
if hasattr(schemas, "FraudAlertRead"):
    try:
        schemas.FraudAlertRead.model_rebuild()
    except Exception:
        pass

for name, SchemaCls, orm_obj in CHECKS:
    try:
        validated = SchemaCls.model_validate(orm_obj)
        data = validated.model_dump()
        # Check forbidden exposures
        exposed = [k for k in forbidden if k in data]
        # Also check nested exposures by searching nested dicts
        def find_forbidden(d, path=""):
            found = []
            if isinstance(d, dict):
                for k, v in d.items():
                    if k in forbidden:
                        found.append(path + k)
                    found.extend(find_forbidden(v, path + k + "/"))
            elif isinstance(d, list):
                for i, it in enumerate(d):
                    found.extend(find_forbidden(it, path + f"[{i}]/"))
            return found
        nested_found = find_forbidden(data)
        if exposed or nested_found:
            final_ok = False
            failures[name] = {"error": "sensitive_exposed", "fields": exposed + nested_found}
            record(name, False, {"sensitive_fields": exposed + nested_found})
        else:
            record(name, True)
    except Exception as e:
        final_ok = False
        tb = traceback.format_exc()
        failures[name] = {"error": "validation_exception", "exception": tb}
        record(name, False, {"exception": tb})

# Additional schema structural checks
struct_issues = {}
# 1. ConfigDict(from_attributes=True) presence checked by model_config attribute
for cls_name in ["UserRead", "SettingRead", "ActivityLogRead", "TransactionRead", "PredictionRead", "FraudAlertRead", "InvestigationCaseRead", "EvidenceRead", "CaseCommentRead", "MLModelRead", "TrainingJobRead", "FeatureImportanceRead"]:
    cls = getattr(schemas, cls_name)
    has_from_attributes = getattr(cls, "model_config", None) is not None and getattr(cls, "model_config").get("from_attributes", False)
    if not has_from_attributes:
        final_ok = False
        struct_issues[cls_name] = struct_issues.get(cls_name, []) + ["missing_from_attributes"]

# 4. Create schemas contain only writable fields (no id, created_at, updated_at)
create_issues = {}
for base in [("UserCreate", "id"), ("SettingCreate", "id"), ("ActivityLogCreate", "id"), ("TransactionCreate", "id"), ("PredictionCreate", "id"), ("FraudAlertCreate", "id"), ("InvestigationCaseCreate", "id"), ("EvidenceCreate", "id"), ("CaseCommentCreate", "id"), ("MLModelCreate", "id"), ("TrainingJobCreate", "id"), ("FeatureImportanceCreate", "id")]:
    cls_name = base[0]
    cls = getattr(schemas, cls_name, None)
    if cls is None:
        create_issues[cls_name] = ["missing_create_schema"]
        final_ok = False
        continue
    fields = set(cls.model_fields.keys())
    for forbidden_field in ("id", "created_at", "updated_at"):
        if forbidden_field in fields:
            create_issues.setdefault(cls_name, []).append(f"contains_{forbidden_field}")
            final_ok = False

# 5. Update schemas contain only optional fields
update_issues = {}
for cls_name in ["UserUpdate", "SettingUpdate", "ActivityLogUpdate", "TransactionUpdate", "PredictionUpdate", "FraudAlertUpdate", "InvestigationCaseUpdate", "EvidenceUpdate", "CaseCommentUpdate", "MLModelUpdate", "TrainingJobUpdate", "FeatureImportanceUpdate"]:
    cls = getattr(schemas, cls_name)
    # model_fields entries have 'required'
    for fname, finfo in cls.model_fields.items():
        if getattr(finfo, "required", False):
            update_issues.setdefault(cls_name, []).append(fname)
            final_ok = False

# 6. Read schemas include generated fields
read_issues = {}
for cls_name in ["UserRead", "SettingRead", "ActivityLogRead", "TransactionRead", "PredictionRead", "FraudAlertRead", "InvestigationCaseRead", "EvidenceRead", "CaseCommentRead", "MLModelRead", "TrainingJobRead", "FeatureImportanceRead"]:
    cls = getattr(schemas, cls_name)
    fields = set(cls.model_fields.keys())
    for must in ("id", "created_at", "updated_at"):
        if must not in fields:
            read_issues.setdefault(cls_name, []).append(f"missing_{must}")
            final_ok = False

# 7. Sensitive fields double-check across all Read schemas done above

report = {
    "per_schema_results": RESULTS,
    "struct_issues": struct_issues,
    "create_issues": create_issues,
    "update_issues": update_issues,
    "read_issues": read_issues,
    "failures": failures,
    "final_ok": final_ok,
}
print(json.dumps(report, indent=2, default=str))

if not final_ok:
    raise SystemExit(2)
else:
    raise SystemExit(0)
