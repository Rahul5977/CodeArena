import { Routes, Route, Navigate } from "react-router-dom";
import { useEffect } from "react";
import useAuthStore from "./stores/authStore";
import Layout from "./components/Layout";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Problems from "./pages/problems/Problems";
import ProblemDetails from "./pages/problems/ProblemDetails";
import Playlists from "./pages/playlists/Playlists";
import PlaylistDetail from "./pages/playlists/PlaylistDetail";
import Submissions from "./pages/submissions/Submissions";
import Profile from "./pages/Profile";
import LoadingSpinner from "./components/LoadingSpinner";
import ProtectedRoute from "./components/ProtectedRoute";

// Contest Pages
import ContestList from "./pages/contests/ContestList";
import ContestDetail from "./pages/contests/ContestDetail";
import ContestLeaderboard from "./pages/contests/ContestLeaderboard";
import ContestSubmit from "./pages/contests/ContestSubmit";

// Sheets Pages
import SheetList from "./pages/sheets/SheetList";
import SheetDetail from "./pages/sheets/SheetDetail";

// Admin Pages
import UserManagement from "./pages/admin/UserManagement";
import AdminDashboard from "./pages/admin/AdminDashboard";
import ContestManagement from "./pages/admin/ContestManagement";
import SheetManagement from "./pages/admin/SheetManagement";

function App() {
  const { isLoading, fetchCurrentUser } = useAuthStore();

  // Check authentication on app load
  useEffect(() => {
    fetchCurrentUser();
  }, [fetchCurrentUser]);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-dark-bg-primary dark:bg-dark-bg-primary text-dark-text-primary dark:text-dark-text-primary transition-colors duration-200">
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />

        {/* Protected Routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
        </Route>

        {/* Problems */}
        <Route
          path="/problems"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Problems />} />
          <Route path=":id" element={<ProblemDetails />} />
        </Route>

        {/* Playlists */}
        <Route
          path="/playlists"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Playlists />} />
          <Route path=":id" element={<PlaylistDetail />} />
        </Route>

        {/* Submissions */}
        <Route
          path="/submissions"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Submissions />} />
        </Route>

        {/* Profile */}
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />

        {/* Contests */}
        <Route
          path="/contests"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<ContestList />} />
          <Route path=":id" element={<ContestDetail />} />
          <Route path=":id/leaderboard" element={<ContestLeaderboard />} />
          <Route path=":contestId/problems/:problemId/submit" element={<ContestSubmit />} />
        </Route>

        {/* Sheets */}
        <Route
          path="/sheets"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<SheetList />} />
          <Route path=":id" element={<SheetDetail />} />
        </Route>

        {/* Admin Routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={["ADMIN", "SUPERADMIN"]}>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="users" element={<UserManagement />} />
          <Route path="contests" element={<ContestManagement />} />
          <Route path="sheets" element={<SheetManagement />} />
        </Route>

        {/* Redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

export default App;
