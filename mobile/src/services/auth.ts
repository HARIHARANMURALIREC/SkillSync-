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
    // Backend expects OAuth2 form: username + password (not JSON email)
    const response = await api.post(
      '/api/auth/login',
      new URLSearchParams({
        username: email,
        password,
      }).toString(),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );
    return response.data;
  },

  async getCurrentUser() {
    const response = await api.get('/api/auth/me');
    return response.data;
  },
};
