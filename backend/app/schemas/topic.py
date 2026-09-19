from typing import Optional, List
from pydantic import BaseModel, ConfigDict, Field


class TopicBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=200)
    summary: Optional[str] = None
    order_index: int = 0


class TopicCreate(TopicBase):
    space_id: str
    parent_id: Optional[str] = None


class TopicUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=200)
    summary: Optional[str] = None
    order_index: Optional[int] = None


class TopicNodeResponse(TopicBase):
    id: str
    space_id: str
    parent_id: Optional[str] = None
    chunk_count: int = 0
    question_count: int = 0
    subtopics: List["TopicNodeResponse"] = []

    model_config = ConfigDict(from_attributes=True)


TopicNodeResponse.model_rebuild()
