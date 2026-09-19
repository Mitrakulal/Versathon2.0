from datetime import datetime, timezone, timedelta
from typing import Dict, Any


class SM2Scheduler:
    """Implements the SuperMemo-2 (SM-2) spaced repetition algorithm."""

    MIN_EASE_FACTOR: float = 1.3
    DEFAULT_EASE_FACTOR: float = 2.5

    @classmethod
    def calculate_next_review(
        cls,
        rating: int,  # 1: Again, 2: Hard, 3: Good, 4: Easy
        current_ease_factor: float = 2.5,
        current_interval_days: int = 1,
        current_repetitions: int = 0,
    ) -> Dict[str, Any]:
        """Calculates updated ease factor, interval, and next due timestamp."""
        # Map user rating 1-4 to SM-2 quality scale 0-5
        quality_map = {
            1: 1,  # Again (failed recall)
            2: 3,  # Hard (recalled with serious difficulty)
            3: 4,  # Good (correct with minor hesitation)
            4: 5,  # Easy (effortless, instant recall)
        }
        q = quality_map.get(rating, 3)

        # Calculate new ease factor
        # EF' = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
        new_ef = current_ease_factor + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
        new_ef = max(cls.MIN_EASE_FACTOR, round(new_ef, 2))

        # Calculate new interval and repetitions
        if q < 3:
            # Failed recall: reset repetitions and interval
            new_repetitions = 0
            new_interval_days = 1
        else:
            # Successful recall
            if current_repetitions == 0:
                new_interval_days = 1
            elif current_repetitions == 1:
                new_interval_days = 6
            else:
                new_interval_days = max(1, round(current_interval_days * new_ef))
            new_repetitions = current_repetitions + 1

        next_due = datetime.now(timezone.utc) + timedelta(days=new_interval_days)

        return {
            "ease_factor": new_ef,
            "interval_days": new_interval_days,
            "repetitions": new_repetitions,
            "next_due_at": next_due,
        }
