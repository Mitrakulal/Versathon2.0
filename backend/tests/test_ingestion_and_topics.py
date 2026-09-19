import os
import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.db.init_db import init_db

init_db()
client = TestClient(app)


def test_pasted_notes_and_topic_extraction():
    # 1. Create a space
    space_res = client.post("/api/v1/spaces", json={"title": "Computer Architecture", "description": "Cache Memory"})
    assert space_res.status_code == 201
    space_id = space_res.json()["id"]

    # 2. Paste notes
    notes_text = """
    Direct-Mapped Cache vs Set-Associative Cache:
    In a direct-mapped cache, each memory block is mapped to exactly one cache line.
    The formula is: (Block address) modulo (Number of cache blocks).
    
    Set-Associative Cache:
    In an N-way set-associative cache, each memory block can be placed in any of the N lines in a specific set.
    This drastically reduces conflict misses compared to direct-mapped caches.
    
    Fully Associative Cache:
    A memory block can be placed in any location in the cache. Requires associative memory search.
    """
    paste_res = client.post(
        f"/api/v1/spaces/{space_id}/documents/paste",
        json={"filename": "Cache_Notes.txt", "content": notes_text}
    )
    assert paste_res.status_code == 202
    data = paste_res.json()
    assert data["status"] == "completed"
    assert data["chunk_count"] >= 1

    # 3. Retrieve topic hierarchy
    topics_res = client.get(f"/api/v1/spaces/{space_id}/topics")
    assert topics_res.status_code == 200
    topic_tree = topics_res.json()
    assert len(topic_tree) >= 1
    root_topic = topic_tree[0]
    assert "name" in root_topic
    assert "subtopics" in root_topic


def test_pdf_upload_and_topics():
    pdf_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "demo_os_notes.pdf")
    if not os.path.exists(pdf_path):
        pytest.skip("demo_os_notes.pdf not found in workspace root")

    # 1. Create a space
    space_res = client.post("/api/v1/spaces", json={"title": "OS CS301", "description": "10-Page Lecture Notes"})
    assert space_res.status_code == 201
    space_id = space_res.json()["id"]

    # 2. Upload PDF
    with open(pdf_path, "rb") as f:
        pdf_bytes = f.read()
    
    upload_res = client.post(
        f"/api/v1/spaces/{space_id}/documents/upload",
        files={"file": ("demo_os_notes.pdf", pdf_bytes, "application/pdf")}
    )
    assert upload_res.status_code == 202
    doc_data = upload_res.json()
    assert doc_data["status"] == "completed"
    assert doc_data["chunk_count"] >= 5

    # 3. Retrieve topic hierarchy tree
    topics_res = client.get(f"/api/v1/spaces/{space_id}/topics")
    assert topics_res.status_code == 200
    topic_tree = topics_res.json()
    assert len(topic_tree) >= 1

    # 4. Test topic editing
    topic_to_edit = topic_tree[0]
    topic_id = topic_to_edit["id"]
    patch_res = client.patch(f"/api/v1/topics/{topic_id}", json={"name": "Modified Topic Name"})
    assert patch_res.status_code == 200
    assert patch_res.json()["name"] == "Modified Topic Name"

    # 5. Test topic deletion
    del_res = client.delete(f"/api/v1/topics/{topic_id}")
    assert del_res.status_code == 204
