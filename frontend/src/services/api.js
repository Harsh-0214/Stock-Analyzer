import axios from 'axios';

const BASE_URL = process.env.REACT_APP_API_URL || '';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
});

export const stockAPI = {
  search: (q) => api.get(`/api/stocks/search?q=${encodeURIComponent(q)}`),
  getInfo: (symbol) => api.get(`/api/stocks/${symbol}/info`),
  getHistory: (symbol, period = '1y', interval = '1d') =>
    api.get(`/api/stocks/${symbol}/history?period=${period}&interval=${interval}`),
  getSignals: (symbol) => api.get(`/api/stocks/${symbol}/signals`),
};

export const marketAPI = {
  getFearGreed: () => api.get('/api/market/fear-greed'),
  getOverview: () => api.get('/api/market/overview'),
  getTrending: (limit = 20) => api.get(`/api/market/trending?limit=${limit}`),
};

export const watchlistAPI = {
  getAll: () => api.get('/api/watchlist'),
  add: (item) => api.post('/api/watchlist', item),
  update: (symbol, data) => api.put(`/api/watchlist/${symbol}`, data),
  remove: (symbol) => api.delete(`/api/watchlist/${symbol}`),
};

export const educationAPI = {
  getLessons: () => api.get('/api/education'),
  getLesson: (id) => api.get(`/api/education/${id}`),
};

export const cryptoAPI = {
  getTop: (limit = 20) => api.get(`/api/crypto/top?limit=${limit}`),
  search: (q) => api.get(`/api/crypto/search?q=${encodeURIComponent(q)}`),
  getInfo: (symbol) => api.get(`/api/crypto/${symbol}/info`),
  getHistory: (symbol, period = '1y', interval = '1d') =>
    api.get(`/api/crypto/${symbol}/history?period=${period}&interval=${interval}`),
  getSignals: (symbol) => api.get(`/api/crypto/${symbol}/signals`),
};

export default api;
