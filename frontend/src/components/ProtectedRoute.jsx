import { Navigate } from "react-router-dom";
import { useAuth } from "../store/auth.js";
import Spinner from "./Spinner.jsx";

// Gates the in-app routes. While the session is being restored we show a
// spinner; anonymous users are sent to /login; admins-only routes can pass
// `adminOnly`.
export default function ProtectedRoute({ children, adminOnly = false }) {
  const { status, user } = useAuth();

  if (status === "loading") {
    return (
      <div style={{ width: "100%", height: "100%", display: "grid", placeItems: "center" }}>
        <Spinner label="Restoring your session…" />
      </div>
    );
  }
  if (status !== "authenticated") return <Navigate to="/login" replace />;
  if (adminOnly && !user?.isAdmin) return <Navigate to="/app" replace />;
  return children;
}
