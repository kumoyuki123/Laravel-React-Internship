import axios from 'axios';

const APP_URL = 'http://127.0.0.1:8000/api';

const api = axios.create({
  baseURL: APP_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Add request interceptor to include token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const login = (data) => api.post('/login', data);
export const logout = () => api.post('/logout');
export const getProfile = () => api.get('/profile');
export const updateProfile = (data) => api.put('/profile', data);
export const changePassword = (data) => api.put('/profile/change-password', data);