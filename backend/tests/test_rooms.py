import pytest
from httpx import AsyncClient


async def create_floor(client: AsyncClient):
    return (await client.post("/api/v1/floors/", json={"name": "F1", "level": 1})).json()


async def create_room(client: AsyncClient, floor_id: str, name="Boardroom", capacity=10):
    return (await client.post("/api/v1/rooms/", json={
        "floor_id": floor_id, "name": name, "capacity": capacity
    })).json()


@pytest.mark.asyncio
async def test_list_rooms_empty(client: AsyncClient):
    r = await client.get("/api/v1/rooms/")
    assert r.status_code == 200
    assert r.json()["total"] == 0


@pytest.mark.asyncio
async def test_create_room(client: AsyncClient):
    floor = await create_floor(client)
    r = await client.post("/api/v1/rooms/", json={
        "floor_id": floor["id"], "name": "Board Room", "capacity": 12
    })
    assert r.status_code == 201
    data = r.json()
    assert data["name"] == "Board Room"
    assert data["capacity"] == 12


@pytest.mark.asyncio
async def test_create_room_invalid_floor(client: AsyncClient):
    r = await client.post("/api/v1/rooms/", json={
        "floor_id": "00000000-0000-0000-0000-000000000000",
        "name": "R", "capacity": 5
    })
    assert r.status_code == 404


@pytest.mark.asyncio
async def test_available_rooms(client: AsyncClient):
    floor = await create_floor(client)
    await create_room(client, floor["id"], "Room A", 8)
    await create_room(client, floor["id"], "Room B", 20)

    r = await client.get("/api/v1/rooms/available?start_dt=2026-06-10T10:00:00&end_dt=2026-06-10T11:00:00&capacity_min=1")
    assert r.status_code == 200
    assert r.json()["total"] == 2


@pytest.mark.asyncio
async def test_available_rooms_capacity_filter(client: AsyncClient):
    floor = await create_floor(client)
    await create_room(client, floor["id"], "Small", 4)
    await create_room(client, floor["id"], "Large", 20)

    r = await client.get("/api/v1/rooms/available?start_dt=2026-06-10T10:00:00&end_dt=2026-06-10T11:00:00&capacity_min=10")
    assert r.status_code == 200
    assert r.json()["total"] == 1
    assert r.json()["items"][0]["name"] == "Large"


@pytest.mark.asyncio
async def test_available_rooms_invalid_window(client: AsyncClient):
    r = await client.get("/api/v1/rooms/available?start_dt=2026-06-10T11:00:00&end_dt=2026-06-10T10:00:00&capacity_min=1")
    assert r.status_code == 422


@pytest.mark.asyncio
async def test_get_room(client: AsyncClient):
    floor = await create_floor(client)
    room = await create_room(client, floor["id"])
    r = await client.get(f"/api/v1/rooms/{room['id']}")
    assert r.status_code == 200
    assert r.json()["id"] == room["id"]


@pytest.mark.asyncio
async def test_delete_room(client: AsyncClient):
    floor = await create_floor(client)
    room = await create_room(client, floor["id"])
    r = await client.delete(f"/api/v1/rooms/{room['id']}")
    assert r.status_code == 204
