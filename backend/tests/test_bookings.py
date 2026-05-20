import pytest
from httpx import AsyncClient


async def setup_floor_desk(client: AsyncClient):
    floor = (await client.post("/api/v1/floors/", json={"name": "F1", "level": 1})).json()
    desk = (await client.post("/api/v1/desks/", json={"floor_id": floor["id"], "label": "D-01"})).json()
    return floor, desk


async def setup_floor_room(client: AsyncClient):
    floor = (await client.post("/api/v1/floors/", json={"name": "F1", "level": 1})).json()
    room = (await client.post("/api/v1/rooms/", json={
        "floor_id": floor["id"], "name": "Conf Room", "capacity": 10
    })).json()
    return floor, room


# ── Desk bookings ──────────────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_create_desk_booking(client: AsyncClient):
    _, desk = await setup_floor_desk(client)
    r = await client.post("/api/v1/bookings/desks/", json={
        "desk_id": desk["id"], "date": "2026-07-01"
    }, headers={"X-User-ID": "user-1"})
    assert r.status_code == 201
    data = r.json()
    assert data["status"] == "confirmed"
    assert data["user_id"] == "user-1"


@pytest.mark.asyncio
async def test_desk_booking_conflict(client: AsyncClient):
    _, desk = await setup_floor_desk(client)
    body = {"desk_id": desk["id"], "date": "2026-07-02"}
    await client.post("/api/v1/bookings/desks/", json=body, headers={"X-User-ID": "user-1"})
    r = await client.post("/api/v1/bookings/desks/", json=body, headers={"X-User-ID": "user-2"})
    assert r.status_code == 409


@pytest.mark.asyncio
async def test_my_desk_bookings(client: AsyncClient):
    _, desk = await setup_floor_desk(client)
    await client.post("/api/v1/bookings/desks/", json={
        "desk_id": desk["id"], "date": "2026-07-10"
    }, headers={"X-User-ID": "user-1"})
    r = await client.get("/api/v1/bookings/desks/mine", headers={"X-User-ID": "user-1"})
    assert r.status_code == 200
    assert r.json()["total"] >= 1


@pytest.mark.asyncio
async def test_check_in_desk(client: AsyncClient):
    _, desk = await setup_floor_desk(client)
    booking = (await client.post("/api/v1/bookings/desks/", json={
        "desk_id": desk["id"], "date": "2026-07-15"
    }, headers={"X-User-ID": "u1"})).json()
    r = await client.post(f"/api/v1/bookings/desks/{booking['id']}/checkin", headers={"X-User-ID": "u1"})
    assert r.status_code == 200
    assert r.json()["status"] == "checked_in"


@pytest.mark.asyncio
async def test_check_in_wrong_user(client: AsyncClient):
    _, desk = await setup_floor_desk(client)
    booking = (await client.post("/api/v1/bookings/desks/", json={
        "desk_id": desk["id"], "date": "2026-07-20"
    }, headers={"X-User-ID": "u1"})).json()
    r = await client.post(f"/api/v1/bookings/desks/{booking['id']}/checkin", headers={"X-User-ID": "u2"})
    assert r.status_code == 403


@pytest.mark.asyncio
async def test_cancel_desk_booking(client: AsyncClient):
    _, desk = await setup_floor_desk(client)
    booking = (await client.post("/api/v1/bookings/desks/", json={
        "desk_id": desk["id"], "date": "2026-07-25"
    }, headers={"X-User-ID": "u1"})).json()
    r = await client.delete(f"/api/v1/bookings/desks/{booking['id']}", headers={"X-User-ID": "u1"})
    assert r.status_code == 204


@pytest.mark.asyncio
async def test_cancel_desk_twice(client: AsyncClient):
    _, desk = await setup_floor_desk(client)
    booking = (await client.post("/api/v1/bookings/desks/", json={
        "desk_id": desk["id"], "date": "2026-07-26"
    }, headers={"X-User-ID": "u1"})).json()
    await client.delete(f"/api/v1/bookings/desks/{booking['id']}", headers={"X-User-ID": "u1"})
    r = await client.delete(f"/api/v1/bookings/desks/{booking['id']}", headers={"X-User-ID": "u1"})
    assert r.status_code == 409


@pytest.mark.asyncio
async def test_utilization(client: AsyncClient):
    _, desk = await setup_floor_desk(client)
    await client.post("/api/v1/bookings/desks/", json={
        "desk_id": desk["id"], "date": "2026-08-01"
    }, headers={"X-User-ID": "u1"})
    r = await client.get("/api/v1/bookings/analytics/utilization?date_from=2026-08-01&date_to=2026-08-01")
    assert r.status_code == 200
    data = r.json()
    assert len(data["data"]) == 1
    assert data["data"][0]["bookings"] == 1


# ── Room bookings ──────────────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_create_room_booking(client: AsyncClient):
    _, room = await setup_floor_room(client)
    r = await client.post("/api/v1/bookings/rooms/", json={
        "room_id": room["id"],
        "title": "Sprint Planning",
        "start_dt": "2026-07-01T10:00:00",
        "end_dt": "2026-07-01T11:00:00",
        "attendee_count": 5,
    }, headers={"X-User-ID": "u1"})
    assert r.status_code == 201
    assert r.json()["status"] == "confirmed"


@pytest.mark.asyncio
async def test_room_booking_over_capacity(client: AsyncClient):
    _, room = await setup_floor_room(client)
    r = await client.post("/api/v1/bookings/rooms/", json={
        "room_id": room["id"],
        "title": "Big meeting",
        "start_dt": "2026-07-02T10:00:00",
        "end_dt": "2026-07-02T11:00:00",
        "attendee_count": 100,
    }, headers={"X-User-ID": "u1"})
    assert r.status_code == 422


@pytest.mark.asyncio
async def test_room_booking_conflict(client: AsyncClient):
    _, room = await setup_floor_room(client)
    body = {
        "room_id": room["id"],
        "title": "Meeting",
        "start_dt": "2026-07-03T10:00:00",
        "end_dt": "2026-07-03T11:00:00",
        "attendee_count": 2,
    }
    await client.post("/api/v1/bookings/rooms/", json=body, headers={"X-User-ID": "u1"})
    r = await client.post("/api/v1/bookings/rooms/", json=body, headers={"X-User-ID": "u2"})
    assert r.status_code == 409


@pytest.mark.asyncio
async def test_cancel_room_booking(client: AsyncClient):
    _, room = await setup_floor_room(client)
    booking = (await client.post("/api/v1/bookings/rooms/", json={
        "room_id": room["id"],
        "title": "Sync",
        "start_dt": "2026-07-04T14:00:00",
        "end_dt": "2026-07-04T15:00:00",
        "attendee_count": 3,
    }, headers={"X-User-ID": "u1"})).json()
    r = await client.delete(f"/api/v1/bookings/rooms/{booking['id']}", headers={"X-User-ID": "u1"})
    assert r.status_code == 204


@pytest.mark.asyncio
async def test_room_booking_end_before_start(client: AsyncClient):
    _, room = await setup_floor_room(client)
    r = await client.post("/api/v1/bookings/rooms/", json={
        "room_id": room["id"],
        "title": "Bad",
        "start_dt": "2026-07-05T11:00:00",
        "end_dt": "2026-07-05T10:00:00",
        "attendee_count": 1,
    }, headers={"X-User-ID": "u1"})
    assert r.status_code == 422
