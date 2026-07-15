import { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./store/auth.js";
import AppShell from "./components/AppShell.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import Landing from "./pages/Landing.jsx";
import Login from "./pages/auth/Login.jsx";
import Register from "./pages/auth/Register.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Problems from "./pages/Problems.jsx";
import ProblemEditor from "./pages/ProblemEditor.jsx";
import Sheets from "./pages/Sheets.jsx";
import Playlists from "./pages/Playlists.jsx";
import Contests from "./pages/Contests.jsx";
import Leaderboard from "./pages/Leaderboard.jsx";
import Submissions from "./pages/Submissions.jsx";
import Profile from "./pages/Profile.jsx";
import Settings from "./pages/Settings.jsx";
import Support from "./pages/Support.jsx";
import Admin from "./pages/Admin.jsx";

export default function App() {
  const hydrate = useAuth((s) => s.hydrate);
  useEffect(() => {
    hydrate();
  }, [hydrate]);

  return (
    <Routes>
      {/* Public, shell-less */}
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* In-app — requires a session; rendered inside the AppShell */}
      <Route
        element={
          <ProtectedRoute>
            <AppShell />
          </ProtectedRoute>
        }
      >
        <Route path="/app" element={<Dashboard />} />
        <Route path="/problems" element={<Problems />} />
        <Route path="/problems/:slug" element={<ProblemEditor />} />
        <Route path="/sheets" element={<Sheets />} />
        <Route path="/sheets/:id" element={<Sheets />} />
        <Route path="/playlists" element={<Playlists />} />
        <Route path="/contests" element={<Contests />} />
        <Route path="/contests/:id" element={<Contests />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="/submissions" element={<Submissions />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/u/:username" element={<Profile />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/support" element={<Support />} />
        <Route
          path="/admin"
          element={
            <ProtectedRoute adminOnly>
              <Admin />
            </ProtectedRoute>
          }
        />
      </Route>

      <Route path="*" element={<Navigate to="/app" replace />} />
    </Routes>
  );
}
