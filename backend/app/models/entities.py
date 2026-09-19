import uuid
from sqlalchemy import Column, String, Integer, Float, ForeignKey, Text, JSON, Boolean, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from app.db.base import Base


class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(100), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)

    study_spaces = relationship("StudySpace", back_populates="user", cascade="all, delete-orphan")
    quiz_sessions = relationship("QuizSession", back_populates="user", cascade="all, delete-orphan")
    topic_masteries = relationship("TopicMastery", back_populates="user", cascade="all, delete-orphan")
    review_states = relationship("ReviewState", back_populates="user", cascade="all, delete-orphan")


class StudySpace(Base):
    __tablename__ = "study_spaces"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)

    user = relationship("User", back_populates="study_spaces")
    documents = relationship("Document", back_populates="study_space", cascade="all, delete-orphan")
    topics = relationship("Topic", back_populates="study_space", cascade="all, delete-orphan")
    quiz_sessions = relationship("QuizSession", back_populates="study_space", cascade="all, delete-orphan")


class Document(Base):
    __tablename__ = "documents"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    space_id = Column(String(36), ForeignKey("study_spaces.id", ondelete="CASCADE"), nullable=False, index=True)
    filename = Column(String(255), nullable=False)
    file_type = Column(String(50), nullable=False)  # pdf, docx, txt, markdown, pasted
    status = Column(String(50), default="pending")   # pending, processing, completed, failed
    file_path = Column(String(500), nullable=True)
    raw_content = Column(Text, nullable=True)
    uploaded_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    study_space = relationship("StudySpace", back_populates="documents")
    chunks = relationship("Chunk", back_populates="document", cascade="all, delete-orphan")


class Topic(Base):
    __tablename__ = "topics"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    space_id = Column(String(36), ForeignKey("study_spaces.id", ondelete="CASCADE"), nullable=False, index=True)
    parent_id = Column(String(36), ForeignKey("topics.id", ondelete="SET NULL"), nullable=True, index=True)
    name = Column(String(200), nullable=False)
    summary = Column(Text, nullable=True)
    order_index = Column(Integer, default=0)

    study_space = relationship("StudySpace", back_populates="topics")
    parent = relationship("Topic", remote_side=[id], back_populates="subtopics")
    subtopics = relationship("Topic", back_populates="parent", cascade="all, delete-orphan")
    chunks = relationship("Chunk", back_populates="topic")
    questions = relationship("Question", back_populates="topic", cascade="all, delete-orphan")
    masteries = relationship("TopicMastery", back_populates="topic", cascade="all, delete-orphan")


class Chunk(Base):
    __tablename__ = "chunks"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    document_id = Column(String(36), ForeignKey("documents.id", ondelete="CASCADE"), nullable=False, index=True)
    topic_id = Column(String(36), ForeignKey("topics.id", ondelete="SET NULL"), nullable=True, index=True)
    text = Column(Text, nullable=False)
    page_number = Column(Integer, nullable=True)
    heading_path = Column(String(500), nullable=True)
    order_index = Column(Integer, nullable=False, default=0)
    embedding_ref = Column(String(255), nullable=True)  # ID in vector store

    document = relationship("Document", back_populates="chunks")
    topic = relationship("Topic", back_populates="chunks")


class Question(Base):
    __tablename__ = "questions"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    topic_id = Column(String(36), ForeignKey("topics.id", ondelete="CASCADE"), nullable=False, index=True)
    type = Column(String(50), nullable=False)  # flashcard, mcq, fill_blank, short_answer, true_false
    prompt = Column(Text, nullable=False)
    options = Column(JSON, nullable=True)      # e.g., ["A", "B", "C", "D"] for MCQ
    answer = Column(Text, nullable=False)
    explanation = Column(Text, nullable=True)
    difficulty = Column(String(20), default="medium")  # easy, medium, hard
    cognitive_level = Column(String(30), default="recall")  # recall, understanding, application
    source_chunk_ids = Column(JSON, default=list)  # list of chunk IDs
    status = Column(String(30), default="verified")  # unverified, verified, rejected
    is_flagged = Column(Boolean, default=False)

    topic = relationship("Topic", back_populates="questions")
    attempts = relationship("Attempt", back_populates="question")
    review_states = relationship("ReviewState", back_populates="question")


class QuizSession(Base):
    __tablename__ = "quiz_sessions"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    space_id = Column(String(36), ForeignKey("study_spaces.id", ondelete="CASCADE"), nullable=False, index=True)
    mode = Column(String(50), nullable=False)  # topic_quiz, mixed, adaptive, daily_revision, flashcards
    started_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    completed_at = Column(DateTime, nullable=True)
    total_questions = Column(Integer, default=0)
    score = Column(Float, nullable=True)  # 0.0 to 100.0 or normalized

    user = relationship("User", back_populates="quiz_sessions")
    study_space = relationship("StudySpace", back_populates="quiz_sessions")
    attempts = relationship("Attempt", back_populates="session", cascade="all, delete-orphan")


class Attempt(Base):
    __tablename__ = "attempts"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    session_id = Column(String(36), ForeignKey("quiz_sessions.id", ondelete="CASCADE"), nullable=False, index=True)
    question_id = Column(String(36), ForeignKey("questions.id", ondelete="CASCADE"), nullable=False, index=True)
    response = Column(Text, nullable=True)
    correctness = Column(String(30), nullable=False)  # correct, partially_correct, incorrect
    score = Column(Float, nullable=False, default=0.0)  # 0.0 to 1.0
    time_taken_seconds = Column(Integer, default=0)
    feedback = Column(Text, nullable=True)

    session = relationship("QuizSession", back_populates="attempts")
    question = relationship("Question", back_populates="attempts")


class TopicMastery(Base):
    __tablename__ = "topic_masteries"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    topic_id = Column(String(36), ForeignKey("topics.id", ondelete="CASCADE"), nullable=False, index=True)
    mastery = Column(Float, default=0.0)  # 0.0 to 1.0
    attempts_count = Column(Integer, default=0)
    last_practiced_at = Column(DateTime, nullable=True)

    user = relationship("User", back_populates="topic_masteries")
    topic = relationship("Topic", back_populates="masteries")


class ReviewState(Base):
    __tablename__ = "review_states"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    question_id = Column(String(36), ForeignKey("questions.id", ondelete="CASCADE"), nullable=False, index=True)
    ease_factor = Column(Float, default=2.5)
    interval_days = Column(Integer, default=1)
    repetitions = Column(Integer, default=0)
    next_due_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)

    user = relationship("User", back_populates="review_states")
    question = relationship("Question", back_populates="review_states")
