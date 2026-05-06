from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}

def test_create_plan():
    response = client.post("/plans", json={"floor_plan_id": "FP-001"})
    assert response.status_code == 200
    data = response.json()
    assert data["floor_plan_id"] == "FP-001"
    assert "id" in data

def test_get_heatmap():
    response = client.get("/plans/abc/heatmap")
    assert response.status_code == 200
    assert "description" in response.json()
