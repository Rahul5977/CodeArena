import { create } from "zustand";
import apiClient from "../utils/api";

const useSheetStore = create((set, get) => ({
  sheets: [],
  mySheets: [],
  currentSheet: null,
  loading: false,
  error: null,
  filters: {
    topic: "",
    difficulty: "",
    type: "",
  },

  // Fetch all sheets with filters
  fetchSheets: async (filters = {}) => {
    set({ loading: true, error: null });
    try {
      const params = new URLSearchParams();
      if (filters.topic) params.append("topic", filters.topic);
      if (filters.difficulty) params.append("difficulty", filters.difficulty);
      if (filters.type) params.append("type", filters.type);

      const response = await apiClient.get(`/sheets?${params.toString()}`);
      if (response.data.success) {
        set({ sheets: response.data.sheets, loading: false });
      }
    } catch (error) {
      set({
        error: error.response?.data?.message || "Failed to fetch sheets",
        loading: false,
      });
    }
  },

  // Fetch sheet by ID
  fetchSheetById: async (sheetId) => {
    set({ loading: true, error: null });
    try {
      const response = await apiClient.get(`/sheets/${sheetId}`);
      if (response.data.success) {
        set({ currentSheet: response.data.sheet, loading: false });
        return response.data.sheet;
      }
    } catch (error) {
      set({
        error: error.response?.data?.message || "Failed to fetch sheet",
        loading: false,
      });
      return null;
    }
  },

  // Fetch user's purchased sheets
  fetchMySheets: async () => {
    set({ loading: true, error: null });
    try {
      const response = await apiClient.get("/sheets/my-sheets");
      if (response.data.success) {
        set({ mySheets: response.data.sheets, loading: false });
      }
    } catch (error) {
      set({
        error: error.response?.data?.message || "Failed to fetch my sheets",
        loading: false,
      });
    }
  },

  // Create payment order
  createPaymentOrder: async (sheetId) => {
    try {
      const response = await apiClient.post("/sheets/create-order", { sheetId });
      if (response.data.success) {
        return response.data;
      }
    } catch (error) {
      throw new Error(error.response?.data?.message || "Failed to create payment order");
    }
  },

  // Verify payment
  verifyPayment: async (paymentData) => {
    try {
      const response = await apiClient.post("/sheets/verify-payment", paymentData);
      if (response.data.success) {
        // Refresh the current sheet to update access
        if (get().currentSheet?.id === paymentData.sheetId) {
          await get().fetchSheetById(paymentData.sheetId);
        }
        // Refresh my sheets
        await get().fetchMySheets();
        return true;
      }
      return false;
    } catch (error) {
      throw new Error(error.response?.data?.message || "Failed to verify payment");
    }
  },

  // Toggle problem completion
  toggleProblemCompletion: async (sheetId, problemId) => {
    try {
      const response = await apiClient.post(`/sheets/${sheetId}/problems/${problemId}/complete`);
      if (response.data.success) {
        // Refresh the current sheet to update progress
        await get().fetchSheetById(sheetId);
        return true;
      }
      return false;
    } catch (error) {
      throw new Error(error.response?.data?.message || "Failed to update progress");
    }
  },

  // Update filters
  setFilters: (filters) => {
    set({ filters });
  },

  // Clear error
  clearError: () => set({ error: null }),

  // Reset store
  reset: () =>
    set({
      sheets: [],
      mySheets: [],
      currentSheet: null,
      loading: false,
      error: null,
      filters: { topic: "", difficulty: "", type: "" },
    }),
}));

export default useSheetStore;
