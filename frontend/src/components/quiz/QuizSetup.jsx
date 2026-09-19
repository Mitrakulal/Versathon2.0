import React, { useState } from 'react';
import { Sparkles, CheckCircle2, Shuffle, Calendar, Target, Play, AlertCircle, PlusCircle } from 'lucide-react';
import Button from '../common/Button';

export default function QuizSetup({
  space,
  topics,
  onStartQuiz,
  loading,
  availableQuestionsCount,
  onGoToQuestions,
}) {
  const [mode, setMode] = useState('adaptive');
  const [questionCount, setQuestionCount] = useState(5);
  const [selectedTopics, setSelectedTopics] = useState([]);

  const modes = [
    {
      id: 'adaptive',
      title: 'Adaptive (Focus on Weak Areas)',
      desc: 'Dynamically oversamples topics where accuracy is lowest (50% weak, 30% developing, 20% strong).',
      icon: Target,
      color: '#ef4444',
      badge: 'Recommended',
    },
    {
      id: 'mixed',
      title: 'Mixed Comprehensive Quiz',
      desc: 'Uniformly samples questions across all extracted topics for general exam preparation.',
      icon: Shuffle,
      color: '#2563eb',
    },
    {
      id: 'topic_quiz',
      title: 'Specific Topic Practice',
      desc: 'Select individual topics or subtopics to test focused concepts.',
      icon: Sparkles,
      color: '#0284c7',
    },
    {
      id: 'daily_revision',
      title: 'Daily Spaced Repetition Queue',
      desc: 'Items scheduled for review today according to the SM-2 algorithm.',
      icon: Calendar,
      color: '#10b981',
    },
  ];

  const handleToggleTopic = (topicId) => {
    setSelectedTopics(prev =>
      prev.includes(topicId) ? prev.filter(id => id !== topicId) : [...prev, topicId]
    );
  };

  const handleLaunch = () => {
    onStartQuiz({
      space_id: space.id,
      mode,
      question_count: Number(questionCount),
      topic_ids: mode === 'topic_quiz' ? selectedTopics : undefined,
    });
  };

  const isBankEmpty = availableQuestionsCount === 0;

  return (
    <div className="glass-card" style={{ maxWidth: '780px', margin: '0 auto', padding: '2.5rem', borderRadius: 'var(--radius-xl)' }}>
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.85rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.5rem' }}>
          Configure Practice Session
        </h2>
        <p style={{ color: '#64748b', fontSize: '0.95rem' }}>
          Choose your practice mode and question volume for "{space.title}"
          {availableQuestionsCount !== undefined && availableQuestionsCount !== null && (
            <span style={{ fontWeight: 600, color: '#2563eb', marginLeft: '0.35rem' }}>
              ({availableQuestionsCount} questions in bank)
            </span>
          )}
        </p>
      </div>

      {/* Empty Question Bank Guard */}
      {isBankEmpty && (
        <div
          style={{
            padding: '1.25rem 1.5rem',
            background: '#fffbeb',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid #fde68a',
            marginBottom: '2rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                background: '#fef3c7',
                color: '#d97706',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <AlertCircle size={20} />
            </div>
            <div>
              <div style={{ fontWeight: 700, color: '#92400e', fontSize: '0.95rem' }}>
                No Questions in Bank Yet
              </div>
              <div style={{ fontSize: '0.84rem', color: '#b45309' }}>
                Generate practice questions from your notes first before starting a session.
              </div>
            </div>
          </div>

          {onGoToQuestions && (
            <Button
              variant="secondary"
              size="sm"
              icon={PlusCircle}
              onClick={onGoToQuestions}
              style={{ borderRadius: 'var(--radius-full)', background: '#ffffff' }}
            >
              Go to Question Bank
            </Button>
          )}
        </div>
      )}

      {/* Mode Picker */}
      <div style={{ marginBottom: '2rem' }}>
        <label className="form-label" style={{ marginBottom: '0.85rem', display: 'block' }}>
          Select Practice Mode
        </label>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.85rem' }}>
          {modes.map((m) => {
            const Icon = m.icon;
            const isSelected = mode === m.id;

            return (
              <div
                key={m.id}
                onClick={() => setMode(m.id)}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '1rem',
                  padding: '1.25rem',
                  borderRadius: 'var(--radius-lg)',
                  background: isSelected ? '#eff6ff' : '#ffffff',
                  border: isSelected ? '2px solid #2563eb' : '1px solid #e2e8f0',
                  boxShadow: isSelected ? '0 4px 14px rgba(37, 99, 235, 0.12)' : '0 1px 3px rgba(0, 0, 0, 0.02)',
                  cursor: 'pointer',
                  transition: 'all var(--transition-fast)',
                }}
              >
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: 'var(--radius-md)',
                    background: isSelected ? '#dbeafe' : '#f1f5f9',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: m.color,
                    flexShrink: 0,
                  }}
                >
                  <Icon size={20} />
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.25rem' }}>
                    <span style={{ fontWeight: 700, color: '#0f172a', fontSize: '1rem' }}>
                      {m.title}
                    </span>
                    {m.badge && (
                      <span className="badge badge-primary" style={{ fontSize: '0.7rem' }}>
                        {m.badge}
                      </span>
                    )}
                  </div>
                  <p style={{ fontSize: '0.85rem', color: '#64748b', lineHeight: 1.45 }}>
                    {m.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Topic selection if topic_quiz */}
      {mode === 'topic_quiz' && topics && topics.length > 0 && (
        <div style={{ marginBottom: '2rem', padding: '1.25rem', background: '#f8fafc', borderRadius: 'var(--radius-md)', border: '1px solid #e2e8f0' }}>
          <label className="form-label" style={{ marginBottom: '0.75rem', display: 'block' }}>
            Select Topics to Include:
          </label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {topics.map(t => {
              const isChecked = selectedTopics.includes(t.id);
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => handleToggleTopic(t.id)}
                  className={`btn btn-sm ${isChecked ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ borderRadius: 'var(--radius-full)' }}
                >
                  {t.name}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Question Count Selection */}
      <div style={{ marginBottom: '2.5rem' }}>
        <label className="form-label" style={{ marginBottom: '0.75rem', display: 'block' }}>
          Number of Questions
        </label>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem' }}>
          {[5, 10, 15, 20].map((count) => (
            <button
              key={count}
              type="button"
              className={`btn ${questionCount === count ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setQuestionCount(count)}
              style={{ fontWeight: 700, padding: '0.85rem', borderRadius: 'var(--radius-md)' }}
            >
              {count} Questions
            </button>
          ))}
        </div>
      </div>

      {/* Action */}
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <Button
          variant="primary"
          size="lg"
          icon={Play}
          onClick={handleLaunch}
          loading={loading}
          disabled={isBankEmpty}
          style={{ width: '100%', maxWidth: '320px', padding: '0.9rem 2rem', borderRadius: 'var(--radius-full)' }}
          id="launch-quiz-btn"
        >
          Start Practice Session
        </Button>
      </div>
    </div>
  );
}
