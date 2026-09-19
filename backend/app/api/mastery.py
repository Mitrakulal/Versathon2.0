from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.entities import StudySpace
from app.schemas.mastery import DashboardResponse
from app.services.mastery.calculator import compute_space_dashboard
from app.core.exceptions import ResourceNotFoundException

router = APIRouter(tags=["Mastery & Analytics"])


@router.get("/spaces/{space_id}/dashboard", response_model=DashboardResponse)
def get_space_dashboard(
    space_id: str,
    db: Session = Depends(get_db),
    user_id: str = "default-user",
):
    """
    Retrieve comprehensive learning analytics, mastery breakdown,
    study streak, and prioritized revision queue for a study space.
    """
    space = db.query(StudySpace).filter(StudySpace.id == space_id).first()
    if not space:
        raise ResourceNotFoundException(resource="StudySpace", identifier=space_id)

    dashboard = compute_space_dashboard(db=db, space_id=space_id, user_id=user_id)
    return dashboard
