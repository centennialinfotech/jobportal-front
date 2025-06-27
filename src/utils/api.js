import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL, // comes from .env
  withCredentials: true, // optional depending on if you're using cookies
});

export default api;
