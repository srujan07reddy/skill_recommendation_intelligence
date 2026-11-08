import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';

// Base API Client
export const apiClient: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api/v1',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach bearer token from sessionStorage if present
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Boundary 7: Only short-lived auth tokens are kept in sessionStorage
    const token = sessionStorage.getItem('ssip_auth_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

// Response Interceptor: Centralized error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Clear token on unauthorized
      sessionStorage.removeItem('ssip_auth_token');
    }
    return Promise.reject(error);
  }
);

