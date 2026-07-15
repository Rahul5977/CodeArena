import { useState } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { api } from "../../lib/api.js";
import { AuthShell } from "./Login.jsx";

export default function ResetPassword() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const token = params.get("token");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await api.post("/auth/reset-password", { token, newPassword: password });
      navigate("/login?reset=1", { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || "Could not reset password — the link may have expired.");
    } finally {
      setBusy(false);
    }
  };

  if (!token) {
    return (
      <AuthShell title="Reset password">
        <p style={{ fontSize: 14, color: "color-mix(in srgb, var(--color-text) 65%, transparent)" }}>
          This reset link is missing its token. <Link to="/forgot-password">Request a new one</Link>.
        </p>
      </AuthShell>
    );
  }

  return (
    <AuthShell title="Set a new password">
      <form onSubmit={submit}>
        <div className="field" style={{ marginBottom: 8 }}>
          <label>New password</label>
          <input className="input" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
        </div>
        <div style={{ fontSize: 11, color: "color-mix(in srgb, var(--color-text) 50%, transparent)", marginBottom: 16 }}>
          At least 8 characters, with an uppercase, a lowercase, and a number.
        </div>
        {error && <div style={{ background: "var(--color-accent-100)", color: "var(--color-accent-800)", fontSize: 13, padding: "9px 12px", borderRadius: 12, marginBottom: 14 }}>{error}</div>}
        <button className="btn btn-primary btn-block" disabled={busy}>{busy ? "Resetting…" : "Reset password"}</button>
      </form>
    </AuthShell>
  );
}
