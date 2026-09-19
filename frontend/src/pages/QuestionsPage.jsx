import React, { useState, useEffect, useCallback } from 'react';
import { HelpCircle, Sparkles, CheckCircle2, Plus } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { questionsService } from '../services/questionsService';
import { topicsService } from '../services/topicsService';
import QuestionFilters from '../components/quiz/QuestionFilters';
import QuestionCard from '../components/quiz/QuestionCard';
import SourcePassageModal from '../components/quiz/SourcePassageModal';
import GenerateQuestionsModal from '../components/quiz/GenerateQuestionsModal';
import Button from '../components/common/Button';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';

export default function QuestionsPage() {
  const { currentSpace, navigate } = useApp();
  const [questions, setQuestions] = useState([]);
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('');
  const [topicFilter, setTopicFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [studyMode, setStudyMode] = useState(false);
  const [generateModalOpen, setGenerateModalOpen] = useState(false);
  const [selectedSourceQ, setSelectedSourceQ] = useState(null);

  // Fetch topics for filter dropdown and modal
  useEffect(() => {
    if (!currentSpace?.id) return;
    topicsService.getTopicTree(currentSpace.id)
      .then((tree) => setTopics(tree || []))
      .catch((err) => console.error('Error fetching topics', err));
  }, [currentSpace?.id]);

  // Fetch questions based on space and active filters
  const fetchQuestions = useCallback(async () => {
    if (!currentSpace?.id) return;
    try {
      setLoading(true);
      const data = await questionsService.listQuestions(currentSpace.id, {
        type: typeFilter || undefined,
        difficulty: difficultyFilter || undefined,
        topic_id: topicFilter || undefined,
      });
      setQuestions(data || []);
    } catch (err) {
      console.error('Error fetching questions', err);
    } finally {
      setLoading(false);
    }
  }, [currentSpace?.id, typeFilter, difficultyFilter, topicFilter]);

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  // In-memory search filtering (fast client-side)
  const filteredQuestions = questions.filter((q) => {
    if (!searchQuery.trim()) return true;
    const term = searchQuery.toLowerCase();
    return (
      q.prompt.toLowerCase().includes(term) ||
      (q.answer && q.answer.toLowerCase().includes(term)) ||
      (q.explanation && q.explanation.toLowerCase().includes(term))
    );
  });

  // Calculate live question bank metrics
  const totalCount = questions.length;
  const mcqCount = questions.filter((q) => q.type === 'mcq').length;
  const flashcardCount = questions.filter((q) => q.type === 'flashcard').length;
  const shortAnswerCount = questions.filter((q) => q.type === 'short_answer').length;
  const fillBlankCount = questions.filter((q) => q.type === 'fill_blank').length;

  if (loading && questions.length === 0) {
    return <LoadingSpinner text="Loading question bank..." />;
  }

  return (
    <div>
      {/* Header Banner */}
      <div
        className="glass-card"
        style={{
          marginBottom: '1.75rem',
          padding: '2rem',
          borderRadius: 'var(--radius-xl)',
          background: '#ffffff',
          border: '1px solid #e2e8f0',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1.25rem',
          }}
        >
          <div>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                color: '#2563eb',
                fontSize: '0.78rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                marginBottom: '0.4rem',
              }}
            >
              <HelpCircle size={14} />
              <span>Grounded Question Bank</span>
            </div>
            <h1
              style={{
                fontSize: '1.85rem',
                fontWeight: 700,
                color: '#0f172a',
                marginBottom: '0.45rem',
              }}
            >
              Study Material Question Bank
            </h1>
            <p
              style={{
                color: '#64748b',
                maxWidth: '680px',
                fontSize: '0.94rem',
                lineHeight: 1.5,
                marginBottom: '1rem',
              }}
            >
              Every question is verified against and grounded in your study notes. Browse, toggle Study Mode for active recall practice, or generate targeted questions.
            </p>

            {/* Live Summary Metrics Strip */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                flexWrap: 'wrap',
              }}
            >
              <span style={{ fontSize: '0.86rem', fontWeight: 700, color: '#1e293b' }}>
                {totalCount} Questions in Bank:
              </span>
              <span className="badge badge-primary">{mcqCount} MCQs</span>
              <span className="badge badge-developing">{flashcardCount} Flashcards</span>
              <span className="badge badge-strong">{shortAnswerCount} Short Answer</span>
              {fillBlankCount > 0 && (
                <span
                  style={{
                    padding: '0.2rem 0.55rem',
                    borderRadius: 'var(--radius-full)',
                    background: '#f1f5f9',
                    color: '#475569',
                    fontSize: '0.73rem',
                    fontWeight: 600,
                  }}
                >
                  {fillBlankCount} Fill in Blank
                </span>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <Button
              variant="primary"
              icon={Sparkles}
              onClick={() => setGenerateModalOpen(true)}
              style={{ borderRadius: 'var(--radius-full)' }}
              id="open-generate-modal-btn"
            >
              + Generate Questions
            </Button>
            <Button
              variant="outline"
              icon={CheckCircle2}
              onClick={() => navigate('quiz', currentSpace?.id)}
              style={{ borderRadius: 'var(--radius-full)' }}
            >
              Start Practice Session
            </Button>
          </div>
        </div>
      </div>

      {/* Filter Bar with Topic Dropdown and Study Mode */}
      <QuestionFilters
        typeFilter={typeFilter}
        setTypeFilter={setTypeFilter}
        difficultyFilter={difficultyFilter}
        setDifficultyFilter={setDifficultyFilter}
        topicFilter={topicFilter}
        setTopicFilter={setTopicFilter}
        topics={topics}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        studyMode={studyMode}
        setStudyMode={setStudyMode}
      />

      {/* Questions List */}
      {filteredQuestions.length === 0 ? (
        <EmptyState
          icon={HelpCircle}
          title="No questions found"
          description="No questions matched your active filters, or none have been generated yet for this selection."
          actionText="Clear Filters"
          onAction={() => {
            setTypeFilter('');
            setDifficultyFilter('');
            setTopicFilter('');
            setSearchQuery('');
          }}
        />
      ) : (
        <div>
          {filteredQuestions.map((q) => (
            <QuestionCard
              key={q.id}
              question={q}
              onViewSource={setSelectedSourceQ}
              studyMode={studyMode}
            />
          ))}
        </div>
      )}

      {/* Generate Questions Modal */}
      <GenerateQuestionsModal
        isOpen={generateModalOpen}
        onClose={() => setGenerateModalOpen(false)}
        spaceId={currentSpace?.id}
        topics={topics}
        onSuccess={fetchQuestions}
      />

      {/* Source Passage Notes Citation Modal */}
      <SourcePassageModal
        isOpen={!!selectedSourceQ}
        onClose={() => setSelectedSourceQ(null)}
        question={selectedSourceQ}
      />
    </div>
  );
}
