import React, { useState } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import { spacesService } from '../../services/spacesService';
import { useApp } from '../../context/AppContext';

export default function CreateSpaceModal({ isOpen, onClose }) {
  const { refreshSpaces, setCurrentSpace, navigate, showToast } = useApp();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Please provide a title for the study space.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const newSpace = await spacesService.createSpace({
        title: title.trim(),
        description: description.trim(),
      });
      showToast(`Study Space "${newSpace.title}" created!`, 'success');
      await refreshSpaces();
      setCurrentSpace(newSpace);
      navigate('overview', newSpace.id);
      onClose();
      setTitle('');
      setDescription('');
    } catch (err) {
      setError(err.detail || 'Failed to create study space.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create New Study Space"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            loading={loading}
            id="create-space-submit-btn"
          >
            Create Space
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
          <label className="form-label" htmlFor="space-title">
            Space Title <span style={{ color: '#fb7185' }}>*</span>
          </label>
          <input
            id="space-title"
            type="text"
            className="form-input"
            placeholder="e.g. Operating Systems, Quantum Physics, Biology 101"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            autoFocus
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="space-description">
            Description (Optional)
          </label>
          <textarea
            id="space-description"
            className="form-textarea"
            placeholder="What material or exams is this study space for?"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
          />
        </div>
      </form>
    </Modal>
  );
}
