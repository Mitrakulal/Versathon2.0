import React from 'react';
import { Search, Filter, Eye, EyeOff, BookOpen } from 'lucide-react';

export default function QuestionFilters({
  typeFilter,
  setTypeFilter,
  difficultyFilter,
  setDifficultyFilter,
  topicFilter,
  setTopicFilter,
  topics = [],
  searchQuery,
  setSearchQuery,
  studyMode,
  setStudyMode,
}) {
  // Flatten topics for clean dropdown options
  const flatTopics = [];
  (topics || []).forEach((t) => {
    flatTopics.push({ id: t.id, name: t.name, isParent: true });
    (t.subtopics || []).forEach((st) => {
      flatTopics.push({ id: st.id, name: `↳ ${st.name}`, isParent: false });
    });
  });

  return (
    <div
      className="glass-card"
      style={{
        padding: '1rem 1.25rem',
        marginBottom: '1.5rem',
        background: '#ffffff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
      }}
    >
      {/* Search Input */}
      <div style={{ position: 'relative', flex: 1, minWidth: '220px' }}>
        <Search
          size={16}
          style={{
            position: 'absolute',
            left: '14px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: '#94a3b8',
          }}
        />
        <input
          type="text"
          className="form-input"
          placeholder="Search question prompts or answers..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ paddingLeft: '2.5rem', width: '100%', borderRadius: 'var(--radius-full)' }}
        />
      </div>

      {/* Filters & Study Mode Toggle */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
        {/* Topic Filter Dropdown */}
        {flatTopics.length > 0 && (
          <select
            className="form-select"
            value={topicFilter}
            onChange={(e) => setTopicFilter(e.target.value)}
            style={{
              padding: '0.45rem 0.85rem',
              fontSize: '0.84rem',
              borderRadius: 'var(--radius-full)',
              maxWidth: '180px',
            }}
          >
            <option value="">All Topics & Units</option>
            {flatTopics.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        )}

        {/* Type Select */}
        <select
          className="form-select"
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          style={{ padding: '0.45rem 0.85rem', fontSize: '0.84rem', borderRadius: 'var(--radius-full)' }}
        >
          <option value="">All Formats</option>
          <option value="mcq">Multiple Choice (MCQ)</option>
          <option value="flashcard">Flashcards</option>
          <option value="short_answer">Short Answer</option>
          <option value="fill_blank">Fill in Blank</option>
        </select>

        {/* Difficulty Select */}
        <select
          className="form-select"
          value={difficultyFilter}
          onChange={(e) => setDifficultyFilter(e.target.value)}
          style={{ padding: '0.45rem 0.85rem', fontSize: '0.84rem', borderRadius: 'var(--radius-full)' }}
        >
          <option value="">All Levels</option>
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
        </select>

        {/* Study Mode Active Recall Toggle */}
        <button
          type="button"
          onClick={() => setStudyMode(!studyMode)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.45rem',
            padding: '0.45rem 0.95rem',
            borderRadius: 'var(--radius-full)',
            border: studyMode ? '1px solid #93c5fd' : '1px solid #e2e8f0',
            background: studyMode ? '#eff6ff' : '#f8fafc',
            color: studyMode ? '#1d4ed8' : '#64748b',
            fontSize: '0.82rem',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
          title={studyMode ? 'Study Mode is ON: Answers are hidden until clicked' : 'Turn on Study Mode to hide answers for active recall practice'}
        >
          {studyMode ? <EyeOff size={14} color="#2563eb" /> : <Eye size={14} color="#94a3b8" />}
          <span>Study Mode: <strong>{studyMode ? 'ON' : 'OFF'}</strong></span>
        </button>
      </div>
    </div>
  );
}
