import { api } from './api';

export const transferService = {
  async createTransfer(batchId: string, data: { recipientId: string; note?: string }) {
    const response = await api.post(`/batches/${batchId}/transfer`, data);
    return response.data;
  },

  async getIncomingTransfers() {
    const response = await api.get('/transfers/incoming');
    return response.data;
  },

  async acceptTransfer(transferId: string) {
    const response = await api.post(`/transfers/${transferId}/accept`);
    return response.data;
  },

  async rejectTransfer(transferId: string, reason: string) {
    const response = await api.post(`/transfers/${transferId}/reject`, { reason });
    return response.data;
  }
};
