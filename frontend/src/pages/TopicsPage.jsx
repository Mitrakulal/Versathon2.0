import React, { useState, useEffect, useCallback } from 'react';
import { Layers, Sparkles, Plus, AlertCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { topicsService } from '../services/topicsService';
import { questionsService } from '../services/questionsService';
import TopicTree from '../components/topics/TopicTree';
import TopicEditModal from '../components/topics/TopicEditModal';
import Button from '../components/common/Button';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';

export default function TopicsPage() {
  const { currentSpace, showToast, navigate } = useApp();
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingTopic, setEditingTopic] = useState(null);
  const [generatingFor, setGeneratingFor] = useState(null);

  const fetchTopics = useCallback(async () => {
    if (!currentSpace) return;
    try {
      setLoading(true);
      const data = await topicsService.getTopicTree(currentSpace.id);
      setTopics(data || []);
    } catch (err) {
      console.error('Failed to load topics', err);
    } finally {
      setLoading(false);
    }
  }, [currentSpace]);

  useEffect(() => {
    fetchTopics();
  }, [fetchTopics]);

  const handleEditTopic = (topic) => {
    setEditingTopic(topic);
  };

  const handleTopicUpdated = (updated) => {
    setTopics((prev) =>
      prev.map((t) => {
        if (t.id === updated.id) {
          return { ...t, ...updated };
        }
        if (t.subtopics) {
          return {
            ...t,
            subtopics: t.subtopics.map((sub) =>
              sub.id === updated.id ? { ...sub, ...updated } : sub
            ),
          };
        }
        return t;
      })
    );
  };

  const handleDeleteTopic = async (topic) => {
    if (window.confirm(`Are you sure you want to delete topic "${topic.name}"?`)) {
      try {
        await topicsService.deleteTopic(topic.id);
        showToast(`Topic "${topic.name}" deleted.`, 'info');
        setTopics((prev) =>
          prev
            .filter((t) => t.id !== topic.id)
            .map((t) => ({
              ...t,
              subtopics: t.subtopics?.filter((sub) => sub.id !== topic.id) || [],
            }))
        );
      } catch (err) {
        showToast(err.detail || 'Failed to delete topic.', 'error');
      }
    }
  };

  const handleGenerateQuestions = async (topic) => {
    try {
      setGeneratingFor(topic.id);
      await questionsService.generateQuestions(currentSpace.id, {
        topic_id: topic.id,
        count: 5,
      });
      showToast(`Generating questions for "${topic.name}"!`, 'success');
      handleTopicUpdated({
        id: topic.id,
        question_count: (topic.question_count || 0) + 5,
      });
    } catch (err) {
      showToast(err.detail || 'Generation failed.', 'error');
    } finally {
      setGeneratingFor(null);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Analyzing notes and structuring topic outline..." />;
  }

  const totalTopics = topics.length;
  const totalSubtopics = topics.reduce(
    (acc, t) => acc + (t.subtopics ? t.subtopics.length : 0),
    0
  );
  const totalQuestions = topics.reduce((acc, t) => {
    const subQ = (t.subtopics || []).reduce((s, st) => s + (st.question_count || 0), 0);
    return acc + (t.question_count || 0) + subQ;
  }, 0);

  return (
    <div>
      {/* Header Banner */}
      <div className="glass-card" style={{ marginBottom: '2rem', padding: '2rem', borderRadius: 'var(--radius-xl)' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#2563eb', fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.4rem' }}>
              <Layers size={14} />
              <span>Hierarchical Knowledge Map</span>
            </div>
            <h1 style={{ fontSize: '1.85rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.5rem' }}>
              Topic Outline & Taxonomy
            </h1>
            <p style={{ color: '#64748b', maxWidth: '720px', fontSize: '0.95rem', lineHeight: 1.5 }}>
              Extracted from your notes. Review topics, edit titles, and generate targeted question banks grounded in your study material.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <Button
              variant="primary"
              icon={Sparkles}
              onClick={() => handleGenerateQuestions({ id: 'all', name: 'All Topics' })}
              loading={generatingFor === 'all'}
              style={{ borderRadius: 'var(--radius-full)' }}
            >
              Generate All Questions
            </Button>
          </div>
        </div>

        {/* Aggregate topic metrics */}
        <div style={{ display: 'flex', gap: '2rem', borderTop: '1px solid #f1f5f9', paddingTop: '1.25rem', flexWrap: 'wrap' }}>
          <div>
            <span style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a' }}>{totalTopics}</span>
            <span style={{ fontSize: '0.82rem', color: '#64748b', marginLeft: '0.4rem' }}>Main Topics</span>
          </div>
          <div>
            <span style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0284c7' }}>{totalSubtopics}</span>
            <span style={{ fontSize: '0.82rem', color: '#64748b', marginLeft: '0.4rem' }}>Subtopics</span>
          </div>
          <div>
            <span style={{ fontSize: '1.35rem', fontWeight: 800, color: '#2563eb' }}>{totalQuestions}</span>
            <span style={{ fontSize: '0.82rem', color: '#64748b', marginLeft: '0.4rem' }}>Total Questions</span>
          </div>
        </div>
      </div>

      {/* Topics Hierarchy List */}
      {topics.length === 0 ? (
        <EmptyState
          icon={Layers}
          title="No topics extracted yet"
          description="Upload study notes or paste lecture transcripts in the Overview section to extract the initial topic outline."
          actionText="Go to Notes & Documents"
          onAction={() => navigate('overview', currentSpace?.id)}
        />
      ) : (
        <TopicTree
          topics={topics}
          onEditTopic={handleEditTopic}
          onDeleteTopic={handleDeleteTopic}
          onGenerateQuestions={handleGenerateQuestions}
        />
      )}

      {/* Edit Modal */}
      <TopicEditModal
        isOpen={!!editingTopic}
        onClose={() => setEditingTopic(null)}
        topic={editingTopic}
        onUpdated={handleTopicUpdated}
      />
    </div>
  );
}
