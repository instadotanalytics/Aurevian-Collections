import axios from "axios";
import { API_URL, AUTH_CONFIG } from "../utils/constants.js";

// Create axios instance with base URL from constants
const axiosInstance = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor - Add token to headers
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(AUTH_CONFIG.ACCESS_TOKEN_KEY);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Response interceptor - Handle token refresh
let isRefreshing = false;
let failedQueue = [];
let refreshAttempts = 0;
const MAX_REFRESH_ATTEMPTS = 2;

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // ✅ Don't retry if the request itself was the refresh attempt
    if (originalRequest.url?.includes("/auth/refresh")) {
      // Refresh failed — clear tokens and redirect
      localStorage.removeItem(AUTH_CONFIG.ACCESS_TOKEN_KEY);
      localStorage.removeItem(AUTH_CONFIG.USER_KEY);
      // Only redirect if not already on login page
      if (!window.location.pathname.includes("/login")) {
        window.location.href = "/login";
      }
      return Promise.reject(error);
    }

    // ✅ Only attempt refresh on 401, and only if we haven't retried too many times
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      refreshAttempts < MAX_REFRESH_ATTEMPTS
    ) {
      if (isRefreshing) {
        // Queue this request to retry after refresh completes
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return axiosInstance(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;
      refreshAttempts += 1;

      try {
        const response = await axios.post(
          `${API_URL}/auth/refresh`,
          {},
          {
            withCredentials: true,
            // ✅ Short timeout so we don't hang forever
            timeout: 10000,
          },
        );

        if (response.data.success) {
          const { token } = response.data;
          if (token) {
            localStorage.setItem(AUTH_CONFIG.ACCESS_TOKEN_KEY, token);
            // ✅ Reset attempts on successful refresh
            refreshAttempts = 0;
            processQueue(null, token);
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return axiosInstance(originalRequest);
          }
        }
        throw new Error("Refresh returned no token");
      } catch (refreshError) {
        // ✅ Only clear tokens if it's an auth error (not network)
        const isAuthError =
          refreshError.response?.status === 401 ||
          refreshError.response?.status === 403;
        if (isAuthError) {
          processQueue(refreshError, null);
          localStorage.removeItem(AUTH_CONFIG.ACCESS_TOKEN_KEY);
          localStorage.removeItem(AUTH_CONFIG.USER_KEY);
          // Don't redirect immediately — let the app handle it
        } else {
          // Network or other error — queue the error but don't clear tokens
          processQueue(refreshError, null);
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
        // Reset attempts if we succeeded or hit max
        if (refreshAttempts >= MAX_REFRESH_ATTEMPTS) {
          refreshAttempts = 0;
        }
      }
    }

    return Promise.reject(error);
  },
);

// ✅ Helper to reset refresh state (useful after logout)
export const resetRefreshState = () => {
  isRefreshing = false;
  failedQueue = [];
  refreshAttempts = 0;
};

export default axiosInstance;
