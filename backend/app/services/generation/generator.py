import re
import logging
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session

from app.models.entities import Question, Topic, Chunk
from app.services.generation.llm_client import llm_client
from app.services.generation.prompts import QuestionPrompts
from app.services.generation.verifier import QuestionVerifier

logger = logging.getLogger("noterecall.generator")


class QuestionGenerator:
    """Generates grounded questions from notes chunks for a given topic."""

    @classmethod
    def generate_for_topic(
        cls,
        topic_id: str,
        db: Session,
        count: int = 5,
    ) -> List[Question]:
        """Generates grounded questions for a subtopic or topic and persists them."""
        topic = db.query(Topic).filter(Topic.id == topic_id).first()
        if not topic:
            return []

        # Find chunks for this topic or child subtopics
        subtopic_ids = [s.id for s in topic.subtopics] if topic.subtopics else []
        target_ids = [topic.id] + subtopic_ids

        chunks = db.query(Chunk).filter(Chunk.topic_id.in_(target_ids)).all()
        if not chunks:
            # Fallback to any space chunks if unassigned
            chunks = db.query(Chunk).join(Topic, Chunk.topic_id == Topic.id).filter(Topic.space_id == topic.space_id).all()

        if not chunks:
            logger.warning(f"No chunks found to generate questions for topic {topic.name}")
            return []

        chunk_dicts = [
            {"id": c.id, "page_number": c.page_number or 1, "text": c.text}
            for c in chunks[:10]  # token limit
        ]

        prompt = QuestionPrompts.build_generation_prompt(
            topic_name=topic.name,
            topic_summary=topic.summary or "",
            chunks=chunk_dicts,
            count=count,
        )

        extracted_raw_questions = []
        try:
            messages = [
                {"role": "system", "content": "You are an educational test generator that strictly returns JSON."},
                {"role": "user", "content": prompt},
            ]
            response_json = llm_client.generate_json(messages)
            if isinstance(response_json, dict) and "questions" in response_json:
                extracted_raw_questions = response_json["questions"]
        except Exception as e:
            logger.warning(f"LLM question generation failed/skipped ({e}). Using heuristic generator.")

        # If LLM didn't return questions, generate heuristic grounded questions
        if not extracted_raw_questions:
            extracted_raw_questions = cls._generate_heuristic_questions(topic, chunks, count)

        # Existing prompts for deduplication
        existing_prompts = [q.prompt for q in db.query(Question.prompt).filter(Question.topic_id == topic.id).all()]

        created_questions = []
        default_chunk_id = chunks[0].id if chunks else None

        for raw_q in extracted_raw_questions:
            cleaned = QuestionVerifier.validate_and_clean(raw_q, fallback_chunk_id=default_chunk_id)
            if not cleaned:
                continue

            # Check duplication
            if QuestionVerifier.is_duplicate(cleaned["prompt"], existing_prompts):
                continue

            question_entity = Question(
                topic_id=topic.id,
                type=cleaned["type"],
                prompt=cleaned["prompt"],
                options=cleaned.get("options"),
                answer=cleaned["answer"],
                explanation=cleaned.get("explanation"),
                difficulty=cleaned.get("difficulty", "medium"),
                cognitive_level=cleaned.get("cognitive_level", "recall"),
                source_chunk_ids=cleaned.get("source_chunk_ids", []),
                status="verified",
                is_flagged=False,
            )
            db.add(question_entity)
            created_questions.append(question_entity)
            existing_prompts.append(cleaned["prompt"])

        db.commit()
        for q in created_questions:
            db.refresh(q)

        logger.info(f"Generated and saved {len(created_questions)} questions for topic '{topic.name}'.")
        return created_questions

    @classmethod
    def _generate_heuristic_questions(
        cls,
        topic: Topic,
        chunks: List[Chunk],
        count: int,
    ) -> List[Dict[str, Any]]:
        """Generates grounded questions from key sentences and definitions in chunks."""
        questions = []
        for chunk in chunks:
            if len(questions) >= count:
                break

            sentences = [s.strip() for s in re.split(r"(?<=[.!?])\s+", chunk.text) if len(s.strip()) > 25]
            for sent in sentences:
                if len(questions) >= count:
                    break

                # Pattern 1: Definition ("X is Y")
                match_is = re.search(r"^([A-Z][a-zA-Z\s]{2,30})\s+(?:is|refers to|represents)\s+(.+)", sent)
                if match_is and len(questions) < count:
                    term = match_is.group(1).strip()
                    definition = match_is.group(2).strip()

                    # Flashcard
                    questions.append({
                        "type": "flashcard",
                        "prompt": f"What is {term}?",
                        "options": None,
                        "answer": definition,
                        "explanation": f"Definition of {term} from notes.",
                        "difficulty": "easy",
                        "cognitive_level": "recall",
                        "source_passage": sent,
                        "source_chunk_ids": [chunk.id],
                    })

                    # MCQ
                    if len(questions) < count:
                        distractors = [
                            f"An unrelated component of the system",
                            f"A temporary disk buffer",
                            f"A hardware interrupt handler",
                        ]
                        options = [term] + distractors
                        questions.append({
                            "type": "mcq",
                            "prompt": f"Which concept matches the description: '{definition[:100]}...'?",
                            "options": options,
                            "answer": term,
                            "explanation": f"According to the notes, {term} is {definition[:100]}.",
                            "difficulty": "medium",
                            "cognitive_level": "understanding",
                            "source_passage": sent,
                            "source_chunk_ids": [chunk.id],
                        })

                # Pattern 2: Short answer from general sentence
                elif len(sent) > 40 and len(questions) < count:
                    questions.append({
                        "type": "short_answer",
                        "prompt": f"Explain the principle: '{sent[:80]}...'?",
                        "options": None,
                        "answer": sent,
                        "explanation": "Grounded directly in lecture notes.",
                        "difficulty": "medium",
                        "cognitive_level": "understanding",
                        "source_passage": sent,
                        "source_chunk_ids": [chunk.id],
                    })

        # Ensure at least 1 question
        if not questions and chunks:
            questions.append({
                "type": "flashcard",
                "prompt": f"Summarize the core concept of {topic.name}",
                "options": None,
                "answer": chunks[0].text[:200],
                "explanation": "Extracted from primary topic notes.",
                "difficulty": "easy",
                "cognitive_level": "recall",
                "source_passage": chunks[0].text[:200],
                "source_chunk_ids": [chunks[0].id],
            })

        return questions[:count]
