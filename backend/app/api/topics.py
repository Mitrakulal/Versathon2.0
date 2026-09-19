from typing import List
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.entities import StudySpace, Topic
from app.schemas.topic import TopicNodeResponse, TopicUpdate
from app.services.topics.manager import TopicManager
from app.core.exceptions import ResourceNotFoundException

router = APIRouter(tags=["Topics"])


@router.get("/spaces/{space_id}/topics", response_model=List[TopicNodeResponse])
def get_topic_hierarchy(
    space_id: str,
    db: Session = Depends(get_db),
    user_id: str = "default-user",
):
    """Retrieve the full hierarchical Topic -> Subtopic tree with chunk counts."""
    space = db.query(StudySpace).filter(StudySpace.id == space_id, StudySpace.user_id == user_id).first()
    if not space:
        raise ResourceNotFoundException(resource="StudySpace", identifier=space_id)

    return TopicManager.get_topic_tree(space_id=space_id, db=db)


@router.patch("/topics/{topic_id}", response_model=TopicNodeResponse)
def update_topic(
    topic_id: str,
    payload: TopicUpdate,
    db: Session = Depends(get_db),
):
    """Edit topic name, summary, or order (Editable Outline)."""
    topic = db.query(Topic).filter(Topic.id == topic_id).first()
    if not topic:
        raise ResourceNotFoundException(resource="Topic", identifier=topic_id)

    if payload.name is not None:
        topic.name = payload.name
    if payload.summary is not None:
        topic.summary = payload.summary
    if payload.order_index is not None:
        topic.order_index = payload.order_index

    db.commit()
    db.refresh(topic)

    # Return tree or node
    tree = TopicManager.get_topic_tree(space_id=topic.space_id, db=db)
    # Find this specific node from tree or return standard node
    return TopicNodeResponse(
        id=topic.id,
        space_id=topic.space_id,
        parent_id=topic.parent_id,
        name=topic.name,
        summary=topic.summary,
        order_index=topic.order_index,
        chunk_count=0,
        question_count=0,
        subtopics=[],
    )


@router.delete("/topics/{topic_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_topic(
    topic_id: str,
    db: Session = Depends(get_db),
):
    """Delete a topic and cascade delete its subtopics."""
    topic = db.query(Topic).filter(Topic.id == topic_id).first()
    if not topic:
        raise ResourceNotFoundException(resource="Topic", identifier=topic_id)

    db.delete(topic)
    db.commit()
    return None
