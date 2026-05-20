import pytest
from httpx import AsyncClient


async def create_floor(client: AsyncClient, name="F1", level=1):
    r = await client.post("/api/v1/floors/", json={"name": name, "level": level})
    return r.json()


@pytest.mark.asyncio
async def test_list_desks_empty(client: AsyncClient):
    r = await client.get("/api/v1/desks/")
    assert r.status_code == 200
    assert r.json()["total"] == 0


@pytest.mark.asyncio
async def test_create_desk(client: AsyncClient):
    floor = await create_floor(client)
    r = await client.post("/api/v1/desks/", json={"floor_id": floor["id"], "label": "D-01"})
    assert r.status_code == 201
    data = r.json()
    assert data["label"] == "D-01"
    assert data["floor_id"] == floor["id"]


@pytest.mark.asyncio
async def test_create_desk_invalid_floor(client: AsyncClient):
    r = await client.post("/api/v1/desks/", json={
        "floor_id": "00000000-0000-0000-0000-000000000000",
        "label": "D-99",
    })
    assert r.status_code == 404


@pytest.mark.asyncio
async def test_get_desk(client: AsyncClient):
    floor = await create_floor(client)
    desk = (await client.post("/api/v1/desks/", json={"floor_id": floor["id"], "label": "D-02"})).json()
    r = await client.get(f"/api/v1/desks/{desk['id']}")
    assert r.status_code == 200
    assert r.json()["id"] == desk["id"]


@pytest.mark.asyncio
async def test_available_desks(client: AsyncClient):
    floor = await create_floor(client)
    await client.post("/api/v1/desks/", json={"floor_id": floor["id"], "label": "D-01"})
    await client.post("/api/v1/desks/", json={"floor_id": floor["id"], "label": "D-02"})
    r = await client.get("/api/v1/desks/available?date=2026-06-10")
    assert r.status_code == 200
    assert r.json()["total"] == 2


@pytest.mark.asyncio
async def test_delete_desk(client: AsyncClient):
    floor = await create_floor(client)
    desk = (await client.post("/api/v1/desks/", json={"floor_id": floor["id"], "label": "D-X"})).json()
    r = await client.delete(f"/api/v1/desks/{desk['id']}")
    assert r.status_code == 204
