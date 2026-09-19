from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.entities import StudySpace, Topic, Question, ReviewState, Chunk
from app.schemas.quiz import (
    FlashcardDueItem,
    FlashcardReviewRequest,
    FlashcardReviewResponse,
)
from app.services.quiz.sm2 import SM2Scheduler
from app.core.exceptions import ResourceNotFoundException

router = APIRouter(tags=["Flashcards"])


@router.get("/flashcards/due", response_model=List[FlashcardDueItem])
def get_due_flashcards(
    space_id: str = Query(..., description="Study Space ID"),
    db: Session = Depends(get_db),
    user_id: str = "default-user",
):
    """Retrieve flashcards due for review today according to SM-2 spaced repetition."""
    space = db.query(StudySpace).filter(StudySpace.id == space_id, StudySpace.user_id == user_id).first()
    if not space:
        raise ResourceNotFoundException(resource="StudySpace", identifier=space_id)

    now = datetime.now(timezone.utc)

    # 1. Cards with next_due_at <= now
    due_reviews = (
        db.query(ReviewState)
        .join(Question, ReviewState.question_id == Question.id)
        .join(Topic, Question.topic_id == Topic.id)
        .filter(
            ReviewState.user_id == user_id,
            Topic.space_id == space_id,
            ReviewState.next_due_at <= now,
            Question.is_flagged == False,
        )
        .all()
    )

    due_question_ids = [r.question_id for r in due_reviews]
    due_cards = db.query(Question).filter(Question.id.in_(due_question_ids)).all() if due_question_ids else []

    # 2. Add unreviewed flashcards to keep learning queue active
    reviewed_ids = [
        r[0] for r in db.query(ReviewState.question_id).filter(ReviewState.user_id == user_id).all()
    ]
    unreviewed = (
        db.query(Question)
        .join(Topic, Question.topic_id == Topic.id)
        .filter(
            Topic.space_id == space_id,
            Question.type == "flashcard",
            Question.id.notin_(reviewed_ids),
            Question.is_flagged == False,
        )
        .limit(10)
        .all()
    )
    if not unreviewed:
        # Fallback to any unreviewed question in the space so learning queue is never empty
        unreviewed = (
            db.query(Question)
            .join(Topic, Question.topic_id == Topic.id)
            .filter(
                Topic.space_id == space_id,
                Question.id.notin_(reviewed_ids),
                Question.is_flagged == False,
            )
            .limit(10)
            .all()
        )
    due_cards.extend(unreviewed)

    results = []
    for card in due_cards:
        passage = ""
        if card.source_chunk_ids:
            chunk = db.query(Chunk).filter(Chunk.id == card.source_chunk_ids[0]).first()
            if chunk:
                passage = f"Notes reference (Page {chunk.page_number or 1}): {chunk.text[:220]}..."

        review_state = db.query(ReviewState).filter(
            ReviewState.user_id == user_id,
            ReviewState.question_id == card.id,
        ).first()

        results.append(
            FlashcardDueItem(
                id=card.id,
                topic_id=card.topic_id,
                prompt=card.prompt,
                answer=card.answer,
                explanation=card.explanation,
                source_passage=passage,
                next_due_at=review_state.next_due_at if review_state else None,
            )
        )

    return results


@router.post("/flashcards/{question_id}/review", response_model=FlashcardReviewResponse)
def review_flashcard(
    question_id: str,
    payload: FlashcardReviewRequest,
    db: Session = Depends(get_db),
    user_id: str = "default-user",
):
    """Submit student self-rating (1: Again, 2: Hard, 3: Good, 4: Easy) and update SM-2 schedule."""
    question = db.query(Question).filter(Question.id == question_id).first()
    if not question:
        raise ResourceNotFoundException(resource="Question", identifier=question_id)

    # Fetch or initialize review state
    state = db.query(ReviewState).filter(
        ReviewState.user_id == user_id,
        ReviewState.question_id == question_id,
    ).first()

    current_ef = state.ease_factor if state else 2.5
    current_interval = state.interval_days if state else 1
    current_reps = state.repetitions if state else 0

    # Calculate SM-2 update
    next_metrics = SM2Scheduler.calculate_next_review(
        rating=payload.rating,
        current_ease_factor=current_ef,
        current_interval_days=current_interval,
        current_repetitions=current_reps,
    )

    if not state:
        state = ReviewState(
            user_id=user_id,
            question_id=question_id,
            ease_factor=next_metrics["ease_factor"],
            interval_days=next_metrics["interval_days"],
            repetitions=next_metrics["repetitions"],
            next_due_at=next_metrics["next_due_at"],
        )
        db.add(state)
    else:
        state.ease_factor = next_metrics["ease_factor"]
        state.interval_days = next_metrics["interval_days"]
        state.repetitions = next_metrics["repetitions"]
        state.next_due_at = next_metrics["next_due_at"]

    db.commit()
    db.refresh(state)

    return FlashcardReviewResponse(
        question_id=question_id,
        ease_factor=state.ease_factor,
        interval_days=state.interval_days,
        repetitions=state.repetitions,
        next_due_at=state.next_due_at,
    )
