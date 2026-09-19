import React, { useState, useEffect } from 'react';
import {
  Trophy,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  RotateCcw,
  PieChart,
  Layers,
  BookOpen,
  Filter,
} from 'lucide-react';
import Button from '../components/common/Button';
import { quizService } from '../services/quizService';

export default function QuizResultsPage({
  summary,
  space,
  onRetake,
  onGoToDashboard,
}) {
  const [attempts, setAttempts] = useState([]);
  const [loadingAttempts, setLoadingAttempts] = useState(false);
  const [filter, setFilter] = useState('all'); // 'all' | 'incorrect' | 'correct'

  const scorePercent = summary?.score ? Math.round(summary.score) : 0;
  const isPassing = scorePercent >= 70;
  const strokeColor = scorePercent >= 75 ? '#10b981' : scorePercent >= 50 ? '#f59e0b' : '#ef4444';

  useEffect(() => {
    if (!summary?.session_id) return;
    const fetchAttempts = async () => {
      try {
        setLoadingAttempts(true);
        const data = await quizService.getQuizResults(summary.session_id);
        if (data?.attempts) {
          setAttempts(data.attempts);
        }
      } catch (err) {
        console.error('Failed to load detailed attempt results', err);
      } finally {
        setLoadingAttempts(false);
      }
    };
    fetchAttempts();
  }, [summary?.session_id]);

  const incorrectCount = attempts.filter(a => a.correctness === 'incorrect').length;
  const correctCount = attempts.filter(a => a.correctness === 'correct').length;

  const filteredAttempts = attempts.filter(a => {
    if (filter === 'incorrect') return a.correctness === 'incorrect';
    if (filter === 'correct') return a.correctness === 'correct';
    return true;
  });

  return (
    <div style={{ maxWidth: '820px', margin: '0 auto', paddingBottom: '3rem' }}>
      {/* Top Summary Card */}
      <div className="glass-card" style={{ padding: '2.5rem', textAlign: 'center', marginBottom: '2rem', borderRadius: 'var(--radius-xl)' }}>
        {/* Animated Score Ring */}
        <div style={{ position: 'relative', width: '140px', height: '140px', margin: '0 auto 1.5rem auto' }}>
          <svg width="140" height="140" viewBox="0 0 140 140">
            <circle
              cx="70"
              cy="70"
              r="60"
              fill="transparent"
              stroke="#e2e8f0"
              strokeWidth="10"
            />
            <circle
              cx="70"
              cy="70"
              r="60"
              fill="transparent"
              stroke={strokeColor}
              strokeWidth="10"
              strokeDasharray="377"
              strokeDashoffset={377 - (377 * scorePercent) / 100}
              strokeLinecap="round"
              style={{ transition: 'stroke-dashoffset 1s ease-out' }}
            />
          </svg>
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a' }}>
              {scorePercent}%
            </span>
            <span style={{ fontSize: '0.74rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>
              Final Score
            </span>
          </div>
        </div>

        <h2 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.5rem' }}>
          {isPassing ? 'Great Job on This Session!' : 'Keep Practicing to Boost Recall!'}
        </h2>
        <p style={{ color: '#64748b', fontSize: '0.95rem', maxWidth: '540px', margin: '0 auto 2rem auto', lineHeight: 1.5 }}>
          Your responses have been processed into the topic mastery model and SM-2 review scheduler for "{space?.title}".
        </p>

        {/* Aggregate KPI Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
          <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: 'var(--radius-md)', border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', color: '#10b981', marginBottom: '0.35rem' }}>
              <CheckCircle2 size={16} />
              <span style={{ fontSize: '1.3rem', fontWeight: 800 }}>
                {summary.correct_count} / {summary.total_questions}
              </span>
            </div>
            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Questions Correct</div>
          </div>

          <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: 'var(--radius-md)', border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', color: '#2563eb', marginBottom: '0.35rem' }}>
              <Clock size={16} />
              <span style={{ fontSize: '1.3rem', fontWeight: 800 }}>
                {Math.round(summary.time_taken_seconds || 0)}s
              </span>
            </div>
            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Time Elapsed</div>
          </div>

          <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: 'var(--radius-md)', border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', color: '#0284c7', marginBottom: '0.35rem' }}>
              <Trophy size={16} />
              <span style={{ fontSize: '1.3rem', fontWeight: 800 }}>
                {summary.topic_breakdown?.length || 1}
              </span>
            </div>
            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Topics Evaluated</div>
          </div>
        </div>

        {/* Per-Topic Breakdown */}
        {summary.topic_breakdown && summary.topic_breakdown.length > 0 && (
          <div style={{ textAlign: 'left', marginBottom: '2rem' }}>
            <h4 style={{ fontSize: '0.98rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Layers size={16} color="#2563eb" />
              Per-Topic Performance Breakdown
            </h4>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {summary.topic_breakdown.map((tb, idx) => {
                const topicScore = Math.round(tb.score);
                const isWeak = topicScore < 50;
                const isStrong = topicScore >= 75;

                return (
                  <div
                    key={idx}
                    style={{
                      padding: '0.85rem 1.15rem',
                      background: '#f8fafc',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid #e2e8f0',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.9rem', color: '#0f172a' }}>
                        {tb.topic_name}
                      </span>
                      <span
                        className={`badge ${isStrong ? 'badge-strong' : isWeak ? 'badge-weak' : 'badge-developing'}`}
                        style={{ fontSize: '0.72rem' }}
                      >
                        {topicScore}% ({tb.attempted} asked)
                      </span>
                    </div>

                    <div style={{ width: '100%', height: '5px', background: '#e2e8f0', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                      <div
                        style={{
                          height: '100%',
                          width: `${topicScore}%`,
                          background: isStrong ? '#10b981' : isWeak ? '#ef4444' : '#f59e0b',
                          borderRadius: 'var(--radius-full)',
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <Button variant="secondary" icon={RotateCcw} onClick={onRetake} style={{ borderRadius: 'var(--radius-full)' }}>
            Take Another Quiz
          </Button>
          <Button variant="primary" icon={PieChart} onClick={onGoToDashboard} style={{ borderRadius: 'var(--radius-full)' }}>
            View Mastery Heatmap
          </Button>
        </div>
      </div>

      {/* Attempt-by-Attempt Question Review & Citations Section */}
      <div className="glass-card" style={{ padding: '2rem', borderRadius: 'var(--radius-xl)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.25rem' }}>
              Question Review & Citations
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#64748b' }}>
              Review your answers, correct references, and verified citations from your lecture notes.
            </p>
          </div>

          {/* Quick Filter Tabs */}
          {attempts.length > 0 && (
            <div style={{ display: 'flex', gap: '0.4rem', background: '#f1f5f9', padding: '0.25rem', borderRadius: 'var(--radius-full)' }}>
              <button
                type="button"
                onClick={() => setFilter('all')}
                style={{
                  padding: '0.3rem 0.8rem',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  border: 'none',
                  background: filter === 'all' ? '#ffffff' : 'transparent',
                  color: filter === 'all' ? '#0f172a' : '#64748b',
                  boxShadow: filter === 'all' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                  cursor: 'pointer',
                  transition: 'all var(--transition-fast)',
                }}
              >
                All ({attempts.length})
              </button>
              <button
                type="button"
                onClick={() => setFilter('incorrect')}
                style={{
                  padding: '0.3rem 0.8rem',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  border: 'none',
                  background: filter === 'incorrect' ? '#ffffff' : 'transparent',
                  color: filter === 'incorrect' ? '#ef4444' : '#64748b',
                  boxShadow: filter === 'incorrect' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                  cursor: 'pointer',
                  transition: 'all var(--transition-fast)',
                }}
              >
                Incorrect ({incorrectCount})
              </button>
              <button
                type="button"
                onClick={() => setFilter('correct')}
                style={{
                  padding: '0.3rem 0.8rem',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  border: 'none',
                  background: filter === 'correct' ? '#ffffff' : 'transparent',
                  color: filter === 'correct' ? '#10b981' : '#64748b',
                  boxShadow: filter === 'correct' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                  cursor: 'pointer',
                  transition: 'all var(--transition-fast)',
                }}
              >
                Correct ({correctCount})
              </button>
            </div>
          )}
        </div>

        {/* List of Attempt Cards */}
        {loadingAttempts ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#64748b', fontSize: '0.9rem' }}>
            Loading attempt-by-attempt review...
          </div>
        ) : filteredAttempts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#64748b', fontSize: '0.9rem' }}>
            No questions match this filter.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {filteredAttempts.map((att, idx) => {
              const isCorrect = att.correctness === 'correct';
              const isPartial = att.correctness === 'partially_correct';

              return (
                <div
                  key={att.question_id || idx}
                  style={{
                    padding: '1.35rem',
                    borderRadius: 'var(--radius-lg)',
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderLeft: `4px solid ${isCorrect ? '#10b981' : isPartial ? '#f59e0b' : '#ef4444'}`,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.75rem', marginBottom: '0.75rem' }}>
                    <h5 style={{ fontSize: '0.98rem', fontWeight: 700, color: '#0f172a', lineHeight: 1.4, flex: 1 }}>
                      {att.prompt}
                    </h5>

                    {isCorrect ? (
                      <span className="badge badge-strong" style={{ gap: '0.3rem', fontSize: '0.74rem', flexShrink: 0 }}>
                        <CheckCircle2 size={13} /> Correct (+{(att.score * 100).toFixed(0)}%)
                      </span>
                    ) : isPartial ? (
                      <span className="badge badge-developing" style={{ gap: '0.3rem', fontSize: '0.74rem', flexShrink: 0 }}>
                        <AlertCircle size={13} /> Partial (+{(att.score * 100).toFixed(0)}%)
                      </span>
                    ) : (
                      <span className="badge badge-weak" style={{ gap: '0.3rem', fontSize: '0.74rem', flexShrink: 0 }}>
                        <XCircle size={13} /> Incorrect (0%)
                      </span>
                    )}
                  </div>

                  {/* Answers Comparison */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.85rem' }}>
                    <div
                      style={{
                        padding: '0.65rem 0.85rem',
                        borderRadius: 'var(--radius-md)',
                        background: isCorrect ? '#ecfdf5' : '#fef2f2',
                        border: `1px solid ${isCorrect ? '#a7f3d0' : '#fecaca'}`,
                        fontSize: '0.84rem',
                      }}
                    >
                      <span style={{ fontWeight: 700, display: 'block', color: isCorrect ? '#065f46' : '#991b1b', marginBottom: '0.2rem', fontSize: '0.74rem', textTransform: 'uppercase' }}>
                        Your Response:
                      </span>
                      <span style={{ color: '#0f172a' }}>{att.student_response || '—'}</span>
                    </div>

                    <div
                      style={{
                        padding: '0.65rem 0.85rem',
                        borderRadius: 'var(--radius-md)',
                        background: '#ecfdf5',
                        border: '1px solid #a7f3d0',
                        fontSize: '0.84rem',
                      }}
                    >
                      <span style={{ fontWeight: 700, display: 'block', color: '#065f46', marginBottom: '0.2rem', fontSize: '0.74rem', textTransform: 'uppercase' }}>
                        Verified Answer:
                      </span>
                      <span style={{ color: '#0f172a' }}>{att.correct_answer}</span>
                    </div>
                  </div>

                  {/* Feedback & Explanation */}
                  {att.feedback && (
                    <div style={{ fontSize: '0.85rem', color: '#334155', marginBottom: '0.5rem', fontWeight: 600 }}>
                      Feedback: <span style={{ fontWeight: 400, color: '#475569' }}>{att.feedback}</span>
                    </div>
                  )}

                  {att.explanation && (
                    <div style={{ fontSize: '0.84rem', color: '#64748b', lineHeight: 1.45, marginBottom: '0.5rem' }}>
                      <span style={{ fontWeight: 600, color: '#475569' }}>Explanation: </span>
                      {att.explanation}
                    </div>
                  )}

                  {/* Notes Citation Grounding Box */}
                  {att.source_passage && (
                    <div
                      style={{
                        padding: '0.65rem 0.85rem',
                        background: '#eff6ff',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid #bfdbfe',
                        marginTop: '0.5rem',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#1d4ed8', fontWeight: 700, fontSize: '0.76rem', marginBottom: '0.2rem' }}>
                        <BookOpen size={13} />
                        <span>Source Grounding</span>
                      </div>
                      <blockquote style={{ fontSize: '0.82rem', color: '#1e293b', fontStyle: 'italic', lineHeight: 1.45, margin: 0 }}>
                        {att.source_passage}
                      </blockquote>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
