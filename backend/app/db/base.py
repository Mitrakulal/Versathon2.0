from datetime import datetime, timezone
from sqlalchemy import Column, DateTime
from sqlalchemy.orm import declarative_base, declared_attr


class CustomBase:
    @declared_attr
    def __tablename__(cls) -> str:
        # Converts CamelCase model name to snake_case table name
        name = cls.__name__
        return "".join(["_" + c.lower() if c.isupper() else c for c in name]).lstrip("_") + "s"

    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=True,
    )


Base = declarative_base(cls=CustomBase)
