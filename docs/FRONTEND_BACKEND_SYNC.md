# Frontend-Backend Collaboration Guide (Vibe Coding Rules)

This guide establishes the rules of engagement for two developers (and their AI coding agents) building **NoteRecall** concurrently on separate ends of the stack.

---

## 🎯 Ground Rules for AI Agents

1. **Boundary Isolation:**
   - **Backend Agent:** Focuses strictly on `backend/`, `docs/`, and root environment configs. **Do not modify files inside `frontend/`**.
   - **Frontend Agent:** Focuses strictly on `frontend/` and reads `docs/`. **Do not modify files inside `backend/`**.

2. **The Docs Folder is Law:**
   - All API endpoints, request bodies, query params, and JSON structures are documented in [`docs/API_CONTRACTS.md`](API_CONTRACTS.md).
   - If the Backend needs to modify a route or response field, **update `docs/API_CONTRACTS.md` first**.
   - The Frontend Agent should read [`docs/API_CONTRACTS.md`](API_CONTRACTS.md) and [`docs/DATA_MODELS.md`](DATA_MODELS.md) to understand payloads and build UI states.

3. **Parallel Vibe Coding (Mocking Strategy):**
   - If the Frontend Agent needs an endpoint that the Backend Agent hasn't finished yet, the Frontend Agent should create a temporary mock function or JSON fixture in `frontend/src/services/` that returns the exact sample JSON from [`docs/API_CONTRACTS.md`](API_CONTRACTS.md).
   - When the backend endpoint is ready, the frontend simply switches the service call to fetch from the real URL without rewriting any UI components!

---

## 🔌 Quick Health Check & Test Command

To verify that the frontend and backend can talk to each other on the same machine:

1. **Start Backend (Terminal 1):**
   ```bash
   cd backend
   uvicorn app.main:app --reload --port 8000
   ```
   Check in browser: `http://localhost:8000/docs`

2. **Start Frontend (Terminal 2):**
   ```bash
   cd frontend
   npm run dev
   ```
   Check in browser: `http://localhost:5173`

3. **Verify Proxy Connection:**
   Open browser dev tools on `http://localhost:5173` and run:
   ```javascript
   fetch('/api/v1/').then(res => res.json()).then(console.log);
   ```
   It should return `{"status": "ok", "app": "NoteRecall API"}`. If this works, the proxy connection is fully functional!

---

## 🌿 Git & Commit Discipline

- Commit often with clear semantic prefixes:
  - `feat(backend): implement topic extraction endpoint`
  - `feat(frontend): build topic outline tree component`
  - `docs: update API contracts for quiz answer submission`
- Always pull the latest `docs/` before starting a new feature branch or task.
