# Backend Implementation Phases & Roadmap

This document outlines the 5 execution phases for building the **NoteRecall** backend prototype.

---

## 📌 Development Discipline (Rule for All Developers)

> [!IMPORTANT]
> **Commit & Push After Every Phase/Feature:**
> Both Backend and Frontend developers must run:
> ```bash
> git add .
> git commit -m "<semantic-commit-message>"
> git push origin main  # or working branch
> ```
> after finishing each phase or major feature. This keeps both working trees synced and prevents merge conflicts.

---

## 🛠️ Phase Overview

### **Phase 1: Database Setup & Study Spaces API**
- **Purpose:** Core relational tables and Study Space management.
- **Endpoints:**
  - `GET /api/v1/spaces`
  - `POST /api/v1/spaces`
  - `GET /api/v1/spaces/{id}`
  - `DELETE /api/v1/spaces/{id}`
- **Commit:** `feat(backend): complete study spaces CRUD and database init`

---

### **Phase 2: Ingestion & Topic Hierarchy Extraction**
- **Purpose:** Parse documents (PDF, DOCX, TXT, text paste), clean text, chunk into 300-500 token blocks, and extract editable Topic $\rightarrow$ Subtopic hierarchy using LLM.
- **Endpoints:**
  - `POST /api/v1/spaces/{id}/documents/upload`
  - `POST /api/v1/spaces/{id}/documents/paste`
  - `GET /api/v1/spaces/{id}/documents`
  - `GET /api/v1/spaces/{id}/topics`
  - `PATCH /api/v1/topics/{id}`
  - `DELETE /api/v1/topics/{id}`
- **Commit:** `feat(backend): document ingestion, chunking, and topic extraction pipeline`

---

### **Phase 3: Grounded Question & Flashcard Generator**
- **Purpose:** RAG generation of MCQs, Flashcards, Fill-in-the-blanks, and Short-answer questions grounded in source chunks.
- **Endpoints:**
  - `GET /api/v1/spaces/{id}/questions`
  - `POST /api/v1/spaces/{id}/questions/generate`
  - `POST /api/v1/questions/{id}/flag`
- **Commit:** `feat(backend): grounded question and flashcard generation pipeline`

---

### **Phase 4: Quiz Practice Engine & SM-2 Spaced Repetition**
- **Purpose:** Run interactive quiz sessions, evaluate MCQ & short answers (with feedback), and handle flashcard SM-2 review ratings.
- **Endpoints:**
  - `POST /api/v1/quiz/start`
  - `POST /api/v1/quiz/{session_id}/answer`
  - `POST /api/v1/quiz/{session_id}/complete`
  - `GET /api/v1/flashcards/due`
  - `POST /api/v1/flashcards/{id}/review`
- **Commit:** `feat(backend): quiz session runner, grading, and SM-2 flashcard scheduler`

---

### **Phase 5: Topic Mastery Engine & Analytics Dashboard**
- **Purpose:** Recency-weighted per-topic mastery scores, weak-topic identification, "Revise Next" queue, and full dashboard aggregation.
- **Endpoints:**
  - `GET /api/v1/spaces/{id}/dashboard`
- **Commit:** `feat(backend): per-topic mastery model, recommendation engine, and dashboard API`
