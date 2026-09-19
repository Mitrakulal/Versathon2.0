import { apiRequest } from './api';
import { MOCK_QUESTIONS } from './mockData';

export const questionsService = {
  /**
   * List questions with optional filters (topic_id, type, difficulty)
   */
  async listQuestions(spaceId, filters = {}) {
    const params = new URLSearchParams();
    if (filters.topic_id) params.append('topic_id', filters.topic_id);
    if (filters.type) params.append('type', filters.type);
    if (filters.difficulty) params.append('difficulty', filters.difficulty);

    const queryStr = params.toString() ? `?${params.toString()}` : '';
    
    // Filter fallback data accordingly
    let fallback = [...MOCK_QUESTIONS];
    if (filters.topic_id) {
      fallback = fallback.filter(q => q.topic_id === filters.topic_id);
    }
    if (filters.type) {
      fallback = fallback.filter(q => q.type === filters.type);
    }
    if (filters.difficulty) {
      fallback = fallback.filter(q => q.difficulty === filters.difficulty);
    }

    return apiRequest(`/spaces/${spaceId}/questions${queryStr}`, { method: 'GET' }, fallback);
  },

  /**
   * Trigger background question generation for a topic
   */
  async generateQuestions(spaceId, payload = {}) {
    const mockResponse = {
      message: 'Question generation initiated',
      topic_id: payload.topic_id || 'all',
    };
    return apiRequest(`/spaces/${spaceId}/questions/generate`, {
      method: 'POST',
      body: payload,
    }, mockResponse);
  },

  /**
   * Flag an incorrect or unclear question
   */
  async flagQuestion(questionId, reason) {
    return apiRequest(`/questions/${questionId}/flag`, {
      method: 'POST',
      body: { reason },
    }, { status: 'flagged', question_id: questionId });
  },
};
