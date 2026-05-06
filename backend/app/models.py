from sqlalchemy import Column, String, Float, DateTime, func
from app.database import Base

class SpacePlanDB(Base):
    __tablename__ = "space_plans"
    id = Column(String, primary_key=True)
    floor_plan_id = Column(String, nullable=False)
    seats_per_sqm = Column(Float)
    collaboration_score = Column(Float)
    quiet_zone_ratio = Column(String)
    redesign_suggestions = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
