import React, { useState, useEffect, useCallback } from 'react';
import { PieChart, Sparkles, CheckCircle2, RefreshCw, BarChart3, LayoutGrid } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { dashboardService } from '../services/dashboardService';
import StatsOverview from '../components/dashboard/StatsOverview';
import MasteryHeatmap from '../components/dashboard/MasteryHeatmap';
import ReviseNextCard from '../components/dashboard/ReviseNextCard';
import TopicMasteryList from '../components/dashboard/TopicMasteryList';
import Button from '../components/common/Button';
import LoadingSpinner from '../components/common/LoadingSpinner';

export default function DashboardPage() {
  const { currentSpace, navigate } = useApp();
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('list'); // 'list' | 'heatmap'

  const fetchDashboard = useCallback(async () => {
    if (!currentSpace) return;
    try {
      setLoading(true);
      const data = await dashboardService.getDashboard(currentSpace.id);
      setDashboard(data);
    } catch (err) {
      console.error('Error fetching dashboard', err);
    } finally {
      setLoading(false);
    }
  }, [currentSpace]);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  const handleStartFocusedQuiz = (topicId) => {
    navigate('quiz', currentSpace?.id, { topic_id: topicId });
  };

  const handleReviewDue = () => {
    navigate('flashcards', currentSpace?.id);
  };

  if (loading && !dashboard) {
    return <LoadingSpinner text="Computing topic mastery model and SM-2 retention metrics..." />;
  }

  return (
    <div style={{ maxWidth: '1080px', margin: '0 auto', paddingBottom: '3rem' }}>
      {/* Header Banner */}
      <div className="glass-card" style={{ marginBottom: '2rem', padding: '2rem', borderRadius: 'var(--radius-xl)' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#2563eb', fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.4rem' }}>
              <PieChart size={14} />
              <span>Learner Mastery Model</span>
            </div>
            <h1 style={{ fontSize: '1.85rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.5rem' }}>
              Mastery & Retention Analytics
            </h1>
            <p style={{ color: '#64748b', maxWidth: '720px', fontSize: '0.95rem', lineHeight: 1.5 }}>
              Real-time measurement of your knowledge retention for "{currentSpace?.title}". Practice weak topics to build long-term memory.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <Button
              variant="secondary"
              icon={RefreshCw}
              onClick={fetchDashboard}
              size="sm"
              style={{ borderRadius: 'var(--radius-full)' }}
            >
              Refresh
            </Button>
            <Button
              variant="primary"
              icon={CheckCircle2}
              onClick={() => navigate('quiz', currentSpace?.id)}
              style={{ borderRadius: 'var(--radius-full)' }}
            >
              Adaptive Practice
            </Button>
          </div>
        </div>
      </div>

      {/* KPI Stats Overview */}
      <StatsOverview dashboard={dashboard} onReviewDue={handleReviewDue} />

      {/* Revise Next Priority Recommendations */}
      <ReviseNextCard
        recommendations={dashboard?.revise_next}
        onStartFocusedQuiz={handleStartFocusedQuiz}
      />

      {/* View Switcher & Topic Mastery Container */}
      <div style={{ marginBottom: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.3rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.2rem' }}>
            Topic Performance Breakdown
          </h2>
          <p style={{ fontSize: '0.85rem', color: '#64748b' }}>
            Choose your preferred analytics view.
          </p>
        </div>

        {/* View Mode Toggle */}
        <div style={{ display: 'flex', gap: '0.3rem', background: '#e2e8f0', padding: '0.25rem', borderRadius: 'var(--radius-full)' }}>
          <button
            type="button"
            onClick={() => setViewMode('list')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: '0.35rem 0.9rem',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.78rem',
              fontWeight: 600,
              border: 'none',
              background: viewMode === 'list' ? '#ffffff' : 'transparent',
              color: viewMode === 'list' ? '#0f172a' : '#64748b',
              boxShadow: viewMode === 'list' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              cursor: 'pointer',
              transition: 'all var(--transition-fast)',
            }}
          >
            <BarChart3 size={14} />
            <span>Progress Bars</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode('heatmap')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: '0.35rem 0.9rem',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.78rem',
              fontWeight: 600,
              border: 'none',
              background: viewMode === 'heatmap' ? '#ffffff' : 'transparent',
              color: viewMode === 'heatmap' ? '#0f172a' : '#64748b',
              boxShadow: viewMode === 'heatmap' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              cursor: 'pointer',
              transition: 'all var(--transition-fast)',
            }}
          >
            <LayoutGrid size={14} />
            <span>Heatmap Grid</span>
          </button>
        </div>
      </div>

      {/* Render Selected View */}
      {viewMode === 'list' ? (
        <TopicMasteryList
          topics={dashboard?.topics}
          onPracticeTopic={handleStartFocusedQuiz}
        />
      ) : (
        <MasteryHeatmap
          topics={dashboard?.topics}
          onPracticeTopic={handleStartFocusedQuiz}
        />
      )}
    </div>
  );
}
