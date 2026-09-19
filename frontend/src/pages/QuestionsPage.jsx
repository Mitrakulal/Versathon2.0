import React, { useState, useEffect, useCallback } from 'react';
import { HelpCircle, Sparkles, CheckCircle2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { questionsService } from '../services/questionsService';
import QuestionFilters from '../components/quiz/QuestionFilters';
import QuestionCard from '../components/quiz/QuestionCard';
import SourcePassageModal from '../components/quiz/SourcePassageModal';
import Button from '../components/common/Button';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';

export default function QuestionsPage() {
  const { currentSpace, navigate } = useApp();
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSourceQ, setSelectedSourceQ] = useState(null);

  const fetchQuestions = useCallback(async () => {
    if (!currentSpace) return;
    try {
      setLoading(true);
      const data = await questionsService.listQuestions(currentSpace.id, {
        type: typeFilter || undefined,
        difficulty: difficultyFilter || undefined,
      });
      setQuestions(data || []);
    } catch (err) {
      console.error('Error fetching questions', err);
    } finally {
      setLoading(false);
    }
  }, [currentSpace, typeFilter, difficultyFilter]);

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  const filteredQuestions = questions.filter(q => {
    if (!searchQuery.trim()) return true;
    const term = searchQuery.toLowerCase();
    return (
      q.prompt.toLowerCase().includes(term) ||
      (q.answer && q.answer.toLowerCase().includes(term)) ||
      (q.explanation && q.explanation.toLowerCase().includes(term))
    );
  });

  if (loading && questions.length === 0) {
    return <LoadingSpinner text="Loading question bank..." />;
  }

  return (
    <div>
      {/* Header Banner */}
      <div className="glass-card" style={{ marginBottom: '2rem', padding: '2rem', borderRadius: 'var(--radius-xl)' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#2563eb', fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.4rem' }}>
              <HelpCircle size={14} />
              <span>Grounded Question Bank</span>
            </div>
            <h1 style={{ fontSize: '1.85rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.5rem' }}>
              Study Material Question Bank
            </h1>
            <p style={{ color: '#64748b', maxWidth: '720px', fontSize: '0.95rem', lineHeight: 1.5 }}>
              Every question is verified against and linked to your specific note passages. Browse, inspect citations, or launch a practice session.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <Button
              variant="primary"
              icon={CheckCircle2}
              onClick={() => navigate('quiz', currentSpace?.id)}
              style={{ borderRadius: 'var(--radius-full)' }}
            >
              Start Practice Session
            </Button>
          </div>
        </div>
      </div>

      {/* Filter bar */}
      <QuestionFilters
        typeFilter={typeFilter}
        setTypeFilter={setTypeFilter}
        difficultyFilter={difficultyFilter}
        setDifficultyFilter={setDifficultyFilter}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      {/* Questions list */}
      {filteredQuestions.length === 0 ? (
        <EmptyState
          icon={HelpCircle}
          title="No questions found"
          description="No questions matched your active filters, or none have been generated yet for this study space."
          actionText="Clear Filters"
          onAction={() => {
            setTypeFilter('');
            setDifficultyFilter('');
            setSearchQuery('');
          }}
        />
      ) : (
        <div>
          {filteredQuestions.map(q => (
            <QuestionCard
              key={q.id}
              question={q}
              onViewSource={setSelectedSourceQ}
            />
          ))}
        </div>
      )}

      {/* Source Passage Modal */}
      <SourcePassageModal
        isOpen={!!selectedSourceQ}
        onClose={() => setSelectedSourceQ(null)}
        question={selectedSourceQ}
      />
    </div>
  );
}
