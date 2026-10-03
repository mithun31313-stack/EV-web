import axios from 'axios';

export const BASE_URL = 'https://ev-charge-api.onrender.com';

// Set this to your real Razorpay TEST Key ID (dashboard.razorpay.com -> Settings -> API Keys)
export const RAZORPAY_KEY_ID = 'rzp_test_XXXXXXXXXXXXXX';

const api = axios.create({ baseURL: BASE_URL });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const authApi = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  register: (name, email, password) => api.post('/auth/register', { name, email, password }),
};

export const sessionApi = {
  create: (station_id, amount) => api.post('/sessions/create', { station_id, amount }),
  verifyPayment: (payload) => api.post('/sessions/verify-payment', payload),
  status: (id) => api.get(`/sessions/${id}/status`),
  stop: (id) => api.post(`/sessions/${id}/stop`),
  mine: () => api.get('/sessions/mine'),
};

export const adminApi = {
  stations: () => api.get('/admin/stations'),
  addStation: (payload) => api.post('/admin/stations', payload),
  activeSessions: () => api.get('/admin/sessions/active'),
  allSessions: () => api.get('/admin/sessions'),
  stats: () => api.get('/admin/stats'),
  forceStop: (id) => api.post(`/admin/sessions/${id}/force-stop`),
};

export default api;
