import uuid
import enum
from datetime import datetime
from sqlalchemy import String, DateTime, Enum, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column
from app.models.base import Base
from app.core.utils import utc_now


class VisitorStatus(str, enum.Enum):
    EXPECTED = "expected"
    CHECKED_IN = "checked_in"
    CHECKED_OUT = "checked_out"
    CANCELLED = "cancelled"


class Visitor(Base):
    __tablename__ = "visitors"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    host_user_id: Mapped[str] = mapped_column(String(100), nullable=False)
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    email: Mapped[str] = mapped_column(String(200), nullable=False)
    company: Mapped[str | None] = mapped_column(String(200), nullable=True)
    expected_at: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    status: Mapped[VisitorStatus] = mapped_column(
        Enum(VisitorStatus, name="visitor_status"), default=VisitorStatus.EXPECTED
    )
    badge_token: Mapped[str] = mapped_column(String(64), default=lambda: uuid.uuid4().hex)
    notes: Mapped[str | None] = mapped_column(String(500), nullable=True)
    checked_in_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    checked_out_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    created_at: Mapped[datetime] = mapped_column(default=utc_now)
    updated_at: Mapped[datetime] = mapped_column(default=utc_now, onupdate=utc_now)
