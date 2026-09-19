import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.db.init_db import init_db

init_db()
client = TestClient(app)


def test_question_generation_and_management():
    # 1. Create a study space
    space_res = client.post("/api/v1/spaces", json={"title": "Data Structures", "description": "Trees and Graphs"})
    assert space_res.status_code == 201
    space_id = space_res.json()["id"]

    # 2. Paste notes
    notes_content = """
    A Binary Search Tree (BST) is a node-based binary tree data structure.
    For every node, all elements in the left subtree are smaller than the node value.
    All elements in the right subtree are greater than the node value.
    
    Time Complexity of BST:
    The search operation takes O(h) time, where h is the height of the tree.
    In a balanced BST like an AVL tree or Red-Black tree, the height is O(log n).
    In the worst case (skewed tree), the height becomes O(n).
    
    AVL Tree:
    An AVL tree is a self-balancing binary search tree.
    The balance factor of any node is calculated as: Height(Left Subtree) - Height(Right Subtree).
    The balance factor must strictly be -1, 0, or +1.
    """
    paste_res = client.post(
        f"/api/v1/spaces/{space_id}/documents/paste",
        json={"filename": "BST_Notes.txt", "content": notes_content},
    )
    assert paste_res.status_code == 202

    # 3. Fetch topics
    topics_res = client.get(f"/api/v1/spaces/{space_id}/topics")
    assert topics_res.status_code == 200
    topic_tree = topics_res.json()
    assert len(topic_tree) > 0
    target_topic_id = topic_tree[0]["id"]

    # 4. Trigger question generation on-demand
    gen_res = client.post(
        f"/api/v1/spaces/{space_id}/questions/generate",
        json={"topic_id": target_topic_id, "count": 4},
    )
    assert gen_res.status_code == 202
    gen_data = gen_res.json()
    assert gen_data["generated_count"] >= 1

    # 5. List all questions for the space
    list_res = client.get(f"/api/v1/spaces/{space_id}/questions")
    assert list_res.status_code == 200
    questions = list_res.json()
    assert len(questions) >= 1

    first_q = questions[0]
    assert "prompt" in first_q
    assert "answer" in first_q
    assert "difficulty" in first_q
    assert "source_chunk_ids" in first_q
    assert first_q["is_flagged"] is False

    # 6. Check MCQ structure if present
    mcqs = [q for q in questions if q["type"] == "mcq"]
    for mcq in mcqs:
        assert mcq["options"] is not None
        assert len(mcq["options"]) == 4
        assert mcq["answer"] in mcq["options"]

    # 7. Test Question Flagging
    question_to_flag = questions[0]
    flag_res = client.post(
        f"/api/v1/questions/{question_to_flag['id']}/flag",
        json={"reason": "Option contradicts AVL balance factor notes"},
    )
    assert flag_res.status_code == 200
    assert flag_res.json()["is_flagged"] is True

    # 8. Verify flagged question is excluded by default
    active_res = client.get(f"/api/v1/spaces/{space_id}/questions?include_flagged=false")
    active_ids = [q["id"] for q in active_res.json()]
    assert question_to_flag["id"] not in active_ids
