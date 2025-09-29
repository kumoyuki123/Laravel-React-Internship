import axios from 'axios';

const APP_URL = 'http://127.0.0.1:8000/api';

// Create axios instance with base config for pure Bearer token authentication
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

// User API (for superuser only)
export const userApi = {
  getAll: () => api.get('/users'),
  getById: (id) => api.get(`/users/${id}`),
  create: (data) => api.post('/users', data),
  update: (id, data) => api.put(`/users/${id}`, data),
  delete: (id) => api.delete(`/users/${id}`),
};

// School API
export const schoolApi = {
  getAll: () => api.get('/schools'),
  getById: (id) => api.get(`/schools/${id}`),
  create: (data) => api.post('/schools', data),
  update: (id, data) => api.put(`/schools/${id}`, data),
  delete: (id) => api.delete(`/schools/${id}`)
};

// Student API
export const studentApi = {
  getAll: () => api.get('/students'),
  getById: (id) => api.get(`/students/${id}`),
  create: (data) => api.post('/students', data),
  update: (id, data) => api.put(`/students/${id}`, data),
  delete: (id) => api.delete(`/students/${id}`),
  exportStudents: () => api.get('/students/export', { 
    responseType: 'blob'
  }),
  importStudents: (formData) => api.post('/students/import', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }),
};

// Employee API
export const employeeApi = {
  getAll: () => api.get('/employees'),
  update: (id, data) => api.put(`/employees/${id}`, data),
  delete: (id) => api.delete(`/employees/${id}`)
};

// Attendance API
export const attendanceApi = {
  getAll: () => api.get('/attendances'),
  getById: (id) => api.get(`/attendances/${id}`),
  getByStudent: (studentId) => api.get(`/attendances/student/${studentId}`),
  getByDateRange: (data) => api.post('/attendances/date-range', data),
  create: (data) => api.post('/attendances', data),
  update: (id, data) => api.put(`/attendances/${id}`, data),
  delete: (id) => api.delete(`/attendances/${id}`)
};

export default api;
