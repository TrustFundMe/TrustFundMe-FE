import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "/api-backend";

export const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (typeof window !== "undefined") {
      const token = window.localStorage.getItem("token");
      if (token) {
        config.headers = config.headers ?? {};
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError | any) => {
    // Clean up Spring Boot's ResponseStatusException message format: '400 BAD_REQUEST "Error message"'
    if (error.response?.data?.message && typeof error.response.data.message === 'string') {
      const match = error.response.data.message.match(/^[0-9]{3} [A-Z_]+ "(.*)"$/);
      if (match && match[1]) {
        error.response.data.message = match[1];
      }
    }

    if (error.response?.status !== 401) {
      return Promise.reject(error);
    }

    // Placeholder for refresh-token flow.
    // When you implement auth service, wire it here to refresh and retry.
    if (typeof window !== "undefined") {
      window.localStorage.removeItem("token");
    }

    return Promise.reject(error);
  }
);
