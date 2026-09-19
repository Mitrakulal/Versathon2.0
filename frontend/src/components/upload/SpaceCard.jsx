import React from 'react';
import { BookOpen, Layers, CheckCircle2, Trash2, ArrowRight, HelpCircle } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { spacesService } from '../../services/spacesService';
import Button from '../common/Button';

export default function SpaceCard({ space }) {
  const { navigate, refreshSpaces, showToast } = useApp();

  const handleDelete = async (e) => {
    e.stopPropagation();
    if (window.confirm(`Are you sure you want to delete "${space.title}"?`)) {
      try {
        await spacesService.deleteSpace(space.id);
        showToast(`Space "${space.title}" removed`, 'info');
        await refreshSpaces();
      } catch (err) {
        showToast(err.detail || 'Failed to delete space', 'error');
      }
    }
  };

  return (
    <div
      className="glass-card glass-card-hover"
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        cursor: 'pointer',
        minHeight: '230px',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-card)',
        padding: '1.5rem',
      }}
      onClick={() => navigate('overview', space.id)}
      id={`space-card-${space.id}`}
    >
      <div>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '0.65rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: 'var(--radius-md)',
                background: '#eff6ff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#2563eb',
              }}
            >
              <BookOpen size={18} />
            </div>
            <h3 style={{ fontSize: '1.15rem', color: '#0f172a', fontWeight: 700 }}>
              {space.title}
            </h3>
          </div>

          <button
            className="btn btn-ghost btn-sm"
            onClick={handleDelete}
            title="Delete space"
            style={{ color: '#94a3b8', padding: '0.35rem' }}
          >
            <Trash2 size={15} />
          </button>
        </div>

        <p style={{ color: '#64748b', fontSize: '0.88rem', lineClamp: 2, display: '-webkit-box', WebkitBoxOrient: 'vertical', overflow: 'hidden', marginBottom: '1.25rem', lineHeight: 1.5 }}>
          {space.description || 'No description provided for this space.'}
        </p>
      </div>

      <div>
        {/* Stats Row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
          <span className="badge badge-primary" style={{ gap: '0.3rem', fontSize: '0.74rem' }}>
            <BookOpen size={12} />
            <span>{space.document_count || 0} Docs</span>
          </span>
          <span className="badge badge-neutral" style={{ gap: '0.3rem', fontSize: '0.74rem' }}>
            <Layers size={12} color="#0284c7" />
            <span>{space.topic_count || 0} Topics</span>
          </span>
          {(space.question_count || 0) > 0 && (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.3rem',
                fontSize: '0.74rem',
                fontWeight: 600,
                color: '#059669',
                background: '#ecfdf5',
                border: '1px solid #a7f3d0',
                padding: '0.15rem 0.55rem',
                borderRadius: 'var(--radius-full)',
              }}
            >
              <HelpCircle size={12} />
              <span>{space.question_count} Questions</span>
            </span>
          )}
        </div>

        {/* Action Row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #f1f5f9', paddingTop: '0.85rem' }}>
          <button
            className="btn btn-ghost btn-sm"
            onClick={(e) => {
              e.stopPropagation();
              navigate('quiz', space.id);
            }}
            style={{ color: '#2563eb', fontWeight: 600, gap: '0.35rem' }}
          >
            <CheckCircle2 size={15} />
            <span>Quiz Mode</span>
          </button>

          <Button
            variant="primary"
            size="sm"
            icon={ArrowRight}
            onClick={(e) => {
              e.stopPropagation();
              navigate('overview', space.id);
            }}
            style={{ borderRadius: 'var(--radius-full)' }}
          >
            Open Space
          </Button>
        </div>
      </div>
    </div>
  );
}
