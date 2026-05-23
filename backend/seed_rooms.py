"""Seed script: creates 3 meeting rooms on the first available floor.

Usage:
    python seed_rooms.py

If no floor exists, a default floor is created first.
The script is idempotent: rooms are only inserted if fewer than 3 already exist
on the target floor.
"""
import asyncio
import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker

DATABASE_URL = "postgresql+asyncpg://postgres:postgres@localhost:5432/dclaw_space"

engine = create_async_engine(DATABASE_URL, echo=False)
AsyncSessionLocal = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

# Import models after engine is set up (avoids circular dependency with app config)
from app.models.floor import Floor  # noqa: E402
from app.models.room import Room    # noqa: E402


SEED_ROOMS = [
    {"name": "Conf Room A", "capacity": 4,  "x": 100.0, "y": 100.0},
    {"name": "Conf Room B", "capacity": 8,  "x": 300.0, "y": 100.0},
    {"name": "Conf Room C", "capacity": 12, "x": 500.0, "y": 100.0},
]


async def seed() -> None:
    async with AsyncSessionLocal() as session:
        # Pick first active floor, or create one
        result = await session.execute(
            select(Floor).where(Floor.is_active.is_(True)).limit(1)
        )
        floor = result.scalar_one_or_none()

        if floor is None:
            floor = Floor(
                id=uuid.uuid4(),
                name="Ground Floor",
                level=0,
                width=1000,
                height=800,
                is_active=True,
            )
            session.add(floor)
            await session.flush()
            print(f"Created floor: {floor.name} (id={floor.id})")
        else:
            print(f"Using existing floor: {floor.name} (id={floor.id})")

        # Count rooms already on this floor
        existing = await session.execute(
            select(Room).where(Room.floor_id == floor.id, Room.is_active.is_(True))
        )
        existing_rooms = existing.scalars().all()
        existing_names = {r.name for r in existing_rooms}

        created = 0
        for room_data in SEED_ROOMS:
            if room_data["name"] in existing_names:
                print(f"  Room '{room_data['name']}' already exists — skipping")
                continue
            room = Room(
                id=uuid.uuid4(),
                floor_id=floor.id,
                name=room_data["name"],
                capacity=room_data["capacity"],
                equipment={},
                x=room_data["x"],
                y=room_data["y"],
                is_active=True,
            )
            session.add(room)
            created += 1
            print(f"  Created room: {room.name} (capacity={room.capacity})")

        await session.commit()
        print(f"Done. {created} room(s) created.")


if __name__ == "__main__":
    asyncio.run(seed())
