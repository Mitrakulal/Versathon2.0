import React, { useState, useEffect, useCallback } from 'react';
import { Sparkles, RotateCcw, CheckCircle2, Trophy, ArrowRight, ArrowLeft } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { flashcardsService } from '../services/flashcardsService';
import FlashcardItem from '../components/flashcards/FlashcardItem';
import RatingButtons from '../components/flashcards/RatingButtons';
import Button from '../components/common/Button';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';

export default function FlashcardsPage() {
  const { currentSpace, navigate, showToast } = useApp();
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [submittingRating, setSubmittingRating] = useState(false);
  const [sessionCompleted, setSessionCompleted] = useState(false);
  const [ratingsHistory, setRatingsHistory] = useState([]);

  const fetchCards = useCallback(async () => {
    if (!currentSpace) return;
    try {
      setLoading(true);
      const data = await flashcardsService.getDueCards(currentSpace.id);
      setCards(data || []);
      setCurrentIndex(0);
      setIsFlipped(false);
      setSessionCompleted(false);
      setRatingsHistory([]);
    } catch (err) {
      console.error('Failed to load flashcards', err);
    } finally {
      setLoading(false);
    }
  }, [currentSpace]);

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
      await flashcardsService.submitRating(currentCard.id, rating);
      setRatingsHistory((prev) => [...prev, { cardId: currentCard.id, rating }]);

      if (currentIndex + 1 < cards.length) {
        setIsFlipped(false);
        setCurrentIndex((prev) => prev + 1);
      } else {
        setSessionCompleted(true);
        showToast('Flashcard review session completed! SM-2 intervals updated.', 'success');
      }
    } catch (err) {
      showToast(err.detail || 'Failed to record rating.', 'error');
    } finally {
      setSubmittingRating(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Retrieving due flashcards for spaced repetition..." />;
  }

  if (cards.length === 0) {
    return (
      <EmptyState
        icon={Sparkles}
        title="No flashcards due right now!"
        description="All flashcards in this study space are up to date in your SM-2 spaced repetition schedule."
        actionText="Practice with a Quiz"
        onAction={() => navigate('quiz', currentSpace?.id)}
        actionIcon={CheckCircle2}
      />
    );
  }

  // Session Completed Summary
  if (sessionCompleted) {
    const easyCount = ratingsHistory.filter((r) => r.rating === 4).length;
    const goodCount = ratingsHistory.filter((r) => r.rating === 3).length;
    const hardCount = ratingsHistory.filter((r) => r.rating === 2).length;
    const againCount = ratingsHistory.filter((r) => r.rating === 1).length;

    return (
      <div className="glass-card" style={{ maxWidth: '640px', margin: '2rem auto', textAlign: 'center', padding: '3rem 2rem' }}>
        <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#34d399', margin: '0 auto 1.5rem auto' }}>
          <Trophy size={32} />
        </div>

        <h2 style={{ fontSize: '1.75rem', marginBottom: '0.5rem', fontWeight: 700 }}>
          Flashcard Session Complete!
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '2rem' }}>
          You reviewed {cards.length} cards. Next review dates have been scheduled according to the SM-2 algorithm.
        </p>

        {/* Rating Breakdown */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
          <div style={{ padding: '0.85rem', background: 'rgba(244, 63, 94, 0.1)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(244, 63, 94, 0.25)' }}>
            <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#fb7185' }}>{againCount}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Again</div>
          </div>
          <div style={{ padding: '0.85rem', background: 'rgba(245, 158, 11, 0.1)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(245, 158, 11, 0.25)' }}>
            <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#fbbf24' }}>{hardCount}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Hard</div>
          </div>
          <div style={{ padding: '0.85rem', background: 'rgba(99, 102, 241, 0.1)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(99, 102, 241, 0.25)' }}>
            <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#818cf8' }}>{goodCount}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Good</div>
          </div>
          <div style={{ padding: '0.85rem', background: 'rgba(16, 185, 129, 0.1)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(16, 185, 129, 0.25)' }}>
            <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#34d399' }}>{easyCount}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Easy</div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
          <Button variant="secondary" icon={RotateCcw} onClick={fetchCards}>
            Review Again
          </Button>
          <Button variant="primary" icon={CheckCircle2} onClick={() => navigate('quiz', currentSpace?.id)}>
            Take Practice Quiz
          </Button>
        </div>
      </div>
    );
  }

  const currentCard = cards[currentIndex];
  const progressPercent = ((currentIndex + 1) / cards.length) * 100;

  return (
    <div style={{ maxWidth: '820px', margin: '0 auto' }}>
      {/* Header with Progress Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span className="badge badge-primary">
            Card {currentIndex + 1} of {cards.length}
          </span>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            {currentSpace?.title}
          </span>
        </div>

        <button
          className="btn btn-ghost btn-sm"
          onClick={() => setIsFlipped((prev) => !prev)}
          style={{ fontSize: '0.82rem' }}
        >
          {isFlipped ? 'Show Front' : 'Show Answer'}
        </button>
      </div>

      {/* Progress Track */}
      <div style={{ width: '100%', height: '6px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: 'var(--radius-full)', overflow: 'hidden', marginBottom: '2rem' }}>
        <div
          style={{
            height: '100%',
            width: `${progressPercent}%`,
            background: 'var(--gradient-brand)',
            borderRadius: 'var(--radius-full)',
            transition: 'width 300ms ease',
          }}
        />
      </div>

      {/* 3D Flipping Flashcard */}
      <FlashcardItem
        card={currentCard}
        isFlipped={isFlipped}
        onFlip={() => setIsFlipped((prev) => !prev)}
      />

      {/* Rating Buttons (Shown on Back Face or when flipped) */}
      {isFlipped ? (
        <RatingButtons onRate={handleRate} disabled={submittingRating} />
      ) : (
        <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
          <Button
            variant="secondary"
            onClick={() => setIsFlipped(true)}
            id="flip-flashcard-btn"
          >
            Reveal Answer & Self-Rate
          </Button>
        </div>
      )}
    </div>
  );
}
