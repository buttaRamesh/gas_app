import axios from "axios";
import type {
  AxiosError,
  AxiosInstance,
  InternalAxiosRequestConfig,
} from "axios";

import { useErrorStore } from "../store/error.store";
import { classifyError } from "../utils/errorClassifier";

// Base URL from .env
const BASE_URL = import.meta.env.VITE_API_BASE_URL;

/**
 * ------------------------------------------------------------
 * Create Axios Instance
 * ------------------------------------------------------------
 */
const axiosInstance: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

/**
 * ------------------------------------------------------------
 * Normalize all error responses
 * ------------------------------------------------------------
 */
const normalizeError = (error: AxiosError) => {
  const status = error.response?.status ?? 0;
  const data = (error.response?.data ?? {}) as any;

  return {
    status,
    message:
      data?.message ??
      error.message ??
      "Something went wrong. Please try again.",
    errors: data?.errors ?? null,
  };
};

/**
 * ------------------------------------------------------------
 * REQUEST INTERCEPTOR
 * ------------------------------------------------------------
 */
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem("access_token");

    if (token) {
      config.headers.set("Authorization", `Bearer ${token}`);
    }

    return config;
  },
  (error: AxiosError) => Promise.reject(normalizeError(error))
);

/**
 * ------------------------------------------------------------
 * RESPONSE INTERCEPTOR (401 Auto Refresh + Global Errors)
 * ------------------------------------------------------------
 */
let isRefreshing = false;

let failedQueue: {
  resolve: (token: string | null) => void;
  reject: (err: unknown) => void;
}[] = [];

const processQueue = (error: unknown, token: string | null) => {
  failedQueue.forEach((p) => {
    if (token) p.resolve(token);
    else p.reject(error);
  });
  failedQueue = [];
};

axiosInstance.interceptors.response.use(
  (response) => response,

  async (error: AxiosError) => {
    const normalized = normalizeError(error);
    const originalRequest = error.config as any;
    const errorStore = useErrorStore.getState();
    const classification = classifyError(normalized);

    /** -----------------------------------------------
     *  GLOBAL ERROR HANDLING (Snackbar)
     *  ---------------------------------------------- */

    // Network failure
    if (classification.isNetworkError) {
      errorStore.showError("Unable to connect to the server.");
    }

    // Forbidden
    else if (classification.isForbidden) {
      errorStore.showError("You do not have permission to perform this action.");
    }

    // Not Found
    else if (classification.isNotFound) {
      errorStore.showError("Requested resource not found.");
    }

    // Server errors
    else if (classification.isServerError) {
      errorStore.showError("A server error occurred. Please try again later.");
    }

    // Validation errors (422) are handled by forms → DO NOT SHOW SNACKBAR

    /** -----------------------------------------------
     *  401 Unauthorized → Refresh Token Flow
     *  ---------------------------------------------- */
    if (classification.isAuthError && !originalRequest._retry) {
      originalRequest._retry = true;

      if (isRefreshing) {
        // Queue this request until refresh finishes
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((newToken) => {
          originalRequest.headers.set("Authorization", `Bearer ${newToken}`);
          return axiosInstance(originalRequest);
        });
      }

      isRefreshing = true;

      try {
        const refreshToken = localStorage.getItem("refresh_token");

        if (!refreshToken) {
          processQueue(null, null);
          isRefreshing = false;
          return Promise.reject(normalized);
        }

        const res = await axios.post(`${BASE_URL}/auth/refresh`, {
          refresh_token: refreshToken,
        });

        const newAccessToken = res.data.access_token;
        localStorage.setItem("access_token", newAccessToken);

        processQueue(null, newAccessToken);

        originalRequest.headers.set(
          "Authorization",
          `Bearer ${newAccessToken}`
        );

        isRefreshing = false;

        return axiosInstance(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        isRefreshing = false;

        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");

        errorStore.showError("Your session has expired. Please login again.");

        return Promise.reject(normalizeError(error));
      }
    }

    /** Return normalized error always */
    return Promise.reject(normalized);
  }
);

export default axiosInstance;
