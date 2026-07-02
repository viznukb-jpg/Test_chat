import axios from 'axios';
import { useAuthStore } from '../store/useAuthStore';

export const apiClient = axios.create({
  baseURL: 'http://localhost:3000', // Адреса нашого NestJS бекенду
  headers: {
    'Content-Type': 'application/json',
  },
});

// Інтерцептор запиту: автоматично додає JWT токен до всіх запитів
apiClient.interceptors.request.use((config) => {
  // Дістаємо токен безпосередньо зі стейту Zustand
  const token = useAuthStore.getState().accessToken;
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Інтерцептор відповіді: глобальна обробка помилок
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Якщо бекенд каже, що токен протермінований (або відсутній у Redis)
      useAuthStore.getState().logout(); // Очищаємо стейт
      
      // Перенаправляємо на сторінку логіну, якщо ми в браузері
      if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);
