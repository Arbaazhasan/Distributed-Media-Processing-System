import axios from 'axios';
import { API_BASE_URL } from '../config/constants';

const api = axios.create({
  baseURL: API_BASE_URL,
});

export const videoService = {
  async getAll() {
    const res = await api.get('/videos');
    return res.data;
  },

  async upload(formData, onProgress) {
    const res = await api.post('/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (event) => {
        if (event.total && onProgress) {
          const percent = Math.round((event.loaded * 100) / event.total);
          onProgress(percent);
        }
      },
    });
    return res.data;
  },

  async delete(videoId) {
    const res = await api.delete(`/videos/${videoId}`);
    return res.data;
  },
};

export default api;
