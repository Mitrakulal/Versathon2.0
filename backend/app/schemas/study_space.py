from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, List


class StudySpaceBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = None


class StudySpaceCreate(StudySpaceBase):
    user_id: str = "default-user"


class StudySpaceUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None


class StudySpaceResponse(StudySpaceBase):
    id: str
    user_id: str
    created_at: datetime

    class Config:
        from_attributes = True
