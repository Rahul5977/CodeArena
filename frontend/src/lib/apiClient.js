import axios from "axios";

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8080/api/v1",
  withCredentials: true, // Important: Send cookies with requests
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000, // 30 seconds
});

// Request interceptor - Add any auth tokens or modify requests
apiClient.interceptors.request.use(
  (config) => {
    // You can add custom headers here if needed
    // For example, if you want to add a custom header:
    // config.headers['X-Custom-Header'] = 'value';

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Flag to prevent multiple simultaneous refresh attempts
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

// Response interceptor - Handle responses and errors globally
apiClient.interceptors.response.use(
  (response) => {
    // Return the data directly for successful responses
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Don't retry if this is the refresh token endpoint itself
    if (originalRequest.url?.includes("/auth/refresh-token")) {
      // Clear auth state if refresh token fails
      localStorage.removeItem("leetlab-auth-storage");
      return Promise.reject(error);
    }

    // Handle 401 Unauthorized errors
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // If already refreshing, queue this request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => {
            return apiClient(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Try to refresh the token
        await apiClient.post("/auth/refresh-token");

        isRefreshing = false;
        processQueue(null);

        // Retry the original request
        return apiClient(originalRequest);
      } catch (refreshError) {
        isRefreshing = false;
        processQueue(refreshError, null);

        // If refresh fails, clear auth state
        localStorage.removeItem("leetlab-auth-storage");

        // Only redirect if we're not already on auth pages
        const authPages = ["/login", "/register", "/forgot-password", "/reset-password"];
        if (!authPages.some((page) => window.location.pathname.startsWith(page))) {
          window.location.href = "/login";
        }

        return Promise.reject(refreshError);
      }
    }

    // Handle other error status codes
    if (error.response?.status === 403) {
      console.error("Access forbidden:", error.response.data);
    }

    if (error.response?.status === 404) {
      console.error("Resource not found:", error.response.data);
    }

    if (error.response?.status >= 500) {
      console.error("Server error:", error.response.data);
    }

    return Promise.reject(error);
  }
);

export default apiClient;

/**
 * API Client Usage Examples:
 *
 * GET request:
 * const response = await apiClient.get('/users');
 * const users = response.data;
 *
 * POST request:
 * const response = await apiClient.post('/auth/login', { email, password });
 * const userData = response.data;
 *
 * PUT request:
 * const response = await apiClient.put('/users/123', { name: 'New Name' });
 *
 * DELETE request:
 * await apiClient.delete('/users/123');
 *
 * With custom config:
 * const response = await apiClient.get('/users', {
 *   params: { page: 1, limit: 10 },
 *   headers: { 'X-Custom-Header': 'value' }
 * });
 */
