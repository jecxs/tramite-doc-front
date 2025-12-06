import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { STORAGE_KEYS } from '@/lib/constants';
import { config } from '@/config';

const API_BASE_URL = config.API_URL;

const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Intentar obtener token de localStorage
    const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error: AxiosError) => {
    if (error.response?.status === 401) {
      localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.USER);

      // Eliminar cookie también
      document.cookie = 'access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';

      window.location.href = '/login';
    }

    return Promise.reject(error);
  }
);

export default apiClient;

export const handleApiError = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<{ message: string | string[]; error: string; statusCode: number }>;

    if (error.code === 'ERR_NETWORK') {
      return 'No se puede conectar con el servidor. Verifique que el backend esté corriendo.';
    }

    if (error.code === 'ECONNABORTED') {
      return 'La solicitud tardó demasiado. Intente nuevamente.';
    }

    if (axiosError.response?.data?.message) {
      const message = axiosError.response.data.message;
      return Array.isArray(message) ? message.join(', ') : message;
    }

    if (axiosError.message) {
      return axiosError.message;
    }
  }

  console.error('Error desconocido:', error);
  return 'Ocurrió un error inesperado. Por favor intente nuevamente.';
};
