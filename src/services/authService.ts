import { api } from './api';

export const authService = {
  async register(data: any) {
    const response = await api.post('/auth/register', data);
    return response.data;
  },

  async login(credentials: any) {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  async getProfile() {
    const response = await api.get('/auth/me');
    return response.data;
  }
};
