from typing import List, Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.entities import StudySpace, Topic, Question
from app.schemas.question import (
    QuestionResponse,
    QuestionGenerateRequest,
    QuestionGenerateResponse,
    QuestionFlagRequest,
    QuestionFlagResponse,
)
from app.services.generation.generator import QuestionGenerator
from app.core.exceptions import ResourceNotFoundException

router = APIRouter(tags=["Questions"])


@router.get("/spaces/{space_id}/questions", response_model=List[QuestionResponse])
def list_questions(
    space_id: str,
    topic_id: Optional[str] = Query(None, description="Filter by topic or subtopic ID"),
    type: Optional[str] = Query(None, description="Filter by question type: flashcard, mcq, fill_blank, short_answer"),
    difficulty: Optional[str] = Query(None, description="Filter by difficulty: easy, medium, hard"),
    include_flagged: bool = Query(False, description="Whether to include flagged questions"),
    db: Session = Depends(get_db),
    user_id: str = "default-user",
):
    """List questions for a study space with optional filters."""
    space = db.query(StudySpace).filter(StudySpace.id == space_id, StudySpace.user_id == user_id).first()
    if not space:
        raise ResourceNotFoundException(resource="StudySpace", identifier=space_id)

    query = db.query(Question).join(Topic, Question.topic_id == Topic.id).filter(Topic.space_id == space_id)

    if topic_id:
        # Check if topic has subtopics
        subtopics = db.query(Topic.id).filter(Topic.parent_id == topic_id).all()
        target_ids = [topic_id] + [s[0] for s in subtopics]
        query = query.filter(Question.topic_id.in_(target_ids))

    if type:
        query = query.filter(Question.type == type.lower())

    if difficulty:
        query = query.filter(Question.difficulty == difficulty.lower())

    if not include_flagged:
        query = query.filter(Question.is_flagged == False)

    questions = query.all()
    return questions


@router.post("/spaces/{space_id}/questions/generate", response_model=QuestionGenerateResponse, status_code=status.HTTP_202_ACCEPTED)
def generate_questions(
    space_id: str,
    payload: QuestionGenerateRequest,
    db: Session = Depends(get_db),
    user_id: str = "default-user",
):
    """Trigger grounded question generation for a specific topic or all topics in a space."""
    space = db.query(StudySpace).filter(StudySpace.id == space_id, StudySpace.user_id == user_id).first()
    if not space:
        raise ResourceNotFoundException(resource="StudySpace", identifier=space_id)

    total_generated = 0

    if payload.topic_id:
        topic = db.query(Topic).filter(Topic.id == payload.topic_id, Topic.space_id == space_id).first()
        if not topic:
            raise ResourceNotFoundException(resource="Topic", identifier=payload.topic_id)
        
        created = QuestionGenerator.generate_for_topic(
            topic_id=topic.id,
            db=db,
            count=payload.count,
        )
        total_generated = len(created)
    else:
        # Generate for subtopics in space
        subtopics = db.query(Topic).filter(Topic.space_id == space_id, Topic.parent_id.isnot(None)).all()
        if not subtopics:
            # Fallback to root topics if no subtopics
            subtopics = db.query(Topic).filter(Topic.space_id == space_id).all()

        for st in subtopics:
            created = QuestionGenerator.generate_for_topic(
                topic_id=st.id,
                db=db,
                count=max(2, payload.count // max(1, len(subtopics))),
            )
            total_generated += len(created)

    return QuestionGenerateResponse(
        message=f"Successfully generated {total_generated} questions.",
        space_id=space_id,
        topic_id=payload.topic_id,
        generated_count=total_generated,
    )


@router.post("/questions/{question_id}/flag", response_model=QuestionFlagResponse)
def flag_question(
    question_id: str,
    payload: QuestionFlagRequest,
    db: Session = Depends(get_db),
):
    """Flag a question as inaccurate, vague, or unsupported by notes."""
    question = db.query(Question).filter(Question.id == question_id).first()
    if not question:
        raise ResourceNotFoundException(resource="Question", identifier=question_id)

    question.is_flagged = True
    db.commit()

    return QuestionFlagResponse(
        id=question.id,
        is_flagged=True,
        message=f"Question flagged successfully. Reason: {payload.reason}",
    )
