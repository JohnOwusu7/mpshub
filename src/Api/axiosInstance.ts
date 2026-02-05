// axiosInstance.ts
import axios from 'axios';
import { API_CONFIG } from './apiConfig';

const axiosInstance = axios.create({
  baseURL: API_CONFIG.baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add the token and companyId to headers
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    const companyId = localStorage.getItem('companyId');
    const departmentId = localStorage.getItem('departmentId');
    const sectionId = localStorage.getItem('sectionId');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    if (companyId) {
      config.headers.companyid = companyId; // Use lowercase for custom headers in backend
    }
    if (departmentId) {
      config.headers.departmentid = departmentId;
    }
    if (sectionId) {
      config.headers.sectionid = sectionId;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default axiosInstance;
