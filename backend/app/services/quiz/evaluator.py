import re
import logging
from typing import Dict, Any, Optional
from app.models.entities import Question
from app.services.generation.llm_client import llm_client

logger = logging.getLogger("noterecall.evaluator")


class AnswerEvaluator:
    """Evaluates student answers (exact/normalized matching for MCQs, LLM rubric for short answers)."""

    @classmethod
    def evaluate(
        cls,
        question: Question,
        student_response: str,
        source_passage: Optional[str] = None,
    ) -> Dict[str, Any]:
        q_type = question.type.lower()
        cleaned_response = student_response.strip()

        # 1. Objective Evaluation (MCQ, fill_blank, true_false)
        if q_type in ["mcq", "fill_blank", "true_false"]:
            return cls._evaluate_objective(question, cleaned_response, source_passage)

        # 2. Subjective / Conceptual Evaluation (short_answer, flashcard)
        return cls._evaluate_subjective(question, cleaned_response, source_passage)

    @classmethod
    def _evaluate_objective(
        cls,
        question: Question,
        student_response: str,
        source_passage: Optional[str] = None,
    ) -> Dict[str, Any]:
        def normalize(text: str) -> str:
            return re.sub(r"[^\w\s]", "", text.lower()).strip()

        target = normalize(question.answer)
        resp = normalize(student_response)

        is_correct = (resp == target) or (resp in target and len(resp) > 3) or (target in resp and len(target) > 3)
        score = 1.0 if is_correct else 0.0
        correctness = "correct" if is_correct else "incorrect"

        feedback = "Correct! Great recall." if is_correct else f"Incorrect. The correct answer is '{question.answer}'."

        return {
            "question_id": question.id,
            "correctness": correctness,
            "score": score,
            "correct_answer": question.answer,
            "explanation": question.explanation or "See source notes for details.",
            "source_passage": source_passage or "",
            "feedback": feedback,
        }

    @classmethod
    def _evaluate_subjective(
        cls,
        question: Question,
        student_response: str,
        source_passage: Optional[str] = None,
    ) -> Dict[str, Any]:
        """Grades short answer using LLM rubric evaluation with partial credit."""
        prompt = f"""
You are an impartial academic grader evaluating a student's answer against a reference answer and study notes.

Question: {question.prompt}
Reference Answer: {question.answer}
Source Notes Context: {source_passage or question.explanation or ""}
Student's Response: {student_response}

Instructions:
1. Assign a score from 0.0 to 1.0 (with partial credit, e.g. 0.0, 0.25, 0.5, 0.75, 1.0).
2. Determine correctness: "correct" (score >= 0.75), "partially_correct" (0.4 <= score < 0.75), or "incorrect" (score < 0.4).
3. Provide 1-2 sentences of helpful feedback explaining what was correct and what concepts were missing.

Output MUST strictly be valid JSON matching this schema:
{{
  "score": 0.8,
  "correctness": "correct",
  "feedback": "Good explanation of the core concept, but missed mentioning the program counter."
}}
"""
        try:
            messages = [
                {"role": "system", "content": "You are an automated academic evaluator outputting strictly JSON."},
                {"role": "user", "content": prompt}
            ]
            eval_res = llm_client.generate_json(messages)
            if isinstance(eval_res, dict) and "score" in eval_res:
                score = float(eval_res.get("score", 0.0))
                correctness = eval_res.get("correctness", "partially_correct")
                feedback = eval_res.get("feedback", "Answer evaluated against source notes.")
                return {
                    "question_id": question.id,
                    "correctness": correctness,
                    "score": max(0.0, min(1.0, score)),
                    "correct_answer": question.answer,
                    "explanation": question.explanation or "See source notes for details.",
                    "source_passage": source_passage or "",
                    "feedback": feedback,
                }
        except Exception as e:
            logger.warning(f"LLM short-answer grading failed/skipped ({e}). Falling back to token overlap.")

        # Heuristic fallback: word overlap similarity
        def words(t: str):
            return set(re.findall(r"\w+", t.lower()))

        resp_words = words(student_response)
        target_words = words(question.answer)
        if not target_words or not resp_words:
            overlap = 0.0
        else:
            overlap = len(resp_words.intersection(target_words)) / len(target_words)

        if overlap >= 0.6:
            score = 1.0
            correctness = "correct"
            feedback = "Well explained! Covered key technical terms."
        elif overlap >= 0.3:
            score = 0.5
            correctness = "partially_correct"
            feedback = "Partially correct. Mentioned some relevant terms but incomplete."
        else:
            score = 0.0
            correctness = "incorrect"
            feedback = f"Incorrect or insufficient explanation. Reference: {question.answer[:120]}..."

        return {
            "question_id": question.id,
            "correctness": correctness,
            "score": score,
            "correct_answer": question.answer,
            "explanation": question.explanation or "See source notes for details.",
            "source_passage": source_passage or "",
            "feedback": feedback,
        }
