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

    // Handle Auth errors (401 and 403)
    if (error.response?.status === 401 || error.response?.status === 403) {
      const errorMessage = error.response?.data?.message || "";
      
      // If it's a 403 but specifically mentions token or authentication issues
      // Or if it's a 401 (always auth issue)
      if (error.response?.status === 401 || 
          errorMessage.toLowerCase().includes("token") || 
          errorMessage.toLowerCase().includes("access denied") ||
          errorMessage.toLowerCase().includes("unauthorized")) {
        
        if (typeof window !== "undefined") {
          const currentToken = window.localStorage.getItem("token");
          if (currentToken) {
            console.warn("Auth error detected, clearing token:", error.response?.status);
            window.localStorage.removeItem("token");
            // Optionally redirect to sign-in if not already there
            if (!window.location.pathname.includes('/sign-in')) {
              window.location.href = "/sign-in?callbackUrl=" + encodeURIComponent(window.location.pathname);
            }
          }
        }
      }
      return Promise.reject(error);
    }

    return Promise.reject(error);
  }
);
