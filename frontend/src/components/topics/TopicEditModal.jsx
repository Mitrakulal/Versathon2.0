import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import { topicsService } from '../../services/topicsService';
import { useApp } from '../../context/AppContext';

export default function TopicEditModal({ isOpen, onClose, topic, onUpdated }) {
  const { showToast } = useApp();
  const [name, setName] = useState('');
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (topic) {
      setName(topic.name || '');
      setSummary(topic.summary || '');
      setError(null);
    }
  }, [topic]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Topic name cannot be empty.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const updated = await topicsService.updateTopic(topic.id, {
        name: name.trim(),
        summary: summary.trim(),
      });
      showToast(`Topic updated successfully!`, 'success');
      if (onUpdated) onUpdated(updated);
      onClose();
    } catch (err) {
      setError(err.detail || 'Failed to update topic.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Topic Details"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            loading={loading}
            id="topic-save-btn"
          >
            Save Changes
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit}>
        {error && (
          <div style={{ padding: '0.75rem 1rem', background: 'rgba(244, 63, 94, 0.15)', border: '1px solid rgba(244, 63, 94, 0.3)', borderRadius: 'var(--radius-md)', color: '#fb7185', marginBottom: '1rem', fontSize: '0.88rem' }}>
            {error}
          </div>
        )}

        <div className="form-group">
          <label className="form-label" htmlFor="edit-topic-name">
            Topic Name <span style={{ color: '#fb7185' }}>*</span>
          </label>
          <input
            id="edit-topic-name"
            type="text"
            className="form-input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            autoFocus
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="edit-topic-summary">
            Summary / Outline Notes
          </label>
          <textarea
            id="edit-topic-summary"
            className="form-textarea"
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            rows={4}
          />
        </div>
      </form>
    </Modal>
  );
}
