import { apiRequest } from './api';
import { MOCK_SPACES } from './mockData';

export const spacesService = {
  /**
   * List all study spaces
   */
  async listSpaces() {
    return apiRequest('/spaces', { method: 'GET' }, MOCK_SPACES);
  },

  /**
   * Get single study space details
   */
  async getSpace(spaceId) {
    const fallback = MOCK_SPACES.find(s => s.id === spaceId) || MOCK_SPACES[0];
    return apiRequest(`/spaces/${spaceId}`, { method: 'GET' }, fallback);
  },

  /**
   * Create a new study space
   */
  async createSpace(data) {
    const mockNew = {
      id: `sp_${Date.now()}`,
      title: data.title,
      description: data.description || '',
      created_at: new Date().toISOString(),
      document_count: 0,
      topic_count: 0,
    };
    return apiRequest('/spaces', {
      method: 'POST',
      body: data,
    }, mockNew);
  },

  /**
   * Delete a study space
   */
  async deleteSpace(spaceId) {
    return apiRequest(`/spaces/${spaceId}`, { method: 'DELETE' }, null);
  },
};
