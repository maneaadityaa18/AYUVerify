import { api } from './api';

export const expertService = {
  async getReviews() {
    const response = await api.get('/expert/reviews');
    return response.data;
  },

  async getReview(reviewId: string) {
    const response = await api.get(`/expert/reviews/${reviewId}`);
    return response.data;
  },

  async submitDecision(reviewId: string, decisionData: { decision: string; notes?: string }) {
    const response = await api.post(`/expert/reviews/${reviewId}/decision`, decisionData);
    return response.data;
  }
};
