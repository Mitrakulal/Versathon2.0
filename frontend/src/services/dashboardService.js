import { apiRequest } from './api';
import { MOCK_DASHBOARD } from './mockData';

export const dashboardService = {
  /**
   * Get overall space mastery, weak topics, and analytics
   */
  async getDashboard(spaceId) {
    const fallback = { ...MOCK_DASHBOARD, space_id: spaceId };
    return apiRequest(`/spaces/${spaceId}/dashboard`, { method: 'GET' }, fallback);
  },
};
