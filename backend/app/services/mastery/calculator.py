from datetime import datetime, timezone, timedelta
from typing import List, Tuple, Optional
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.models.entities import (
    StudySpace,
    Topic,
    Question,
    Attempt,
    QuizSession,
    ReviewState,
    TopicMastery,
)
from app.schemas.mastery import (
    TopicMasteryItem,
    ReviseRecommendation,
    DashboardResponse,
    MasteryLabel,
)


def classify_mastery(mastery: float) -> MasteryLabel:
    """Classify mastery score into weak, developing, or strong tier."""
    if mastery < 0.50:
        return "weak"
    elif mastery <= 0.75:
        return "developing"
    else:
        return "strong"


def calculate_recency_weighted_score(scores: List[float]) -> float:
    """
    Calculate recency-weighted average of scores (each in [0.0, 1.0]).
    Scores are expected in chronological order: index 0 is oldest, index N-1 is newest.
    Weight formula: w_i = 1.0 + 0.3 * i, normalized by sum of weights.
    """
    if not scores:
        return 0.0

    n = len(scores)
    weights = [1.0 + 0.3 * i for i in range(n)]
    weighted_sum = sum(s * w for s, w in zip(scores, weights))
    total_weight = sum(weights)

    val = weighted_sum / total_weight
    # Clamp to [0.0, 1.0] and round to 2 decimal places
    return round(min(max(val, 0.0), 1.0), 2)


def compute_topic_masteries(
    db: Session,
    space_id: str,
    user_id: str = "default-user",
) -> List[TopicMasteryItem]:
    """Compute and persist recency-weighted mastery for all topics in a space."""
    topics = db.query(Topic).filter(Topic.space_id == space_id).order_by(Topic.order_index.asc()).all()
    now_utc = datetime.now(timezone.utc)
    results: List[TopicMasteryItem] = []

    for topic in topics:
        # Collect question IDs for this topic
        question_ids = [
            q.id for q in db.query(Question.id).filter(Question.topic_id == topic.id).all()
        ]

        if not question_ids:
            # Topic has no questions generated yet
            results.append(
                TopicMasteryItem(
                    topic_id=topic.id,
                    topic_name=topic.name,
                    mastery=0.0,
                    label="weak",
                    attempts_count=0,
                    last_practiced_at=None,
                )
            )
            continue

        # Fetch all user attempts for these questions ordered chronologically
        attempts = (
            db.query(Attempt, QuizSession.completed_at, QuizSession.started_at)
            .join(QuizSession, Attempt.session_id == QuizSession.id)
            .filter(
                Attempt.question_id.in_(question_ids),
                QuizSession.user_id == user_id,
            )
            .order_by(QuizSession.started_at.asc(), Attempt.id.asc())
            .all()
        )

        attempts_count = len(attempts)
        if attempts_count == 0:
            mastery = 0.0
            last_practiced_at = None
        else:
            scores = [att.score for att, _, _ in attempts]
            mastery = calculate_recency_weighted_score(scores)
            # Find latest timestamp
            last_practiced_at = max(
                (comp or start) for _, comp, start in attempts if (comp or start)
            )

        label = classify_mastery(mastery)

        # Upsert or update TopicMastery row in DB for persistence
        tm_record = (
            db.query(TopicMastery)
            .filter(TopicMastery.topic_id == topic.id, TopicMastery.user_id == user_id)
            .first()
        )
        if not tm_record:
            tm_record = TopicMastery(
                user_id=user_id,
                topic_id=topic.id,
                mastery=mastery,
                attempts_count=attempts_count,
                last_practiced_at=last_practiced_at,
            )
            db.add(tm_record)
        else:
            tm_record.mastery = mastery
            tm_record.attempts_count = attempts_count
            tm_record.last_practiced_at = last_practiced_at

        results.append(
            TopicMasteryItem(
                topic_id=topic.id,
                topic_name=topic.name,
                mastery=mastery,
                label=label,
                attempts_count=attempts_count,
                last_practiced_at=last_practiced_at,
            )
        )

    db.commit()
    return results


def calculate_study_streak(db: Session, user_id: str = "default-user") -> int:
    """
    Calculate current consecutive days of study ending today or yesterday.
    Considers completed/started quiz sessions.
    """
    sessions = (
        db.query(QuizSession.started_at, QuizSession.completed_at)
        .filter(QuizSession.user_id == user_id)
        .all()
    )

    if not sessions:
        return 0

    active_dates = set()
    for start, comp in sessions:
        dt = comp or start
        if dt:
            active_dates.add(dt.date())

    if not active_dates:
        return 0

    today = datetime.now(timezone.utc).date()
    yesterday = today - timedelta(days=1)

    # Streak is active if user studied today or yesterday
    if today in active_dates:
        current_date = today
    elif yesterday in active_dates:
        current_date = yesterday
    else:
        return 0

    streak = 0
    while current_date in active_dates:
        streak += 1
        current_date -= timedelta(days=1)

    return streak


