import { apiRequest } from './api';
import { MOCK_FLASHCARDS } from './mockData';

export const flashcardsService = {
  /**
   * Get due flashcards for spaced repetition review
   */
  async getDueCards(spaceId) {
    return apiRequest(`/flashcards/due?space_id=${spaceId}`, { method: 'GET' }, MOCK_FLASHCARDS);
  },

  /**
   * Submit flashcard self-rating (SM-2 update)
   * rating: 1 (Again), 2 (Hard), 3 (Good), 4 (Easy)
   */
  async submitRating(questionId, rating) {
    const mockSM2 = {
      question_id: questionId,
      ease_factor: 2.5 + (rating - 3) * 0.1,
      interval_days: rating === 1 ? 1 : rating === 2 ? 2 : rating === 3 ? 4 : 7,
      repetitions: rating > 1 ? 2 : 0,
      next_due_at: new Date(Date.now() + (rating > 1 ? 4 : 1) * 86400000).toISOString(),
    };

    return apiRequest(`/flashcards/${questionId}/review`, {
      method: 'POST',
      body: { rating },
    }, mockSM2);
  },
};
