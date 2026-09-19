import re
from typing import Dict, Any, List, Optional
import logging

logger = logging.getLogger("noterecall.verifier")


class QuestionVerifier:
    """Validates, cleans, and deduplicates generated questions."""

    @staticmethod
    def validate_and_clean(q: Dict[str, Any], fallback_chunk_id: Optional[str] = None) -> Optional[Dict[str, Any]]:
        """Ensures question conforms to all schema requirements and quality constraints."""
        q_type = q.get("type", "").lower()
        if q_type not in ["flashcard", "mcq", "fill_blank", "short_answer", "true_false"]:
            q_type = "flashcard"
        q["type"] = q_type

        prompt = q.get("prompt", "").strip()
        answer = q.get("answer", "").strip()
        if not prompt or not answer:
            return None

        # Clean MCQ options
        if q_type == "mcq":
            raw_options = q.get("options") or []
            options = [str(opt).strip() for opt in raw_options if str(opt).strip()]
            
            # Ensure answer is in options
            if answer not in options:
                options.append(answer)

            # Ensure exactly 4 options by generating default fillers if needed
            options = list(dict.fromkeys(options))  # Deduplicate
            fillers = ["None of the mentioned", "All of the mentioned", "Cannot be determined", "Both A and B"]
            for filler in fillers:
                if len(options) >= 4:
                    break
                if filler not in options:
                    options.append(filler)

            q["options"] = options[:4]
        else:
            q["options"] = None

        # Difficulty & Cognitive levels
        diff = q.get("difficulty", "medium").lower()
        if diff not in ["easy", "medium", "hard"]:
            diff = "medium"
        q["difficulty"] = diff

        cog = q.get("cognitive_level", "recall").lower()
        if cog not in ["recall", "understanding", "application"]:
            cog = "recall"
        q["cognitive_level"] = cog

        # Ensure source chunk IDs
        source_chunk_ids = q.get("source_chunk_ids") or []
        if isinstance(source_chunk_ids, str):
            source_chunk_ids = [source_chunk_ids]
        if not source_chunk_ids and fallback_chunk_id:
            source_chunk_ids = [fallback_chunk_id]
        q["source_chunk_ids"] = source_chunk_ids

        # Explanation
        if not q.get("explanation"):
            q["explanation"] = f"Correct answer is '{answer}' based on the source notes."

        return q

    @staticmethod
    def is_duplicate(prompt: str, existing_prompts: List[str], threshold: float = 0.85) -> bool:
        """Simple token-overlap Jaccard similarity check to detect near-duplicates."""
        def tokenize(text: str):
            return set(re.findall(r"\w+", text.lower()))

        words_a = tokenize(prompt)
        if not words_a:
            return False

        for existing in existing_prompts:
            words_b = tokenize(existing)
            if not words_b:
                continue
            intersection = len(words_a.intersection(words_b))
            union = len(words_a.union(words_b))
            if union > 0 and (intersection / union) >= threshold:
                return True
        return False
