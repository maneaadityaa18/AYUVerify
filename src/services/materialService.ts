import { api } from './api';

export const materialService = {
  async getMaterials() {
    const response = await api.get('/materials');
    return response.data;
  },

  async getMaterial(materialId: string) {
    const response = await api.get(`/materials/${materialId}`);
    return response.data;
  }
};
