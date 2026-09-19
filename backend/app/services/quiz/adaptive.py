import random
from datetime import datetime, timezone
from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.models.entities import Question, Topic, TopicMastery, ReviewState


class AdaptiveSampler:
    """Samples questions based on selected quiz mode, topic filters, and student mastery."""

    @classmethod
    def sample_questions(
        cls,
        space_id: str,
        mode: str,
        topic_ids: Optional[List[str]],
        count: int,
        user_id: str,
        db: Session,
    ) -> List[Question]:
        # Exclude flagged questions
        base_query = (
            db.query(Question)
            .join(Topic, Question.topic_id == Topic.id)
            .filter(Topic.space_id == space_id, Question.is_flagged == False)
        )

        # 1. Topic Quiz Mode
        if mode == "topic_quiz" and topic_ids:
            # Include child subtopics
            subtopics = db.query(Topic.id).filter(Topic.parent_id.in_(topic_ids)).all()
            all_target_ids = list(set(topic_ids + [s[0] for s in subtopics]))
            candidates = base_query.filter(Question.topic_id.in_(all_target_ids)).all()
            random.shuffle(candidates)
            return candidates[:count]

        # 2. Daily Revision Mode (SM-2 Due Queue)
        if mode == "daily_revision":
            now = datetime.now(timezone.utc)
            # Find questions due for review
            due_ids = (
                db.query(ReviewState.question_id)
                .filter(ReviewState.user_id == user_id, ReviewState.next_due_at <= now)
                .all()
            )
            due_id_set = [d[0] for d in due_ids]
            due_questions = base_query.filter(Question.id.in_(due_id_set)).all()
            
            # Fill with unreviewed questions if fewer than requested
            if len(due_questions) < count:
                reviewed_ids = [
                    r[0] for r in db.query(ReviewState.question_id).filter(ReviewState.user_id == user_id).all()
                ]
                unreviewed = base_query.filter(Question.id.notin_(reviewed_ids)).all()
                random.shuffle(unreviewed)
                due_questions.extend(unreviewed[: (count - len(due_questions))])
            
            random.shuffle(due_questions)
            return due_questions[:count]

        # 3. Adaptive Mode (50% Weak, 30% Developing, 20% Strong)
        if mode == "adaptive":
            masteries = db.query(TopicMastery).filter(TopicMastery.user_id == user_id).all()
            if masteries:
                weak_topics = [m.topic_id for m in masteries if m.mastery < 0.50]
                dev_topics = [m.topic_id for m in masteries if 0.50 <= m.mastery <= 0.75]
                strong_topics = [m.topic_id for m in masteries if m.mastery > 0.75]

                weak_count = max(1, int(count * 0.50))
                dev_count = max(1, int(count * 0.30))
                strong_count = max(1, count - weak_count - dev_count)

                sampled = []
                if weak_topics:
                    weak_q = base_query.filter(Question.topic_id.in_(weak_topics)).all()
                    random.shuffle(weak_q)
                    sampled.extend(weak_q[:weak_count])

                if dev_topics:
                    dev_q = base_query.filter(Question.topic_id.in_(dev_topics)).all()
                    random.shuffle(dev_q)
                    sampled.extend(dev_q[:dev_count])

                if strong_topics:
                    strong_q = base_query.filter(Question.topic_id.in_(strong_topics)).all()
                    random.shuffle(strong_q)
                    sampled.extend(strong_q[:strong_count])

                # If not enough adaptive questions, fill with random space questions
                if len(sampled) < count:
                    existing_ids = [q.id for q in sampled]
                    remaining = base_query.filter(Question.id.notin_(existing_ids)).all()
                    random.shuffle(remaining)
                    sampled.extend(remaining[: (count - len(sampled))])

                random.shuffle(sampled)
                return sampled[:count]

        # 4. Mixed Quiz Mode (Default balanced sample)
        all_questions = base_query.all()
        random.shuffle(all_questions)
        return all_questions[:count]
