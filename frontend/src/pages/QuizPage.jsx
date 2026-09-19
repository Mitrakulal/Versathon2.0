import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { quizService } from '../services/quizService';
import { topicsService } from '../services/topicsService';
import QuizSetup from '../components/quiz/QuizSetup';
import QuizRunner from '../components/quiz/QuizRunner';
import QuizResultsPage from './QuizResultsPage';
import LoadingSpinner from '../components/common/LoadingSpinner';

export default function QuizPage() {
  const { currentSpace, navigate, showToast } = useApp();
  const [topics, setTopics] = useState([]);
  const [loadingTopics, setLoadingTopics] = useState(true);
  const [activeSession, setActiveSession] = useState(null);
  const [quizSummary, setQuizSummary] = useState(null);
  const [startingQuiz, setStartingQuiz] = useState(false);

  useEffect(() => {
    if (!currentSpace) return;
    const loadTopics = async () => {
      try {
        setLoadingTopics(true);
        const data = await topicsService.getTopicTree(currentSpace.id);
        setTopics(data || []);
      } catch (err) {
        console.error('Failed to load topics', err);
      } finally {
        setLoadingTopics(false);
      }
    };
    loadTopics();
  }, [currentSpace]);

  const handleStartQuiz = async (payload) => {
    try {
      setStartingQuiz(true);
      const session = await quizService.startQuiz(payload);
      setActiveSession(session);
      setQuizSummary(null);
      showToast(`Quiz session started in ${payload.mode} mode!`, 'info');
    } catch (err) {
      showToast(err.detail || 'Failed to start quiz session.', 'error');
    } finally {
      setStartingQuiz(false);
    }
  };

  const handleSubmitAnswer = async (questionId, responseText, timeSeconds) => {
    if (!activeSession) return;
    return await quizService.submitAnswer(activeSession.session_id, questionId, responseText, timeSeconds);
  };

  const handleCompleteQuiz = async () => {
    if (!activeSession) return;
    try {
      const summary = await quizService.completeQuiz(activeSession.session_id);
      setQuizSummary(summary);
      setActiveSession(null);
    } catch (err) {
      showToast(err.detail || 'Failed to finalize quiz summary.', 'error');
    }
  };

  const handleRetake = () => {
    setActiveSession(null);
    setQuizSummary(null);
  };

  if (loadingTopics) {
    return <LoadingSpinner text="Preparing quiz generator and topics..." />;
  }

  // 1. If summary exists, display Results
  if (quizSummary) {
    return (
      <QuizResultsPage
        summary={quizSummary}
        space={currentSpace}
        onRetake={handleRetake}
        onGoToDashboard={() => navigate('dashboard', currentSpace?.id)}
      />
    );
  }

  // 2. If active session is running, display Runner
  if (activeSession) {
    return (
      <QuizRunner
        session={activeSession}
        onSubmitAnswer={handleSubmitAnswer}
        onCompleteQuiz={handleCompleteQuiz}
      />
    );
  }

  // 3. Otherwise, display QuizSetup
  return (
    <QuizSetup
      space={currentSpace}
      topics={topics}
      onStartQuiz={handleStartQuiz}
      loading={startingQuiz}
    />
  );
}
