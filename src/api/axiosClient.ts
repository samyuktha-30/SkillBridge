import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { sessionStore } from '../auth/sessionStorage';
import type { AuthResponse } from '../types/auth.types';
import type { ProblemDetails as CommonProblemDetails } from '../types/common.types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1';

export const axiosClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

interface RetryableConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (err: unknown) => void;
}> = [];

function processQueue(error: unknown, token: string | null) {
  failedQueue.forEach((promise) => {
    if (error || !token) {
      promise.reject(error);
    } else {
      promise.resolve(token);
    }
  });
  failedQueue = [];
}

axiosClient.interceptors.request.use((config) => {
  const token = sessionStore.getAccessToken();
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

axiosClient.interceptors.response.use(
  (response) => {
    const isBlob = response.config.responseType === 'blob';
    if (!isBlob && typeof response.data === 'string' && response.data.trimStart().startsWith('<')) {
      return Promise.reject(
        new Error(
          'SkillBridge .NET 10 API is not reachable from this preview host (received HTML fallback instead of JSON). Run the .NET 10 backend locally on port 5000 (or set VITE_API_BASE_URL to your deployed .NET API URL).'
        )
      );
    }
    return response;
  },
  async (error: AxiosError<CommonProblemDetails>) => {
    const originalRequest = error.config as RetryableConfig | undefined;

    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !originalRequest.url?.includes('/auth/login') &&
      !originalRequest.url?.includes('/auth/refresh')
    ) {
      const refreshToken = sessionStore.getRefreshToken();
      if (!refreshToken) {
        sessionStore.clear();
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise<string>((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((newToken) => {
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
          }
          return axiosClient(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const res = await axios.post<AuthResponse>(`${API_BASE_URL}/auth/refresh`, {
          refreshToken,
        });
        const { accessToken, refreshToken: rotatedRefresh, user } = res.data;
        sessionStore.updateTokens(accessToken, rotatedRefresh);
        if (user) {
          sessionStore.updateUser(user);
        }
        processQueue(null, accessToken);
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        }
        return axiosClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        sessionStore.clear();
        window.dispatchEvent(new CustomEvent('skillbridge:unauthorized'));
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export function extractApiErrorMessage(err: unknown): string {
  if (axios.isAxiosError(err)) {
    if (!err.response) {
      return 'Unable to reach the SkillBridge .NET 10 API server. Ensure the backend is running locally on port 5000 (or configure VITE_API_BASE_URL).';
    }
    const data = err.response.data as CommonProblemDetails | undefined;
    if (data?.errors) {
      const firstKey = Object.keys(data.errors)[0];
      if (firstKey && data.errors[firstKey]?.length) {
        return data.errors[firstKey][0];
      }
    }
    if (data?.detail) return data.detail;
    if (data?.title) return data.title;
    return `Request failed (${err.response.status})`;
  }
  if (err instanceof Error) return err.message;
  return 'An unexpected error occurred.';
}
