import axios, { AxiosError, AxiosRequestConfig } from 'axios';
import { ApiError } from "../types";

// Base API URL - replace with your actual API URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";

// Create axios instance with default config
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add authentication interceptor
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

interface ErrorResponse {
  message?: string;
}

// Add response interceptor for error handling
axiosInstance.interceptors.response.use(
  response => response,
  (error: AxiosError<ErrorResponse>) => {
    const apiError: ApiError = {
      message: error.response?.data?.message || error.message || 'Something went wrong',
      statusCode: error.response?.status || 0
    };
    return Promise.reject(apiError);
  }
);

interface RequestOptions extends Omit<AxiosRequestConfig, 'params'> {
  params?: Record<string, string | number | boolean>;
}

/**
 * HTTP GET request
 */
export const get = <T>(
  endpoint: string,
  params?: Record<string, string | number | boolean>
): Promise<T> => {
  return axiosInstance.get<T>(endpoint, { params }).then(response => response.data);
};

/**
 * HTTP POST request
 */
// export const post = <T>(endpoint: string, data?: any): Promise<T> => {
//   return axiosInstance.post<T>(endpoint, data).then(response => response.data);
// };
export const post = <T>(endpoint: string, data?: any): Promise<T> => {
  return axiosInstance
    .post<T>(endpoint, data)
    .then(response => response.data)
    .catch(error => {
      if (error.response) {
        // Handle error response from backend (validation errors, etc.)
        console.error("Backend validation errors:", error.response.data);
        // You can throw an error or display the error messages to the user
        // Here we are just logging them and throwing a general error
        throw new Error(`Validation Error: ${JSON.stringify(error.response.data)}`);
      } else if (error.request) {
        // No response received from the backend
        console.error("No response received:", error.request);
      } else {
        // Something else went wrong
        console.error("General error:", error.message);
      }
      throw error; // Re-throw the error for further handling
    });
};


/**
 * HTTP PUT request
 */
export const put = <T>(endpoint: string, data?: any): Promise<T> => {
  return axiosInstance.put<T>(endpoint, data).then(response => response.data);
};

/**
 * HTTP PATCH request
 */
export const patch = <T>(endpoint: string, data?: any): Promise<T> => {
  return axiosInstance.patch<T>(endpoint, data).then(response => response.data);
};

/**
 * HTTP DELETE request
 */
export const del = <T>(endpoint: string): Promise<T> => {
  return axiosInstance.delete<T>(endpoint).then(response => response.data);
};

/**
 * Upload file(s) with multipart form data
 */
export const uploadFiles = <T>(
  endpoint: string,
  files: File | File[],
  fieldName = "file",
  additionalData?: Record<string, any>
): Promise<T> => {
  const formData = new FormData();

  // Add file(s) to form data
  if (Array.isArray(files)) {
    files.forEach((file, index) => {
      formData.append(`${fieldName}[${index}]`, file);
    });
  } else {
    formData.append(fieldName, files);
  }

  // Add any additional data
  if (additionalData) {
    Object.entries(additionalData).forEach(([key, value]) => {
      formData.append(key, String(value));
    });
  }

  return axiosInstance.post<T>(endpoint, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  }).then(response => response.data);
};

export default {
  get,
  post,
  put,
  patch,
  delete: del,
  uploadFiles,
};
