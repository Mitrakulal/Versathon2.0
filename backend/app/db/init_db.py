import os
from sqlalchemy.orm import Session
from app.db.base import Base
from app.db.session import engine, SessionLocal
from app.models.entities import User
from app.core.logging import logger


def init_db():
    """Initializes the database directory, creates tables, and seeds the default user."""
    # Ensure local directory exists for SQLite
    db_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "data")
    os.makedirs(db_dir, exist_ok=True)

    logger.info("Initializing database tables...")
    Base.metadata.create_all(bind=engine)

    # Seed default user if not exists
    db: Session = SessionLocal()
    try:
        default_user = db.query(User).filter(User.id == "default-user").first()
        if not default_user:
            default_user = User(
                id="default-user",
                name="Default Student",
                email="student@noterecall.local",
            )
            db.add(default_user)
            db.commit()
            logger.info("Seeded default user (id: default-user)")
    except Exception as e:
        logger.error(f"Failed to seed default user: {e}")
        db.rollback()
    finally:
        db.close()
