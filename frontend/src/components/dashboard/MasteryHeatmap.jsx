import React, { useState } from 'react';
import { Layers } from 'lucide-react';

export default function MasteryHeatmap({ topics }) {
  const [hoveredTopic, setHoveredTopic] = useState(null);

  if (!topics || topics.length === 0) return null;

  const getColorStyle = (mastery) => {
    if (mastery >= 0.75) {
      return {
        bg: '#ecfdf5',
        border: '#a7f3d0',
        text: '#059669',
        badge: 'Strong',
      };
    } else if (mastery >= 0.50) {
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
    <div className="glass-card" style={{ marginBottom: '2rem', padding: '1.75rem', borderRadius: 'var(--radius-xl)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem', color: '#0f172a' }}>
            <Layers size={18} color="#2563eb" />
            Topic Mastery Heatmap
          </h3>
          <p style={{ fontSize: '0.84rem', color: '#64748b' }}>
            Recency-weighted knowledge retention across your study material
          </p>
        </div>

        {/* Legend */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.78rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '3px', background: '#ef4444' }} />
            <span style={{ color: '#64748b' }}>Weak (&lt;50%)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '3px', background: '#f59e0b' }} />
            <span style={{ color: '#64748b' }}>Developing (50–75%)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '3px', background: '#10b981' }} />
            <span style={{ color: '#64748b' }}>Strong (&gt;75%)</span>
          </div>
        </div>
      </div>

      {/* Heatmap Matrix Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '1rem' }}>
        {topics.map((t) => {
          const style = getColorStyle(t.mastery);
          const isHovered = hoveredTopic?.topic_id === t.topic_id;

          return (
            <div
              key={t.topic_id}
              onMouseEnter={() => setHoveredTopic(t)}
              onMouseLeave={() => setHoveredTopic(null)}
              style={{
                padding: '1.25rem 1rem',
                borderRadius: 'var(--radius-lg)',
                background: style.bg,
                border: `1.5px solid ${style.border}`,
                boxShadow: isHovered ? '0 4px 14px rgba(0, 0, 0, 0.08)' : 'none',
                transform: isHovered ? 'translateY(-2px)' : 'none',
                transition: 'all 200ms ease',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                minHeight: '120px',
              }}
            >
              <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.5rem', lineHeight: 1.3 }}>
                {t.topic_name}
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '1.4rem', fontWeight: 800, color: style.text }}>
                  {Math.round(t.mastery * 100)}%
                </span>
                <span style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 500 }}>
                  {t.attempts_count} attempts
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Hover Inspection Info Banner */}
      {hoveredTopic && (
        <div style={{ marginTop: '1rem', padding: '0.75rem 1rem', background: '#f8fafc', borderRadius: 'var(--radius-md)', border: '1px solid #e2e8f0', fontSize: '0.84rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <span style={{ fontWeight: 700, color: '#0f172a' }}>{hoveredTopic.topic_name}: </span>
            <span style={{ color: '#475569' }}>
              {Math.round(hoveredTopic.mastery * 100)}% mastery score based on {hoveredTopic.attempts_count} practice attempts.
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
