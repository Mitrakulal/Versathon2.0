import React, { useState } from 'react';
import { Plus, Search, FolderGit2, BookOpen, Layers, CheckCircle2, Sparkles, Clock, Star, Award, ArrowRight } from 'lucide-react';
import { useApp } from '../context/AppContext';
import SpaceCard from '../components/upload/SpaceCard';
import EmptyState from '../components/common/EmptyState';
import Button from '../components/common/Button';
import LoadingSpinner from '../components/common/LoadingSpinner';

export default function SpacesPage({ onOpenCreateSpace }) {
  const { spaces, loadingSpaces, navigate } = useApp();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredSpaces = spaces.filter(space =>
    space.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (space.description && space.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const totalDocs = spaces.reduce((sum, s) => sum + (s.document_count || 0), 0);
  const totalTopics = spaces.reduce((sum, s) => sum + (s.topic_count || 0), 0);

  if (loadingSpaces) {
    return <LoadingSpinner text="Loading your study spaces..." />;
  }

  return (
    <div>
      {/* Welcome Blue Card (Exact style from Studdy reference) */}
      <div className="welcome-banner">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1.5rem', position: 'relative', zIndex: 2 }}>
          <div style={{ maxWidth: '640px' }}>
            <h1 style={{ fontSize: '1.95rem', fontWeight: 700, marginBottom: '0.65rem' }}>
              Welcome back, Learner! 👋
            </h1>
            <p style={{ fontSize: '1rem', lineHeight: 1.5, opacity: 0.95, marginBottom: '1.25rem' }}>
              You've mastered <strong style={{ textDecoration: 'underline' }}>70%</strong> of your active recall targets this week! Keep it up to reinforce memory retention.
            </p>

            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <button
                onClick={onOpenCreateSpace}
                style={{
                  background: '#ffffff',
                  color: '#1d4ed8',
                  border: 'none',
                  padding: '0.65rem 1.25rem',
                  borderRadius: 'var(--radius-full)',
                  fontWeight: 700,
                  fontSize: '0.88rem',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                }}
              >
                <Plus size={16} />
                <span>Create New Space</span>
              </button>

              {spaces.length > 0 && (
                <button
                  onClick={() => navigate('quiz', spaces[0].id)}
                  style={{
                    background: 'rgba(255, 255, 255, 0.2)',
                    color: '#ffffff',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    padding: '0.65rem 1.25rem',
                    borderRadius: 'var(--radius-full)',
                    fontWeight: 600,
                    fontSize: '0.88rem',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                  }}
                >
                  <CheckCircle2 size={16} />
                  <span>Start Daily Revision</span>
                </button>
              )}
            </div>
          </div>

          {/* Decorative Learning Illustration / Badge */}
          <div
            style={{
              width: '96px',
              height: '96px',
              borderRadius: 'var(--radius-xl)',
              background: 'rgba(255, 255, 255, 0.15)',
              border: '2px solid rgba(255, 255, 255, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              boxShadow: '0 8px 30px rgba(0, 0, 0, 0.15)',
            }}
          >
            <BookOpen size={48} />
          </div>
        </div>
      </div>

      {/* Top 3 KPI Cards (Matching Studdy Reference Header Cards) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
        {/* Card 1: Attendance / Streak */}
        <div className="stat-card">
          <div>
            <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#475569', marginBottom: '0.75rem' }}>
              Study Consistency
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.5rem' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563eb' }}>
                <Clock size={17} />
              </div>
              <span style={{ fontSize: '1.65rem', fontWeight: 800, color: '#0f172a' }}>
                19/20
              </span>
            </div>
          </div>
          <p style={{ fontSize: '0.78rem', color: '#64748b' }}>
            Well done! You're attending all active recall sessions this month.
          </p>
        </div>

        {/* Card 2: Questions Solved */}
        <div className="stat-card">
          <div>
            <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#475569', marginBottom: '0.75rem' }}>
              Questions Solved
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.5rem' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563eb' }}>
                <CheckCircle2 size={17} />
              </div>
              <span style={{ fontSize: '1.65rem', fontWeight: 800, color: '#0f172a' }}>
                53/56
              </span>
            </div>
          </div>
          <p style={{ fontSize: '0.78rem', color: '#64748b' }}>
            Don't forget about your next scheduled SM-2 flashcard review.
          </p>
        </div>

        {/* Card 3: Retention Rating */}
        <div className="stat-card">
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#475569' }}>Retention Rating</span>
                <span style={{ background: '#2563eb', color: '#ffffff', fontSize: '0.65rem', fontWeight: 700, padding: '0.15rem 0.4rem', borderRadius: 'var(--radius-full)' }}>
                  AI powered ✨
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.5rem' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563eb' }}>
                  <Star size={17} />
                </div>
                <span style={{ fontSize: '1.65rem', fontWeight: 800, color: '#0f172a' }}>
                  89/100
                </span>
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.25rem' }}>
            <span
              style={{ color: '#2563eb', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer' }}
              onClick={() => spaces[0] && navigate('dashboard', spaces[0].id)}
            >
              Go to report →
            </span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', gap: '1rem', flexWrap: 'wrap' }}>
        <div>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 700, color: '#0f172a' }}>Your Study Spaces</h2>
          <p style={{ fontSize: '0.84rem', color: '#64748b' }}>
            {spaces.length} active spaces with {totalDocs} documents and {totalTopics} extracted topics
          </p>
        </div>
        
        <div style={{ position: 'relative', minWidth: '280px' }}>
          <Search size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          <input
            type="text"
            className="form-input"
            placeholder="Search study spaces..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ paddingLeft: '2.5rem', width: '100%', borderRadius: 'var(--radius-full)' }}
            id="spaces-search-input"
          />
        </div>
      </div>

      {/* Spaces Grid */}
      {filteredSpaces.length === 0 ? (
        <EmptyState
          icon={FolderGit2}
          title={searchTerm ? 'No matching study spaces' : 'No study spaces yet'}
          description={searchTerm ? `No spaces matched "${searchTerm}". Try another query.` : 'Create your first study space to start uploading notes and generating practice quizzes.'}
          actionText={searchTerm ? 'Clear Search' : 'Create First Space'}
          onAction={searchTerm ? () => setSearchTerm('') : onOpenCreateSpace}
          actionIcon={Plus}
        />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
          {filteredSpaces.map((space) => (
            <SpaceCard key={space.id} space={space} />
          ))}
        </div>
      )}
    </div>
  );
}
