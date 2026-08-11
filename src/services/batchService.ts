import { api } from './api';

export const batchService = {
  async createBatch(data: {
    identificationId: string;
    materialId: string;
    sourceLocation: string;
    notes?: string;
  }) {
    const response = await api.post('/batches', data);
    return response.data;
  },

  async getBatches() {
    const response = await api.get('/batches');
    return response.data;
  },

  async getBatch(batchId: string) {
    const response = await api.get(`/batches/${batchId}`);
    return response.data;
  },

  async verifyBatch(batchId: string, verificationData: {
    visualIntegrity: boolean;
    weightMatch: boolean;
    sealCheck: boolean;
  }) {
    const response = await api.post(`/batches/${batchId}/verify`, verificationData);
    return response.data;
  },

  async getPublicBatch(batchId: string) {
    const response = await api.get(`/public/batches/${batchId}`);
    return response.data;
  }
};
