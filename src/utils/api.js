import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && error.response.data.redirectTo) {
      console.log('Invalid token detected, redirecting to:', error.response.data.redirectTo);
      localStorage.removeItem('token'); // Clear invalid token
      window.location.href = error.response.data.redirectTo; // Redirect to specified login page
    }
    return Promise.reject(error);
  }
);
export default api;