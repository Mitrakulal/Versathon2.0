import React, { useState } from 'react';
import { BookOpen, RotateCw, Flag, AlertCircle } from 'lucide-react';
import { questionsService } from '../../services/questionsService';
import { useApp } from '../../context/AppContext';

export default function FlashcardItem({
  card,
  isFlipped,
  onFlip,
  topicName,
}) {
  const { showToast } = useApp();
  const [isFlagged, setIsFlagged] = useState(card?.is_flagged || false);
  const [flagging, setFlagging] = useState(false);

  const handleFlag = async (e) => {
    e.stopPropagation(); // prevent card flip
    const reason = window.prompt(
      'Why would you like to flag this flashcard? (e.g. Inaccurate definition, ambiguous prompt)'
    );
    if (!reason || !reason.trim()) return;

    try {
      setFlagging(true);
      await questionsService.flagQuestion(card.id, reason.trim());
      setIsFlagged(true);
      showToast('Flashcard flagged for review.', 'info');
    } catch (err) {
      showToast(err.detail || 'Failed to flag flashcard.', 'error');
    } finally {
      setFlagging(false);
    }
  };

  return (
    <div className="flashcard-stage" onClick={onFlip}>
      <div className={`flashcard-inner ${isFlipped ? 'flipped' : ''}`}>
        {/* Front Face (Prompt) */}
        <div
          className="flashcard-face"
          style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            boxShadow: '0 8px 30px rgba(0, 0, 0, 0.06)',
            borderRadius: 'var(--radius-xl)',
            padding: '2rem',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span className="badge badge-primary">Flashcard</span>
              {topicName && (
                <span
                  style={{
                    padding: '0.2rem 0.6rem',
                    borderRadius: 'var(--radius-full)',
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    color: '#475569',
                    fontSize: '0.74rem',
                    fontWeight: 600,
                  }}
                >
                  {topicName}
                </span>
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span
                style={{
                  fontSize: '0.78rem',
                  color: '#94a3b8',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                }}
              >
                <kbd
                  style={{
                    background: '#f1f5f9',
                    border: '1px solid #cbd5e1',
                    borderRadius: '4px',
                    padding: '0.1rem 0.35rem',
                    fontSize: '0.7rem',
                    color: '#475569',
                  }}
                >
                  Space
                </kbd>
                <span>to flip</span>
              </span>

              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={handleFlag}
                disabled={flagging || isFlagged}
                title="Flag flashcard"
                style={{ color: isFlagged ? '#ef4444' : '#94a3b8', padding: '0.35rem' }}
              >
                <Flag size={14} />
              </button>
            </div>
          </div>

          {/* Prompt Center */}
          <div style={{ margin: 'auto 0', textAlign: 'center', padding: '1.5rem 1rem' }}>
            <h3
              style={{
                fontSize: '1.5rem',
                fontWeight: 700,
                color: '#0f172a',
                lineHeight: 1.5,
              }}
            >
              {card.prompt}
            </h3>
          </div>

          {/* Footer Guide */}
          <div style={{ textAlign: 'center', color: '#94a3b8', fontSize: '0.82rem' }}>
            Actively retrieve the concept from memory, then click or press Space to reveal
          </div>
        </div>

        {/* Back Face (Answer + Explanation + Cited Notes) */}
        <div
          className="flashcard-face flashcard-back"
          style={{
            background: '#ffffff',
            border: '1px solid #cbd5e1',
            boxShadow: '0 8px 30px rgba(0, 0, 0, 0.06)',
            borderRadius: 'var(--radius-xl)',
            padding: '2rem',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span className="badge badge-strong">Answer Grounding</span>
              {topicName && (
                <span
                  style={{
                    padding: '0.2rem 0.6rem',
                    borderRadius: 'var(--radius-full)',
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    color: '#475569',
                    fontSize: '0.74rem',
                    fontWeight: 600,
                  }}
                >
                  {topicName}
                </span>
              )}
            </div>

            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={handleFlag}
              disabled={flagging || isFlagged}
              title="Flag flashcard"
              style={{ color: isFlagged ? '#ef4444' : '#94a3b8', padding: '0.35rem' }}
            >
              <Flag size={14} />
            </button>
          </div>

          {/* Answer Body */}
          <div style={{ margin: 'auto 0', display: 'flex', flexDirection: 'column', gap: '1rem', padding: '0.5rem 0' }}>
            <div
              style={{
                fontSize: '1.25rem',
                fontWeight: 700,
                color: '#0f172a',
                lineHeight: 1.5,
              }}
            >
              {card.answer}
            </div>

            {card.explanation && (
              <p style={{ fontSize: '0.9rem', color: '#475569', lineHeight: 1.55 }}>
                {card.explanation}
              </p>
            )}

            {card.source_passage && (
              <div
                style={{
                  padding: '0.85rem 1rem',
                  background: '#f8fafc',
                  borderLeft: '3px solid #2563eb',
                  border: '1px solid #e2e8f0',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.84rem',
                  color: '#334155',
                  fontStyle: 'italic',
                  lineHeight: 1.5,
                }}
              >
                <BookOpen
                  size={14}
                  style={{ display: 'inline', marginRight: '6px', verticalAlign: 'middle', color: '#2563eb' }}
                />
                {card.source_passage}
              </div>
            )}
          </div>

          {/* Footer SM-2 notice */}
          <div style={{ textAlign: 'center', color: '#64748b', fontSize: '0.78rem' }}>
            Rate your recall difficulty below to schedule your next review via SM-2
          </div>
        </div>
      </div>
    </div>
  );
}
