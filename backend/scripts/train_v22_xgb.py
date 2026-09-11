from __future__ import annotations

import json
import pickle
from pathlib import Path
import zipfile
from typing import Any

import numpy as np
import pandas as pd
import xgboost as xgb
from sklearn.metrics import (
    average_precision_score,
    confusion_matrix,
    f1_score,
    precision_recall_curve,
    precision_score,
    recall_score,
    roc_auc_score,
)


REPO_ROOT = Path(__file__).resolve().parents[2]
ARTIFACT_DIR = REPO_ROOT / "backend" / "app" / "ml" / "artifacts"
TRAIN_TRANSACTION_ZIP = REPO_ROOT / "train_transaction.csv.zip"


FEATURE_COLUMNS = [
    "TransactionAmt",
    "ProductCD",
    *[f"C{i}" for i in range(1, 15)],
]

# Frozen V2.2.1 split contract for the IEEE-CIS data.
TRAIN_END = 396_865
VAL_END = 466_131


def _load_csv_from_zip(zip_path: Path) -> pd.DataFrame:
    with zipfile.ZipFile(zip_path) as archive:
        csv_name = archive.namelist()[0]
        with archive.open(csv_name) as handle:
            return pd.read_csv(handle)


def _prepare_split(raw_df: pd.DataFrame) -> tuple[pd.DataFrame, pd.DataFrame, pd.DataFrame]:
    df = raw_df.sort_values("TransactionDT").reset_index(drop=True).copy()
    if len(df) < VAL_END:
        raise ValueError(f"Dataset too small for frozen split contract: {len(df)} rows")

    train_df = df.iloc[:TRAIN_END].copy()
    val_df = df.iloc[TRAIN_END:VAL_END].copy()
    holdout_df = df.iloc[VAL_END:].copy()
    return train_df, val_df, holdout_df


def _build_feature_frame(frame: pd.DataFrame, num_medians: dict[str, float], product_categories: list[str]) -> pd.DataFrame:
    working = frame[FEATURE_COLUMNS].copy()

    numeric_columns = [col for col in FEATURE_COLUMNS if col != "ProductCD"]
    for col in numeric_columns:
        working[col] = working[col].fillna(num_medians[col])

    working["ProductCD"] = working["ProductCD"].fillna("MISSING").astype(str)
    product_encoded = pd.get_dummies(working["ProductCD"], prefix="ProductCD")
    product_encoded = product_encoded.reindex(columns=[f"ProductCD_{category}" for category in product_categories], fill_value=0)

    numeric_frame = working[numeric_columns].copy()
    return pd.concat([numeric_frame.reset_index(drop=True), product_encoded.reset_index(drop=True)], axis=1)


def _select_threshold(y_true: np.ndarray, y_score: np.ndarray) -> tuple[float, float]:
    precision, recall, thresholds = precision_recall_curve(y_true, y_score)
    f1_scores = np.divide(
        2 * precision[:-1] * recall[:-1],
        precision[:-1] + recall[:-1],
        out=np.zeros_like(precision[:-1], dtype=float),
        where=(precision[:-1] + recall[:-1]) > 0,
    )
    best_idx = int(np.argmax(f1_scores))
    best_threshold = float(thresholds[best_idx]) if len(thresholds) > best_idx else 0.5
    return best_threshold, float(f1_scores[best_idx])


