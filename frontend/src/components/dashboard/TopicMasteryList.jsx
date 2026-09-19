import React, { useState } from 'react';
import { Layers, CheckCircle2, AlertTriangle, AlertCircle } from 'lucide-react';

export default function TopicMasteryList({ topics }) {
  const [activeTab, setActiveTab] = useState('all');

  if (!topics || topics.length === 0) return null;

  const weakTopics = topics.filter(t => t.mastery < 0.50);
  const developingTopics = topics.filter(t => t.mastery >= 0.50 && t.mastery < 0.75);
  const strongTopics = topics.filter(t => t.mastery >= 0.75);

  const displayedTopics =
    activeTab === 'weak' ? weakTopics :
    activeTab === 'developing' ? developingTopics :
    activeTab === 'strong' ? strongTopics :
    topics;

  return (
    <div className="glass-card" style={{ padding: '1.75rem', borderRadius: 'var(--radius-xl)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem', color: '#0f172a' }}>
            <Layers size={18} color="#2563eb" />
            Detailed Topic Breakdown
          </h3>
          <p style={{ fontSize: '0.84rem', color: '#64748b' }}>
            Filter by mastery categorization to target your revision
          </p>
        </div>

        {/* Filter Pills matching reference */}
        <div style={{ display: 'flex', gap: '0.35rem', background: '#f1f5f9', padding: '0.25rem', borderRadius: 'var(--radius-full)' }}>
          <button
            className={`btn btn-sm ${activeTab === 'all' ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setActiveTab('all')}
            style={{ borderRadius: 'var(--radius-full)', padding: '0.3rem 0.85rem' }}
          >
            All ({topics.length})
          </button>
          <button
            className={`btn btn-sm ${activeTab === 'weak' ? 'btn-danger' : 'btn-ghost'}`}
            onClick={() => setActiveTab('weak')}
            style={{ borderRadius: 'var(--radius-full)', padding: '0.3rem 0.85rem' }}
          >
            Weak ({weakTopics.length})
          </button>
          <button
            className={`btn btn-sm ${activeTab === 'developing' ? 'btn-secondary' : 'btn-ghost'}`}
            onClick={() => setActiveTab('developing')}
            style={{ borderRadius: 'var(--radius-full)', padding: '0.3rem 0.85rem' }}
          >
            Developing ({developingTopics.length})
          </button>
          <button
            className={`btn btn-sm ${activeTab === 'strong' ? 'btn-success' : 'btn-ghost'}`}
            onClick={() => setActiveTab('strong')}
            style={{ borderRadius: 'var(--radius-full)', padding: '0.3rem 0.85rem' }}
          >
            Strong ({strongTopics.length})
          </button>
        </div>
      </div>

      {/* List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
        {displayedTopics.map((topic) => {
          const score = Math.round(topic.mastery * 100);
          const isWeak = topic.mastery < 0.50;
          const isStrong = topic.mastery >= 0.75;
          const barColor = isStrong ? '#10b981' : isWeak ? '#ef4444' : '#f59e0b';

          return (
            <div
              key={topic.topic_id}
              style={{
                padding: '1.1rem 1.25rem',
                background: '#f8fafc',
                borderRadius: 'var(--radius-md)',
                border: '1px solid #e2e8f0',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.65rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  {isStrong ? (
                    <CheckCircle2 size={16} color="#10b981" />
                  ) : isWeak ? (
                    <AlertCircle size={16} color="#ef4444" />
                  ) : (
                    <AlertTriangle size={16} color="#f59e0b" />
                  )}
                  <span style={{ fontWeight: 700, fontSize: '0.94rem', color: '#0f172a' }}>
                    {topic.topic_name}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                    {topic.attempts_count} practice attempts
                  </span>
                  <span
                    className={`badge ${isStrong ? 'badge-strong' : isWeak ? 'badge-weak' : 'badge-developing'}`}
                  >
                    {score}%
                  </span>
                </div>
              </div>

              {/* Progress Bar */}
              <div style={{ width: '100%', height: '6px', background: '#e2e8f0', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                <div
                  style={{
                    height: '100%',
                    width: `${score}%`,
                    background: barColor,
                    borderRadius: 'var(--radius-full)',
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
