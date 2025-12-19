import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// For Android emulator, use 10.0.2.2 instead of localhost
// For iOS simulator, use localhost
// For physical devices, use your computer's IP address
// IMPORTANT: Make sure your phone and computer are on the SAME WiFi network
const getApiBaseUrl = () => {
  if (__DEV__) {
    // Your computer's IP address - UPDATE THIS if your IP changes
    // Get your IP with: ifconfig | grep "inet " | grep -v 127.0.0.1
    const COMPUTER_IP = '192.168.2.1';
    
    if (Platform.OS === 'android') {
      // Android emulator uses special IP
      return 'http://10.0.2.2:8000';
    }
    
    // For iOS: simulator can use localhost, but physical device needs IP
    // Comment out the localhost line and use IP for physical device
    // return 'http://localhost:8000'; // iOS Simulator only
    return `http://${COMPUTER_IP}:8000`; // iOS Physical device
  }
  return 'https://your-production-api.com';
};

const API_BASE_URL = getApiBaseUrl();

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Add token to requests
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
  (error) => {
    return Promise.reject(error);
  }
);

// Handle token expiration
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      try {
        await AsyncStorage.removeItem('token');
        // Navigation will be handled by AuthContext
      } catch (storageError) {
        console.error('Error removing token:', storageError);
      }
    }
    return Promise.reject(error);
  }
);

export default api;

