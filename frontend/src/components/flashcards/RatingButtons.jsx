import React, { useEffect } from 'react';
import { RotateCcw, AlertCircle, ThumbsUp, Zap } from 'lucide-react';

export default function RatingButtons({ onRate, disabled, submittingRating }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (disabled || submittingRating) return;
      if (e.key === '1') onRate(1);
      if (e.key === '2') onRate(2);
      if (e.key === '3') onRate(3);
      if (e.key === '4') onRate(4);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onRate, disabled, submittingRating]);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '0.75rem',
        marginTop: '1.5rem',
        width: '100%',
        maxWidth: '680px',
        margin: '1.5rem auto 0 auto',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%',
          fontSize: '0.84rem',
          color: '#64748b',
          fontWeight: 500,
          padding: '0 0.25rem',
        }}
      >
        <span>Rate your active recall difficulty:</span>
        <span style={{ fontSize: '0.76rem', color: '#94a3b8' }}>
          Keyboard shortcuts: <strong style={{ color: '#475569' }}>1, 2, 3, 4</strong>
        </span>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '0.75rem',
          width: '100%',
        }}
      >
        {/* Rating 1: Again */}
        <button
          className="btn btn-danger"
          disabled={disabled || submittingRating}
          onClick={() => onRate(1)}
          style={{
            flexDirection: 'column',
            padding: '0.85rem 0.5rem',
            gap: '0.3rem',
            borderRadius: 'var(--radius-lg)',
            position: 'relative',
            transition: 'all 0.15s ease',
          }}
          id="flashcard-rate-again"
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <RotateCcw size={15} />
            <span style={{ fontWeight: 700 }}>Again</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <span
              style={{
                fontSize: '0.68rem',
                background: 'rgba(255, 255, 255, 0.25)',
                padding: '0.1rem 0.35rem',
                borderRadius: '4px',
                fontWeight: 700,
              }}
            >
              [1]
            </span>
            <span style={{ fontSize: '0.72rem', opacity: 0.9 }}>&lt; 1 day</span>
          </div>
        </button>

        {/* Rating 2: Hard */}
        <button
          className="btn"
          disabled={disabled || submittingRating}
          onClick={() => onRate(2)}
          style={{
            flexDirection: 'column',
            padding: '0.85rem 0.5rem',
            gap: '0.3rem',
            borderRadius: 'var(--radius-lg)',
            background: '#fffbeb',
            color: '#b45309',
            border: '1px solid #fde68a',
            position: 'relative',
            transition: 'all 0.15s ease',
          }}
          id="flashcard-rate-hard"
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <AlertCircle size={15} />
            <span style={{ fontWeight: 700 }}>Hard</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <span
              style={{
                fontSize: '0.68rem',
                background: '#fef3c7',
                border: '1px solid #fcd34d',
                padding: '0.1rem 0.35rem',
                borderRadius: '4px',
                fontWeight: 700,
              }}
            >
              [2]
            </span>
            <span style={{ fontSize: '0.72rem', opacity: 0.9 }}>1 - 2 days</span>
          </div>
        </button>

        {/* Rating 3: Good */}
        <button
          className="btn"
          disabled={disabled || submittingRating}
          onClick={() => onRate(3)}
          style={{
            flexDirection: 'column',
            padding: '0.85rem 0.5rem',
            gap: '0.3rem',
            borderRadius: 'var(--radius-lg)',
            background: '#eff6ff',
            color: '#1d4ed8',
            border: '1px solid #bfdbfe',
            position: 'relative',
            transition: 'all 0.15s ease',
          }}
          id="flashcard-rate-good"
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <ThumbsUp size={15} />
            <span style={{ fontWeight: 700 }}>Good</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <span
              style={{
                fontSize: '0.68rem',
                background: '#dbeafe',
                border: '1px solid #93c5fd',
                padding: '0.1rem 0.35rem',
                borderRadius: '4px',
                fontWeight: 700,
              }}
            >
              [3]
            </span>
            <span style={{ fontSize: '0.72rem', opacity: 0.9 }}>4 - 6 days</span>
          </div>
        </button>

        {/* Rating 4: Easy */}
        <button
          className="btn btn-success"
          disabled={disabled || submittingRating}
          onClick={() => onRate(4)}
          style={{
            flexDirection: 'column',
            padding: '0.85rem 0.5rem',
            gap: '0.3rem',
            borderRadius: 'var(--radius-lg)',
            position: 'relative',
            transition: 'all 0.15s ease',
          }}
          id="flashcard-rate-easy"
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <Zap size={15} />
            <span style={{ fontWeight: 700 }}>Easy</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <span
              style={{
                fontSize: '0.68rem',
                background: 'rgba(255, 255, 255, 0.25)',
                padding: '0.1rem 0.35rem',
                borderRadius: '4px',
                fontWeight: 700,
              }}
            >
              [4]
            </span>
            <span style={{ fontSize: '0.72rem', opacity: 0.9 }}>7+ days</span>
          </div>
        </button>
      </div>
    </div>
  );
}
