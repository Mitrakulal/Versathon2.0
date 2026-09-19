import React from 'react';
import { Target, Flame, Calendar, CheckCircle2 } from 'lucide-react';

export default function StatsOverview({ dashboard }) {
  const masteryPercent = Math.round((dashboard?.overall_mastery || 0) * 100);
  const streak = dashboard?.study_streak_days || 0;
  const attempts = dashboard?.total_attempts || 0;
  const dueCount = dashboard?.due_today_count || 0;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
      {/* Overall Mastery */}
      <div className="stat-card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#475569' }}>
            Overall Mastery
          </span>
          <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563eb' }}>
            <Target size={17} />
          </div>
        </div>
        <div style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.25rem' }}>
          {masteryPercent}%
        </div>
        <div style={{ fontSize: '0.78rem', color: masteryPercent >= 75 ? '#059669' : masteryPercent >= 50 ? '#d97706' : '#dc2626', fontWeight: 600 }}>
          {masteryPercent >= 75 ? 'Strong overall retention' : masteryPercent >= 50 ? 'Developing competency' : 'Needs reinforcement'}
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
          {streak} Days
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
      <div className="stat-card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#475569' }}>
            Due Today (SM-2)
          </span>
          <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#f0f9ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0284c7' }}>
            <Calendar size={17} />
          </div>
        </div>
        <div style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.25rem' }}>
          {dueCount} Items
        </div>
        <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
          Scheduled for spaced recall today
        </div>
      </div>
    </div>
  );
}
