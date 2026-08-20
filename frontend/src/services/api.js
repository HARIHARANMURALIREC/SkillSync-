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
  if (detail && typeof detail === 'object' && typeof detail.message === 'string') return detail.message;
  return fallback;
}

export async function createReadinessReport() {
  const res = await api.post('/api/readiness-report');
  return res.data;
}

export async function getLatestReadinessReport() {
  const res = await api.get('/api/readiness-report/latest');
  return res.data;
}

export async function getPublicReadinessReport(token) {
  const res = await api.get(`/api/readiness-report/public/${token}`);
  return res.data;
}

export async function getCoachHistory() {
  const res = await api.get('/api/coach/history');
  return res.data;
}

export async function clearCoachHistory() {
  const res = await api.delete('/api/coach/history');
  return res.data;
}

export async function getWeeklyPlan() {
  const res = await api.get('/api/coach/weekly-plan');
  return res.data;
}

export function publicReportUrl(sharePath) {
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  return `${origin}${sharePath}`;
}

export default api;
