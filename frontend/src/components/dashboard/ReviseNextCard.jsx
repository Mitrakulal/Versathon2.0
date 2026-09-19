import React from 'react';
import { AlertCircle, ArrowRight, Target } from 'lucide-react';
import Button from '../common/Button';

export default function ReviseNextCard({ recommendations, onStartFocusedQuiz }) {
  if (!recommendations || recommendations.length === 0) {
    return null;
  }

  return (
    <div className="glass-card" style={{ marginBottom: '2rem', padding: '1.75rem', borderRadius: 'var(--radius-xl)', borderLeft: '5px solid #ef4444' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', color: '#dc2626', fontWeight: 700 }}>
        <Target size={18} />
        <span style={{ textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.8rem' }}>
          Recommended Focus Areas
        </span>
      </div>
      <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.5rem' }}>
        What to Revise Next
      </h3>
      <p style={{ color: '#64748b', fontSize: '0.88rem', marginBottom: '1.25rem' }}>
        Identified by NoteRecall's adaptive tracking based on low accuracy or elapsed spaced repetition intervals:
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {recommendations.map((rec, idx) => (
          <div
            key={idx}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '1.1rem 1.25rem',
              background: '#f8fafc',
              borderRadius: 'var(--radius-md)',
              border: '1px solid #e2e8f0',
              flexWrap: 'wrap',
              gap: '1rem',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                <span style={{ fontWeight: 700, fontSize: '0.96rem', color: '#0f172a' }}>
                  {rec.topic_name}
                </span>
                <span className="badge badge-weak">
                  {Math.round(rec.mastery * 100)}% Mastery
                </span>
              </div>
              <p style={{ fontSize: '0.84rem', color: '#64748b' }}>
                {rec.reason}
              </p>
            </div>

            <Button
              variant="primary"
              size="sm"
              icon={ArrowRight}
              onClick={() => onStartFocusedQuiz(rec.topic_id)}
              style={{ borderRadius: 'var(--radius-full)' }}
            >
              {rec.recommended_action || 'Practice Now'}
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
