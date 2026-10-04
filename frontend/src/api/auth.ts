import request from '@/utils/request';

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  username: string;
  password: string;
  confirmPassword: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: any;
}

export const authApi = {
  login: (data: LoginData) => request.post<LoginResponse>('/auth/login', data),
  register: (data: RegisterData) => request.post('/auth/register', data),
  refreshToken: (refreshToken: string) => request.post<LoginResponse>('/auth/refresh', { refreshToken }),
  logout: () => request.post('/auth/logout'),
  getCurrentUser: () => request.get('/auth/profile'),
};
