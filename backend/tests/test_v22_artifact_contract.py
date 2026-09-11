import json
import pickle
from pathlib import Path


def test_v22_artifact_has_complete_frozen_contract():
    root = Path(__file__).resolve().parents[2]
    artifact_path = root / "backend" / "app" / "ml" / "artifacts" / "xgb_fraud_v2_2_2.joblib"
    metadata_path = root / "backend" / "app" / "ml" / "artifacts" / "xgb_fraud_v2_2_2_metadata.json"

    assert artifact_path.exists(), "artifact missing"
    assert metadata_path.exists(), "metadata missing"

    with artifact_path.open("rb") as handle:
        artifact = pickle.load(handle)

    with metadata_path.open("r", encoding="utf-8") as handle:
        metadata = json.load(handle)

    assert artifact["contract_version"] == "fraudlens-v2.2.1"
    assert artifact["model_version"] == "fraudlens-xgb-v2.2.2"
    assert artifact["model_version"] == metadata["model_version"]
    assert artifact["contract_version"] == metadata["contract_version"]

    required_keys = {
        "raw_feature_list",
        "feature_columns",
        "numeric_columns",
        "categorical_columns",
        "selected_threshold",
        "estimated_threshold",
        "validation_pr_auc",
        "validation_roc_auc",
        "validation_precision",
        "validation_recall",
        "validation_f1",
        "validation_confusion_matrix",
        "holdout_pr_auc",
        "holdout_roc_auc",
        "holdout_precision",
        "holdout_recall",
        "holdout_f1",
        "holdout_confusion_matrix",
        "fitted_preprocessing",
        "split_boundaries",
        "product_categories",
        "product_missing_token",
        "product_unknown_token",
    }

    missing = sorted(required_keys - set(artifact.keys()))
    assert not missing, f"missing artifact keys: {missing}"
    assert artifact["selected_threshold"] == artifact["estimated_threshold"]
    assert artifact["feature_columns"] == artifact["feature_columns"]
    assert artifact["model_version"] == "fraudlens-xgb-v2.2.2"
