import sys
from pathlib import Path
repo_root = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(repo_root))

from app.db.session import SessionLocal
from app.models import User, Transaction
from sqlalchemy import select

import json

report = {}
try:
    db = SessionLocal()
    # simple lightweight counts
    u = db.scalar(select(User).limit(1))
    t = db.scalar(select(Transaction).limit(1))
    report['status'] = 'ok'
    db.close()
except Exception as e:
    report['status'] = 'error'
    report['error'] = str(e)
    try:
        db.close()
    except Exception:
        pass
print(json.dumps(report))
