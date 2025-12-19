import api from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface User {
  id: number;
  email: string;
  full_name: string | null;
  career_goal: string | null;
  hours_per_week: number;
}

export interface SignupData {
  email: string;
  password: string;
  full_name?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user?: User;
}

export const authService = {
  async signup(data: SignupData): Promise<AuthResponse> {
    const response = await api.post('/api/auth/signup', {
      email: data.email,
      password: data.password,
      full_name: data.full_name,
    });
    return response.data;
  },

  async login(data: LoginData): Promise<AuthResponse> {
    const response = await api.post('/api/auth/login', {
      email: data.email,
      password: data.password,
    });
    return response.data;
  },

  async getCurrentUser(): Promise<User | null> {
    try {
      const response = await api.get('/api/auth/me');
      return response.data;
    } catch (error) {
      return null;
    }
  },

  async logout(): Promise<void> {
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('user');
  },

  async saveToken(token: string): Promise<void> {
    await AsyncStorage.setItem('token', token);
  },

  async getToken(): Promise<string | null> {
    return await AsyncStorage.getItem('token');
  },

  async saveUser(user: User): Promise<void> {
    await AsyncStorage.setItem('user', JSON.stringify(user));
  },

  async getUser(): Promise<User | null> {
    const userStr = await AsyncStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },
};

