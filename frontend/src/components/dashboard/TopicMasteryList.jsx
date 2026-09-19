import React, { useState } from 'react';
import { Layers, CheckCircle2, AlertTriangle, AlertCircle, Sparkles, Play } from 'lucide-react';

export default function TopicMasteryList({ topics = [], onPracticeTopic }) {
  const [activeTab, setActiveTab] = useState('all');

  if (!topics || topics.length === 0) return null;

  const untestedTopics = topics.filter(t => (t.attempts_count || 0) === 0);
  const weakTopics = topics.filter(t => (t.attempts_count || 0) > 0 && t.mastery < 0.50);
  const developingTopics = topics.filter(t => (t.attempts_count || 0) > 0 && t.mastery >= 0.50 && t.mastery < 0.75);
  const strongTopics = topics.filter(t => (t.attempts_count || 0) > 0 && t.mastery >= 0.75);

  const displayedTopics =
    activeTab === 'weak' ? weakTopics :
    activeTab === 'developing' ? developingTopics :
    activeTab === 'strong' ? strongTopics :
    activeTab === 'untested' ? untestedTopics :
    topics;

  return (
    <div className="glass-card" style={{ padding: '2rem', borderRadius: 'var(--radius-xl)' }}>
      {/* Header & Filter Tabs */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem', color: '#0f172a' }}>
            <Layers size={18} color="#2563eb" />
            Topic Recall & Mastery Breakdown
          </h3>
          <p style={{ fontSize: '0.84rem', color: '#64748b' }}>
            Accurate retention scores based on your practice test performance.
          </p>
        </div>

        {/* Filter Tabs */}
        <div style={{ display: 'flex', gap: '0.3rem', background: '#f1f5f9', padding: '0.25rem', borderRadius: 'var(--radius-full)', flexWrap: 'wrap' }}>
          <button
            type="button"
            className={`btn btn-sm ${activeTab === 'all' ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setActiveTab('all')}
            style={{ borderRadius: 'var(--radius-full)', padding: '0.3rem 0.85rem', fontSize: '0.78rem' }}
          >
            All ({topics.length})
          </button>
          {weakTopics.length > 0 && (
            <button
              type="button"
              className={`btn btn-sm ${activeTab === 'weak' ? 'btn-danger' : 'btn-ghost'}`}
              onClick={() => setActiveTab('weak')}
              style={{ borderRadius: 'var(--radius-full)', padding: '0.3rem 0.85rem', fontSize: '0.78rem' }}
            >
              Needs Focus ({weakTopics.length})
            </button>
          )}
          {developingTopics.length > 0 && (
            <button
              type="button"
              className={`btn btn-sm ${activeTab === 'developing' ? 'btn-secondary' : 'btn-ghost'}`}
              onClick={() => setActiveTab('developing')}
              style={{ borderRadius: 'var(--radius-full)', padding: '0.3rem 0.85rem', fontSize: '0.78rem' }}
            >
              Developing ({developingTopics.length})
            </button>
          )}
          {strongTopics.length > 0 && (
            <button
              type="button"
              className={`btn btn-sm ${activeTab === 'strong' ? 'btn-success' : 'btn-ghost'}`}
              onClick={() => setActiveTab('strong')}
              style={{ borderRadius: 'var(--radius-full)', padding: '0.3rem 0.85rem', fontSize: '0.78rem' }}
            >
              Mastered ({strongTopics.length})
            </button>
          )}
          {untestedTopics.length > 0 && (
            <button
              type="button"
              className={`btn btn-sm ${activeTab === 'untested' ? 'btn-secondary' : 'btn-ghost'}`}
              onClick={() => setActiveTab('untested')}
              style={{ borderRadius: 'var(--radius-full)', padding: '0.3rem 0.85rem', fontSize: '0.78rem' }}
            >
              Untested ({untestedTopics.length})
            </button>
          )}
        </div>
      </div>

      {/* Mini Color Legend */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1.25rem',
          padding: '0.65rem 1rem',
          background: '#f8fafc',
          borderRadius: 'var(--radius-md)',
          border: '1px solid #e2e8f0',
          marginBottom: '1.5rem',
          fontSize: '0.76rem',
          color: '#64748b',
          flexWrap: 'wrap',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }} />
          <span><strong>Mastered (75%+)</strong>: High retention</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#f59e0b' }} />
          <span><strong>Developing (50–74%)</strong>: Partial recall</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ef4444' }} />
          <span><strong>Needs Focus (&lt;50%)</strong>: Review recommended</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#94a3b8' }} />
          <span><strong>Untested</strong>: No quiz attempts yet</span>
        </div>
      </div>

      {/* Topic List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
        {displayedTopics.map((topic) => {
          const attempts = topic.attempts_count || 0;
          const isUntested = attempts === 0;
          const score = Math.round(topic.mastery * 100);
          const isWeak = !isUntested && topic.mastery < 0.50;
          const isStrong = !isUntested && topic.mastery >= 0.75;
          const barColor = isUntested ? '#cbd5e1' : isStrong ? '#10b981' : isWeak ? '#ef4444' : '#f59e0b';

          return (
            <div
              key={topic.topic_id}
              style={{
                padding: '1.15rem 1.25rem',
                background: '#ffffff',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid #e2e8f0',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.02)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.65rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  {isUntested ? (
                    <Sparkles size={16} color="#94a3b8" />
                  ) : isStrong ? (
                    <CheckCircle2 size={16} color="#10b981" />
                  ) : isWeak ? (
                    <AlertCircle size={16} color="#ef4444" />
                  ) : (
                    <AlertTriangle size={16} color="#f59e0b" />
                  )}
                  <span style={{ fontWeight: 700, fontSize: '0.95rem', color: '#0f172a' }}>
                    {topic.topic_name}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                    {isUntested ? 'Untested' : `${attempts} practice attempt${attempts !== 1 ? 's' : ''}`}
                  </span>

                  {isUntested ? (
                    <span
                      style={{
                        padding: '0.2rem 0.6rem',
                        borderRadius: 'var(--radius-full)',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        background: '#f1f5f9',
                        color: '#64748b',
                        border: '1px solid #e2e8f0',
                      }}
                    >
                      Not Started
                    </span>
                  ) : (
                    <span
                      className={`badge ${isStrong ? 'badge-strong' : isWeak ? 'badge-weak' : 'badge-developing'}`}
                      style={{ fontSize: '0.74rem' }}
                    >
                      {score}% Recall
                    </span>
                  )}

                  {onPracticeTopic && (
                    <button
                      type="button"
                      onClick={() => onPracticeTopic(topic.topic_id)}
                      className="btn btn-sm btn-secondary"
                      style={{
                        borderRadius: 'var(--radius-full)',
                        padding: '0.25rem 0.75rem',
                        fontSize: '0.75rem',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                      }}
                      title={`Start practice quiz on ${topic.topic_name}`}
                    >
                      <Play size={11} fill="currentColor" />
                      <span>Practice</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Progress Track */}
              <div style={{ width: '100%', height: '6px', background: '#f1f5f9', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                <div
                  style={{
                    height: '100%',
                    width: isUntested ? '0%' : `${score}%`,
                    background: barColor,
                    borderRadius: 'var(--radius-full)',
                    transition: 'width 400ms ease',
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
