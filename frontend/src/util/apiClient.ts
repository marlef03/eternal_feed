import axios from 'axios';
import tokenStore from './tokenStore';
import { useAuthStatus } from './authStatus';

const apiClient = axios.create({
  baseURL: '/api/v1',
  withCredentials: true,
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  const token = tokenStore.get();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let isRefreshing = false;
let failedQueue: { resolve: (token: string | null) => void, reject: (error: Error | null) => void }[] = [];

const processQueue = (error: Error | null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

apiClient.interceptors.response.use(
  (response) => {
    if (response.config.url == '/users/me') {
      useAuthStatus.setState({ authed: true });
    }

    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers["Authorization"] = `Bearer ${token}`;
            return apiClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const { data } = await axios.post("/auth/refresh", {}, {
          baseURL: '/api/v1',
          withCredentials: true,
        });

        const newToken = data.access_token;

        tokenStore.set(newToken);

        apiClient.defaults.headers.common["Authorization"] = `Bearer ${newToken}`;

        useAuthStatus.setState({ authed: true });

        processQueue(null, newToken);
        return apiClient(originalRequest);
      } catch (refreshError) {
        if (refreshError instanceof Error) {
          useAuthStatus.setState({ authed: false });

          tokenStore.clear();

          processQueue(refreshError, null);
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;