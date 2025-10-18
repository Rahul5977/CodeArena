import { create } from "zustand";
import { persist } from "zustand/middleware";
import authAPI from "../services/authService";

/**
 * Zustand store for authentication state management
 * Persisted to localStorage for persistence across page refreshes
 */
const useAuthStore = create(
  persist(
    (set, get) => ({
      // State
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // Actions
      /**
       * Set user data and authentication status
       */
      setUser: (user) =>
        set({
          user,
          isAuthenticated: !!user,
          error: null,
        }),

      /**
       * Set loading state
       */
      setLoading: (isLoading) => set({ isLoading }),

      /**
       * Set error message
       */
      setError: (error) => set({ error }),

      /**
       * Clear error message
       */
      clearError: () => set({ error: null }),

      /**
       * Register a new user
       */
      register: async (userData) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authAPI.register(userData);
          const user = response.data?.user;

          set({
            user,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });

          return response;
        } catch (error) {
          const errorMessage = error.message || "Registration failed";
          set({
            error: errorMessage,
            isLoading: false,
            isAuthenticated: false,
            user: null,
          });
          throw error;
        }
      },

      /**
       * Login user
       */
      login: async (credentials) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authAPI.login(credentials);
          const user = response.data?.user;

          set({
            user,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });

          return response;
        } catch (error) {
          const errorMessage = error.message || "Login failed";
          set({
            error: errorMessage,
            isLoading: false,
            isAuthenticated: false,
            user: null,
          });
          throw error;
        }
      },

      /**
       * Logout user
       */
      logout: async () => {
        set({ isLoading: true });
        try {
          await authAPI.logout();
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          });
        } catch (error) {
          // Even if logout fails on backend, clear local state
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          });
          throw error;
        }
      },

      /**
       * Logout from all devices
       */
      logoutAll: async () => {
        set({ isLoading: true });
        try {
          await authAPI.logoutAll();
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          });
        } catch (error) {
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          });
          throw error;
        }
      },

      /**
       * Fetch current user from backend (using cookies)
       * Call this on app initialization to restore auth state
       */
      fetchCurrentUser: async () => {
        set({ isLoading: true });
        try {
          const response = await authAPI.getCurrentUser();
          const user = response.data?.user;

          if (user) {
            set({
              user,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            });
          } else {
            set({
              user: null,
              isAuthenticated: false,
              isLoading: false,
              error: null,
            });
          }

          return user;
        } catch (error) {
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          });
          return null;
        }
      },

      /**
       * Update user profile
       */
      updateProfile: async (profileData) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authAPI.updateProfile(profileData);
          const updatedUser = response.data?.user;

          set({
            user: updatedUser,
            isLoading: false,
            error: null,
          });

          return response;
        } catch (error) {
          const errorMessage = error.message || "Failed to update profile";
          set({ error: errorMessage, isLoading: false });
          throw error;
        }
      },

      /**
       * Change password
       */
      changePassword: async (passwordData) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authAPI.changePassword(passwordData);
          set({ isLoading: false, error: null });
          return response;
        } catch (error) {
          const errorMessage = error.message || "Failed to change password";
          set({ error: errorMessage, isLoading: false });
          throw error;
        }
      },

      /**
       * Request password reset
       */
      forgotPassword: async (email) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authAPI.forgotPassword(email);
          set({ isLoading: false, error: null });
          return response;
        } catch (error) {
          const errorMessage = error.message || "Failed to send reset email";
          set({ error: errorMessage, isLoading: false });
          throw error;
        }
      },

      /**
       * Reset password with token
       */
      resetPassword: async (resetData) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authAPI.resetPassword(resetData);
          set({ isLoading: false, error: null });
          return response;
        } catch (error) {
          const errorMessage = error.message || "Failed to reset password";
          set({ error: errorMessage, isLoading: false });
          throw error;
        }
      },

      /**
       * Check if user has specific role
       */
      hasRole: (role) => {
        const { user } = get();
        return user?.role === role;
      },

      /**
       * Check if user has any of the specified roles
       */
      hasAnyRole: (roles) => {
        const { user } = get();
        return roles.includes(user?.role);
      },

      /**
       * Check if user is admin or superadmin
       */
      isAdmin: () => {
        const { user } = get();
        return user?.role === "ADMIN" || user?.role === "SUPERADMIN";
      },

      /**
       * Check if user is superadmin
       */
      isSuperAdmin: () => {
        const { user } = get();
        return user?.role === "SUPERADMIN";
      },
    }),
    {
      name: "leetlab-auth-storage",
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

export default useAuthStore;

/**
 * USAGE EXAMPLES:
 *
 * // In a component:
 * import useAuthStore from './stores/authStore';
 *
 * function MyComponent() {
 *   const { user, isAuthenticated, login, logout } = useAuthStore();
 *
 *   const handleLogin = async () => {
 *     try {
 *       await login({ email: 'test@example.com', password: 'password' });
 *       console.log('Logged in!');
 *     } catch (error) {
 *       console.error('Login failed:', error);
 *     }
 *   };
 *
 *   return (
 *     <div>
 *       {isAuthenticated ? (
 *         <>
 *           <p>Welcome {user.name}!</p>
 *           <button onClick={logout}>Logout</button>
 *         </>
 *       ) : (
 *         <button onClick={handleLogin}>Login</button>
 *       )}
 *     </div>
 *   );
 * }
 *
 * // Initialize auth on app load:
 * useEffect(() => {
 *   const initAuth = async () => {
 *     await fetchCurrentUser();
 *   };
 *   initAuth();
 * }, []);
 */
