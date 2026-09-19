import React, { useState } from 'react';
import { AlignLeft, Sparkles, AlertCircle } from 'lucide-react';
import { documentsService } from '../../services/documentsService';
import { useApp } from '../../context/AppContext';
import Button from '../common/Button';

export default function TextPaster({ spaceId, onDocumentAdded }) {
  const { showToast } = useApp();
  const [filename, setFilename] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) {
      setError('Please paste your notes content before submitting.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const name = filename.trim() || `Lecture_Notes_${new Date().toISOString().slice(0, 10)}.txt`;
      const newDoc = await documentsService.pasteText(spaceId, name, content.trim());
      showToast(`Notes "${name}" submitted for processing!`, 'success');
      setContent('');
      setFilename('');
      if (onDocumentAdded) onDocumentAdded(newDoc);
    } catch (err) {
      setError(err.detail || 'Failed to submit pasted text.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-card">
      <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <AlignLeft size={18} color="#06b6d4" />
        Paste Raw Study Text
      </h3>
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
        Paste raw lecture transcripts, class notes, or article summaries directly.
      </p>

      {error && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.65rem 0.85rem', background: 'rgba(244, 63, 94, 0.15)', border: '1px solid rgba(244, 63, 94, 0.3)', borderRadius: 'var(--radius-md)', color: '#fb7185', marginBottom: '1rem', fontSize: '0.85rem' }}>
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label" htmlFor="paste-note-title">
            Note Title (Optional)
          </label>
          <input
            id="paste-note-title"
            type="text"
            className="form-input"
            placeholder="e.g. CPU Scheduling Notes.txt"
            value={filename}
            onChange={(e) => setFilename(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="paste-note-content">
            Note Content <span style={{ color: '#fb7185' }}>*</span>
          </label>
          <textarea
            id="paste-note-content"
            className="form-textarea"
            placeholder="Paste your markdown notes, textbook passages, or key points here..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={6}
            required
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
          <Button
            type="submit"
            variant="secondary"
            icon={Sparkles}
            loading={loading}
            id="submit-pasted-note-btn"
          >
            Process & Extract Topics
          </Button>
        </div>
      </form>
    </div>
  );
}
