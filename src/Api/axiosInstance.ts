// axiosInstance.ts
import axios from 'axios';
import { API_CONFIG } from './apiConfig';

const axiosInstance = axios.create({
  baseURL: API_CONFIG.baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default axiosInstance;
