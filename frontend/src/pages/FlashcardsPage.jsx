import React, { useState, useEffect, useCallback } from 'react';
import {
  Sparkles,
  RotateCcw,
  CheckCircle2,
  Trophy,
  ArrowRight,
  ArrowLeft,
  Plus,
  Layers,
  Calendar,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { flashcardsService } from '../services/flashcardsService';
import { topicsService } from '../services/topicsService';
import FlashcardItem from '../components/flashcards/FlashcardItem';
import RatingButtons from '../components/flashcards/RatingButtons';
import GenerateQuestionsModal from '../components/quiz/GenerateQuestionsModal';
import Button from '../components/common/Button';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';

export default function FlashcardsPage() {
  const { currentSpace, navigate, showToast } = useApp();
  const [cards, setCards] = useState([]);
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [submittingRating, setSubmittingRating] = useState(false);
  const [sessionCompleted, setSessionCompleted] = useState(false);
  const [ratingsHistory, setRatingsHistory] = useState([]);
  const [lastSm2Feedback, setLastSm2Feedback] = useState(null);
  const [generateModalOpen, setGenerateModalOpen] = useState(false);

  // Fetch topics to resolve topic_id -> topic_name
  useEffect(() => {
    if (!currentSpace?.id) return;
    topicsService.getTopicTree(currentSpace.id)
      .then((tree) => setTopics(tree || []))
      .catch((err) => console.error('Error fetching topics for flashcards', err));
  }, [currentSpace?.id]);

  // Topic lookup map
  const topicMap = {};
  topics.forEach((t) => {
    topicMap[t.id] = t.name;
    (t.subtopics || []).forEach((st) => {
      topicMap[st.id] = st.name;
    });
  });

  const fetchCards = useCallback(async () => {
    if (!currentSpace?.id) return;
    try {
      setLoading(true);
      const data = await flashcardsService.getDueCards(currentSpace.id);
      setCards(data || []);
      setCurrentIndex(0);
      setIsFlipped(false);
      setSessionCompleted(false);
      setRatingsHistory([]);
      setLastSm2Feedback(null);
    } catch (err) {
      console.error('Failed to load flashcards', err);
    } finally {
      setLoading(false);
    }
  }, [currentSpace?.id]);

  useEffect(() => {
    fetchCards();
  }, [fetchCards]);

  // Spacebar flips card
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === 'Space' && !sessionCompleted && cards.length > 0) {
        e.preventDefault();
        setIsFlipped((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [sessionCompleted, cards.length]);

  const handleRate = async (rating) => {
    const currentCard = cards[currentIndex];
    if (!currentCard) return;

    try {
      setSubmittingRating(true);
      const sm2Response = await flashcardsService.submitRating(currentCard.id, rating);
      
      if (sm2Response) {
        setLastSm2Feedback(sm2Response);
      }

      setRatingsHistory((prev) => [
        ...prev,
        { cardId: currentCard.id, rating, sm2: sm2Response },
      ]);

      if (currentIndex + 1 < cards.length) {
        setIsFlipped(false);
        setCurrentIndex((prev) => prev + 1);
      } else {
        setSessionCompleted(true);
        showToast('Flashcard review completed! SM-2 intervals updated.', 'success');
      }
    } catch (err) {
      showToast(err.detail || 'Failed to record rating.', 'error');
    } finally {
      setSubmittingRating(false);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setIsFlipped(false);
      setCurrentIndex((prev) => prev - 1);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Retrieving due flashcards for spaced repetition..." />;
  }

  // Empty State
  if (cards.length === 0) {
    return (
      <div style={{ maxWidth: '680px', margin: '2rem auto' }}>
        <EmptyState
          icon={Sparkles}
          title="No flashcards due right now!"
          description="All flashcards in this study space are up to date in your SM-2 spaced repetition schedule. You can generate new cards from your notes or take a practice quiz."
          actionText="+ Generate Flashcards"
          onAction={() => setGenerateModalOpen(true)}
        />

        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '1rem' }}>
          <Button
            variant="ghost"
            icon={CheckCircle2}
            onClick={() => navigate('quiz', currentSpace?.id)}
            style={{ color: '#2563eb' }}
          >
            Or Practice with a Quiz
          </Button>
        </div>

        <GenerateQuestionsModal
          isOpen={generateModalOpen}
          onClose={() => setGenerateModalOpen(false)}
          spaceId={currentSpace?.id}
          topics={topics}
          onSuccess={fetchCards}
        />
      </div>
    );
  }

  // Session Completed Summary
  if (sessionCompleted) {
    const easyCount = ratingsHistory.filter((r) => r.rating === 4).length;
    const goodCount = ratingsHistory.filter((r) => r.rating === 3).length;
    const hardCount = ratingsHistory.filter((r) => r.rating === 2).length;
    const againCount = ratingsHistory.filter((r) => r.rating === 1).length;

    return (
      <div
        className="glass-card"
        style={{
          maxWidth: '640px',
          margin: '2rem auto',
          textAlign: 'center',
          padding: '3rem 2rem',
          borderRadius: 'var(--radius-xl)',
          background: '#ffffff',
          border: '1px solid #e2e8f0',
        }}
      >
        <div
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: '#ecfdf5',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#10b981',
            margin: '0 auto 1.5rem auto',
          }}
        >
          <Trophy size={32} />
        </div>

        <h2 style={{ fontSize: '1.75rem', marginBottom: '0.5rem', fontWeight: 700, color: '#0f172a' }}>
          Flashcard Review Complete!
        </h2>
        <p style={{ color: '#64748b', fontSize: '0.95rem', marginBottom: '2rem', lineHeight: 1.5 }}>
          You completed all {cards.length} cards in this deck. Review dates have been saved and scheduled into the future using the SM-2 algorithm.
        </p>

        {/* Rating Breakdown Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.85rem', marginBottom: '2.5rem' }}>
          <div style={{ padding: '0.85rem', background: '#fef2f2', borderRadius: 'var(--radius-md)', border: '1px solid #fecaca' }}>
            <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#ef4444' }}>{againCount}</div>
            <div style={{ fontSize: '0.78rem', color: '#991b1b', fontWeight: 600 }}>Again (&lt; 1d)</div>
          </div>
          <div style={{ padding: '0.85rem', background: '#fffbeb', borderRadius: 'var(--radius-md)', border: '1px solid #fde68a' }}>
            <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#f59e0b' }}>{hardCount}</div>
            <div style={{ fontSize: '0.78rem', color: '#92400e', fontWeight: 600 }}>Hard (1-2d)</div>
          </div>
          <div style={{ padding: '0.85rem', background: '#eff6ff', borderRadius: 'var(--radius-md)', border: '1px solid #bfdbfe' }}>
            <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#2563eb' }}>{goodCount}</div>
            <div style={{ fontSize: '0.78rem', color: '#1e40af', fontWeight: 600 }}>Good (4-6d)</div>
          </div>
          <div style={{ padding: '0.85rem', background: '#ecfdf5', borderRadius: 'var(--radius-md)', border: '1px solid #a7f3d0' }}>
            <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#10b981' }}>{easyCount}</div>
            <div style={{ fontSize: '0.78rem', color: '#065f46', fontWeight: 600 }}>Easy (7+d)</div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <Button variant="outline" icon={RotateCcw} onClick={fetchCards} style={{ borderRadius: 'var(--radius-full)' }}>
            Review Deck Again
          </Button>
          <Button
            variant="primary"
            icon={CheckCircle2}
            onClick={() => navigate('quiz', currentSpace?.id)}
            style={{ borderRadius: 'var(--radius-full)' }}
          >
            Take Practice Quiz
          </Button>
        </div>
      </div>
    );
  }

  const currentCard = cards[currentIndex];
  const progressPercent = Math.round(((currentIndex + 1) / cards.length) * 100);
  const currentTopicName = topicMap[currentCard?.topic_id] || 'General';

  return (
    <div style={{ maxWidth: '720px', margin: '0 auto', paddingBottom: '2rem' }}>
      {/* Top Deck Progress Header */}
      <div
        className="glass-card"
        style={{
          padding: '1.25rem 1.5rem',
          marginBottom: '1.5rem',
          background: '#ffffff',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid #e2e8f0',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              disabled={currentIndex === 0}
              onClick={handlePrevious}
              style={{
                color: currentIndex === 0 ? '#cbd5e1' : '#2563eb',
                padding: '0.25rem 0.5rem',
                gap: '0.3rem',
                fontSize: '0.8rem',
              }}
              title="Return to previous card"
            >
              <ArrowLeft size={14} />
              <span>Previous</span>
            </button>
            <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0f172a' }}>
              Card {currentIndex + 1} of {cards.length}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={() => setGenerateModalOpen(true)}
              style={{ color: '#2563eb', fontSize: '0.8rem', gap: '0.35rem', fontWeight: 600 }}
            >
              <Plus size={14} />
              <span>Add Cards</span>
            </button>
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#64748b' }}>
              {progressPercent}% Complete
            </span>
          </div>
        </div>

        {/* Progress bar line */}
        <div style={{ width: '100%', height: '6px', background: '#f1f5f9', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
          <div
            style={{
              width: `${progressPercent}%`,
              height: '100%',
              background: 'linear-gradient(90deg, #2563eb, #3b82f6)',
              borderRadius: 'var(--radius-full)',
              transition: 'width 0.3s ease',
            }}
          />
        </div>
      </div>

      {/* 3D Flashcard Stage */}
      {currentCard && (
        <FlashcardItem
          card={currentCard}
          isFlipped={isFlipped}
          onFlip={() => setIsFlipped((prev) => !prev)}
          topicName={currentTopicName}
        />
      )}

      {/* SM-2 Recall Rating Controls */}
      <RatingButtons
        onRate={handleRate}
        disabled={!isFlipped}
        submittingRating={submittingRating}
      />

      {/* SM-2 Real-Time Feedback Pill */}
      {lastSm2Feedback && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            marginTop: '1rem',
            fontSize: '0.8rem',
            color: '#059669',
            background: '#ecfdf5',
            padding: '0.4rem 1rem',
            borderRadius: 'var(--radius-full)',
            width: 'fit-content',
            margin: '1rem auto 0 auto',
            border: '1px solid #a7f3d0',
          }}
        >
          <Calendar size={13} />
          <span>
            Previous card scheduled for review in <strong>{lastSm2Feedback.interval_days} day{lastSm2Feedback.interval_days > 1 ? 's' : ''}</strong> (Ease: {lastSm2Feedback.ease_factor})
          </span>
        </div>
      )}

      {/* Generate Questions Modal */}
      <GenerateQuestionsModal
        isOpen={generateModalOpen}
        onClose={() => setGenerateModalOpen(false)}
        spaceId={currentSpace?.id}
        topics={topics}
        onSuccess={fetchCards}
      />
    </div>
  );
}
