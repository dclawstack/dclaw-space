import uuid
from datetime import datetime
from typing import Any
from pydantic import BaseModel, ConfigDict, Field


class DeskBase(BaseModel):
    floor_id: uuid.UUID
    label: str = Field(..., min_length=1, max_length=50)
    zone: str | None = Field(None, max_length=50)
    x: float = 0.0
    y: float = 0.0
    amenities: dict[str, Any] = Field(default_factory=dict)


class DeskCreate(DeskBase):
    pass


class DeskUpdate(BaseModel):
    label: str | None = Field(None, min_length=1, max_length=50)
    zone: str | None = None
    x: float | None = None
    y: float | None = None
    amenities: dict[str, Any] | None = None
    is_active: bool | None = None


class DeskOut(DeskBase):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    is_active: bool
    created_at: datetime
    updated_at: datetime


class DeskListOut(BaseModel):
    items: list[DeskOut]
    total: int
