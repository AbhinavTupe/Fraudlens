from __future__ import annotations

import argparse
import zipfile
from pathlib import Path

import pandas as pd

from app.db.session import SessionLocal
from app.services.ieee_cis_ingestion_service import RAW_FEATURE_COLUMNS, ingest_ieee_cis_row


SOURCE_COLUMNS = ["TransactionID", "TransactionDT", *RAW_FEATURE_COLUMNS]


def _read_requested_rows(path: Path, requested_ids: set[int]) -> list[dict]:
    opener = zipfile.ZipFile(path) if path.suffix.lower() == ".zip" else None
    try:
        handle = opener.open(opener.namelist()[0]) if opener is not None else path.open("rb")
        with handle:
            matches: list[dict] = []
            for chunk in pd.read_csv(handle, usecols=SOURCE_COLUMNS, chunksize=10000):
                selected = chunk[chunk["TransactionID"].isin(requested_ids)]
                matches.extend(selected.to_dict(orient="records"))
                if len(matches) == len(requested_ids):
                    break
            return matches
    finally:
        if opener is not None:
            opener.close()


def ingest(path: Path, source_ids: list[int]) -> list[str]:
    if not 1 <= len(source_ids) <= 10:
        raise ValueError("Provide between 1 and 10 explicit IEEE-CIS TransactionID values")
    if len(set(source_ids)) != len(source_ids):
        raise ValueError("Duplicate source TransactionID values were supplied")

    rows = _read_requested_rows(path, set(source_ids))
    by_id = {int(row["TransactionID"]): row for row in rows}
    missing = [source_id for source_id in source_ids if source_id not in by_id]
    if missing:
        raise ValueError(f"IEEE-CIS TransactionID values were not found: {missing}")

    db = SessionLocal()
    try:
        imported: list[str] = []
        with db.begin():
            for source_id in source_ids:
                transaction, _, _ = ingest_ieee_cis_row(db, by_id[source_id])
                imported.append(str(transaction.id))
        return imported
    finally:
        db.close()


def main() -> None:
    parser = argparse.ArgumentParser(description="Ingest up to 10 explicit IEEE-CIS rows")
    parser.add_argument("source_path", type=Path)
    parser.add_argument("transaction_ids", nargs="+", type=int)
    args = parser.parse_args()
    for transaction_id in ingest(args.source_path, args.transaction_ids):
        print(transaction_id)


if __name__ == "__main__":
    main()
