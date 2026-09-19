# Architecture & Local Development Workflow

This document defines how **NoteRecall** runs locally and how the Backend and Frontend communicate seamlessly without merge conflicts during parallel vibe coding.

---

## 1. Local Network & Port Conventions

| Service | Technology | Local URL | Port |
|---|---|---|---|
| **Frontend** | React + Vite | `http://localhost:5173` | `5173` |
| **Backend** | FastAPI (Uvicorn) | `http://localhost:8000` | `8000` |
| **API Docs** | Swagger / OpenAPI | `http://localhost:8000/docs` | `8000` |
| **Database** | SQLite | `backend/data/noterecall.db` | Local File |

---

## 2. API Communication & Vite Proxy

To avoid CORS issues and hardcoded URLs:
- The Frontend should make all API requests to the relative prefix: `/api/v1/...`
- Vite's dev server automatically proxies any request starting with `/api` to `http://localhost:8000`:
  ```javascript
  // frontend/vite.config.js
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  }
  ```

---

## 3. High-Level Flow Between Frontend & Backend

```mermaid
sequenceDiagram
    autonumber
    actor User
    participant FE as Frontend (React / Vite)
    participant BE as Backend (FastAPI)
    participant DB as SQLite DB
    participant Vec as Vector Store (Chroma)

    User->>FE: 1. Uploads notes (PDF/TXT) or pastes text
    FE->>BE: POST /api/v1/spaces/{id}/documents/upload
    BE->>DB: Save document (status: processing)
    BE-->>FE: Return documentId & status: processing
    
    Note over BE,Vec: Ingestion worker extracts text, chunks & builds embeddings
    
    FE->>BE: Poll /api/v1/spaces/{id}/documents (or status check)
    BE-->>FE: status: completed
    
    FE->>BE: GET /api/v1/spaces/{id}/topics
    BE-->>FE: Return Topic Hierarchy Tree
    
    User->>FE: 2. Starts Practice (Quiz / Flashcards)
    FE->>BE: POST /api/v1/quiz/start { space_id, mode: "adaptive" }
    BE-->>FE: Return Quiz Session + Questions
    
    User->>FE: 3. Submits Answer
    FE->>BE: POST /api/v1/quiz/{session_id}/answer { question_id, response }
    BE-->>FE: Return evaluation (correctness, score, explanation, source citation)
    
    FE->>BE: GET /api/v1/spaces/{id}/dashboard
    BE-->>FE: Return topic mastery, heatmap data & "Revise Next" list
```

---

## 4. Error Handling Standard

All backend endpoints return errors conforming to this standard JSON shape:

```json
{
  "detail": "Descriptive error message here",
  "error_code": "RESOURCE_NOT_FOUND",
  "status_code": 404
}
```

The frontend Axios / fetch client can always safely display `error.response.data.detail`.
