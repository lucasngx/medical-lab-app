import axios from "axios";

// Base API URL - replace with your actual API URL
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";

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
  withCredentials: true, // Enable credentials for CORS
});

// Add request interceptor to add token to all requests except login
api.interceptors.request.use(
  (config) => {
    // Log the request details
    console.log("API Request:", {
      url: config.url,
      method: config.method,
      baseURL: config.baseURL,
      data: config.data,
    });

    // Skip adding token for login endpoint
    if (config.url?.includes("/api/auth/login")) {
      return config;
    }

    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error("Request interceptor error:", error);
    return Promise.reject(error);
  }
);

// Add response interceptor to handle token expiration and errors
api.interceptors.response.use(
  (response) => {
    // Log successful response
    console.log("API Success Response:", {
      url: response.config.url,
      status: response.status,
      data: response.data,
    });
    return response;
  },
  async (error) => {
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error("API Error Response:", {
        status: error.response.status,
        data: error.response.data,
        headers: error.response.headers,
      });

      if (error.response.status === 401) {
        // Handle unauthorized access (token expired or invalid)
        if (typeof window !== "undefined") {
          localStorage.removeItem("auth-storage");
          localStorage.removeItem("user_email");
          localStorage.removeItem("user_role");
          // Redirect to login page
          window.location.href = "/login";
        }
      } else if (error.response.status === 403) {
        console.error(
          "Forbidden access. Please check your credentials and permissions."
        );
        // Don't automatically redirect to unauthorized page for API calls
        // Let components handle 403 errors gracefully
        // if (typeof window !== "undefined") {
        //   window.location.href = "/unauthorized";
        // }
      }
    } else if (error.request) {
      // The request was made but no response was received
      console.error("No response received:", error.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error("Request setup error:", error.message);
    }
    return Promise.reject(error);
  }
);
