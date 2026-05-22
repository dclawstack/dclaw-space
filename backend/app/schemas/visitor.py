from datetime import datetime
import uuid
from pydantic import BaseModel, EmailStr, ConfigDict
from app.models.visitor import VisitorStatus


class VisitorCreate(BaseModel):
    name: str
    email: str
    company: str | None = None
    expected_at: datetime
    notes: str | None = None


class VisitorUpdate(BaseModel):
    name: str | None = None
    email: str | None = None
    company: str | None = None
    expected_at: datetime | None = None
    notes: str | None = None


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
