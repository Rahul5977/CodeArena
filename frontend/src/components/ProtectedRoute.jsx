import { Navigate, useLocation } from "react-router-dom";
import useAuthStore from "../stores/authStore";
import LoadingSpinner from "./LoadingSpinner";

/**
 * ProtectedRoute component - Guards routes that require authentication
 * Supports role-based access control (RBAC)
 */
const ProtectedRoute = ({ children, allowedRoles = [], redirectTo = "/login" }) => {
  const { isAuthenticated, user, isLoading } = useAuthStore();
  const location = useLocation();

  // Show loading spinner while checking authentication
  if (isLoading) {
    return <LoadingSpinner />;
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated || !user) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // Check role-based access if roles are specified
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
        <div className="bg-white/5 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/10 p-8 max-w-md w-full text-center">
          <h2 className="text-3xl font-bold text-red-400 mb-4">Access Denied</h2>
          <p className="text-gray-300 mb-6">You don't have permission to access this page.</p>
          <Navigate to="/" replace />
        </div>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;
