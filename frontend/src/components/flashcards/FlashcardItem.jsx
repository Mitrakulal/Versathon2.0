import React from 'react';
import { Sparkles, BookOpen, RotateCw } from 'lucide-react';

export default function FlashcardItem({
  card,
  isFlipped,
  onFlip,
}) {
  return (
    <div className="flashcard-stage" onClick={onFlip}>
      <div className={`flashcard-inner ${isFlipped ? 'flipped' : ''}`}>
        {/* Front Face (Prompt) */}
        <div className="flashcard-face" style={{ background: '#ffffff', border: '1px solid #e2e8f0', boxShadow: '0 8px 30px rgba(0, 0, 0, 0.06)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span className="badge badge-primary">Flashcard Prompt</span>
            <span style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <RotateCw size={14} /> Click or spacebar to flip
            </span>
          </div>

          <div style={{ margin: 'auto 0', textAlign: 'center', padding: '1rem' }}>
            <h3 style={{ fontSize: '1.45rem', fontWeight: 700, color: '#0f172a', lineHeight: 1.5 }}>
              {card.prompt}
            </h3>
          </div>

          <div style={{ textAlign: 'center', color: '#94a3b8', fontSize: '0.82rem' }}>
            Try to recall the definition or concept actively before flipping
          </div>
        </div>

        {/* Back Face (Answer + Explanation + Source Notes) */}
        <div className="flashcard-face flashcard-back" style={{ background: '#f8fafc', border: '1px solid #cbd5e1', boxShadow: '0 8px 30px rgba(0, 0, 0, 0.06)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span className="badge badge-strong">Answer & Notes Grounding</span>
            <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
              Rate your recall quality below
            </span>
          </div>

          <div style={{ margin: 'auto 0', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a', lineHeight: 1.5 }}>
              {card.answer}
            </div>

            {card.explanation && (
              <p style={{ fontSize: '0.88rem', color: '#475569', lineHeight: 1.5 }}>
                {card.explanation}
              </p>
            )}

            {card.source_passage && (
              <div style={{ padding: '0.85rem 1rem', background: '#ffffff', borderLeft: '3px solid #2563eb', border: '1px solid #e2e8f0', borderRadius: 'var(--radius-sm)', fontSize: '0.84rem', color: '#334155', fontStyle: 'italic' }}>
                <BookOpen size={13} style={{ display: 'inline', marginRight: '5px', verticalAlign: 'middle', color: '#2563eb' }} />
                {card.source_passage}
              </div>
            )}
          </div>

          <div style={{ textAlign: 'center', color: '#94a3b8', fontSize: '0.78rem' }}>
            SM-2 algorithm calculates next review date based on your rating
          </div>
        </div>
      </div>
    </div>
  );
}
