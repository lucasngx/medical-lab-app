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
  // withCredentials: true, // Temporarily disable credentials for debugging
});

// Add request interceptor to add token to all requests except login
api.interceptors.request.use(
  (config) => {
    // Skip adding token for login and register endpoints
    if (
      config.url?.includes("/api/auth/login") ||
      config.url?.includes("/api/auth/register")
    ) {
      console.log("API Request (Auth endpoint):", {
        url: config.url,
        method: config.method,
        baseURL: config.baseURL,
        headers: config.headers,
      });
      return config;
    }

    const token = getAccessToken();
    
    // Log the request details with token info
    console.log("API Request:", {
      url: config.url,
      method: config.method,
      baseURL: config.baseURL,
      data: config.data,
      hasToken: !!token,
      tokenPreview: token ? `${token.substring(0, 10)}...${token.substring(token.length - 10)}` : null,
      authHeader: token ? `Bearer ${token.substring(0, 10)}...` : 'No auth header',
    });

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      console.warn("No access token found for request to:", config.url);
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
  (response: AxiosResponse) => {
    // Log successful response
    console.log("API Success Response:", {
      url: response.config.url,
      status: response.status,
      data: response.data,
    });
    return response;
  },
  async (error: AxiosError) => {
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error("API Error Response:", {
        status: error.response.status,
        data: error.response.data,
        headers: error.response.headers,
        url: error.config?.url,
      });

      if (error.response.status === 401) {
        // Handle unauthorized access (token expired or invalid)
        if (typeof window !== "undefined") {
          localStorage.removeItem("auth_token");
          localStorage.removeItem("user");
          document.cookie =
            "auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict; Secure";
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
      } else if (error.response.status >= 500) {
        console.error("Server error occurred:", error.response.data);
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
