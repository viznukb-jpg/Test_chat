import axios from "axios";
import { useAuthStore } from "../store/useAuthStore";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export const apiClient = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// No need for request interceptor — cookies are sent automatically

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: unknown) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve();
    }
  });
  failedQueue = [];
};

// Cross-tab synchronization
let authChannel: BroadcastChannel | null = null;
if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
  authChannel = new BroadcastChannel('auth_refresh_channel');
  authChannel.onmessage = (event) => {
    if (event.data.type === 'REFRESH_START') {
      isRefreshing = true;
    } else if (event.data.type === 'REFRESH_SUCCESS') {
      isRefreshing = false;
      processQueue(null);
    } else if (event.data.type === 'REFRESH_FAILED') {
      isRefreshing = false;
      processQueue(new Error('Refresh failed in another tab'));
    }
  };
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const isAuthRoute = originalRequest.url?.includes('/auth/login') || originalRequest.url?.includes('/auth/register') || originalRequest.url?.includes('/auth/refresh');

    if (error.response?.status === 401 && !originalRequest._retry && !isAuthRoute) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => {
            return apiClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;
      authChannel?.postMessage({ type: 'REFRESH_START' });

      try {
        // Refresh token is sent automatically via httpOnly cookie
        await axios.post(`${API_URL}/auth/refresh`, {}, { withCredentials: true });
        
        processQueue(null);
        authChannel?.postMessage({ type: 'REFRESH_SUCCESS' });
        
        return apiClient(originalRequest);
      } catch (err) {
        processQueue(err);
        authChannel?.postMessage({ type: 'REFRESH_FAILED' });
        useAuthStore.getState().logout();
        if (typeof window !== "undefined" && window.location.pathname !== "/login") {
          window.location.href = "/login";
        }
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);
