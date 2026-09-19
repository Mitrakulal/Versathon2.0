import React, { useState, useEffect } from 'react';
import { Clock, CheckCircle2, XCircle, AlertCircle, BookOpen, ArrowRight } from 'lucide-react';
import Button from '../common/Button';

export default function QuizRunner({
  session,
  onSubmitAnswer,
  onCompleteQuiz,
  loading,
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState('');
  const [shortAnswerText, setShortAnswerText] = useState('');
  const [evaluation, setEvaluation] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);

  // Timer increment
  useEffect(() => {
    const interval = setInterval(() => {
      setTimerSeconds(prev => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const currentQuestion = session.questions[currentIndex];
  const totalQuestions = session.questions.length;
  const progressPercent = ((currentIndex + 1) / totalQuestions) * 100;

  const formatTimer = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleSubmit = async () => {
    const responseText = currentQuestion.type === 'short_answer' ? shortAnswerText.trim() : selectedOption;
    if (!responseText) return;

    try {
      setSubmitting(true);
      const evalResult = await onSubmitAnswer(currentQuestion.id, responseText, timerSeconds);
      setEvaluation(evalResult);
    } catch (err) {
      console.error('Answer submission error', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleNext = () => {
    setEvaluation(null);
    setSelectedOption('');
    setShortAnswerText('');

    if (currentIndex + 1 < totalQuestions) {
      setCurrentIndex(prev => prev + 1);
    } else {
      onCompleteQuiz();
    }
  };

  if (!currentQuestion) return null;

  return (
    <div style={{ maxWidth: '820px', margin: '0 auto' }}>
      {/* Top Header: Progress & Timer */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span className="badge badge-primary">
            Question {currentIndex + 1} of {totalQuestions}
          </span>
          <span style={{ fontSize: '0.85rem', color: '#64748b', textTransform: 'capitalize' }}>
            Mode: {session.mode?.replace('_', ' ')}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#64748b', fontSize: '0.9rem', fontVariantNumeric: 'tabular-nums' }}>
          <Clock size={16} color="#2563eb" />
          <span>{formatTimer(timerSeconds)}</span>
        </div>
      </div>

      {/* Progress Track */}
      <div style={{ width: '100%', height: '6px', background: '#e2e8f0', borderRadius: 'var(--radius-full)', overflow: 'hidden', marginBottom: '2rem' }}>
        <div
          style={{
            height: '100%',
            width: `${progressPercent}%`,
            background: 'var(--primary-500)',
            borderRadius: 'var(--radius-full)',
            transition: 'width 300ms ease',
          }}
        />
      </div>

      {/* Question Card */}
      <div className="glass-card" style={{ padding: '2.5rem', marginBottom: '1.5rem', borderRadius: 'var(--radius-xl)' }}>
        <div style={{ fontSize: '0.78rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700, marginBottom: '0.5rem' }}>
          Prompt ({currentQuestion.type?.replace('_', ' ')})
        </div>

        <h3 style={{ fontSize: '1.35rem', fontWeight: 700, color: '#0f172a', lineHeight: 1.5, marginBottom: '1.75rem' }}>
          {currentQuestion.prompt}
        </h3>

        {/* MCQ Mode Options */}
        {currentQuestion.options && currentQuestion.options.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginBottom: '1.5rem' }}>
            {currentQuestion.options.map((opt, idx) => {
              const letter = String.fromCharCode(65 + idx);
              const isSelected = selectedOption === opt;
              const isEvaluated = evaluation !== null;
              const isCorrectAnswer = isEvaluated && evaluation.correct_answer === opt;
              const isUserChoice = isEvaluated && selectedOption === opt;

              let borderCol = isSelected ? '#2563eb' : '#e2e8f0';
              let bgCol = isSelected ? '#eff6ff' : '#ffffff';

              if (isEvaluated) {
                if (isCorrectAnswer) {
                  borderCol = '#10b981';
                  bgCol = '#ecfdf5';
                } else if (isUserChoice && !isCorrectAnswer) {
                  borderCol = '#ef4444';
                  bgCol = '#fef2f2';
                }
              }

              return (
                <div
                  key={idx}
                  onClick={() => !evaluation && setSelectedOption(opt)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    padding: '1rem 1.25rem',
                    borderRadius: 'var(--radius-md)',
                    background: bgCol,
                    border: `1.5px solid ${borderCol}`,
                    cursor: evaluation ? 'default' : 'pointer',
                    transition: 'all var(--transition-fast)',
                    boxShadow: isSelected ? '0 2px 8px rgba(37, 99, 235, 0.1)' : '0 1px 2px rgba(0, 0, 0, 0.02)',
                  }}
                >
                  <span
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      background: isSelected ? '#2563eb' : '#f1f5f9',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.82rem',
                      fontWeight: 700,
                      color: isSelected ? '#ffffff' : '#64748b',
                      flexShrink: 0,
                    }}
                  >
                    {letter}
                  </span>
                  <span style={{ fontSize: '0.95rem', color: '#0f172a', fontWeight: isSelected ? 600 : 500, flex: 1 }}>
                    {opt}
                  </span>
                </div>
              );
            })}
          </div>
        ) : (
          /* Short Answer Mode */
          <div style={{ marginBottom: '1.5rem' }}>
            <textarea
              className="form-textarea"
              placeholder="Type your explanation or response based on your notes..."
              value={shortAnswerText}
              onChange={(e) => setShortAnswerText(e.target.value)}
              disabled={evaluation !== null}
              rows={4}
            />
          </div>
        )}

        {/* Submit Button (Shown before evaluation) */}
        {!evaluation && (
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant="primary"
              onClick={handleSubmit}
              loading={submitting}
              disabled={currentQuestion.type === 'short_answer' ? !shortAnswerText.trim() : !selectedOption}
              id="submit-answer-btn"
              style={{ borderRadius: 'var(--radius-full)', padding: '0.75rem 1.75rem' }}
            >
              Submit Answer
            </Button>
          </div>
        )}
      </div>

      {/* Answer Evaluation Feedback Card */}
      {evaluation && (
        <div
          className="glass-card"
          style={{
            padding: '1.75rem',
            marginBottom: '1.5rem',
            borderRadius: 'var(--radius-xl)',
            background: '#ffffff',
            borderLeft: `5px solid ${evaluation.correctness === 'correct' ? '#10b981' : evaluation.correctness === 'partially_correct' ? '#f59e0b' : '#ef4444'}`,
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.06)',
            animation: 'slideUp 250ms ease-out',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {evaluation.correctness === 'correct' ? (
                <span className="badge badge-strong" style={{ gap: '0.4rem', fontSize: '0.85rem' }}>
                  <CheckCircle2 size={16} /> Correct! (+{(evaluation.score * 100).toFixed(0)}%)
                </span>
              ) : evaluation.correctness === 'partially_correct' ? (
                <span className="badge badge-developing" style={{ gap: '0.4rem', fontSize: '0.85rem' }}>
                  <AlertCircle size={16} /> Partially Correct (+{(evaluation.score * 100).toFixed(0)}%)
                </span>
              ) : (
                <span className="badge badge-weak" style={{ gap: '0.4rem', fontSize: '0.85rem' }}>
                  <XCircle size={16} /> Incorrect (0%)
                </span>
              )}
            </div>

            <Button
              variant="primary"
              size="sm"
              icon={ArrowRight}
              onClick={handleNext}
              id="next-question-btn"
              style={{ borderRadius: 'var(--radius-full)' }}
            >
              {currentIndex + 1 < totalQuestions ? 'Next Question' : 'View Results'}
            </Button>
          </div>

          {/* Feedback & explanation */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {evaluation.feedback && (
              <p style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.98rem' }}>
                {evaluation.feedback}
              </p>
            )}

            <div style={{ fontSize: '0.88rem', color: '#334155', lineHeight: 1.5 }}>
              <span style={{ fontWeight: 700, color: '#0f172a' }}>Verified Answer: </span>
              {evaluation.correct_answer}
            </div>

            {evaluation.explanation && (
              <p style={{ fontSize: '0.86rem', color: '#64748b', lineHeight: 1.5 }}>
                {evaluation.explanation}
              </p>
            )}

            {/* Cited Notes Passage */}
            {evaluation.source_passage && (
              <div style={{ padding: '0.85rem 1rem', background: '#eff6ff', borderRadius: 'var(--radius-md)', border: '1px solid #bfdbfe', marginTop: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#1d4ed8', fontWeight: 700, fontSize: '0.8rem', marginBottom: '0.25rem' }}>
                  <BookOpen size={14} />
                  <span>Grounding from your Notes</span>
                </div>
                <blockquote style={{ fontSize: '0.85rem', color: '#1e293b', fontStyle: 'italic', lineHeight: 1.5 }}>
                  {evaluation.source_passage}
                </blockquote>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
