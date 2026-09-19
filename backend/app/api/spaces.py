from typing import List
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.db.session import get_db
from app.models.entities import StudySpace, Document, Topic
from app.schemas.study_space import StudySpaceCreate, StudySpaceUpdate, StudySpaceResponse
from app.core.exceptions import ResourceNotFoundException

router = APIRouter(prefix="/spaces", tags=["Study Spaces"])


@router.get("", response_model=List[StudySpaceResponse])
def list_study_spaces(
    db: Session = Depends(get_db),
    user_id: str = "default-user",
):
    """Retrieve all study spaces for the current user with document & topic counts."""
    spaces = db.query(StudySpace).filter(StudySpace.user_id == user_id).order_by(StudySpace.created_at.desc()).all()

    result = []
    for space in spaces:
        doc_count = db.query(func.count(Document.id)).filter(Document.space_id == space.id).scalar() or 0
        top_count = db.query(func.count(Topic.id)).filter(Topic.space_id == space.id).scalar() or 0
        
        result.append(
            StudySpaceResponse(
                id=space.id,
                user_id=space.user_id,
                title=space.title,
                description=space.description,
                created_at=space.created_at,
                document_count=doc_count,
                topic_count=top_count,
            )
        )
    return result


@router.post("", response_model=StudySpaceResponse, status_code=status.HTTP_201_CREATED)
def create_study_space(
    payload: StudySpaceCreate,
    db: Session = Depends(get_db),
    user_id: str = "default-user",
):
    """Create a new study space."""
    new_space = StudySpace(
        user_id=user_id,
        title=payload.title,
        description=payload.description,
    )
    db.add(new_space)
    db.commit()
    db.refresh(new_space)

    return StudySpaceResponse(
        id=new_space.id,
        user_id=new_space.user_id,
        title=new_space.title,
        description=new_space.description,
        created_at=new_space.created_at,
        document_count=0,
        topic_count=0,
    )


@router.get("/{space_id}", response_model=StudySpaceResponse)
def get_study_space(
    space_id: str,
    db: Session = Depends(get_db),
    user_id: str = "default-user",
):
    """Get details of a specific study space."""
    space = db.query(StudySpace).filter(
        StudySpace.id == space_id,
        StudySpace.user_id == user_id,
    ).first()

    if not space:
        raise ResourceNotFoundException(resource="StudySpace", identifier=space_id)

    doc_count = db.query(func.count(Document.id)).filter(Document.space_id == space.id).scalar() or 0
    top_count = db.query(func.count(Topic.id)).filter(Topic.space_id == space.id).scalar() or 0

    return StudySpaceResponse(
        id=space.id,
        user_id=space.user_id,
        title=space.title,
        description=space.description,
        created_at=space.created_at,
        document_count=doc_count,
        topic_count=top_count,
    )


@router.patch("/{space_id}", response_model=StudySpaceResponse)
def update_study_space(
    space_id: str,
    payload: StudySpaceUpdate,
    db: Session = Depends(get_db),
    user_id: str = "default-user",
):
    """Update title or description of a study space."""
    space = db.query(StudySpace).filter(
        StudySpace.id == space_id,
        StudySpace.user_id == user_id,
    ).first()

    if not space:
        raise ResourceNotFoundException(resource="StudySpace", identifier=space_id)

    if payload.title is not None:
        space.title = payload.title
    if payload.description is not None:
        space.description = payload.description

    db.commit()
    db.refresh(space)

    doc_count = db.query(func.count(Document.id)).filter(Document.space_id == space.id).scalar() or 0
    top_count = db.query(func.count(Topic.id)).filter(Topic.space_id == space.id).scalar() or 0

    return StudySpaceResponse(
        id=space.id,
        user_id=space.user_id,
        title=space.title,
        description=space.description,
        created_at=space.created_at,
        document_count=doc_count,
        topic_count=top_count,
    )


@router.delete("/{space_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_study_space(
    space_id: str,
    db: Session = Depends(get_db),
    user_id: str = "default-user",
):
    """Delete a study space and cascade all associated data."""
    space = db.query(StudySpace).filter(
        StudySpace.id == space_id,
        StudySpace.user_id == user_id,
    ).first()

    if not space:
        raise ResourceNotFoundException(resource="StudySpace", identifier=space_id)

    db.delete(space)
    db.commit()
    return None
