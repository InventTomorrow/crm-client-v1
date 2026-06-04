import axios from 'axios';

/**
 * Pre-configured axios instance for all API requests.
 * HttpOnly cookies are sent automatically — no manual token handling needed.
 * Set NEXT_PUBLIC_API_URL in .env to point at the real backend.
 */
export const apiClient = axios.create({
  baseURL: '/api/v1',
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: any) => void;
  reject: (reason?: any) => void;
}> = [];

const processQueue = (error: any) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve();
    }
  });
  failedQueue = [];
};

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (!originalRequest) {
      return Promise.reject(error);
    }

    // Check if the error is due to an expired access token and is not already a retry
    if (
      error.response?.status === 401 &&
      error.response?.data?.error?.code === 'auth/token_expired' &&
      !originalRequest._retry
    ) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => {
            return apiClient(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        await apiClient.post('/auth/refresh');
        isRefreshing = false;
        processQueue(null);
        return apiClient(originalRequest);
      } catch (refreshError) {
        isRefreshing = false;
        processQueue(refreshError);

        if (typeof window !== 'undefined') {
          window.location.href = '/auth/login';
        }
        return Promise.reject(refreshError);
      }
    }

    // If it's a 401 error but NOT a token expiration issue, or if the refresh attempt itself failed
    if (error.response?.status === 401) {
      const url = originalRequest.url ?? '';
      const isAuthRoute = url.endsWith('/auth/login') || url.endsWith('/auth/refresh');

      if (!isAuthRoute) {
        if (typeof window !== 'undefined') {
          window.location.href = '/auth/login';
        }
      }
    }

    return Promise.reject(error);
  },
);
