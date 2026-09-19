import { apiRequest } from './api';
import { MOCK_TOPICS } from './mockData';

export const topicsService = {
  /**
   * Get the topic hierarchy tree for a study space
   */
  async getTopicTree(spaceId) {
    return apiRequest(`/spaces/${spaceId}/topics`, { method: 'GET' }, MOCK_TOPICS);
  },

  /**
   * Update topic (rename, summary)
   */
  async updateTopic(topicId, data) {
    const mockUpdated = {
      id: topicId,
      name: data.name,
      summary: data.summary || '',
    };
    return apiRequest(`/topics/${topicId}`, {
      method: 'PATCH',
      body: data,
    }, mockUpdated);
  },

  /**
   * Delete a topic
   */
  async deleteTopic(topicId) {
    return apiRequest(`/topics/${topicId}`, { method: 'DELETE' }, null);
  },
};
