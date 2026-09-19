import { apiRequest } from './api';
import { MOCK_QUESTIONS } from './mockData';

export const quizService = {
  /**
   * Start a practice session (modes: topic_quiz, mixed, adaptive, daily_revision)
   */
  async startQuiz(payload) {
    const mockSession = {
      session_id: `sess_${Date.now()}`,
      space_id: payload.space_id,
      mode: payload.mode || 'adaptive',
      total_questions: payload.question_count || 5,
      started_at: new Date().toISOString(),
      questions: MOCK_QUESTIONS.slice(0, payload.question_count || 5).map(q => ({
        id: q.id,
        topic_id: q.topic_id,
        type: q.type,
        prompt: q.prompt,
        options: q.options,
        difficulty: q.difficulty,
      })),
    };

    return apiRequest('/quiz/start', {
      method: 'POST',
      body: payload,
    }, mockSession);
  },

  /**
   * Submit an answer for real-time evaluation and feedback
   */
  async submitAnswer(sessionId, questionId, responseText, timeTakenSeconds = 15) {
    const originalQ = MOCK_QUESTIONS.find(q => q.id === questionId);
    const isCorrect = originalQ && (
      originalQ.answer.toLowerCase().trim() === responseText.toLowerCase().trim() ||
      responseText.toLowerCase().includes(originalQ.answer.toLowerCase().slice(0, 5))
    );

    const mockEvaluation = {
      question_id: questionId,
      correctness: isCorrect ? 'correct' : 'incorrect',
      score: isCorrect ? 1.0 : 0.0,
      correct_answer: originalQ?.answer || 'Correct answer details',
      explanation: originalQ?.explanation || 'Explanation from source notes.',
      source_passage: originalQ?.source_passage || 'Cited source note passage.',
      feedback: isCorrect ? 'Excellent! Spot on answer.' : 'Good effort! Check the explanation and cited notes below.',
    };

    return apiRequest(`/quiz/${sessionId}/answer`, {
      method: 'POST',
      body: {
        question_id: questionId,
        response: responseText,
        time_taken_seconds: timeTakenSeconds,
      },
    }, mockEvaluation);
  },

  /**
   * Complete quiz session and receive summary breakdown
   */
  async completeQuiz(sessionId, answersSummary = {}) {
    const mockSummary = {
      session_id: sessionId,
      score: 80.0,
      total_questions: 5,
      correct_count: 4,
      time_taken_seconds: 145,
      topic_breakdown: [
        {
          topic_id: 'top_1_1',
          topic_name: 'Process States & PCB',
          score: 100.0,
          attempted: 2,
        },
        {
          topic_id: 'top_1_2',
          topic_name: 'CPU Scheduling Algorithms',
          score: 66.7,
          attempted: 3,
        }
      ],
    };

    return apiRequest(`/quiz/${sessionId}/complete`, {
      method: 'POST',
    }, mockSummary);
  },

  /**
   * Fetch attempt-by-attempt review data with verified answers & note excerpts
   */
  async getQuizResults(sessionId) {
    const mockResults = {
      session_id: sessionId,
      score: 80.0,
      completed_at: new Date().toISOString(),
      attempts: MOCK_QUESTIONS.slice(0, 5).map((q, idx) => ({
        question_id: q.id,
        prompt: q.prompt,
        type: q.type,
        student_response: idx === 1 ? 'Incorrect guess' : q.answer,
        correct_answer: q.answer,
        correctness: idx === 1 ? 'incorrect' : 'correct',
        score: idx === 1 ? 0.0 : 1.0,
        time_taken_seconds: 14 + idx * 3,
        explanation: q.explanation,
        source_passage: q.source_passage || 'Notes excerpt from lecture slides.',
        feedback: idx === 1 ? 'Missed the key definition from notes.' : 'Spot on answer!',
      })),
    };

    return apiRequest(`/quiz/${sessionId}/results`, {
      method: 'GET',
    }, mockResults);
  },
};
