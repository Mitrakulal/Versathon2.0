from datetime import datetime, timezone
from typing import List, Dict, Any
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.db.session import get_db
from app.models.entities import StudySpace, Topic, Question, QuizSession, Attempt, Chunk
from app.schemas.quiz import (
    QuizStartRequest,
    QuizStartResponse,
    QuizQuestionItem,
    AnswerSubmitRequest,
    AnswerEvaluationResponse,
    QuizCompleteResponse,
    TopicScoreBreakdown,
)
from app.services.quiz.adaptive import AdaptiveSampler
from app.services.quiz.evaluator import AnswerEvaluator
from app.core.exceptions import ResourceNotFoundException, ProcessingFailedException

router = APIRouter(tags=["Quizzes"])


@router.post("/quiz/start", response_model=QuizStartResponse, status_code=status.HTTP_201_CREATED)
def start_quiz(
    payload: QuizStartRequest,
    db: Session = Depends(get_db),
    user_id: str = "default-user",
):
    """Start an active recall quiz session (mode: topic_quiz, mixed, adaptive, daily_revision)."""
    space = db.query(StudySpace).filter(StudySpace.id == payload.space_id, StudySpace.user_id == user_id).first()
    if not space:
        raise ResourceNotFoundException(resource="StudySpace", identifier=payload.space_id)

    sampled_questions = AdaptiveSampler.sample_questions(
        space_id=payload.space_id,
        mode=payload.mode,
        topic_ids=payload.topic_ids,
        count=payload.question_count,
        user_id=user_id,
        db=db,
    )

    if not sampled_questions:
        raise ProcessingFailedException(
            process_name="Quiz Creation",
            reason="No active questions found in this study space. Generate questions first.",
        )

    session = QuizSession(
        user_id=user_id,
        space_id=payload.space_id,
        mode=payload.mode,
        total_questions=len(sampled_questions),
        started_at=datetime.now(timezone.utc),
    )
    db.add(session)
    db.commit()
    db.refresh(session)

    # Convert to schema with answers/explanations strictly hidden
    question_items = [
        QuizQuestionItem(
            id=q.id,
            topic_id=q.topic_id,
            type=q.type,
            prompt=q.prompt,
            options=q.options,
            difficulty=q.difficulty,
        )
        for q in sampled_questions
    ]

    return QuizStartResponse(
        session_id=session.id,
        space_id=session.space_id,
        mode=session.mode,
        total_questions=session.total_questions,
        started_at=session.started_at,
        questions=question_items,
    )


@router.post("/quiz/{session_id}/answer", response_model=AnswerEvaluationResponse)
def submit_quiz_answer(
    session_id: str,
    payload: AnswerSubmitRequest,
    db: Session = Depends(get_db),
    user_id: str = "default-user",
):
    """Submit an answer to a question, evaluate it, and record the attempt."""
    session = db.query(QuizSession).filter(QuizSession.id == session_id, QuizSession.user_id == user_id).first()
    if not session:
        raise ResourceNotFoundException(resource="QuizSession", identifier=session_id)

    question = db.query(Question).filter(Question.id == payload.question_id).first()
    if not question:
        raise ResourceNotFoundException(resource="Question", identifier=payload.question_id)

    # Get source snippet if available
    source_passage = ""
    if question.source_chunk_ids:
        first_chunk_id = question.source_chunk_ids[0]
        chunk = db.query(Chunk).filter(Chunk.id == first_chunk_id).first()
        if chunk:
            source_passage = f"Notes excerpt (Page {chunk.page_number or 1}): {chunk.text[:220]}..."

    # Evaluate answer
    eval_result = AnswerEvaluator.evaluate(
        question=question,
        student_response=payload.response,
        source_passage=source_passage,
    )

    # Persist Attempt
    attempt = Attempt(
        session_id=session.id,
        question_id=question.id,
        response=payload.response,
        correctness=eval_result["correctness"],
        score=eval_result["score"],
        time_taken_seconds=payload.time_taken_seconds,
        feedback=eval_result["feedback"],
    )
    db.add(attempt)
    db.commit()

    return AnswerEvaluationResponse(
        question_id=question.id,
        correctness=eval_result["correctness"],
        score=eval_result["score"],
        correct_answer=eval_result["correct_answer"],
        explanation=eval_result["explanation"],
        source_passage=eval_result["source_passage"],
        feedback=eval_result["feedback"],
    )


