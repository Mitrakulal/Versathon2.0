import React from 'react';
import Modal from '../common/Modal';
import { BookOpen, FileText, CheckCircle2 } from 'lucide-react';
import Button from '../common/Button';

export default function SourcePassageModal({ isOpen, onClose, question }) {
  if (!question) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Grounded Source Notes Citation"
      maxWidth="680px"
      footer={
        <Button variant="primary" onClick={onClose} style={{ borderRadius: 'var(--radius-full)' }}>
          Done
        </Button>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {/* Question prompt context */}
        <div style={{ padding: '0.85rem 1rem', background: '#f8fafc', borderRadius: 'var(--radius-md)', border: '1px solid #e2e8f0' }}>
          <div style={{ fontSize: '0.74rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700, marginBottom: '0.25rem' }}>
            Question Prompt
          </div>
          <div style={{ fontWeight: 700, fontSize: '0.94rem', color: '#0f172a' }}>
            {question.prompt}
          </div>
        </div>

        {/* Source passage highlight box */}
        <div
          style={{
            padding: '1.25rem',
            background: '#eff6ff',
            border: '1px solid #bfdbfe',
            borderRadius: 'var(--radius-lg)',
            borderLeft: '4px solid #2563eb',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.65rem', color: '#1d4ed8', fontWeight: 700, fontSize: '0.85rem' }}>
            <BookOpen size={16} />
            <span>Extracted Passage from Your Notes</span>
          </div>
          <blockquote style={{ fontStyle: 'italic', color: '#1e293b', fontSize: '0.92rem', lineHeight: 1.6 }}>
            {question.source_passage || 'Source passage directly tied to this note chunk.'}
          </blockquote>
        </div>

        {/* Answer & Explanation */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#059669', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <CheckCircle2 size={16} />
            <span>Verified Answer: {question.answer}</span>
          </div>
          {question.explanation && (
            <p style={{ fontSize: '0.85rem', color: '#64748b', lineHeight: 1.5 }}>
              {question.explanation}
            </p>
          )}
        </div>
      </div>
    </Modal>
  );
}
