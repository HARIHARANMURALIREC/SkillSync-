import api from './api';

export const authService = {
  async signup(email: string, password: string, fullName?: string) {
    const response = await api.post('/api/auth/signup', {
      email,
      password,
      full_name: fullName,
    });
    return response.data;
  },

  async login(email: string, password: string) {
    const response = await api.post('/api/auth/login', {
      email,
      password,
    });
    return response.data;
  },

  async getCurrentUser() {
    const response = await api.get('/api/auth/me');
    return response.data;
  },
};

