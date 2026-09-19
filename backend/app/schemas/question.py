from typing import List, Optional, Literal
from pydantic import BaseModel, ConfigDict, Field


QuestionType = Literal["flashcard", "mcq", "fill_blank", "short_answer", "true_false"]
DifficultyLevel = Literal["easy", "medium", "hard"]
CognitiveLevel = Literal["recall", "understanding", "application"]


class QuestionBase(BaseModel):
    topic_id: str
    type: QuestionType
    prompt: str = Field(..., min_length=3)
    options: Optional[List[str]] = None
    answer: str
    explanation: Optional[str] = None
    difficulty: DifficultyLevel = "medium"
    cognitive_level: CognitiveLevel = "recall"
    source_chunk_ids: List[str] = []
    source_passage: Optional[str] = None


class QuestionCreate(QuestionBase):
    pass


class QuestionResponse(QuestionBase):
    id: str
    status: str = "verified"
    is_flagged: bool = False

    model_config = ConfigDict(from_attributes=True)


class QuestionGenerateRequest(BaseModel):
    topic_id: Optional[str] = Field(None, description="Generate for a specific subtopic, or omit for all topics in space")
    count: int = Field(default=5, ge=1, le=25, description="Number of questions to generate")
    question_types: Optional[List[QuestionType]] = None


class QuestionGenerateResponse(BaseModel):
    message: str
    space_id: str
    topic_id: Optional[str] = None
    generated_count: int


class QuestionFlagRequest(BaseModel):
    reason: str = Field(..., min_length=3, max_length=500, description="Why this question is incorrect or unclear")


class QuestionFlagResponse(BaseModel):
    id: str
    is_flagged: bool
    message: str
