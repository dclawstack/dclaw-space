import uuid
from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field


class FloorBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    level: int = Field(..., ge=0)
    svg_data: str | None = None
    width: int = Field(1000, gt=0)
    height: int = Field(800, gt=0)


class FloorCreate(FloorBase):
    pass


class FloorUpdate(BaseModel):
    name: str | None = Field(None, min_length=1, max_length=100)
    level: int | None = Field(None, ge=0)
    svg_data: str | None = None
    width: int | None = Field(None, gt=0)
    height: int | None = Field(None, gt=0)
    is_active: bool | None = None


class FloorOut(FloorBase):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    is_active: bool
    created_at: datetime
    updated_at: datetime


class FloorListOut(BaseModel):
    items: list[FloorOut]
    total: int
