# NoteRecall API Contracts (Single Source of Truth)

> **Base URL:** `/api/v1` (locally proxied from `http://localhost:5173/api/v1` to `http://localhost:8000/api/v1`)  
> **Headers:** `Content-Type: application/json`

---

## 1. Study Spaces

### 1.1 List Study Spaces
- **Endpoint:** `GET /spaces`
- **Response:** `200 OK`
```json
[
  {
    "id": "sp_123",
    "title": "Operating Systems",
    "description": "Midterm preparation notes on processes and memory management",
    "created_at": "2026-09-19T10:00:00Z",
    "document_count": 3,
    "topic_count": 8
  }
]
```

### 1.2 Create Study Space
- **Endpoint:** `POST /spaces`
- **Request Body:**
```json
{
  "title": "Operating Systems",
  "description": "Midterm preparation notes"
}
```
- **Response:** `201 Created`
```json
{
  "id": "sp_123",
  "title": "Operating Systems",
  "description": "Midterm preparation notes",
  "created_at": "2026-09-19T10:00:00Z"
}
```

### 1.3 Get Single Study Space
- **Endpoint:** `GET /spaces/{id}`
- **Response:** `200 OK` (Same schema as Create with document & topic summaries)

### 1.4 Delete Study Space
- **Endpoint:** `DELETE /spaces/{id}`
- **Response:** `204 No Content`

---

## 2. Documents & Ingestion

### 2.1 Upload Document File
- **Endpoint:** `POST /spaces/{space_id}/documents/upload`
- **Content-Type:** `multipart/form-data`
- **Form Data:** `file: (Binary, .pdf, .docx, .txt, .md)`
- **Response:** `202 Accepted`
```json
{
  "id": "doc_456",
  "space_id": "sp_123",
  "filename": "Chapter_3_Processes.pdf",
  "file_type": "pdf",
  "status": "processing",
  "uploaded_at": "2026-09-19T10:05:00Z"
}
```

### 2.2 Paste Raw Text
- **Endpoint:** `POST /spaces/{space_id}/documents/paste`
- **Request Body:**
```json
{
  "filename": "Lecture_Notes_Process_Scheduling.txt",
  "content": "A process is a program in execution. The operating system uses PCBs..."
}
```
- **Response:** `202 Accepted` (Same schema as 2.1)

### 2.3 List Documents & Ingestion Status
- **Endpoint:** `GET /spaces/{space_id}/documents`
- **Response:** `200 OK`
```json
[
  {
    "id": "doc_456",
    "space_id": "sp_123",
    "filename": "Chapter_3_Processes.pdf",
    "file_type": "pdf",
    "status": "completed",
    "uploaded_at": "2026-09-19T10:05:00Z",
    "chunk_count": 18
  }
]
```
> *Statuses:* `"pending" | "processing" | "completed" | "failed"`

---

## 3. Topics Hierarchy

### 3.1 Get Topic Tree
- **Endpoint:** `GET /spaces/{space_id}/topics`
- **Response:** `200 OK`
```json
[
  {
    "id": "top_1",
    "name": "Process Management",
    "summary": "Covers processes, states, scheduling, and IPC.",
    "order_index": 0,
    "chunk_count": 12,
    "question_count": 15,
    "subtopics": [
      {
        "id": "top_1_1",
        "parent_id": "top_1",
        "name": "Process States & PCB",
        "summary": "New, Ready, Running, Waiting, Terminated states.",
        "order_index": 0,
        "chunk_count": 5,
        "question_count": 7,
        "subtopics": []
      },
      {
        "id": "top_1_2",
        "parent_id": "top_1",
        "name": "CPU Scheduling Algorithms",
        "summary": "FCFS, SJF, Round Robin, and Priority Scheduling.",
        "order_index": 1,
        "chunk_count": 7,
        "question_count": 8,
        "subtopics": []
      }
    ]
  }
]
```

### 3.2 Update Topic (Rename / Edit Summary)
- **Endpoint:** `PATCH /topics/{topic_id}`
- **Request Body:**
```json
{
  "name": "Process States & Lifecycle",
  "summary": "Updated summary"
}
```
- **Response:** `200 OK`

### 3.3 Delete Topic
- **Endpoint:** `DELETE /topics/{topic_id}`
- **Response:** `204 No Content`

---

## 4. Question Bank

### 4.1 List Questions
- **Endpoint:** `GET /spaces/{space_id}/questions?topic_id=top_1_1&type=mcq`
- **Query Params (Optional):**
  - `topic_id`: Filter by specific topic/subtopic
  - `type`: `flashcard | mcq | short_answer | fill_blank`
  - `difficulty`: `easy | medium | hard`
- **Response:** `200 OK`
```json
[
  {
    "id": "q_789",
    "topic_id": "top_1_1",
    "type": "mcq",
    "prompt": "Which component of the PCB stores the current CPU register values?",
    "options": [
      "Process state",
      "Program counter",
      "CPU registers",
      "Memory management information"
    ],
    "answer": "CPU registers",
    "explanation": "When an interrupt occurs, state information must be saved in the CPU registers field of the PCB so execution can resume later.",
    "difficulty": "medium",
    "cognitive_level": "recall",
    "source_passage": "According to slide 14: 'The CPU registers vary in number and type depending on the architecture...'",
    "source_chunk_ids": ["chk_101"],
    "is_flagged": false
  }
]
```

### 4.2 Generate Questions (Trigger Background Generation)
- **Endpoint:** `POST /spaces/{space_id}/questions/generate`
- **Request Body (Optional):**
```json
{
  "topic_id": "top_1_1",
  "count": 5
}
```
- **Response:** `202 Accepted`
```json
{
  "message": "Question generation initiated",
  "topic_id": "top_1_1"
}
```

