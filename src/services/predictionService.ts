import { api } from './api';

export const predictionService = {
  async predict(imageFile: File) {
    const formData = new FormData();
    formData.append('image', imageFile);

    const response = await api.post('/predictions', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }
};
