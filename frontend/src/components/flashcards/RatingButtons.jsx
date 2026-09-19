import React, { useEffect } from 'react';
import { RotateCcw, AlertCircle, ThumbsUp, Zap } from 'lucide-react';

export default function RatingButtons({ onRate, disabled }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (disabled) return;
      if (e.key === '1') onRate(1);
      if (e.key === '2') onRate(2);
      if (e.key === '3') onRate(3);
      if (e.key === '4') onRate(4);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onRate, disabled]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem', marginTop: '1.5rem', width: '100%', maxWidth: '680px', margin: '1.5rem auto 0 auto' }}>
      <div style={{ fontSize: '0.84rem', color: '#64748b', fontWeight: 500 }}>
        How well did you recall this concept? (Shortcut keys: 1, 2, 3, 4)
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.85rem', width: '100%' }}>
        {/* Rating 1: Again */}
        <button
          className="btn btn-danger"
          disabled={disabled}
          onClick={() => onRate(1)}
          style={{ flexDirection: 'column', padding: '0.85rem 0.5rem', gap: '0.35rem', borderRadius: 'var(--radius-lg)' }}
          id="flashcard-rate-again"
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <RotateCcw size={15} />
            <span style={{ fontWeight: 700 }}>Again</span>
          </div>
          <span style={{ fontSize: '0.72rem', opacity: 0.85 }}>&lt; 1 day</span>
        </button>

        {/* Rating 2: Hard */}
        <button
          className="btn"
          disabled={disabled}
          onClick={() => onRate(2)}
          style={{
            flexDirection: 'column',
            padding: '0.85rem 0.5rem',
            gap: '0.35rem',
            borderRadius: 'var(--radius-lg)',
            background: '#fffbeb',
            color: '#d97706',
            border: '1px solid #fde68a',
          }}
          id="flashcard-rate-hard"
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <AlertCircle size={15} />
            <span style={{ fontWeight: 700 }}>Hard</span>
          </div>
          <span style={{ fontSize: '0.72rem', opacity: 0.85 }}>2 days</span>
        </button>

        {/* Rating 3: Good */}
        <button
          className="btn"
          disabled={disabled}
          onClick={() => onRate(3)}
          style={{
            flexDirection: 'column',
            padding: '0.85rem 0.5rem',
            gap: '0.35rem',
            borderRadius: 'var(--radius-lg)',
            background: '#eff6ff',
            color: '#2563eb',
            border: '1px solid #bfdbfe',
          }}
          id="flashcard-rate-good"
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <ThumbsUp size={15} />
            <span style={{ fontWeight: 700 }}>Good</span>
          </div>
          <span style={{ fontSize: '0.72rem', opacity: 0.85 }}>4 days</span>
        </button>

        {/* Rating 4: Easy */}
        <button
          className="btn btn-success"
          disabled={disabled}
          onClick={() => onRate(4)}
          style={{ flexDirection: 'column', padding: '0.85rem 0.5rem', gap: '0.35rem', borderRadius: 'var(--radius-lg)' }}
          id="flashcard-rate-easy"
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <Zap size={15} />
            <span style={{ fontWeight: 700 }}>Easy</span>
          </div>
          <span style={{ fontSize: '0.72rem', opacity: 0.85 }}>7 days</span>
        </button>
      </div>
    </div>
  );
}