### 4.3 Flag Incorrect/Unclear Question
- **Endpoint:** `POST /questions/{question_id}/flag`
- **Request Body:**
```json
{
  "reason": "Option C contradicts notes on slide 12"
}
```
- **Response:** `200 OK`

---

## 5. Quizzing & Practice Sessions

### 5.1 Start Practice Session
- **Endpoint:** `POST /quiz/start`
- **Request Body:**
```json
{
  "space_id": "sp_123",
  "mode": "adaptive",
  "topic_ids": ["top_1_1", "top_1_2"],
  "question_count": 10
}
```
> *Modes:* `"topic_quiz" | "mixed" | "adaptive" | "daily_revision"`  
> (*adaptive* selects 50% weak, 30% developing/due, 20% strong topics)

- **Response:** `201 Created`
```json
{
  "session_id": "sess_999",
  "space_id": "sp_123",
  "mode": "adaptive",
  "total_questions": 10,
  "started_at": "2026-09-19T10:15:00Z",
  "questions": [
    {
      "id": "q_789",
      "topic_id": "top_1_1",
      "type": "mcq",
      "prompt": "Which component of the PCB stores the current CPU register values?",
      "options": [
        "Process state",
        "Program counter",
        "CPU registers",
        "Memory management information"
      ],
      "difficulty": "medium"
    }
  ]
}
```
*(Notice: answer & explanation are excluded during active quiz)*

### 5.2 Submit Answer for Evaluation
- **Endpoint:** `POST /quiz/{session_id}/answer`
- **Request Body:**
```json
{
  "question_id": "q_789",
  "response": "CPU registers",
  "time_taken_seconds": 18
}
```
- **Response:** `200 OK`
```json
{
  "question_id": "q_789",
  "correctness": "correct",
  "score": 1.0,
  "correct_answer": "CPU registers",
  "explanation": "CPU registers field saves the context during a context switch.",
  "source_passage": "From Lecture 3 notes: 'State save into PCB registers...'",
  "feedback": "Perfect! Correct context identification."
}
```
> *For short answers, `score` can be `0.0` to `1.0` with `correctness`: `"correct" | "partially_correct" | "incorrect"`.*

### 5.3 Complete Session & Get Final Summary
- **Endpoint:** `POST /quiz/{session_id}/complete`
- **Response:** `200 OK`
```json
{
  "session_id": "sess_999",
  "score": 85.0,
  "total_questions": 10,
  "correct_count": 8,
  "time_taken_seconds": 240,
  "topic_breakdown": [
    {
      "topic_id": "top_1_1",
      "topic_name": "Process States & PCB",
      "score": 100.0,
      "attempted": 5
    },
    {
      "topic_id": "top_1_2",
      "topic_name": "CPU Scheduling Algorithms",
      "score": 70.0,
      "attempted": 5
    }
  ]
}
```

---

## 6. Flashcards & Spaced Repetition (SM-2)

### 6.1 Get Due Flashcards
- **Endpoint:** `GET /flashcards/due?space_id=sp_123`
- **Response:** `200 OK`
```json
[
  {
    "id": "q_801",
    "topic_id": "top_1_1",
    "prompt": "What is a Process Control Block (PCB)?",
    "answer": "A data structure maintained by the OS containing all information about a specific process.",
    "explanation": "Holds process state, PID, registers, memory limits, and open files list.",
    "source_passage": "Notes Section 2: 'A PCB represents a process in memory...'"
  }
]
```

### 6.2 Submit Flashcard Self-Rating (SM-2 Update)
- **Endpoint:** `POST /flashcards/{question_id}/review`
- **Request Body:**
```json
{
  "rating": 3
}
```
> *Ratings:*  
> `1`: **Again** (Complete blackout / incorrect)  
> `2`: **Hard** (Recalled with difficulty)  
> `3`: **Good** (Normal recall with brief hesitation)  
> `4`: **Easy** (Instant, effortless recall)

- **Response:** `200 OK`
```json
{
  "question_id": "q_801",
  "ease_factor": 2.6,
  "interval_days": 3,
  "repetitions": 2,
  "next_due_at": "2026-09-22T10:00:00Z"
}
```

---

## 7. Mastery Tracking & Analytics Dashboard

### 7.1 Get Space Mastery & Analytics Dashboard
- **Endpoint:** `GET /spaces/{space_id}/dashboard`
- **Response:** `200 OK`
```json
{
  "space_id": "sp_123",
  "overall_mastery": 0.68,
  "total_attempts": 42,
  "study_streak_days": 4,
  "topics": [
    {
      "topic_id": "top_1_1",
      "topic_name": "Process States & PCB",
      "mastery": 0.88,
      "label": "strong",
      "attempts_count": 20,
      "last_practiced_at": "2026-09-19T10:20:00Z"
    },
    {
      "topic_id": "top_1_2",
      "topic_name": "CPU Scheduling Algorithms",
      "mastery": 0.42,
      "label": "weak",
      "attempts_count": 22,
      "last_practiced_at": "2026-09-19T10:20:00Z"
    }
  ],
  "revise_next": [
    {
      "topic_id": "top_1_2",
      "topic_name": "CPU Scheduling Algorithms",
      "mastery": 0.42,
      "reason": "Accuracy below 50% on Round Robin and Priority scheduling.",
      "recommended_action": "Take a 5-question targeted quiz"
    }
  ],
  "due_today_count": 6
}
```
> *Mastery Classification:*  
> - `"weak"`: mastery `< 0.50`  
> - `"developing"`: `0.50 <= mastery <= 0.75`  
> - `"strong"`: mastery `> 0.75`
