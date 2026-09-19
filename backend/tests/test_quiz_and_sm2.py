import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.db.init_db import init_db

init_db()
client = TestClient(app)


def test_quiz_lifecycle_and_sm2_reviews():
    # 1. Create a study space
    space_res = client.post("/api/v1/spaces", json={"title": "Computer Networks", "description": "OSI & TCP/IP"})
    assert space_res.status_code == 201
    space_id = space_res.json()["id"]

    # 2. Ingest notes with definitions
    notes = """
    The OSI Model has seven layers: Physical, Data Link, Network, Transport, Session, Presentation, Application.
    The Transport Layer provides transparent transfer of data between end users.
    Transmission Control Protocol (TCP) is a connection-oriented and reliable transport protocol.
    User Datagram Protocol (UDP) is a connectionless and lightweight transport protocol.
    """
    paste_res = client.post(
        f"/api/v1/spaces/{space_id}/documents/paste",
        json={"filename": "Networks_Intro.txt", "content": notes},
    )
    assert paste_res.status_code == 202

    # 3. Generate questions for the space
    gen_res = client.post(
        f"/api/v1/spaces/{space_id}/questions/generate",
        json={"count": 5},
    )
    assert gen_res.status_code == 202

    # 4. Start an interactive quiz
    start_res = client.post(
        "/api/v1/quiz/start",
        json={"space_id": space_id, "mode": "mixed", "question_count": 4},
    )
    assert start_res.status_code == 201
    session_data = start_res.json()
    session_id = session_data["session_id"]
    questions = session_data["questions"]
    assert len(questions) >= 1

    # Verify answers are shielded in quiz start
    first_q = questions[0]
    assert "answer" not in first_q
    assert "explanation" not in first_q
    q_id = first_q["id"]

    # 5. Submit an answer
    # First get actual question to test exact answer
    q_details = client.get(f"/api/v1/spaces/{space_id}/questions").json()
    matched_q = next(q for q in q_details if q["id"] == q_id)
    correct_ans = matched_q["answer"]

    # Submit correct answer
    ans_res = client.post(
        f"/api/v1/quiz/{session_id}/answer",
        json={"question_id": q_id, "response": correct_ans, "time_taken_seconds": 12},
    )
    assert ans_res.status_code == 200
    eval_data = ans_res.json()
    assert eval_data["correctness"] in ["correct", "partially_correct"]
    assert eval_data["score"] > 0.0
    assert "explanation" in eval_data

    # Submit wrong answer if there is a second question
    if len(questions) > 1:
        second_q_id = questions[1]["id"]
        wrong_res = client.post(
            f"/api/v1/quiz/{session_id}/answer",
            json={"question_id": second_q_id, "response": "completely_wrong_answer_xyz", "time_taken_seconds": 8},
        )
        assert wrong_res.status_code == 200
        assert wrong_res.json()["correctness"] == "incorrect"
        assert wrong_res.json()["score"] == 0.0

    # 6. Complete the quiz session
    comp_res = client.post(f"/api/v1/quiz/{session_id}/complete")
    assert comp_res.status_code == 200
    comp_data = comp_res.json()
    assert comp_data["session_id"] == session_id
    assert "score" in comp_data
    assert "topic_breakdown" in comp_data

    # 7. Get full attempt results review
    results_res = client.get(f"/api/v1/quiz/{session_id}/results")
    assert results_res.status_code == 200
    assert len(results_res.json()["attempts"]) >= 1

    # 8. Test Flashcard SM-2 Spaced Repetition
    due_res = client.get(f"/api/v1/flashcards/due?space_id={space_id}")
    assert due_res.status_code == 200
    cards = due_res.json()
    assert len(cards) >= 1
    card_id = cards[0]["id"]

    # Review 1: Rating = 3 (Good) -> rep = 1, interval = 1
    rev1 = client.post(f"/api/v1/flashcards/{card_id}/review", json={"rating": 3})
    assert rev1.status_code == 200
    data1 = rev1.json()
    assert data1["repetitions"] == 1
    assert data1["interval_days"] == 1

    # Review 2: Rating = 3 (Good) -> rep = 2, interval = 6
    rev2 = client.post(f"/api/v1/flashcards/{card_id}/review", json={"rating": 3})
    assert rev2.status_code == 200
    data2 = rev2.json()
    assert data2["repetitions"] == 2
    assert data2["interval_days"] == 6

    # Review 3: Rating = 1 (Again) -> reset reps = 0, interval = 1
    rev3 = client.post(f"/api/v1/flashcards/{card_id}/review", json={"rating": 1})
    assert rev3.status_code == 200
    data3 = rev3.json()
    assert data3["repetitions"] == 0
    assert data3["interval_days"] == 1
