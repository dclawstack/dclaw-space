import asyncio
import json
from datetime import date
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.database import get_db
from app.models.desk_booking import DeskBooking, BookingStatus
from app.models.desk import Desk

router = APIRouter()

# Simple in-memory connection manager
class FloorConnectionManager:
    def __init__(self):
        # floor_id -> list[WebSocket]
        self._connections: dict[str, list[WebSocket]] = {}

    async def connect(self, floor_id: str, ws: WebSocket):
        await ws.accept()
        self._connections.setdefault(floor_id, []).append(ws)

    def disconnect(self, floor_id: str, ws: WebSocket):
        conns = self._connections.get(floor_id, [])
        if ws in conns:
            conns.remove(ws)

    async def broadcast(self, floor_id: str, payload: dict):
        dead = []
        for ws in self._connections.get(floor_id, []):
            try:
                await ws.send_text(json.dumps(payload))
            except Exception:
                dead.append(ws)
        for ws in dead:
            self.disconnect(floor_id, ws)


manager = FloorConnectionManager()


async def _get_occupancy(floor_id: str, db: AsyncSession) -> dict:
    today = date.today()
    result = await db.execute(
        select(DeskBooking.desk_id, DeskBooking.status, DeskBooking.user_id)
        .join(Desk, DeskBooking.desk_id == Desk.id)
        .where(
            Desk.floor_id == floor_id,
            DeskBooking.date == today,
            DeskBooking.status != BookingStatus.CANCELLED,
        )
    )
    occupancy: dict[str, dict] = {}
    for row in result.all():
        occupancy[str(row.desk_id)] = {
            "status": row.status.value,
            "user_id": row.user_id,
        }
    return {"floor_id": floor_id, "date": str(today), "occupancy": occupancy}


@router.websocket("/floors/{floor_id}/ws")
async def floor_occupancy_ws(
    floor_id: str,
    websocket: WebSocket,
    db: AsyncSession = Depends(get_db),
):
    await manager.connect(floor_id, websocket)
    try:
        # Send current state immediately on connect
        payload = await _get_occupancy(floor_id, db)
        await websocket.send_text(json.dumps(payload))
        # Keep alive — client pings every 30s, server sends refreshed occupancy
        while True:
            await asyncio.sleep(30)
            payload = await _get_occupancy(floor_id, db)
            await websocket.send_text(json.dumps(payload))
    except WebSocketDisconnect:
        manager.disconnect(floor_id, websocket)
    except Exception:
        manager.disconnect(floor_id, websocket)
