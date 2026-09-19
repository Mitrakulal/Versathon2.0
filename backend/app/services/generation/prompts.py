from typing import List, Dict, Any


class QuestionPrompts:
    @staticmethod
    def build_generation_prompt(
        topic_name: str,
        topic_summary: str,
        chunks: List[Dict[str, Any]],
        count: int = 5,
    ) -> str:
        """Constructs a strict JSON prompt grounded in the provided notes chunks."""
        passages = []
        for c in chunks:
            chunk_id = c.get("id", "")
            page = c.get("page_number", 1)
            text = c.get("text", "").replace("\n", " ")
            passages.append(f"[Chunk ID: {chunk_id} | Page: {page}]: {text}")

        joined_passages = "\n\n".join(passages)

        return f"""
You are an expert educator creating grounded study questions for active recall.
Generate {count} high-quality questions for the topic: "{topic_name}".
Topic Summary: "{topic_summary}"

SOURCE NOTES MATERIAL:
{joined_passages}

CRITICAL RULES:
1. Every question MUST be directly answered and grounded in the provided source notes. Do NOT invent information.
2. Produce a balanced mix of types:
   - "flashcard": A clear question and concise factual definition/answer.
   - "mcq": A multiple choice question with exactly 4 options, 1 correct answer, and 3 plausible distractors from the material.
   - "fill_blank": A sentence from the notes with a key term or concept replaced by "____".
   - "short_answer": A conceptual question testing deeper understanding.
3. For every question, cite the exact Chunk ID(s) where the answer is found.
4. Provide a brief explanation and the source passage snippet.

Output MUST strictly be valid JSON matching this structure:
{{
  "questions": [
    {{
      "type": "mcq",
      "prompt": "Which process state indicates that the process is waiting to be assigned to a CPU?",
      "options": ["Running", "Ready", "Waiting", "New"],
      "answer": "Ready",
      "explanation": "In the five-state model, Ready processes are in memory waiting for CPU allocation.",
      "difficulty": "medium",
      "cognitive_level": "recall",
      "source_passage": "Ready: The process is waiting to be assigned to a processor.",
      "source_chunk_ids": ["chunk_id_here"]
    }},
    {{
      "type": "flashcard",
      "prompt": "What is a Process Control Block (PCB)?",
      "options": null,
      "answer": "A kernel data structure containing all information about a specific process such as state, PID, registers, and memory limits.",
      "explanation": "Serves as the repository for any information that can vary from process to process.",
      "difficulty": "easy",
      "cognitive_level": "recall",
      "source_passage": "Each process is represented in the operating system by a Process Control Block (PCB)...",
      "source_chunk_ids": ["chunk_id_here"]
    }}
  ]
}}
"""
