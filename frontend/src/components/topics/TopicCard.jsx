import React from 'react';
import { 
  ChevronDown, 
  ChevronRight, 
  Layers, 
  HelpCircle, 
  Sparkles, 
  Edit3, 
  Trash2, 
  CheckCircle2 
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import Button from '../common/Button';

export default function TopicCard({
  topic,
  isSubtopic = false,
  isExpanded = true,
  onToggleExpand,
  onEdit,
  onDelete,
  onGenerateQuestions,
}) {
  const { navigate, currentSpace } = useApp();
  const hasSubtopics = topic.subtopics && topic.subtopics.length > 0;

  return (
    <div
      style={{
        background: '#ffffff',
        border: `1px solid ${isSubtopic ? '#e2e8f0' : '#cbd5e1'}`,
        borderRadius: 'var(--radius-lg)',
        padding: '1.25rem 1.5rem',
        marginBottom: '0.85rem',
        boxShadow: isSubtopic ? 'none' : 'var(--shadow-card)',
        transition: 'all var(--transition-fast)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
        {/* Left side: Expander & Content */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', flex: 1, minWidth: '280px' }}>
          {hasSubtopics ? (
            <button
              onClick={onToggleExpand}
              className="btn btn-ghost btn-sm"
              style={{ padding: '0.25rem', marginTop: '0.15rem', color: '#64748b' }}
              title={isExpanded ? 'Collapse subtopics' : 'Expand subtopics'}
            >
              {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
            </button>
          ) : (
            <div style={{ width: '22px', height: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '0.15rem', color: '#94a3b8' }}>
              •
            </div>
          )}

          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.35rem', flexWrap: 'wrap' }}>
              <h4 style={{ fontSize: isSubtopic ? '0.98rem' : '1.15rem', fontWeight: 700, color: '#0f172a' }}>
                {topic.name}
              </h4>

              {/* Badges */}
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <span className="badge badge-neutral" title="Source text chunks">
                  <Layers size={12} color="#0284c7" />
                  <span>{topic.chunk_count || 0} chunks</span>
                </span>
                <span className="badge badge-primary" title="Generated questions">
                  <HelpCircle size={12} color="#2563eb" />
                  <span>{topic.question_count || 0} questions</span>
                </span>
              </div>
            </div>

            {topic.summary && (
              <p style={{ color: '#64748b', fontSize: '0.86rem', lineHeight: 1.5, maxWidth: '820px' }}>
                {topic.summary}
              </p>
            )}
          </div>
        </div>

        {/* Right side: Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => onGenerateQuestions(topic)}
            title="Generate more questions from source chunks"
            style={{ borderRadius: 'var(--radius-full)', color: '#2563eb', fontWeight: 600 }}
          >
            <Sparkles size={14} />
            <span>Generate</span>
          </button>

          <button
            className="btn btn-primary btn-sm"
            onClick={() => navigate('quiz', currentSpace?.id)}
            title="Take quiz on this topic"
            style={{ borderRadius: 'var(--radius-full)' }}
          >
            <CheckCircle2 size={14} />
            <span>Practice</span>
          </button>

          <button
            className="btn btn-ghost btn-sm"
            onClick={() => onEdit(topic)}
            title="Edit topic"
            style={{ padding: '0.35rem', color: '#94a3b8' }}
          >
            <Edit3 size={15} />
          </button>

          <button
            className="btn btn-ghost btn-sm"
            onClick={() => onDelete(topic)}
            title="Delete topic"
            style={{ padding: '0.35rem', color: '#94a3b8' }}
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}
