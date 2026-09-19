# Data Models & Type Definitions

This document aligns data entities across **Python (Pydantic / SQLAlchemy)** in the backend and **TypeScript** in the frontend.

---

## TypeScript Definitions for Frontend

The frontend team can copy or reference these interfaces directly in `frontend/src/types/index.ts`.

```typescript
// 1. Study Space
export interface StudySpace {
  id: string;
  title: string;
  description?: string;
  created_at: string;
  document_count?: number;
  topic_count?: number;
}

// 2. Document
export type IngestionStatus = 'pending' | 'processing' | 'completed' | 'failed';
export type FileType = 'pdf' | 'docx' | 'txt' | 'md' | 'pasted';

export interface DocumentItem {
  id: string;
  space_id: string;
  filename: string;
  file_type: FileType;
  status: IngestionStatus;
  uploaded_at: string;
  chunk_count?: number;
}

// 3. Topic Tree
export interface TopicNode {
  id: string;
  parent_id?: string | null;
  name: string;
  summary?: string;
  order_index: number;
  chunk_count: number;
  question_count: number;
  subtopics: TopicNode[];
}

// 4. Question & Practice
export type QuestionType = 'flashcard' | 'mcq' | 'fill_blank' | 'short_answer';
export type DifficultyLevel = 'easy' | 'medium' | 'hard';
export type CognitiveLevel = 'recall' | 'understanding' | 'application';

export interface Question {
  id: string;
  topic_id: string;
  type: QuestionType;
  prompt: string;
  options?: string[]; // for MCQ
  answer?: string;    // hidden during active quiz
  explanation?: string;
  difficulty: DifficultyLevel;
  cognitive_level?: CognitiveLevel;
  source_passage?: string;
  is_flagged?: boolean;
}

// 5. Quiz Session & Evaluation
export type QuizMode = 'topic_quiz' | 'mixed' | 'adaptive' | 'daily_revision' | 'flashcards';
export type Correctness = 'correct' | 'partially_correct' | 'incorrect';

export interface QuizSession {
  session_id: string;
  space_id: string;
  mode: QuizMode;
  total_questions: number;
  started_at: string;
  questions: Question[];
}

export interface AnswerEvaluation {
  question_id: string;
  correctness: Correctness;
  score: number; // 0.0 to 1.0
  correct_answer: string;
  explanation: string;
  source_passage?: string;
  feedback?: string;
}

export interface QuizSummary {
  session_id: string;
  score: number;
  total_questions: number;
  correct_count: number;
  time_taken_seconds: number;
  topic_breakdown: {
    topic_id: string;
    topic_name: string;
    score: number;
    attempted: number;
  }[];
}

// 6. Mastery & Dashboard
export type MasteryLabel = 'weak' | 'developing' | 'strong';

export interface TopicMasteryItem {
  topic_id: string;
  topic_name: string;
  mastery: number; // 0.0 to 1.0
  label: MasteryLabel;
  attempts_count: number;
  last_practiced_at?: string;
}

export interface ReviseRecommendation {
  topic_id: string;
  topic_name: string;
  mastery: number;
  reason: string;
  recommended_action: string;
}

export interface DashboardData {
  space_id: string;
  overall_mastery: number;
  total_attempts: number;
  study_streak_days: number;
  topics: TopicMasteryItem[];
  revise_next: ReviseRecommendation[];
  due_today_count: number;
}
```
