import React, { useState } from 'react';
import { BookOpen, Flag, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { questionsService } from '../../services/questionsService';
import { useApp } from '../../context/AppContext';

export default function QuestionCard({ question, onViewSource, studyMode = false }) {
  const { showToast } = useApp();
  const [flagging, setFlagging] = useState(false);
  const [isFlagged, setIsFlagged] = useState(question.is_flagged || false);
  const [isRevealed, setIsRevealed] = useState(false);

  const handleFlag = async () => {
    const reason = window.prompt(
      'Why would you like to flag this question? (e.g. Ambiguous option, note contradiction)'
    );
    if (!reason || !reason.trim()) return;

    try {
      setFlagging(true);
      await questionsService.flagQuestion(question.id, reason.trim());
      setIsFlagged(true);
      showToast('Question flagged for regeneration review.', 'info');
    } catch (err) {
      showToast(err.detail || 'Failed to flag question.', 'error');
    } finally {
      setFlagging(false);
    }
  };

  const getDifficultyBadge = (difficulty) => {
    switch (difficulty) {
      case 'easy':
        return <span className="badge badge-strong">Easy</span>;
      case 'hard':
        return <span className="badge badge-weak">Hard</span>;
      default:
        return <span className="badge badge-developing">Medium</span>;
    }
  };

  const getCognitiveBadge = (level) => {
    switch (level?.toLowerCase()) {
      case 'understanding':
        return (
          <span
            style={{
              padding: '0.2rem 0.55rem',
              borderRadius: 'var(--radius-full)',
              background: '#f5f3ff',
              border: '1px solid #ddd6fe',
              color: '#6d28d9',
              fontSize: '0.73rem',
              fontWeight: 600,
            }}
          >
            Understanding
          </span>
        );
      case 'application':
        return (
          <span
            style={{
              padding: '0.2rem 0.55rem',
              borderRadius: 'var(--radius-full)',
              background: '#f0fdf4',
              border: '1px solid #bbf7d0',
              color: '#15803d',
              fontSize: '0.73rem',
              fontWeight: 600,
            }}
          >
            Application
          </span>
        );
      case 'recall':
      default:
        return (
          <span
            style={{
              padding: '0.2rem 0.55rem',
              borderRadius: 'var(--radius-full)',
              background: '#eff6ff',
              border: '1px solid #bfdbfe',
              color: '#1d4ed8',
              fontSize: '0.73rem',
              fontWeight: 600,
            }}
          >
            Recall
          </span>
        );
    }
  };

  const getTypeLabel = (type) => {
    switch (type) {
      case 'mcq':
        return 'Multiple Choice';
      case 'short_answer':
        return 'Short Answer';
      case 'fill_blank':
        return 'Fill In The Blank';
      case 'flashcard':
        return 'Flashcard';
      default:
        return type;
    }
  };

  const showAnswer = !studyMode || isRevealed;

  return (
    <div
      className="glass-card"
      style={{
        padding: '1.5rem',
        marginBottom: '1rem',
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: 'var(--radius-lg)',
        borderLeft: isFlagged ? '4px solid #ef4444' : '1px solid #e2e8f0',
        transition: 'all 0.2s ease',
      }}
    >
      {/* Header: Meta tags */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '0.85rem',
          flexWrap: 'wrap',
          gap: '0.5rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <span className="badge badge-primary">{getTypeLabel(question.type)}</span>
          {getDifficultyBadge(question.difficulty)}
          {getCognitiveBadge(question.cognitive_level)}
          {isFlagged && (
            <span className="badge badge-weak" style={{ gap: '0.3rem' }}>
              <AlertCircle size={12} />
              <span>Flagged</span>
            </span>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {question.source_passage && (
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => onViewSource(question)}
              style={{ color: '#2563eb', fontWeight: 600, gap: '0.35rem' }}
            >
              <BookOpen size={14} />
              <span>View Source Notes</span>
            </button>
          )}

          <button
            className="btn btn-ghost btn-sm"
            onClick={handleFlag}
            disabled={flagging || isFlagged}
            title="Flag question as inaccurate"
            style={{ color: isFlagged ? '#ef4444' : '#94a3b8', padding: '0.35rem' }}
          >
            <Flag size={15} />
          </button>
        </div>
      </div>

      {/* Prompt */}
      <h4
        style={{
          fontSize: '1.05rem',
          fontWeight: 700,
          color: '#0f172a',
          marginBottom: '1rem',
          lineHeight: 1.5,
        }}
      >
        {question.prompt}
      </h4>

      {/* MCQ Options (if present) */}
      {question.options && question.options.length > 0 && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '0.65rem',
            marginBottom: '1rem',
          }}
        >
          {question.options.map((opt, idx) => {
            const letter = String.fromCharCode(65 + idx);
            const isCorrectAnswer =
              showAnswer &&
              question.answer &&
              question.answer.toLowerCase() === opt.toLowerCase();

            return (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.75rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  background: isCorrectAnswer ? '#ecfdf5' : '#f8fafc',
                  border: isCorrectAnswer ? '1px solid #a7f3d0' : '1px solid #e2e8f0',
                  fontSize: '0.88rem',
                  color: isCorrectAnswer ? '#065f46' : '#334155',
                  fontWeight: isCorrectAnswer ? 600 : 500,
                  transition: 'all 0.15s ease',
                }}
              >
                <span
                  style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    background: isCorrectAnswer ? '#10b981' : '#e2e8f0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    color: isCorrectAnswer ? '#ffffff' : '#64748b',
                  }}
                >
                  {letter}
                </span>
                <span>{opt}</span>
              </div>
            );
          })}
        </div>
      )}

      {/* Study Mode: Shielded Answer vs Revealed Answer */}
      {studyMode && !isRevealed ? (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0.95rem 1rem',
            background: '#f8fafc',
            borderRadius: 'var(--radius-md)',
            border: '1px dashed #cbd5e1',
          }}
        >
          <button
            type="button"
            onClick={() => setIsRevealed(true)}
            className="btn btn-ghost btn-sm"
            style={{ color: '#2563eb', fontWeight: 600, gap: '0.45rem', fontSize: '0.85rem' }}
          >
            <Eye size={15} />
            <span>Click to Reveal Answer & Explanation</span>
          </button>
        </div>
      ) : (
        question.answer && (
          <div
            style={{
              padding: '0.85rem 1rem',
              background: '#f8fafc',
              borderRadius: 'var(--radius-md)',
              border: '1px solid #e2e8f0',
              fontSize: '0.86rem',
              position: 'relative',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '0.25rem',
              }}
            >
              <div style={{ fontWeight: 700, color: '#059669' }}>
                Answer: {question.answer}
              </div>
              {studyMode && (
                <button
                  type="button"
                  onClick={() => setIsRevealed(false)}
                  style={{
                    border: 'none',
                    background: 'transparent',
                    color: '#94a3b8',
                    cursor: 'pointer',
                    fontSize: '0.75rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.3rem',
                  }}
                  title="Hide answer again"
                >
                  <EyeOff size={13} />
                  <span>Hide</span>
                </button>
              )}
            </div>

            {question.explanation && (
              <div style={{ color: '#64748b', lineHeight: 1.5 }}>
                {question.explanation}
              </div>
            )}
          </div>
        )
      )}
    </div>
  );
}
