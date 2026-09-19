import React from 'react';
import { Search, Filter } from 'lucide-react';

export default function QuestionFilters({
  typeFilter,
  setTypeFilter,
  difficultyFilter,
  setDifficultyFilter,
  searchQuery,
  setSearchQuery,
}) {
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
      {/* Search */}
      <div style={{ position: 'relative', flex: 1, minWidth: '220px' }}>
        <Search
          size={16}
          style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}
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

      {/* Filters */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', color: '#64748b' }}>
          <Filter size={15} />
          <span>Filter:</span>
        </div>

        {/* Type Select */}
        <select
          className="form-select"
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          style={{ padding: '0.45rem 0.85rem', fontSize: '0.84rem', borderRadius: 'var(--radius-full)' }}
        >
          <option value="">All Question Types</option>
          <option value="mcq">Multiple Choice (MCQ)</option>
          <option value="short_answer">Short Answer</option>
          <option value="fill_blank">Fill in the Blank</option>
          <option value="flashcard">Flashcard</option>
        </select>

        {/* Difficulty Select */}
        <select
          className="form-select"
          value={difficultyFilter}
          onChange={(e) => setDifficultyFilter(e.target.value)}
          style={{ padding: '0.45rem 0.85rem', fontSize: '0.84rem', borderRadius: 'var(--radius-full)' }}
        >
          <option value="">All Difficulties</option>
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
        </select>
      </div>
    </div>
  );
}