def generate_revise_recommendations(
    db: Session,
    space_id: str,
    topic_items: List[TopicMasteryItem],
    user_id: str = "default-user",
    limit: int = 5,
) -> List[ReviseRecommendation]:
    """Generate prioritized actionable revision suggestions for the student."""
    now_utc = datetime.now(timezone.utc)
    recommendations: List[Tuple[float, ReviseRecommendation]] = []

    for t in topic_items:
        # Check due flashcards count for this topic
        topic_due_count = (
            db.query(ReviewState)
            .join(Question, ReviewState.question_id == Question.id)
            .filter(
                Question.topic_id == t.topic_id,
                ReviewState.user_id == user_id,
                ReviewState.next_due_at <= now_utc,
            )
            .count()
        )

        priority_score = 0.0  # Lower score = higher priority in queue
        reason = ""
        action = ""

        if t.attempts_count == 0:
            priority_score = 0.1
            reason = f"No practice attempts recorded yet for '{t.topic_name}'."
            action = f"Take a 5-question intro quiz to establish your baseline."
        elif t.mastery < 0.50:
            priority_score = 0.0 + t.mastery
            if topic_due_count > 0:
                reason = f"Accuracy below 50% ({int(t.mastery * 100)}%) with {topic_due_count} flashcards overdue."
                action = f"Review {topic_due_count} due flashcards and take a targeted quiz."
            else:
                reason = f"Accuracy below 50% ({int(t.mastery * 100)}%) on recent practice questions."
                action = f"Take a 5-question targeted quiz to master key concepts."
        elif topic_due_count > 0:
            priority_score = 0.4
            reason = f"{topic_due_count} flashcard{'s are' if topic_due_count > 1 else ' is'} due for spaced repetition."
            action = f"Review {topic_due_count} due flashcards to retain what you learned."
        elif t.mastery <= 0.75:
            priority_score = 0.5 + t.mastery
            reason = f"Mastery is developing ({int(t.mastery * 100)}%). A quick refresher will solidify retention."
            action = f"Take a 3-question booster quiz."
        else:
            # Strong mastery, lowest priority for revision
            priority_score = 1.0 + t.mastery
            reason = f"Strong mastery ({int(t.mastery * 100)}%). Ready for periodic maintenance."
            action = f"Review high-difficulty questions to stay sharp."

        rec = ReviseRecommendation(
            topic_id=t.topic_id,
            topic_name=t.topic_name,
            mastery=t.mastery,
            reason=reason,
            recommended_action=action,
        )
        recommendations.append((priority_score, rec))

    # Sort by priority score (ascending = most urgent first)
    recommendations.sort(key=lambda x: x[0])
    return [rec for _, rec in recommendations[:limit]]


def compute_space_dashboard(
    db: Session,
    space_id: str,
    user_id: str = "default-user",
) -> DashboardResponse:
    """Aggregate space-wide analytics, mastery breakdown, streak, and revision recommendations."""
    space = db.query(StudySpace).filter(StudySpace.id == space_id).first()
    if not space:
        return None

    # Per-topic mastery list
    topic_items = compute_topic_masteries(db, space_id, user_id)

    # Overall space mastery (mean of topic masteries if topics exist, else 0.0)
    if topic_items:
        overall_mastery = round(sum(t.mastery for t in topic_items) / len(topic_items), 2)
    else:
        overall_mastery = 0.0

    # Total practice attempts across all questions in space
    total_attempts = (
        db.query(Attempt)
        .join(QuizSession, Attempt.session_id == QuizSession.id)
        .filter(
            QuizSession.space_id == space_id,
            QuizSession.user_id == user_id,
        )
        .count()
    )

    # Study streak (days)
    streak_days = calculate_study_streak(db, user_id)

    # Due today count (scheduled flashcards due now + unreviewed flashcards)
    now_utc = datetime.now(timezone.utc)
    scheduled_due_count = (
        db.query(ReviewState)
        .join(Question, ReviewState.question_id == Question.id)
        .join(Topic, Question.topic_id == Topic.id)
        .filter(
            Topic.space_id == space_id,
            ReviewState.user_id == user_id,
            ReviewState.next_due_at <= now_utc,
        )
        .count()
    )
    reviewed_q_ids = [
        r[0] for r in db.query(ReviewState.question_id).filter(ReviewState.user_id == user_id).all()
    ]
    unreviewed_flashcard_count = (
        db.query(Question)
        .join(Topic, Question.topic_id == Topic.id)
        .filter(
            Topic.space_id == space_id,
            Question.type == "flashcard",
            Question.id.notin_(reviewed_q_ids) if reviewed_q_ids else True,
            Question.is_flagged == False,
        )
        .count()
    )
    due_today_count = scheduled_due_count + unreviewed_flashcard_count

    # Revise next recommendations
    revise_next = generate_revise_recommendations(db, space_id, topic_items, user_id)

    return DashboardResponse(
        space_id=space.id,
        overall_mastery=overall_mastery,
        total_attempts=total_attempts,
        study_streak_days=streak_days,
        topics=topic_items,
        revise_next=revise_next,
        due_today_count=due_today_count,
    )
