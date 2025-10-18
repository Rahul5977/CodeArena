import apiClient from "../lib/apiClient";

/**
 * Authentication API Service
 * All auth-related API calls with proper error handling
 */

const authAPI = {
  /**
   * Register a new user
   * @param {Object} userData - { name, email, password }
   * @returns {Promise<Object>} User data and token
   */
  register: async (userData) => {
    try {
      const response = await apiClient.post("/auth/register", userData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Registration failed" };
    }
  },

  /**
   * Login user
   * @param {Object} credentials - { email, password, rememberMe }
   * @returns {Promise<Object>} User data and token
   */
  login: async (credentials) => {
    try {
      const response = await apiClient.post("/auth/login", credentials);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Login failed" };
    }
  },

  /**
   * Logout user
   * @returns {Promise<Object>} Success message
   */
  logout: async () => {
    try {
      const response = await apiClient.post("/auth/logout");
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Logout failed" };
    }
  },

  /**
   * Logout from all devices
   * @returns {Promise<Object>} Success message
   */
  logoutAll: async () => {
    try {
      const response = await apiClient.post("/auth/logout-all");
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Logout from all devices failed" };
    }
  },

  /**
   * Get current user profile
   * @returns {Promise<Object>} User data
   */
  getProfile: async () => {
    try {
      const response = await apiClient.get("/auth/profile");
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Failed to fetch profile" };
    }
  },

  /**
   * Get current authenticated user (using /me endpoint)
   * @returns {Promise<Object>} User data
   */
  getCurrentUser: async () => {
    try {
      const response = await apiClient.get("/auth/me");
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Failed to fetch user data" };
    }
  },

  /**
   * Update user profile
   * @param {Object} profileData - Profile fields to update
   * @returns {Promise<Object>} Updated user data
   */
  updateProfile: async (profileData) => {
    try {
      const response = await apiClient.put("/auth/profile", profileData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Failed to update profile" };
    }
  },

  /**
   * Change password
   * @param {Object} passwordData - { oldPassword, newPassword }
   * @returns {Promise<Object>} Success message
   */
  changePassword: async (passwordData) => {
    try {
      const response = await apiClient.post("/auth/change-password", passwordData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Failed to change password" };
    }
  },

  /**
   * Request password reset
   * @param {string} email - User email
   * @returns {Promise<Object>} Success message
   */
  forgotPassword: async (email) => {
    try {
      const response = await apiClient.post("/auth/forgot-password", { email });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Failed to send reset email" };
    }
  },

  /**
   * Reset password with token
   * @param {Object} resetData - { token, newPassword }
   * @returns {Promise<Object>} Success message
   */
  resetPassword: async (resetData) => {
    try {
      const response = await apiClient.post("/auth/reset-password", resetData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Failed to reset password" };
    }
  },

  /**
   * Refresh access token
   * @returns {Promise<Object>} New tokens
   */
  refreshToken: async () => {
    try {
      const response = await apiClient.post("/auth/refresh-token");
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Failed to refresh token" };
    }
  },

  /**
   * Check authentication status
   * @returns {Promise<Object>} Auth status and user data
   */
  checkAuth: async () => {
    try {
      const response = await apiClient.get("/auth/check");
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Authentication check failed" };
    }
  },

  /**
   * Health check
   * @returns {Promise<Object>} Health status
   */
  healthCheck: async () => {
    try {
      const response = await apiClient.get("/auth/health");
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Health check failed" };
    }
  },
};

export default authAPI;

/**
 * USAGE EXAMPLES:
 *
 * // Register
 * try {
 *   const data = await authAPI.register({ name: 'John', email: 'john@example.com', password: 'Pass123!@#' });
 *   console.log('User registered:', data.data.user);
 * } catch (error) {
 *   console.error('Registration error:', error.message);
 * }
 *
 * // Login
 * try {
 *   const data = await authAPI.login({ email: 'john@example.com', password: 'Pass123!@#', rememberMe: true });
 *   console.log('Logged in:', data.data.user);
 * } catch (error) {
 *   console.error('Login error:', error.message);
 * }
 *
 * // Get current user
 * try {
 *   const data = await authAPI.getCurrentUser();
 *   console.log('Current user:', data.data.user);
 * } catch (error) {
 *   console.error('Error fetching user:', error.message);
 * }
 *
 * // Change password
 * try {
 *   await authAPI.changePassword({ oldPassword: 'old123', newPassword: 'new456' });
 *   console.log('Password changed successfully');
 * } catch (error) {
 *   console.error('Password change error:', error.message);
 * }
 */
