import uuid
from sqlalchemy import String, ForeignKey, Integer, Float
from sqlalchemy.orm import Mapped, mapped_column
from datetime import datetime
from app.models.base import Base
from app.core.utils import utc_now


class UserPreference(Base):
    __tablename__ = "user_preferences"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    user_id: Mapped[str] = mapped_column(String(100), nullable=False, unique=True, index=True)
    preferred_floor_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("floors.id", ondelete="SET NULL"), nullable=True
    )
    preferred_zone: Mapped[str | None] = mapped_column(String(50), nullable=True)
    preferred_desk_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("desks.id", ondelete="SET NULL"), nullable=True
    )
    booking_count: Mapped[int] = mapped_column(Integer, default=0)
    updated_at: Mapped[datetime] = mapped_column(default=utc_now, onupdate=utc_now)
