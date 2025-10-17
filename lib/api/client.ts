import axios, { type AxiosResponse } from "axios";
import { getToken, clearAuthData } from "@/lib/utils/token-storage";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://192.168.1.2:3000/api";

export const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 10000,
});

// Request interceptor to add auth token to requests
apiClient.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Si el body es FormData, eliminar Content-Type para que axios lo establezca automáticamente
    // con el boundary correcto para multipart/form-data
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle 401 Unauthorized
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized (e.g., token expired)
      clearAuthData();

      // Redirect to login only if not already on login page
      if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
