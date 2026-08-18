import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export function getApiErrorMessage(error, fallback = 'Something went wrong. Please try again.') {
  const status = error.response?.status;
  const detail = error.response?.data?.detail;
  if (status === 503) {
    return detail || 'Ollama is not running. Start it with `ollama serve`. SkillSync uses the mistral:latest model.';
  }
  if (typeof detail === 'string' && detail) {
    return detail;
  }
  return fallback;
}

export default api;

