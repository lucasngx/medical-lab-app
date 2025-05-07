import { ApiError } from "../types";

// Base API URL - replace with your actual API URL
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";

interface FetchOptions extends RequestInit {
  params?: Record<string, string | number | boolean>;
}

/**
 * Build URL with query parameters
 */
const buildUrl = (
  endpoint: string,
  params?: Record<string, string | number | boolean>
): string => {
  const url = new URL(`${API_BASE_URL}${endpoint}`);

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, String(value));
    });
  }

  return url.toString();
};

/**
 * Generic fetch wrapper with error handling
 */
async function fetchAPI<T>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<T> {
  try {
    // Extract params from options and build URL
    const { params, ...fetchOptions } = options;
    const url = buildUrl(endpoint, params);


    // Set up headers
    const headers = new Headers(options.headers);

    // Set content type if not already set
    if (
      !headers.has("Content-Type") &&
      options.method &&
      options.method !== "GET" &&
      options.body
    ) {
      headers.set("Content-Type", "application/json");
    }

 

    // Perform the fetch
    const response = await fetch(url, {
      ...fetchOptions,
      headers,
    });

    // Parse the response
    let data: any;

    // Try to parse as JSON, fall back to text if that fails
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    // Handle error responses
    if (!response.ok) {
      const error: ApiError = {
        message: data.message || response.statusText || "Something went wrong",
        statusCode: response.status,
      };
      throw error;
    }

    return data as T;
  } catch (error: any) {
    // Handle network errors
    if (!error.statusCode) {
      console.error("Network error:", error);
      throw {
        message: "Network error. Please check your connection.",
        statusCode: 0,
      } as ApiError;
    }
    throw error;
  }
}

/**
 * HTTP GET request
 */
export const get = <T>(
  endpoint: string,
  params?: Record<string, string | number | boolean>
): Promise<T> => {
  return fetchAPI<T>(endpoint, { method: "GET", params });
};

/**
 * HTTP POST request
 */
export const post = <T>(endpoint: string, data?: any): Promise<T> => {
  return fetchAPI<T>(endpoint, {
    method: "POST",
    body: data ? JSON.stringify(data) : undefined,
  });
};

/**
 * HTTP PUT request
 */
export const put = <T>(endpoint: string, data?: any): Promise<T> => {
  return fetchAPI<T>(endpoint, {
    method: "PUT",
    body: data ? JSON.stringify(data) : undefined,
  });
};

/**
 * HTTP PATCH request
 */
export const patch = <T>(endpoint: string, data?: any): Promise<T> => {
  return fetchAPI<T>(endpoint, {
    method: "PATCH",
    body: data ? JSON.stringify(data) : undefined,
  });
};

/**
 * HTTP DELETE request
 */
export const del = <T>(endpoint: string): Promise<T> => {
  return fetchAPI<T>(endpoint, { method: "DELETE" });
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

  return fetchAPI<T>(endpoint, {
    method: "POST",
    body: formData,
    // Don't set Content-Type header, let the browser set it with the boundary
  });
};

export default {
  get,
  post,
  put,
  patch,
  delete: del,
  uploadFiles,
};
