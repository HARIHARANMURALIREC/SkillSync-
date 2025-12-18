import api from './api';

export const authService = {
  async signup(email, password, fullName) {
    const response = await api.post('/api/auth/signup', {
      email,
      password,
      full_name: fullName,
    });
    return response.data; // Returns { access_token, token_type, user }
  },

  async login(email, password) {
    const response = await api.post('/api/auth/login', 
      new URLSearchParams({
        username: email,
        password: password,
      }),
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

