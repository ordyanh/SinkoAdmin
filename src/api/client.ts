import axios, { AxiosError } from "axios";
import { getAdminToken } from "./token";

// In development, Vite proxies /api to the configured backend (local :5206 or remote Azure)
const client = axios.create({
  baseURL: "/api",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000,
});

// Automatically inject transparent Admin JWT token into every request
client.interceptors.request.use((config) => {
  const token = getAdminToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Format and extract helpful error messages
client.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ message?: string; error?: string; title?: string }>) => {
    const isHy = typeof window !== "undefined" && localStorage.getItem("sinko_admin_lang") === "hy";
    let message = isHy ? "Տեղի է ունեցել անսպասելի սխալ" : "An unexpected error occurred";
    if (error.response?.data) {
      const data = error.response.data;
      message = data.message || data.error || data.title || JSON.stringify(data);
    } else if (error.message) {
      message = error.message;
    }
    return Promise.reject(new Error(message));
  }
);

export default client;
