import React, { useState, useEffect, useCallback } from 'react';
import { PieChart, Sparkles, CheckCircle2, RefreshCw } from 'lucide-react';
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
    navigate('quiz', currentSpace?.id);
  };

  if (loading && !dashboard) {
    return <LoadingSpinner text="Computing topic mastery model and SM-2 retention metrics..." />;
  }

  return (
    <div>
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
      <StatsOverview dashboard={dashboard} />

      {/* Revise Next Recommendations */}
      <ReviseNextCard
        recommendations={dashboard?.revise_next}
        onStartFocusedQuiz={handleStartFocusedQuiz}
      />

      {/* Topic Mastery Heatmap */}
      <MasteryHeatmap topics={dashboard?.topics} />

      {/* Categorized Topic List */}
      <TopicMasteryList topics={dashboard?.topics} />
    </div>
  );
}
