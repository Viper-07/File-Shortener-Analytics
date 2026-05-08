import axios from 'axios';

const api = axios.create({
  baseURL: '/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

export const linkService = {
  shorten: async (url) => {
    const response = await api.post('/links/', { original_url: url });
    return response.data;
  },
  getStats: async (shortCode) => {
    const response = await api.get(`/analytics/${shortCode}`);
    return response.data;
  },
  getLinkInfo: async (shortCode) => {
    const response = await api.get(`/links/${shortCode}`);
    return response.data;
  }
};

export default api;
