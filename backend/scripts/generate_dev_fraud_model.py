from __future__ import annotations

import pickle
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from app.config import get_settings
from scripts.demo_fraud_model import DemoFraudModel


def main() -> None:
    settings = get_settings()
    artifact_path = Path(settings.MODEL_PATH)
    if not artifact_path.is_absolute():
        artifact_path = (Path(__file__).resolve().parents[1] / artifact_path).resolve()

    artifact_path.parent.mkdir(parents=True, exist_ok=True)
    with artifact_path.open("wb") as handle:
        pickle.dump(DemoFraudModel(), handle)

    print(f"Created development artifact at {artifact_path}")


if __name__ == "__main__":
    main()
