import pickle
from pathlib import Path

import numpy as np
import pandas as pd
import pytest

from app.ml.shap_explainer import FrozenV22ModelExplainer


@pytest.fixture(scope='module')
def artifact():
    root = Path(__file__).resolve().parents[2]
    with (root / 'backend' / 'app' / 'ml' / 'artifacts' / 'xgb_fraud_v2_2_2.joblib').open('rb') as handle:
        return pickle.load(handle)


@pytest.fixture(scope='module')
def explainer():
    return FrozenV22ModelExplainer()


@pytest.fixture(scope='module')
def real_row(artifact):
    root = Path(__file__).resolve().parents[2]
    import zipfile

    with zipfile.ZipFile(root / 'train_transaction.csv.zip') as archive:
        csv_name = archive.namelist()[0]
        with archive.open(csv_name) as handle:
            df = pd.read_csv(handle).sort_values('TransactionDT').reset_index(drop=True)

    raw = df.iloc[100].copy()
    return raw.to_dict()


def test_explainer_loads_frozen_artifact(explainer, artifact):
    assert explainer.model_version == 'fraudlens-xgb-v2.2.2'
    assert explainer.contract_version == 'fraudlens-v2.2.1'
    assert artifact['model_version'] == explainer.model_version
    assert artifact['contract_version'] == explainer.contract_version


def test_explainer_output_has_expected_feature_order(explainer, real_row):
    result = explainer.explain_row(real_row)
    assert result['feature_order'] == explainer.feature_order
    assert len(result['feature_order']) == 20
    assert result['feature_order'] == [
        'TransactionAmt', 'C1', 'C2', 'C3', 'C4', 'C5', 'C6', 'C7', 'C8', 'C9', 'C10', 'C11', 'C12', 'C13', 'C14', 'ProductCD_C', 'ProductCD_H', 'ProductCD_R', 'ProductCD_S', 'ProductCD_W'
    ]


def test_shap_values_numeric_and_dimension_match(explainer, real_row):
    result = explainer.explain_row(real_row)
    values = [float(item['shap_value']) for item in result['contributions']]
    assert len(values) == len(result['feature_order'])
    assert all(np.isfinite(v) for v in values)


def test_explainer_is_deterministic_on_repeat(explainer, real_row):
    first = explainer.explain_row(real_row)
    second = explainer.explain_row(real_row)
    assert first['model_probability'] == pytest.approx(second['model_probability'])
    assert first['model_prediction'] == second['model_prediction']
    assert first['feature_order'] == second['feature_order']
    for left, right in zip(first['contributions'], second['contributions']):
        assert left['feature_name'] == right['feature_name']
        assert float(left['shap_value']) == pytest.approx(float(right['shap_value']), rel=1e-9, abs=1e-9)


def test_real_ieee_cis_row_explanation(explainer, real_row):
    result = explainer.explain_row(real_row)
    assert result['model_probability'] >= 0.0
    assert result['model_probability'] <= 1.0
    assert result['model_prediction'] in (0, 1)
    assert result['base_value'] is not None
    assert result['contributions']


def test_unknown_productcd_and_missing_numeric_are_handled(explainer):
    row = {
        'TransactionAmt': None,
        'ProductCD': 'UNSEEN_FRAUDLENS_CATEGORY',
        'C1': None,
        'C2': 0.0,
        'C3': 0.0,
        'C4': 0.0,
        'C5': 0.0,
        'C6': 0.0,
        'C7': 0.0,
        'C8': 0.0,
        'C9': 0.0,
        'C10': 0.0,
        'C11': 0.0,
        'C12': 0.0,
        'C13': 0.0,
        'C14': 0.0,
    }
    result = explainer.explain_row(row)
    assert len(result['contributions']) == len(result['feature_order'])
    assert result['model_probability'] >= 0.0
    assert result['model_prediction'] in (0, 1)


def test_missing_productcd_still_infers(explainer):
    row = {
        'TransactionAmt': 100.0,
        'ProductCD': None,
        'C1': 0.0,
        'C2': 0.0,
        'C3': 0.0,
        'C4': 0.0,
        'C5': 0.0,
        'C6': 0.0,
        'C7': 0.0,
        'C8': 0.0,
        'C9': 0.0,
        'C10': 0.0,
        'C11': 0.0,
        'C12': 0.0,
        'C13': 0.0,
        'C14': 0.0,
    }
    result = explainer.explain_row(row)
    assert len(result['contributions']) == 20
    assert result['model_probability'] >= 0.0
    assert result['model_prediction'] in (0, 1)


def test_explainer_matches_model_output_space(explainer, real_row):
    result = explainer.explain_row(real_row)
    model_probability = explainer._model_probability(explainer._coerce_row(real_row))
    assert result['model_probability'] == pytest.approx(model_probability, rel=1e-9, abs=1e-9)
    assert result['model_prediction'] == explainer._model_prediction(model_probability)
