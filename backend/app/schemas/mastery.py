from pydantic import BaseModel, Field
from typing import List, Optional, Literal
from datetime import datetime

MasteryLabel = Literal["weak", "developing", "strong"]


class TopicMasteryItem(BaseModel):
    topic_id: str = Field(..., description="Unique ID of the topic")
    topic_name: str = Field(..., description="Human-readable title of the topic")
    mastery: float = Field(..., ge=0.0, le=1.0, description="Mastery score from 0.0 to 1.0")
    label: MasteryLabel = Field(..., description="Tier: weak (<0.50), developing (0.50-0.75), strong (>0.75)")
    attempts_count: int = Field(default=0, ge=0, description="Total practice attempts recorded")
    last_practiced_at: Optional[datetime] = Field(default=None, description="ISO timestamp of most recent practice")


class ReviseRecommendation(BaseModel):
    topic_id: str = Field(..., description="Unique ID of the topic to revise")
    topic_name: str = Field(..., description="Human-readable title of the topic")
    mastery: float = Field(..., ge=0.0, le=1.0, description="Current mastery score")
    reason: str = Field(..., description="Human-readable reason why this topic needs practice")
    recommended_action: str = Field(..., description="Actionable recommendation for the student")


class DashboardResponse(BaseModel):
    space_id: str = Field(..., description="Unique ID of the study space")
    overall_mastery: float = Field(..., ge=0.0, le=1.0, description="Overall space mastery score between 0.0 and 1.0")
    total_attempts: int = Field(..., ge=0, description="Total practice attempts across all questions in space")
    study_streak_days: int = Field(..., ge=0, description="Consecutive days of active study")
    topics: List[TopicMasteryItem] = Field(default_factory=list, description="Per-topic mastery breakdown")
    revise_next: List[ReviseRecommendation] = Field(default_factory=list, description="Targeted priority revision queue")
    due_today_count: int = Field(default=0, ge=0, description="Number of flashcards due for spaced repetition today")
