# NoteRecall — Learn From Your Notes

> **Active recall & spaced repetition system for your study material.**  
> Built for Problem Statement E2 (*Learn From Your Notes*).

---

## 🌟 Architecture Overview

NoteRecall transforms passive document reading into active, measurable learning using a clean, layered architecture:

```
Versathon2.0/
├── backend/                  # FastAPI Application (Prototype)
│   ├── app/
│   │   ├── api/              # REST endpoints (spaces, documents, topics, quiz, etc.)
│   │   ├── core/             # Configuration & database session
│   │   ├── models/           # SQLAlchemy models
│   │   ├── schemas/          # Pydantic schemas
│   │   ├── services/         # Logic (ingestion, topics, generation, quiz, mastery)
│   │   └── main.py           # FastAPI entry point
│   ├── data/                 # SQLite database & local storage
│   └── requirements.txt      # Python dependencies
│
├── frontend/                 # React SPA (Vite)
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/       # UI (upload, topics, quiz, flashcards, dashboard)
│   │   ├── pages/            # View pages
│   │   ├── services/         # API calls
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   └── package.json
│
└── .env.example              # Environment variables template
```

---

## 🚀 Quickstart

### 1. Prerequisites
- Python 3.11+
- Node.js 18+ & npm

### 2. Backend Setup
```bash
cd backend
python -m venv .venv
# On Windows:
.venv\Scripts\activate
# On Unix:
source .venv/bin/activate

pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```
API Documentation will be available at: `http://localhost:8000/docs`.

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Access the application at `http://localhost:5173`.

