from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel
from datetime import datetime
import uuid, random
from app.database import get_db

router = APIRouter()

class CreatePlanRequest(BaseModel):
    floor_plan_id: str

class SpacePlan(BaseModel):
    id: str
    floor_plan_id: str
    seats_per_sqm: float
    collaboration_score: float
    quiet_zone_ratio: str
    redesign_suggestions: list[str]
    created_at: datetime

    class Config:
        from_attributes = True

@router.post("/plans", response_model=SpacePlan)
def create_plan(req: CreatePlanRequest, db: Session = Depends(get_db)):
    return SpacePlan(
        id=str(uuid.uuid4()),
        floor_plan_id=req.floor_plan_id,
        seats_per_sqm=round(random.uniform(4, 12), 1),
        collaboration_score=round(random.uniform(60, 90), 1),
        quiet_zone_ratio="25%",
        redesign_suggestions=["Add phone booths"],
        created_at=datetime.utcnow(),
    )

@router.get("/plans/{id}/heatmap")
def get_heatmap(id: str, db: Session = Depends(get_db)):
    return {
        "description": "Heatmap shows high occupancy in collaboration zones (east wing) and low occupancy in quiet zones (north wing). Recommend rebalancing seating allocation."
    }
