import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

function localDateKey(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  config.headers['X-Local-Date'] = localDateKey();
  return config;
});

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
    return (
      detail ||
      'Ollama is not running. Start it with `ollama serve`. SkillSync uses the mistral:latest model.'
    );
  }
  if (typeof detail === 'string' && detail) return detail;
  return fallback;
}

export default api;
