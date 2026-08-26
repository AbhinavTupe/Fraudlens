from app.db.session import SessionLocal
from app.models import User
from app.models.enums import UserRole, UserStatus
from scripts.provision_dev_user import provision_development_user


def test_provision_development_user_is_idempotent():
    db = SessionLocal()
    try:
        email = "dev-test@fraudlens.local"
        existing = db.query(User).filter(User.email == email).first()
        if existing is not None:
            db.delete(existing)
            db.commit()

        first = provision_development_user(db=db, email=email)
        assert first.email == email
        assert first.role == UserRole.ADMIN
        assert first.status == UserStatus.ACTIVE

        second = provision_development_user(db=db, email=email)
        assert second.id == first.id
        assert db.query(User).filter(User.email == email).count() == 1
    finally:
        db.close()