def main() -> None:
    ARTIFACT_DIR.mkdir(parents=True, exist_ok=True)

    raw_train = _load_csv_from_zip(TRAIN_TRANSACTION_ZIP)
    train_df, val_df, holdout_df = _prepare_split(raw_train)

    if "isFraud" not in train_df.columns or "isFraud" not in val_df.columns or "isFraud" not in holdout_df.columns:
        raise ValueError("The frozen IEEE-CIS transaction files do not include the isFraud target column")

    numeric_columns = [col for col in FEATURE_COLUMNS if col != "ProductCD"]
    num_medians = train_df[numeric_columns].median(numeric_only=True).to_dict()
    product_categories = sorted(train_df["ProductCD"].fillna("MISSING").astype(str).unique().tolist())

    X_train = _build_feature_frame(train_df, num_medians, product_categories)
    X_val = _build_feature_frame(val_df, num_medians, product_categories)
    X_holdout = _build_feature_frame(holdout_df, num_medians, product_categories)

    y_train = train_df["isFraud"].astype(int).to_numpy()
    y_val = val_df["isFraud"].astype(int).to_numpy()
    y_holdout = holdout_df["isFraud"].astype(int).to_numpy()

    if X_train.shape[1] != X_val.shape[1] or X_train.shape[1] != X_holdout.shape[1]:
        raise ValueError("Feature dimension mismatch across the split sets")

    candidate_params = [
        {"max_depth": 4, "learning_rate": 0.05, "n_estimators": 400, "subsample": 0.8, "colsample_bytree": 0.9},
        {"max_depth": 5, "learning_rate": 0.03, "n_estimators": 600, "subsample": 0.8, "colsample_bytree": 0.8},
        {"max_depth": 3, "learning_rate": 0.07, "n_estimators": 500, "subsample": 1.0, "colsample_bytree": 0.8},
    ]

    best_model: Any | None = None
    best_params: dict[str, Any] | None = None
    best_val_pr_auc = -1.0

    for params in candidate_params:
        model = xgb.XGBClassifier(
            objective="binary:logistic",
            eval_metric="aucpr",
            random_state=42,
            n_jobs=-1,
            tree_method="hist",
            scale_pos_weight=(y_train == 0).sum() / (y_train == 1).sum(),
            **params,
        )
        model.fit(X_train, y_train, verbose=False)
        val_score = model.predict_proba(X_val)[:, 1]
        pr_auc = average_precision_score(y_val, val_score)
        if pr_auc > best_val_pr_auc:
            best_val_pr_auc = float(pr_auc)
            best_model = model
            best_params = params

    if best_model is None or best_params is None:
        raise RuntimeError("No candidate XGBoost model was trained")

    val_score = best_model.predict_proba(X_val)[:, 1]
    best_threshold, _ = _select_threshold(y_val, val_score)

    val_pred = (val_score >= best_threshold).astype(int)
    validation_precision = float(precision_score(y_val, val_pred, zero_division=0))
    validation_recall = float(recall_score(y_val, val_pred, zero_division=0))
    validation_f1 = float(f1_score(y_val, val_pred, zero_division=0))
    validation_confusion = confusion_matrix(y_val, val_pred).tolist()
    validation_roc_auc = float(roc_auc_score(y_val, val_score))

    holdout_score = best_model.predict_proba(X_holdout)[:, 1]
    holdout_pred = (holdout_score >= best_threshold).astype(int)
    holdout_pr_auc = float(average_precision_score(y_holdout, holdout_score))
    holdout_precision = float(precision_score(y_holdout, holdout_pred, zero_division=0))
    holdout_recall = float(recall_score(y_holdout, holdout_pred, zero_division=0))
    holdout_f1 = float(f1_score(y_holdout, holdout_pred, zero_division=0))
    holdout_confusion = confusion_matrix(y_holdout, holdout_pred).tolist()
    holdout_roc_auc = float(roc_auc_score(y_holdout, holdout_score))

    artifact_payload = {
        "contract_version": "fraudlens-v2.2.1",
        "model_version": "fraudlens-xgb-v2.2.2",
        "model": best_model,
        "raw_feature_list": FEATURE_COLUMNS,
        "feature_columns": list(X_train.columns),
        "numeric_columns": numeric_columns,
        "categorical_columns": ["ProductCD"],
        "train_end_row": TRAIN_END,
        "validation_end_row": VAL_END,
        "selected_threshold": float(best_threshold),
        "estimated_threshold": float(best_threshold),
        "validation_pr_auc": float(best_val_pr_auc),
        "validation_roc_auc": validation_roc_auc,
        "validation_precision": validation_precision,
        "validation_recall": validation_recall,
        "validation_f1": validation_f1,
        "validation_confusion_matrix": validation_confusion,
        "holdout_pr_auc": float(holdout_pr_auc),
        "holdout_roc_auc": holdout_roc_auc,
        "holdout_precision": holdout_precision,
        "holdout_recall": holdout_recall,
        "holdout_f1": holdout_f1,
        "holdout_confusion_matrix": holdout_confusion,
        "model_params": best_params,
        "scale_pos_weight": float((y_train == 0).sum() / (y_train == 1).sum()),
        "product_categories": product_categories,
        "product_missing_token": "MISSING",
        "product_unknown_token": "UNKNOWN",
        "fitted_preprocessing": {
            "numeric_medians": num_medians,
            "product_categories": product_categories,
            "product_missing_token": "MISSING",
            "product_unknown_token": "UNKNOWN",
            "feature_order": list(X_train.columns),
            "unknown_policy": "all_product_columns_zero",
        },
        "split_boundaries": {
            "train_max_transaction_dt": int(train_df["TransactionDT"].max()),
            "validation_min_transaction_dt": int(val_df["TransactionDT"].min()),
            "validation_max_transaction_dt": int(val_df["TransactionDT"].max()),
            "holdout_min_transaction_dt": int(holdout_df["TransactionDT"].min()),
            "train_rows": int(len(train_df)),
            "validation_rows": int(len(val_df)),
            "holdout_rows": int(len(holdout_df)),
        },
        "dataset_name": "IEEE-CIS Fraud Detection",
        "training_row_count": int(len(train_df)),
        "validation_row_count": int(len(val_df)),
        "holdout_row_count": int(len(holdout_df)),
        "distribution": {
            "train": {"total": int(len(train_df)), "fraud": int(y_train.sum()), "legitimate": int((1 - y_train).sum())},
            "validation": {"total": int(len(val_df)), "fraud": int(y_val.sum()), "legitimate": int((1 - y_val).sum())},
            "holdout": {"total": int(len(holdout_df)), "fraud": int(y_holdout.sum()), "legitimate": int((1 - y_holdout).sum())},
        },
    }

    artifact_path = ARTIFACT_DIR / "xgb_fraud_v2_2_2.joblib"
    with artifact_path.open("wb") as handle:
        pickle.dump(artifact_payload, handle)

    metadata = {
        "artifact_name": artifact_path.name,
        "algorithm": "XGBoostClassifier",
        "contract_version": "fraudlens-v2.2.1",
        "model_version": "fraudlens-xgb-v2.2.2",
        "feature_columns": list(X_train.columns),
        "feature_contract": {
            "numeric": numeric_columns,
            "categorical": ["ProductCD"],
            "excluded": ["TransactionDT", "TransactionID", "DeviceType", "card1..card6", "addr1..addr2", "id_*"],
        },
        "splits": {
            "training_rows": int(len(train_df)),
            "validation_rows": int(len(val_df)),
            "holdout_rows": int(len(holdout_df)),
            "frozen_train_end": TRAIN_END,
            "frozen_validation_end": VAL_END,
        },
        "threshold": float(best_threshold),
        "validation_pr_auc": float(best_val_pr_auc),
        "holdout_pr_auc": float(holdout_pr_auc),
        "best_params": best_params,
        "notes": "Artifact created outside the live runtime to preserve the V2.1 implementation while producing the first trained XGBoost baseline.",
    }

    metadata_path = ARTIFACT_DIR / "xgb_fraud_v2_2_2_metadata.json"
    metadata_path.write_text(json.dumps(metadata, indent=2), encoding="utf-8")

    precision = float(((holdout_pred == 1) & (y_holdout == 1)).sum())
    recall = float(((holdout_pred == 1) & (y_holdout == 1)).sum())
    if y_holdout.sum() > 0:
        recall = precision / y_holdout.sum()
    if holdout_pred.sum() > 0:
        precision = precision / holdout_pred.sum()
    f1_score = 0.0
    if precision + recall > 0:
        f1_score = 2 * precision * recall / (precision + recall)

    print(f"artifact_path={artifact_path}")
    print(f"metadata_path={metadata_path}")
    print(f"train_rows={len(train_df)} validation_rows={len(val_df)} holdout_rows={len(holdout_df)}")
    print(f"best_params={best_params}")
    print(f"validation_pr_auc={best_val_pr_auc:.6f}")
    print(f"selected_threshold={best_threshold:.6f}")
    print(f"holdout_pr_auc={holdout_pr_auc:.6f}")
    print(f"holdout_f1={f1_score:.6f}")


if __name__ == "__main__":
    main()
