import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

/** Host Metro uses to serve the JS bundle — same machine as the backend in dev. */
function getExpoDevHost(): string | null {
  const hostUri =
    Constants.expoConfig?.hostUri ??
    (Constants as { manifest?: { debuggerHost?: string } }).manifest?.debuggerHost ??
    (Constants as { manifest2?: { extra?: { expoGo?: { debuggerHost?: string } } } }).manifest2
      ?.extra?.expoGo?.debuggerHost;

  if (!hostUri) {
    return null;
  }

  return hostUri.split(':')[0] || null;
}

export const getApiBaseUrl = () => {
  if (!__DEV__) {
    return 'https://your-production-api.com';
  }

  const expoHost = getExpoDevHost();
  if (expoHost) {
    return `http://${expoHost}:8000`;
  }

  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:8000';
  }

  return 'http://localhost:8000';
};

export const API_BASE_URL = getApiBaseUrl();

if (__DEV__) {
  console.log('[SkillSync] API base URL:', API_BASE_URL);
}

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error getting token:', error);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      try {
        await AsyncStorage.removeItem('token');
      } catch (storageError) {
        console.error('Error removing token:', storageError);
      }
    }
    return Promise.reject(error);
  }
);

export function getApiErrorMessage(
  error: any,
  fallback = 'Something went wrong. Please try again.'
): string {
  if (error.code === 'ECONNABORTED') {
    return `Request timed out. Ensure the backend is running and reachable at ${API_BASE_URL}.`;
  }

  if (!error.response && (error.message === 'Network Error' || error.code === 'ERR_NETWORK')) {
    return `Cannot reach the server at ${API_BASE_URL}. Start the backend with \`uvicorn app.main:app --host 0.0.0.0 --port 8000\` and ensure your phone is on the same Wi‑Fi as your computer.`;
  }

  const status = error.response?.status;
  const detail = error.response?.data?.detail;

  if (status === 422) {
    return 'Invalid login request. Please try again.';
  }
  if (status === 503) {
    return (
      detail ||
      'Ollama is not running. Start it with `ollama serve`. SkillSync uses the mistral:latest model.'
    );
  }
  if (typeof detail === 'string' && detail) {
    return detail;
  }
  if (Array.isArray(detail) && detail.length > 0) {
    return detail.map((d: { msg?: string }) => d.msg).filter(Boolean).join(', ') || fallback;
  }
  return fallback;
}

export default api;
