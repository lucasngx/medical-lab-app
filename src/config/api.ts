import axios, { AxiosError, AxiosResponse } from "axios";

// Base API URL - replace with your actual API URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

// Function to get the access token from localStorage
const getAccessToken = () => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("auth_token");
  }
  return null;
};

// Create axios instance with default config
export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  withCredentials: false, // Changed to false to avoid CORS issues
});

// Add request interceptor to add token to all requests except login
api.interceptors.request.use(
  (config) => {
    // Skip adding token for login endpoint
    if (config.url?.includes("/api/auth/login")) {
      return config;
    }

    const token = getAccessToken();
    
    if (!token) {
      // If no token is found for non-login requests, redirect to login
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
      return Promise.reject(new Error("No access token found"));
    }

    // Ensure the token is properly formatted
    config.headers.Authorization = `Bearer ${token.trim()}`;
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle token expiration and errors
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    if (error.response) {
      if (error.response.status === 401) {
        // Handle unauthorized access (token expired or invalid)
        if (typeof window !== "undefined") {
          localStorage.removeItem("auth_token");
          localStorage.removeItem("user");
          window.location.href = "/login";
        }
      }
    }
    return Promise.reject(error);
  }
);
