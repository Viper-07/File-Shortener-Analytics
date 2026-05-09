import axios from 'axios';

const api = axios.create({
  baseURL: '/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

export const linkService = {
  shorten: async (data) => {
    // If data is just a string, convert to object
    const payload = typeof data === 'string' ? { original_url: data } : data;
    const response = await api.post('/links/', payload);
    return response.data;
  },
  getStats: async (shortCode) => {
    const response = await api.get(`/analytics/${shortCode}`);
    return response.data;
  },
  getLinkInfo: async (shortCode) => {
    const response = await api.get(`/links/${shortCode}`);
    return response.data;
  },
  verifyPassword: async (shortCode, password) => {
    const response = await api.post(`/links/${shortCode}/verify`, { password });
    return response.data;
  }
};

export default api;
