import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_list_floors_empty(client: AsyncClient):
    r = await client.get("/api/v1/floors/")
    assert r.status_code == 200
    assert r.json()["total"] == 0


@pytest.mark.asyncio
async def test_create_floor(client: AsyncClient):
    r = await client.post("/api/v1/floors/", json={"name": "Ground Floor", "level": 0})
    assert r.status_code == 201
    data = r.json()
    assert data["name"] == "Ground Floor"
    assert data["level"] == 0
    assert data["is_active"] is True


@pytest.mark.asyncio
async def test_get_floor(client: AsyncClient):
    created = (await client.post("/api/v1/floors/", json={"name": "Floor 1", "level": 1})).json()
    r = await client.get(f"/api/v1/floors/{created['id']}")
    assert r.status_code == 200
    assert r.json()["id"] == created["id"]


@pytest.mark.asyncio
async def test_get_floor_not_found(client: AsyncClient):
    r = await client.get("/api/v1/floors/00000000-0000-0000-0000-000000000000")
    assert r.status_code == 404


@pytest.mark.asyncio
async def test_update_floor(client: AsyncClient):
    created = (await client.post("/api/v1/floors/", json={"name": "Old", "level": 1})).json()
    r = await client.put(f"/api/v1/floors/{created['id']}", json={"name": "New"})
    assert r.status_code == 200
    assert r.json()["name"] == "New"


@pytest.mark.asyncio
async def test_delete_floor(client: AsyncClient):
    created = (await client.post("/api/v1/floors/", json={"name": "Temp", "level": 2})).json()
    r = await client.delete(f"/api/v1/floors/{created['id']}")
    assert r.status_code == 204
    assert (await client.get(f"/api/v1/floors/{created['id']}")).status_code == 404


@pytest.mark.asyncio
async def test_floor_occupancy(client: AsyncClient):
    floor = (await client.post("/api/v1/floors/", json={"name": "F1", "level": 1})).json()
    r = await client.get(f"/api/v1/floors/{floor['id']}/occupancy?date=2026-06-01")
    assert r.status_code == 200
    data = r.json()
    assert "occupancy" in data
    assert data["total_desks"] == 0
