import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { message } from 'antd';
import { useUserStore } from '@/stores/userStore';

const request: AxiosInstance = axios.create({
  baseURL: '/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

request.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

request.interceptors.response.use(
  (response: AxiosResponse) => {
    const res = response.data;
    if (res.code === 0 || res.code === 200) {
      return res;
    }
    if (res.code === 401) {
      const userStore = useUserStore.getState();
      userStore.logout();
      message.error('登录已过期，请重新登录');
      window.location.href = '/login';
      return Promise.reject(res);
    }
    message.error(res.message || '请求失败');
    return Promise.reject(res);
  },
  (error) => {
    if (error.response?.status === 401) {
      const userStore = useUserStore.getState();
      userStore.logout();
      message.error('登录已过期，请重新登录');
      window.location.href = '/login';
    } else {
      message.error(error.response?.data?.message || error.message || '网络错误');
    }
    return Promise.reject(error);
  }
);

export default request;
