import pytest
from datetime import datetime, timezone, timedelta
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.main import app
from app.db.session import get_db
from app.models.entities import StudySpace, Topic, Question, Chunk, QuizSession, Attempt, ReviewState


@pytest.fixture
def client():
    return TestClient(app)


def test_empty_space_dashboard(client):
    # 1. Create empty study space
    res = client.post("/api/v1/spaces", json={"title": "Empty Space for Analytics"})
    assert res.status_code == 201
    space_id = res.json()["id"]

    # 2. Get dashboard
    dash_res = client.get(f"/api/v1/spaces/{space_id}/dashboard")
    assert dash_res.status_code == 200
    data = dash_res.json()

    assert data["space_id"] == space_id
    assert data["overall_mastery"] == 0.0
    assert data["total_attempts"] == 0
    assert data["topics"] == []
    assert data["revise_next"] == []
    assert data["due_today_count"] == 0


def test_mastery_calculation_and_recommendations(client):
    # 1. Create space
    res = client.post("/api/v1/spaces", json={"title": "OS Mastery Analytics"})
    assert res.status_code == 201
    space_id = res.json()["id"]

    # 2. Ingest notes with two distinct topics
    notes_text = """
    # Operating Systems Study Notes
    
    ## Unit 1: Process Synchronization
    Semaphores and mutex locks provide mutual exclusion for critical sections.
    A race condition occurs when concurrent threads access shared data.
    
    ## Unit 2: Memory Paging
    Virtual memory maps logical pages to physical frames via page tables.
    Page fault occurs when an accessed page is not loaded into main memory.
    """
    ingest_res = client.post(
        f"/api/v1/spaces/{space_id}/documents/paste",
        json={"title": "OS Unit 1 and 2 Notes", "content": notes_text},
    )
    assert ingest_res.status_code == 202

    # 3. Generate questions
    gen_res = client.post(
        f"/api/v1/spaces/{space_id}/questions/generate",
        json={"count": 4, "difficulty": "medium", "types": ["mcq", "short_answer"]},
    )
    assert gen_res.status_code == 202

    # 4. Fetch questions to inspect topics
    q_res = client.get(f"/api/v1/spaces/{space_id}/questions")
    assert q_res.status_code == 200
    questions = q_res.json()
    assert len(questions) >= 2

    # Group questions by topic_id
    topic_ids = list(set(q["topic_id"] for q in questions if q.get("topic_id")))
    assert len(topic_ids) >= 1

    target_topic_1 = topic_ids[0]

    # 5. Start a quiz session
    quiz_res = client.post(
        "/api/v1/quiz/start",
        json={"space_id": space_id, "mode": "mixed", "question_count": len(questions)},
    )
    assert quiz_res.status_code == 201
    quiz_data = quiz_res.json()
    session_id = quiz_data["session_id"]
    quiz_questions = quiz_data["questions"]

    # Answer questions for target_topic_1 correctly
    for q in quiz_questions:
        ans_payload = {
            "question_id": q["id"],
            "response": "Semaphores and mutex locks" if q["topic_id"] == target_topic_1 else "Incorrect answer wrong",
            "time_taken_seconds": 12,
        }
        ans_res = client.post(f"/api/v1/quiz/{session_id}/answer", json=ans_payload)
        assert ans_res.status_code == 200

    # 6. Complete quiz
    comp_res = client.post(f"/api/v1/quiz/{session_id}/complete")
    assert comp_res.status_code == 200

    # 7. Query Dashboard
    dash_res = client.get(f"/api/v1/spaces/{space_id}/dashboard")
    assert dash_res.status_code == 200
    dash = dash_res.json()

    assert dash["space_id"] == space_id
    assert dash["total_attempts"] == len(quiz_questions)
    assert dash["study_streak_days"] >= 1
    assert 0.0 <= dash["overall_mastery"] <= 1.0
    assert len(dash["topics"]) >= 1

    # Check that topics have mastery and valid label
    for t in dash["topics"]:
        assert "topic_id" in t
        assert "topic_name" in t
        assert "mastery" in t
        assert t["label"] in ["weak", "developing", "strong"]

    # Check revise_next recommendations
    assert isinstance(dash["revise_next"], list)
    if dash["revise_next"]:
        rec = dash["revise_next"][0]
        assert "topic_id" in rec
        assert "topic_name" in rec
        assert "reason" in rec
        assert "recommended_action" in rec
        assert len(rec["reason"]) > 0
        assert len(rec["recommended_action"]) > 0


def test_dashboard_due_flashcard_count(client):
    # 1. Create space
    res = client.post("/api/v1/spaces", json={"title": "Flashcards Analytics Space"})
    assert res.status_code == 201
    space_id = res.json()["id"]

    # 2. Add document with explicit definition
    client.post(
        f"/api/v1/spaces/{space_id}/documents/paste",
        json={"title": "Review Notes", "content": "Cache memory is high-speed buffer memory between CPU and RAM."},
    )

    # 3. Generate questions
    gen_res = client.post(
        f"/api/v1/spaces/{space_id}/questions/generate",
        json={"count": 2, "types": ["flashcard"]},
    )
    assert gen_res.status_code == 202

    # 4. Fetch questions and schedule one with ReviewState due now
    q_res = client.get(f"/api/v1/spaces/{space_id}/questions")
    questions = q_res.json()
    assert len(questions) >= 1
    q_id = questions[0]["id"]

    # Explicitly add an overdue ReviewState
    from app.db.session import SessionLocal
    db = SessionLocal()
    try:
        overdue_state = ReviewState(
            user_id="default-user",
            question_id=q_id,
            ease_factor=2.5,
            interval_days=1,
            repetitions=1,
            next_due_at=datetime.now(timezone.utc) - timedelta(hours=2),
        )
        db.add(overdue_state)
        db.commit()
    finally:
        db.close()

    # 5. Query Dashboard
    dash_res = client.get(f"/api/v1/spaces/{space_id}/dashboard")
    assert dash_res.status_code == 200
    dash = dash_res.json()
    assert dash["due_today_count"] >= 1
