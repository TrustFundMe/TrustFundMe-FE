import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";

// Client-side: dùng proxy /api-backend (Next.js forward → BE), tránh Mixed Content
// Server-side: gọi thẳng BE URL (server-to-server không bị HTTPS block)
const BASE_URL = (() => {
  if (typeof window !== "undefined") {
    return "/api-backend"; // Proxy qua Next.js → tránh Mixed Content trên Vercel
  }
  return (
    process.env.NEXT_PUBLIC_BE_API_URL ||
    process.env.BE_API_GATEWAY_URL ||
    "http://localhost:8080"
  );
})();

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
