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
      localStorage.removeItem('token');
      localStorage.removeItem('loginType');
      window.location.href = error.response.data.redirectTo;
    } else if (error.response?.status === 503 || error.response?.status === 500) {
      console.error('Server error:', error.response.data);
      return Promise.reject({
        ...error,
        message: error.response.data.message === 'Service unavailable: Database not connected'
          ? 'The server is temporarily unavailable due to database issues. Please try again later.'
          : error.response.data.message || 'An unexpected server error occurred.',
      });
    }
    return Promise.reject(error);
  }
);

export default api;