@router.post("/quiz/{session_id}/complete", response_model=QuizCompleteResponse)
def complete_quiz(
    session_id: str,
    db: Session = Depends(get_db),
    user_id: str = "default-user",
):
    """Finalize a quiz session, calculate overall score, and aggregate topic breakdown."""
    session = db.query(QuizSession).filter(QuizSession.id == session_id, QuizSession.user_id == user_id).first()
    if not session:
        raise ResourceNotFoundException(resource="QuizSession", identifier=session_id)

    attempts = db.query(Attempt).filter(Attempt.session_id == session.id).all()
    total_score = sum(a.score for a in attempts)
    total_time = sum(a.time_taken_seconds for a in attempts)
    correct_count = sum(1 for a in attempts if a.correctness == "correct")

    # Percentage score
    percentage_score = (total_score / len(attempts) * 100.0) if attempts else 0.0
    session.score = round(percentage_score, 1)
    session.completed_at = datetime.now(timezone.utc)
    db.commit()

    # Calculate per-topic breakdown
    topic_scores: Dict[str, Dict[str, Any]] = {}
    for a in attempts:
        q = db.query(Question).filter(Question.id == a.question_id).first()
        if not q:
            continue
        topic = db.query(Topic).filter(Topic.id == q.topic_id).first()
        t_name = topic.name if topic else "General"
        t_id = q.topic_id

        if t_id not in topic_scores:
            topic_scores[t_id] = {"name": t_name, "points": 0.0, "count": 0}
        topic_scores[t_id]["points"] += a.score
        topic_scores[t_id]["count"] += 1

    breakdown = []
    for t_id, data in topic_scores.items():
        t_pct = (data["points"] / data["count"]) * 100.0 if data["count"] > 0 else 0.0
        breakdown.append(
            TopicScoreBreakdown(
                topic_id=t_id,
                topic_name=data["name"],
                score=round(t_pct, 1),
                attempted=data["count"],
            )
        )

    return QuizCompleteResponse(
        session_id=session.id,
        score=session.score,
        total_questions=len(attempts),
        correct_count=correct_count,
        time_taken_seconds=total_time,
        topic_breakdown=breakdown,
    )


@router.get("/quiz/{session_id}/results")
def get_quiz_results(
    session_id: str,
    db: Session = Depends(get_db),
    user_id: str = "default-user",
):
    """Retrieve full attempt-by-attempt review screen with questions and citations."""
    session = db.query(QuizSession).filter(QuizSession.id == session_id, QuizSession.user_id == user_id).first()
    if not session:
        raise ResourceNotFoundException(resource="QuizSession", identifier=session_id)

    attempts = db.query(Attempt).filter(Attempt.session_id == session.id).all()
    results = []

    for a in attempts:
        q = db.query(Question).filter(Question.id == a.question_id).first()
        if not q:
            continue
        
        # Source snippet
        passage = ""
        if q.source_chunk_ids:
            chunk = db.query(Chunk).filter(Chunk.id == q.source_chunk_ids[0]).first()
            if chunk:
                passage = f"Notes excerpt (Page {chunk.page_number or 1}): {chunk.text[:220]}..."

        results.append({
            "question_id": q.id,
            "prompt": q.prompt,
            "type": q.type,
            "student_response": a.response,
            "correct_answer": q.answer,
            "correctness": a.correctness,
            "score": a.score,
            "time_taken_seconds": a.time_taken_seconds,
            "explanation": q.explanation,
            "source_passage": passage,
            "feedback": a.feedback,
        })

    return {
        "session_id": session.id,
        "score": session.score,
        "completed_at": session.completed_at,
        "attempts": results,
    }
