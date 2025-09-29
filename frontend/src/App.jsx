import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./contexts/AuthContext";
import Layout from "./components/Layout";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
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
  const { loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-base-200" data-theme="leetlab">
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected Routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="problems" element={<Problems />} />
          <Route path="problems/:id" element={<ProblemDetails />} />
          <Route path="playlists" element={<Playlists />} />
          <Route path="playlists/:id" element={<PlaylistDetail />} />
          <Route path="submissions" element={<Submissions />} />
          <Route path="profile" element={<Profile />} />

          {/* Contest Routes */}
          <Route path="contests" element={<ContestList />} />
          <Route path="contests/:id" element={<ContestDetail />} />
          <Route path="contests/:id/leaderboard" element={<ContestLeaderboard />} />
          <Route
            path="contests/:contestId/problems/:problemId/submit"
            element={<ContestSubmit />}
          />

          {/* Sheets Routes */}
          <Route path="sheets" element={<SheetList />} />
          <Route path="sheets/:id" element={<SheetDetail />} />

          {/* Admin Routes */}
          <Route
            path="admin"
            element={
              <ProtectedRoute roles={["ADMIN", "SUPERADMIN"]}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="admin/users"
            element={
              <ProtectedRoute roles={["ADMIN", "SUPERADMIN"]}>
                <UserManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="admin/contests"
            element={
              <ProtectedRoute roles={["ADMIN", "SUPERADMIN"]}>
                <ContestManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="admin/sheets"
            element={
              <ProtectedRoute roles={["ADMIN", "SUPERADMIN"]}>
                <SheetManagement />
              </ProtectedRoute>
            }
          />
        </Route>

        {/* Redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

export default App;
