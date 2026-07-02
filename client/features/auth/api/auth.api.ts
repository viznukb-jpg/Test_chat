import { apiClient } from '@/shared/api/axios';

export interface LoginDto {
  email: string;
  password?: string;
}

export interface RegisterDto {
  email: string;
  username: string;
  password?: string;
}

export const authApi = {
  async register(data: RegisterDto) {
    const res = await apiClient.post('/auth/register', data);
    return res.data;
  },

  async login(data: LoginDto) {
    const res = await apiClient.post('/auth/login', data);
    return res.data;
  },

  async fetchMe() {
    const res = await apiClient.get('/auth/me');
    return res.data;
  }
};
