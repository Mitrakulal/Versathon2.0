import React from 'react';
import { Target, Flame, Calendar, CheckCircle2, ArrowRight } from 'lucide-react';

export default function StatsOverview({ dashboard, onReviewDue }) {
  const masteryPercent = Math.round((dashboard?.overall_mastery || 0) * 100);
  const streak = dashboard?.study_streak_days || 0;
  const attempts = dashboard?.total_attempts || 0;
  const dueCount = dashboard?.due_today_count || 0;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
      {/* Overall Mastery / Accuracy */}
      <div className="stat-card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#475569' }}>
            Overall Recall Accuracy
          </span>
          <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563eb' }}>
            <Target size={17} />
          </div>
        </div>
        <div style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.25rem' }}>
          {attempts === 0 ? '—' : `${masteryPercent}%`}
        </div>
        <div style={{ fontSize: '0.78rem', color: attempts === 0 ? '#64748b' : masteryPercent >= 75 ? '#059669' : masteryPercent >= 50 ? '#d97706' : '#dc2626', fontWeight: 600 }}>
          {attempts === 0 ? 'Take your first quiz to begin' : masteryPercent >= 75 ? 'Strong overall retention' : masteryPercent >= 50 ? 'Developing competency' : 'Needs reinforcement'}
        </div>
      </div>

      {/* Study Streak */}
      <div className="stat-card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#475569' }}>
            Study Streak
          </span>
          <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#fffbeb', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f59e0b' }}>
            <Flame size={17} />
          </div>
        </div>
        <div style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.25rem' }}>
          {streak} {streak === 1 ? 'Day' : 'Days'}
        </div>
        <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
          Consecutive active recall practice
        </div>
      </div>

      {/* Total Practice Attempts */}
      <div className="stat-card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#475569' }}>
            Questions Solved
          </span>
          <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#ecfdf5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981' }}>
            <CheckCircle2 size={17} />
          </div>
        </div>
        <div style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.25rem' }}>
          {attempts}
        </div>
        <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
          Active test submissions logged
        </div>
      </div>

      {/* Due for Review Today */}
      <div
        className="stat-card"
        onClick={dueCount > 0 && onReviewDue ? onReviewDue : undefined}
        style={{
          cursor: dueCount > 0 && onReviewDue ? 'pointer' : 'default',
          transition: 'all 200ms ease',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#475569' }}>
            Due Today (SM-2)
          </span>
          <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#f0f9ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0284c7' }}>
            <Calendar size={17} />
          </div>
        </div>
        <div style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.25rem' }}>
          {dueCount} {dueCount === 1 ? 'Item' : 'Items'}
        </div>
        <div style={{ fontSize: '0.78rem', color: dueCount > 0 ? '#0284c7' : '#64748b', display: 'flex', alignItems: 'center', gap: '0.25rem', fontWeight: dueCount > 0 ? 600 : 400 }}>
          <span>{dueCount > 0 ? 'Review flashcards now' : 'All caught up for today!'}</span>
          {dueCount > 0 && <ArrowRight size={13} />}
        </div>
      </div>
    </div>
  );
}
