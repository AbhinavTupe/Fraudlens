from __future__ import annotations

import pickle
from pathlib import Path
from typing import Any

import numpy as np
import pandas as pd
import shap

REPO_ROOT = Path(__file__).resolve().parents[3]
ARTIFACT_PATH = REPO_ROOT / 'backend' / 'app' / 'ml' / 'artifacts' / 'xgb_fraud_v2_2_2.joblib'


class FrozenV22ModelExplainer:
    def __init__(self, artifact_path: str | Path | None = None) -> None:
        self.artifact_path = Path(artifact_path) if artifact_path is not None else ARTIFACT_PATH
        self.artifact = self._load_artifact(self.artifact_path)
        self.model = self.artifact['model']
        self.model_version = self.artifact['model_version']
        self.contract_version = self.artifact['contract_version']
        self.feature_order = list(self.artifact['feature_order'])
        self.raw_feature_list = list(self.artifact['raw_feature_list'])
        self.numeric_columns = list(self.artifact['numeric_columns'])
        self.product_categories = list(self.artifact['product_categories'])
        self.fitted_numeric_medians = self.artifact['fitted_preprocessing']['numeric_medians']
        self.threshold = float(self.artifact['selected_threshold'])
        self.explainer = shap.TreeExplainer(self.model)

    @staticmethod
    def _load_artifact(path: str | Path) -> dict[str, Any]:
        with Path(path).open('rb') as handle:
            artifact = pickle.load(handle)
        if not isinstance(artifact, dict):
            raise TypeError('Loaded artifact is not a dictionary payload')
        return artifact

    def _input_feature_columns(self) -> list[str]:
        return list(self.artifact['feature_order'])

    def _coerce_row(self, raw_row: dict[str, Any] | pd.Series | pd.DataFrame) -> pd.DataFrame:
        if isinstance(raw_row, pd.DataFrame):
            frame = raw_row.copy()
        elif isinstance(raw_row, pd.Series):
            frame = raw_row.to_frame().T.copy()
        else:
            frame = pd.DataFrame([raw_row]).copy()

        for column in self.raw_feature_list:
            if column not in frame.columns:
                frame[column] = np.nan

        numeric_frame = frame[self.raw_feature_list].copy()
        for column in self.numeric_columns:
            numeric_frame[column] = pd.to_numeric(numeric_frame[column], errors='coerce')
            if pd.isna(numeric_frame[column]).any():
                numeric_frame[column] = numeric_frame[column].fillna(self.fitted_numeric_medians[column])

        product_frame = numeric_frame[['ProductCD']].copy() if 'ProductCD' in numeric_frame.columns else pd.DataFrame({'ProductCD': [None]})
        product_frame['ProductCD'] = product_frame['ProductCD'].fillna('MISSING').astype(str)
        product_frame['ProductCD'] = product_frame['ProductCD'].replace({'': 'MISSING'})

        encoded = pd.get_dummies(product_frame['ProductCD'], prefix='ProductCD')
        encoded = encoded.reindex(columns=[f'ProductCD_{category}' for category in self.product_categories], fill_value=0)

        feature_frame = pd.concat([
            numeric_frame[[col for col in self.numeric_columns if col != 'ProductCD']].reset_index(drop=True),
            encoded.reset_index(drop=True),
        ], axis=1)

        feature_frame = feature_frame.reindex(columns=self.feature_order, fill_value=0.0)
        return feature_frame

    def _model_probability(self, transformed: pd.DataFrame) -> float:
        return float(self.model.predict_proba(transformed)[0, 1])

    def _model_prediction(self, probability: float) -> int:
        return int(probability >= self.threshold)

    def explain_row(self, raw_row: dict[str, Any] | pd.Series | pd.DataFrame) -> dict[str, Any]:
        transformed = self._coerce_row(raw_row)
        probability = self._model_probability(transformed)
        prediction = self._model_prediction(probability)

        explanation = self.explainer.shap_values(transformed)
        if isinstance(explanation, list):
            shap_values = np.asarray(explanation[1]).ravel()
            expected_value = np.asarray(self.explainer.expected_value)[1] if isinstance(self.explainer.expected_value, list) else float(self.explainer.expected_value)
        else:
            shap_values = np.asarray(explanation).ravel()
            expected_value = float(self.explainer.expected_value)

        if shap_values.shape[0] != transformed.shape[1]:
            raise ValueError(f'SHAP dimension mismatch: expected {transformed.shape[1]}, got {shap_values.shape[0]}')

        contributions = []
        for feature_name, feature_value, shap_value in zip(self.feature_order, transformed.iloc[0].to_list(), shap_values.tolist()):
            contributions.append({
                'feature_name': feature_name,
                'feature_value': float(feature_value) if isinstance(feature_value, (int, float, np.floating, np.integer)) else feature_value,
                'shap_value': float(shap_value),
            })

        sorted_contributions = sorted(contributions, key=lambda item: abs(float(item['shap_value'])), reverse=True)
        return {
            'model_version': self.model_version,
            'contract_version': self.contract_version,
            'model_probability': probability,
            'model_prediction': prediction,
            'base_value': float(expected_value),
            'shap_output_space': 'logit / tree output for the positive class',
            'feature_order': self.feature_order,
            'contributions': contributions,
            'top_contributors': sorted_contributions,
        }


__all__ = ['FrozenV22ModelExplainer']
