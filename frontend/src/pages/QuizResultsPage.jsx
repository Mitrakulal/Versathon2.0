import React from 'react';
import { Trophy, Clock, CheckCircle2, RotateCcw, PieChart, ArrowRight, Layers } from 'lucide-react';
import Button from '../components/common/Button';

export default function QuizResultsPage({
  summary,
  space,
  onRetake,
  onGoToDashboard,
}) {
  const scorePercent = summary?.score ? Math.round(summary.score) : 0;
  const isPassing = scorePercent >= 70;
  const strokeColor = scorePercent >= 75 ? '#10b981' : scorePercent >= 50 ? '#f59e0b' : '#ef4444';

  return (
    <div style={{ maxWidth: '780px', margin: '0 auto' }}>
      <div className="glass-card" style={{ padding: '2.5rem', textAlign: 'center', marginBottom: '2rem', borderRadius: 'var(--radius-xl)' }}>
        {/* Score Ring */}
        <div style={{ position: 'relative', width: '140px', height: '140px', margin: '0 auto 1.5rem auto' }}>
          <svg width="140" height="140" viewBox="0 0 140 140">
            <circle
              cx="70"
              cy="70"
              r="60"
              fill="transparent"
              stroke="#e2e8f0"
              strokeWidth="10"
            />
            <circle
              cx="70"
              cy="70"
              r="60"
              fill="transparent"
              stroke={strokeColor}
              strokeWidth="10"
              strokeDasharray="377"
              strokeDashoffset={377 - (377 * scorePercent) / 100}
              strokeLinecap="round"
              style={{ transition: 'stroke-dashoffset 1s ease-out' }}
            />
          </svg>
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a' }}>
              {scorePercent}%
            </span>
            <span style={{ fontSize: '0.74rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>
              Final Score
            </span>
          </div>
        </div>

        <h2 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.5rem' }}>
          {isPassing ? 'Great Job on This Session!' : 'Keep Practicing to Boost Recall!'}
        </h2>
        <p style={{ color: '#64748b', fontSize: '0.95rem', maxWidth: '520px', margin: '0 auto 2rem auto', lineHeight: 1.5 }}>
          Your responses have been processed into the topic mastery model and SM-2 review scheduler for "{space?.title}".
        </p>

        {/* Aggregate KPI grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
          <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: 'var(--radius-md)', border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', color: '#10b981', marginBottom: '0.35rem' }}>
              <CheckCircle2 size={16} />
              <span style={{ fontSize: '1.3rem', fontWeight: 800 }}>
                {summary.correct_count} / {summary.total_questions}
              </span>
            </div>
            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Questions Correct</div>
          </div>

          <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: 'var(--radius-md)', border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', color: '#2563eb', marginBottom: '0.35rem' }}>
              <Clock size={16} />
              <span style={{ fontSize: '1.3rem', fontWeight: 800 }}>
                {Math.round(summary.time_taken_seconds || 120)}s
              </span>
            </div>
            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Time Elapsed</div>
          </div>

          <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: 'var(--radius-md)', border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', color: '#0284c7', marginBottom: '0.35rem' }}>
              <Trophy size={16} />
              <span style={{ fontSize: '1.3rem', fontWeight: 800 }}>
                {summary.topic_breakdown?.length || 1}
              </span>
            </div>
            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Topics Evaluated</div>
          </div>
        </div>

        {/* Per-Topic Breakdown */}
        {summary.topic_breakdown && summary.topic_breakdown.length > 0 && (
          <div style={{ textAlign: 'left', marginBottom: '2.5rem' }}>
            <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Layers size={16} color="#2563eb" />
              Per-Topic Performance Breakdown
            </h4>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {summary.topic_breakdown.map((tb, idx) => {
                const topicScore = Math.round(tb.score);
                const isWeak = topicScore < 50;
                const isStrong = topicScore >= 75;

                return (
                  <div
                    key={idx}
                    style={{
                      padding: '1rem 1.25rem',
                      background: '#f8fafc',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid #e2e8f0',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.92rem', color: '#0f172a' }}>
                        {tb.topic_name}
                      </span>
                      <span
                        className={`badge ${isStrong ? 'badge-strong' : isWeak ? 'badge-weak' : 'badge-developing'}`}
                      >
                        {topicScore}% ({tb.attempted} asked)
                      </span>
                    </div>

                    {/* Mini progress bar */}
                    <div style={{ width: '100%', height: '6px', background: '#e2e8f0', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                      <div
                        style={{
                          height: '100%',
                          width: `${topicScore}%`,
                          background: isStrong ? '#10b981' : isWeak ? '#ef4444' : '#f59e0b',
                          borderRadius: 'var(--radius-full)',
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <Button variant="secondary" icon={RotateCcw} onClick={onRetake} style={{ borderRadius: 'var(--radius-full)' }}>
            Take Another Quiz
          </Button>
          <Button variant="primary" icon={PieChart} onClick={onGoToDashboard} style={{ borderRadius: 'var(--radius-full)' }}>
            View Mastery Heatmap
          </Button>
        </div>
      </div>
    </div>
  );
}
