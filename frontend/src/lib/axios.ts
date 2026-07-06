import axios, {
  type AxiosError,
  type InternalAxiosRequestConfig,
} from "axios";
import type { ApiErrorResponse } from "../types/auth.types";

const BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:5000/api/v1";

export const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, // send/receive httpOnly accessToken & refreshToken cookies
});

// ---- Refresh-token queueing ----
// Your tokens live in httpOnly cookies, so we never touch the token strings
// ourselves. We just hit POST /auth/refresh, the server rotates the cookies,
// and we retry whatever request failed with 401.

interface RetryableRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

let isRefreshing = false;
let pendingQueue: Array<{
  resolve: () => void;
  reject: (err: unknown) => void;
}> = [];

const flushQueue = (error: unknown | null) => {
  pendingQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else resolve();
  });
  pendingQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiErrorResponse>) => {
    const originalRequest = error.config as RetryableRequestConfig | undefined;

    if (!originalRequest) {
      return Promise.reject(error);
    }

    const requestUrl = originalRequest.url ?? "";
    const isAuthEndpoint =
      requestUrl.includes("/auth/login") ||
      requestUrl.includes("/auth/register") ||
      requestUrl.includes("/auth/refresh");

    // Only try to refresh once per request, and never for the auth endpoints
    // themselves (avoids infinite refresh loops).
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !isAuthEndpoint
    ) {
      if (isRefreshing) {
        // A refresh is already in flight — queue this request until it's done.
        return new Promise<void>((resolve, reject) => {
          pendingQueue.push({ resolve, reject });
        }).then(() => api(originalRequest));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        await api.post("/auth/refresh");
        flushQueue(null);
        return api(originalRequest);
      } catch (refreshError) {
        flushQueue(refreshError);
        // Refresh token is dead too — force the app back to a logged-out state.
        window.dispatchEvent(new Event("auth:logout"));
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;