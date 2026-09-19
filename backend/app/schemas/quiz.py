from datetime import datetime
from typing import List, Optional, Literal
from pydantic import BaseModel, ConfigDict, Field


QuizMode = Literal["topic_quiz", "mixed", "adaptive", "daily_revision", "flashcards"]
Correctness = Literal["correct", "partially_correct", "incorrect"]


class QuizStartRequest(BaseModel):
    space_id: str
    mode: QuizMode = "adaptive"
    topic_ids: Optional[List[str]] = Field(None, description="Filter to specific topics if mode=topic_quiz")
    question_count: int = Field(default=10, ge=1, le=50)


class QuizQuestionItem(BaseModel):
    id: str
    topic_id: str
    type: str
    prompt: str
    options: Optional[List[str]] = None
    difficulty: str

    model_config = ConfigDict(from_attributes=True)


class QuizStartResponse(BaseModel):
    session_id: str
    space_id: str
    mode: QuizMode
    total_questions: int
    started_at: datetime
    questions: List[QuizQuestionItem]


class AnswerSubmitRequest(BaseModel):
    question_id: str
    response: str = Field(..., description="Student answer response text")
    time_taken_seconds: int = Field(default=0, ge=0)


class AnswerEvaluationResponse(BaseModel):
    question_id: str
    correctness: Correctness
    score: float = Field(..., ge=0.0, le=1.0)
    correct_answer: str
    explanation: Optional[str] = None
    source_passage: Optional[str] = None
    feedback: Optional[str] = None


class TopicScoreBreakdown(BaseModel):
    topic_id: str
    topic_name: str
    score: float
    attempted: int


class QuizCompleteResponse(BaseModel):
    session_id: str
    score: float
    total_questions: int
    correct_count: int
    time_taken_seconds: int
    topic_breakdown: List[TopicScoreBreakdown]


class FlashcardDueItem(BaseModel):
    id: str
    topic_id: str
    prompt: str
    answer: str
    explanation: Optional[str] = None
    source_passage: Optional[str] = None
    next_due_at: Optional[datetime] = None


class FlashcardReviewRequest(BaseModel):
    rating: int = Field(..., ge=1, le=4, description="1: Again, 2: Hard, 3: Good, 4: Easy")


class FlashcardReviewResponse(BaseModel):
    question_id: str
    ease_factor: float
    interval_days: int
    repetitions: int
    next_due_at: datetime
