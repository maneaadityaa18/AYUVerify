import { api } from './api';

export const participantService = {
  async search(q: string, role: string) {
    const response = await api.get('/participants/search', {
      params: { q, role }
    });
    return response.data;
  }
};
