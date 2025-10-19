import apiClient from "../lib/apiClient";

/**
 * Problem API Service
 * All problem-related API calls with proper error handling
 */

const problemAPI = {
  /**
   * Get all problems with optional filters
   * @param {Object} params - Query parameters (difficulty, tags, search, etc.)
   * @returns {Promise<Object>} Problems list
   */
  getProblems: async (params = {}) => {
    try {
      const response = await apiClient.get("/problems/get-all-problems", { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Failed to fetch problems" };
    }
  },

  /**
   * Get problem by ID
   * @param {string} id - Problem ID
   * @returns {Promise<Object>} Problem details
   */
  getProblemById: async (id) => {
    try {
      const response = await apiClient.get(`/problems/get-all-problems/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Failed to fetch problem details" };
    }
  },

  /**
   * Execute code against test cases
   * @param {Object} data - { problemId, code, language, customInput }
   * @returns {Promise<Object>} Execution results
   */
  runCode: async (data) => {
    try {
      const response = await apiClient.post("/execute-code", data);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Failed to run code" };
    }
  },

  /**
   * Submit code for problem
   * @param {Object} data - { problemId, code, language }
   * @returns {Promise<Object>} Submission results
   */
  submitCode: async (data) => {
    try {
      const response = await apiClient.post("/submission/submit", data);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Failed to submit code" };
    }
  },

  /**
   * Get user's submissions for a problem
   * @param {string} problemId - Problem ID
   * @returns {Promise<Object>} Submissions list
   */
  getProblemSubmissions: async (problemId) => {
    try {
      const response = await apiClient.get(`/submission/get-submission/${problemId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Failed to fetch submissions" };
    }
  },
};

export default problemAPI;
