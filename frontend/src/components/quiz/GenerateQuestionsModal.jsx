import React, { useState } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import { questionsService } from '../../services/questionsService';
import { useApp } from '../../context/AppContext';
import { Sparkles, Layers, Sliders, CheckSquare, Square } from 'lucide-react';

const QUESTION_TYPES = [
  { id: 'mcq', label: 'Multiple Choice (MCQ)' },
  { id: 'flashcard', label: 'Flashcards' },
  { id: 'short_answer', label: 'Short Answer' },
  { id: 'fill_blank', label: 'Fill in the Blank' },
];

const COUNT_OPTIONS = [3, 5, 10, 15];
const DIFFICULTY_OPTIONS = [
  { id: 'easy', label: 'Easy' },
  { id: 'medium', label: 'Medium' },
  { id: 'hard', label: 'Hard' },
];

export default function GenerateQuestionsModal({
  isOpen,
  onClose,
  spaceId,
  topics = [],
  onSuccess,
}) {
  const { showToast } = useApp();
  const [selectedTopic, setSelectedTopic] = useState('');
  const [count, setCount] = useState(5);
  const [difficulty, setDifficulty] = useState('medium');
  const [selectedTypes, setSelectedTypes] = useState(['mcq', 'flashcard', 'short_answer']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const toggleType = (typeId) => {
    if (selectedTypes.includes(typeId)) {
      if (selectedTypes.length === 1) {
        showToast('At least one question type must be selected.', 'warning');
        return;
      }
      setSelectedTypes(selectedTypes.filter((t) => t !== typeId));
    } else {
      setSelectedTypes([...selectedTypes, typeId]);
    }
  };

  const handleGenerate = async () => {
    if (selectedTypes.length === 0) {
      setError('Please select at least one question type.');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const payload = {
        topic_id: selectedTopic ? selectedTopic : undefined,
        count: parseInt(count, 10),
        difficulty,
        types: selectedTypes,
      };

      await questionsService.generateQuestions(spaceId, payload);
      showToast(`Generated ${count} new practice questions!`, 'success');
      if (onSuccess) {
        onSuccess();
      }
      onClose();
    } catch (err) {
      setError(err.detail || 'Failed to generate questions. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Flatten topics for clean dropdown options
  const flatTopics = [];
  (topics || []).forEach((t) => {
    flatTopics.push({ id: t.id, name: t.name, isParent: true });
    (t.subtopics || []).forEach((st) => {
      flatTopics.push({ id: st.id, name: `↳ ${st.name}`, isParent: false });
    });
  });

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Generate Grounded Practice Questions"
      maxWidth="540px"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            variant="primary"
            icon={Sparkles}
            onClick={handleGenerate}
            loading={loading}
          >
            {loading ? 'Generating...' : `Generate ${count} Questions`}
          </Button>
        </>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {error && (
          <div
            style={{
              padding: '0.75rem 1rem',
              background: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: 'var(--radius-md)',
              color: '#dc2626',
              fontSize: '0.86rem',
            }}
          >
            {error}
          </div>
        )}

        {/* Target Topic Selection */}
        <div>
          <label
            style={{
              display: 'block',
              fontSize: '0.85rem',
              fontWeight: 600,
              color: '#334155',
              marginBottom: '0.4rem',
            }}
          >
            Select Target Topic
          </label>
          <select
            className="form-select"
            value={selectedTopic}
            onChange={(e) => setSelectedTopic(e.target.value)}
            style={{ width: '100%' }}
          >
            <option value="">All Topics (Balanced across study notes)</option>
            {flatTopics.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
          <span style={{ fontSize: '0.76rem', color: '#94a3b8', marginTop: '0.25rem', display: 'block' }}>
            Leave as "All Topics" to sample questions evenly from the whole document.
          </span>
        </div>

        {/* Question Count Pills */}
        <div>
          <label
            style={{
              display: 'block',
              fontSize: '0.85rem',
              fontWeight: 600,
              color: '#334155',
              marginBottom: '0.4rem',
            }}
          >
            Number of Questions
          </label>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {COUNT_OPTIONS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setCount(c)}
                style={{
                  flex: 1,
                  padding: '0.55rem 0',
                  borderRadius: 'var(--radius-md)',
                  border: count === c ? '2px solid #2563eb' : '1px solid #e2e8f0',
                  background: count === c ? '#eff6ff' : '#ffffff',
                  color: count === c ? '#1d4ed8' : '#475569',
                  fontWeight: count === c ? 700 : 500,
                  fontSize: '0.88rem',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                {c} Questions
              </button>
            ))}
          </div>
        </div>

        {/* Question Types (Checkboxes / Pills) */}
        <div>
          <label
            style={{
              display: 'block',
              fontSize: '0.85rem',
              fontWeight: 600,
              color: '#334155',
              marginBottom: '0.4rem',
            }}
          >
            Question Formats
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
            {QUESTION_TYPES.map((t) => {
              const isChecked = selectedTypes.includes(t.id);
              return (
                <div
                  key={t.id}
                  onClick={() => toggleType(t.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.6rem',
                    padding: '0.6rem 0.85rem',
                    borderRadius: 'var(--radius-md)',
                    border: isChecked ? '1px solid #93c5fd' : '1px solid #e2e8f0',
                    background: isChecked ? '#f0f7ff' : '#ffffff',
                    cursor: 'pointer',
                    userSelect: 'none',
                    fontSize: '0.84rem',
                    color: isChecked ? '#1e40af' : '#475569',
                    fontWeight: isChecked ? 600 : 500,
                  }}
                >
                  {isChecked ? (
                    <CheckSquare size={16} color="#2563eb" />
                  ) : (
                    <Square size={16} color="#94a3b8" />
                  )}
                  <span>{t.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Difficulty Selector */}
        <div>
          <label
            style={{
              display: 'block',
              fontSize: '0.85rem',
              fontWeight: 600,
              color: '#334155',
              marginBottom: '0.4rem',
            }}
          >
            Target Difficulty
          </label>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {DIFFICULTY_OPTIONS.map((d) => (
              <button
                key={d.id}
                type="button"
                onClick={() => setDifficulty(d.id)}
                style={{
                  flex: 1,
                  padding: '0.5rem 0',
                  borderRadius: 'var(--radius-md)',
                  border: difficulty === d.id ? '2px solid #2563eb' : '1px solid #e2e8f0',
                  background: difficulty === d.id ? '#eff6ff' : '#ffffff',
                  color: difficulty === d.id ? '#1d4ed8' : '#475569',
                  fontWeight: difficulty === d.id ? 700 : 500,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                {d.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </Modal>
  );
}
