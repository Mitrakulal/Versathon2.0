import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.db.init_db import init_db

# Initialize database before tests
init_db()
client = TestClient(app)


def test_root_endpoint():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"


def test_study_spaces_lifecycle():
    # 1. Create a space
    create_payload = {
        "title": "Operating Systems Unit 1",
        "description": "Processes and Threads revision"
    }
    create_res = client.post("/api/v1/spaces", json=create_payload)
    assert create_res.status_code == 201
    space = create_res.json()
    assert space["title"] == "Operating Systems Unit 1"
    space_id = space["id"]

    # 2. List spaces
    list_res = client.get("/api/v1/spaces")
    assert list_res.status_code == 200
    spaces = list_res.json()
    assert any(s["id"] == space_id for s in spaces)

    # 3. Get single space
    get_res = client.get(f"/api/v1/spaces/{space_id}")
    assert get_res.status_code == 200
    assert get_res.json()["title"] == "Operating Systems Unit 1"

    # 4. Update space
    patch_res = client.patch(f"/api/v1/spaces/{space_id}", json={"title": "OS Unit 1 - Updated"})
    assert patch_res.status_code == 200
    assert patch_res.json()["title"] == "OS Unit 1 - Updated"

    # 5. Delete space
    del_res = client.delete(f"/api/v1/spaces/{space_id}")
    assert del_res.status_code == 204

    # 6. Verify 404 after deletion
    get_after_del = client.get(f"/api/v1/spaces/{space_id}")
    assert get_after_del.status_code == 404
