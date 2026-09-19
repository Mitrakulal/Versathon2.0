import React, { useState } from 'react';
import {
  Plus,
  Search,
  FolderGit2,
  BookOpen,
  Layers,
  CheckCircle2,
  HelpCircle,
  Clock,
  Award,
  ArrowRight,
} from 'lucide-react';
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
  const totalQuestions = spaces.reduce((sum, s) => sum + (s.question_count || 0), 0);

  // Find the most populated space for quick-start practice
  const activePracticeSpace =
    [...spaces].sort((a, b) => (b.question_count || 0) - (a.question_count || 0))[0] || spaces[0];

  if (loadingSpaces) {
    return <LoadingSpinner text="Loading your study spaces..." />;
  }

  return (
    <div>
      {/* Welcome Banner */}
      <div className="welcome-banner">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1.5rem', position: 'relative', zIndex: 2 }}>
          <div style={{ maxWidth: '640px' }}>
            <h1 style={{ fontSize: '1.95rem', fontWeight: 700, marginBottom: '0.65rem' }}>
              Welcome to NoteRecall! 🧠
            </h1>
            <p style={{ fontSize: '0.96rem', lineHeight: 1.55, opacity: 0.95, marginBottom: '1.35rem' }}>
              {spaces.length > 0 ? (
                <>
                  You have <strong style={{ textDecoration: 'underline' }}>{totalQuestions} active recall questions</strong> and{' '}
                  <strong>{totalTopics} topics</strong> ready across {spaces.length} course spaces.
                </>
              ) : (
                'Upload your lecture slides, PDFs, or notes to automatically generate grounded practice questions and flashcards.'
              )}
            </p>

            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <button
                type="button"
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

              {activePracticeSpace && (
                <button
                  type="button"
                  onClick={() => navigate('quiz', activePracticeSpace.id)}
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
                  <span>Practice ({activePracticeSpace.title})</span>
                </button>
              )}
            </div>
          </div>

          {/* Learning Illustration Badge */}
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

      {/* Top Real Metrics Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
        {/* Card 1: Ingested Lecture Materials */}
        <div className="stat-card">
          <div>
            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#475569', marginBottom: '0.75rem' }}>
              Lecture Materials
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.5rem' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563eb' }}>
                <BookOpen size={17} />
              </div>
              <span style={{ fontSize: '1.65rem', fontWeight: 800, color: '#0f172a' }}>
                {totalDocs}
              </span>
            </div>
          </div>
          <p style={{ fontSize: '0.78rem', color: '#64748b' }}>
            Documents and transcripts uploaded across your spaces.
          </p>
        </div>

        {/* Card 2: Generated Question Bank */}
        <div className="stat-card">
          <div>
            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#475569', marginBottom: '0.75rem' }}>
              Practice Question Bank
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.5rem' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#ecfdf5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981' }}>
                <HelpCircle size={17} />
              </div>
              <span style={{ fontSize: '1.65rem', fontWeight: 800, color: '#0f172a' }}>
                {totalQuestions}
              </span>
            </div>
          </div>
          <p style={{ fontSize: '0.78rem', color: '#64748b' }}>
            Grounded recall questions extracted across {totalTopics} topics.
          </p>
        </div>

        {/* Card 3: Study Spaces Active */}
        <div className="stat-card">
          <div>
            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#475569', marginBottom: '0.75rem' }}>
              Active Course Notebooks
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.5rem' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#fffbeb', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f59e0b' }}>
                <Layers size={17} />
              </div>
              <span style={{ fontSize: '1.65rem', fontWeight: 800, color: '#0f172a' }}>
                {spaces.length}
              </span>
            </div>
          </div>
          <p style={{ fontSize: '0.78rem', color: '#64748b' }}>
            Individual study spaces organized with notes and flashcards.
          </p>
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
