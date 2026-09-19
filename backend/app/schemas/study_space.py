from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict, Field


class StudySpaceBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=200, description="Title of the study space")
    description: Optional[str] = Field(None, description="Optional description of the notes/subject")


class StudySpaceCreate(StudySpaceBase):
    pass


class StudySpaceUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = None


class StudySpaceResponse(StudySpaceBase):
    id: str
    user_id: str
    created_at: datetime
    document_count: int = 0
    topic_count: int = 0

    model_config = ConfigDict(from_attributes=True)
