import React, { useState } from 'react';
import { Layers, Play } from 'lucide-react';

export default function MasteryHeatmap({ topics = [], onPracticeTopic }) {
  const [hoveredTopic, setHoveredTopic] = useState(null);

  if (!topics || topics.length === 0) return null;

  const getColorStyle = (t) => {
    const attempts = t.attempts_count || 0;
    if (attempts === 0) {
      return {
        bg: '#f8fafc',
        border: '#e2e8f0',
        text: '#64748b',
        badge: 'Untested',
      };
    }
    if (t.mastery >= 0.75) {
      return {
        bg: '#ecfdf5',
        border: '#a7f3d0',
        text: '#059669',
        badge: 'Strong',
      };
    } else if (t.mastery >= 0.50) {
      return {
        bg: '#fffbeb',
        border: '#fde68a',
        text: '#d97706',
        badge: 'Developing',
      };
    } else {
      return {
        bg: '#fef2f2',
        border: '#fecaca',
        text: '#dc2626',
        badge: 'Weak',
      };
    }
  };

  return (
    <div className="glass-card" style={{ padding: '2rem', borderRadius: 'var(--radius-xl)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem', color: '#0f172a' }}>
            <Layers size={18} color="#2563eb" />
            Topic Mastery Heatmap
          </h3>
          <p style={{ fontSize: '0.84rem', color: '#64748b' }}>
            Click any tile to launch focused practice on that concept.
          </p>
        </div>

        {/* Legend */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.76rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <span style={{ width: '9px', height: '9px', borderRadius: '50%', background: '#10b981' }} />
            <span style={{ color: '#64748b' }}>Mastered (&gt;75%)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <span style={{ width: '9px', height: '9px', borderRadius: '50%', background: '#f59e0b' }} />
            <span style={{ color: '#64748b' }}>Developing (50–75%)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <span style={{ width: '9px', height: '9px', borderRadius: '50%', background: '#ef4444' }} />
            <span style={{ color: '#64748b' }}>Needs Focus (&lt;50%)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <span style={{ width: '9px', height: '9px', borderRadius: '50%', background: '#94a3b8' }} />
            <span style={{ color: '#64748b' }}>Untested</span>
          </div>
        </div>
      </div>

      {/* Heatmap Matrix Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))', gap: '1rem' }}>
        {topics.map((t) => {
          const style = getColorStyle(t);
          const isHovered = hoveredTopic?.topic_id === t.topic_id;
          const attempts = t.attempts_count || 0;
          const isUntested = attempts === 0;

          return (
            <div
              key={t.topic_id}
              onClick={() => onPracticeTopic && onPracticeTopic(t.topic_id)}
              onMouseEnter={() => setHoveredTopic(t)}
              onMouseLeave={() => setHoveredTopic(null)}
              style={{
                padding: '1.25rem 1rem',
                borderRadius: 'var(--radius-lg)',
                background: style.bg,
                border: `1.5px solid ${style.border}`,
                boxShadow: isHovered ? '0 6px 18px rgba(0, 0, 0, 0.08)' : 'none',
                transform: isHovered ? 'translateY(-2px)' : 'none',
                transition: 'all 200ms ease',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                minHeight: '125px',
              }}
              title="Click to practice this topic"
            >
              <div>
                <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.35rem', lineHeight: 1.3 }}>
                  {t.topic_name}
                </div>
                <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                  {isUntested ? 'Untested' : `${attempts} attempt${attempts !== 1 ? 's' : ''}`}
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginTop: '1rem' }}>
                <span style={{ fontSize: '1.35rem', fontWeight: 800, color: style.text }}>
                  {isUntested ? '—' : `${Math.round(t.mastery * 100)}%`}
                </span>
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                    fontSize: '0.72rem',
                    color: style.text,
                    fontWeight: 600,
                  }}
                >
                  <Play size={10} fill="currentColor" />
                  Practice
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Hover Inspection Info Banner */}
      {hoveredTopic && (
        <div style={{ marginTop: '1rem', padding: '0.75rem 1rem', background: '#f8fafc', borderRadius: 'var(--radius-md)', border: '1px solid #e2e8f0', fontSize: '0.84rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div>
            <span style={{ fontWeight: 700, color: '#0f172a' }}>{hoveredTopic.topic_name}: </span>
            <span style={{ color: '#475569' }}>
              {(hoveredTopic.attempts_count || 0) === 0
                ? 'No practice attempts yet. Click to take a diagnostic quiz.'
                : `${Math.round(hoveredTopic.mastery * 100)}% accuracy score across ${hoveredTopic.attempts_count} practice attempts.`}
            </span>
          </div>
          {hoveredTopic.last_practiced_at && (
            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
              Last tested: {new Date(hoveredTopic.last_practiced_at).toLocaleDateString()}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
