from datetime import datetime
import uuid
from pydantic import BaseModel, EmailStr, ConfigDict, field_validator
from app.models.visitor import VisitorStatus


class VisitorCreate(BaseModel):
    name: str
    email: str
    company: str | None = None
    expected_at: datetime
    notes: str | None = None

    @field_validator("expected_at", mode="after")
    @classmethod
    def strip_tz(cls, v: datetime) -> datetime:
        return v.replace(tzinfo=None) if v.tzinfo is not None else v


class VisitorUpdate(BaseModel):
    name: str | None = None
    email: str | None = None
    company: str | None = None
    expected_at: datetime | None = None
    notes: str | None = None

    @field_validator("expected_at", mode="after")
    @classmethod
    def strip_tz(cls, v: datetime | None) -> datetime | None:
        if v is None:
            return v
        return v.replace(tzinfo=None) if v.tzinfo is not None else v


class VisitorOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    host_user_id: str
    name: str
    email: str
    company: str | None
    expected_at: datetime
    status: VisitorStatus
    badge_token: str
    notes: str | None
    checked_in_at: datetime | None
    checked_out_at: datetime | None
    created_at: datetime


class VisitorListOut(BaseModel):
    items: list[VisitorOut]
    total: int
