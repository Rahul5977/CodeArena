import { useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../../lib/api.js";
import { AuthShell } from "./Login.jsx";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await api.post("/auth/forgot-password", { email: email.trim() });
    } catch {
      /* response is intentionally identical whether or not the account exists */
    }
    setSent(true);
    setBusy(false);
  };

  return (
    <AuthShell title="Reset password">
      {sent ? (
        <p style={{ fontSize: 14, color: "color-mix(in srgb, var(--color-text) 70%, transparent)" }}>
          If an account exists for <strong>{email}</strong>, a reset link is on its way. Check your inbox.
        </p>
      ) : (
        <form onSubmit={submit}>
          <p style={{ fontSize: 13.5, color: "color-mix(in srgb, var(--color-text) 65%, transparent)", margin: "0 0 16px" }}>
            Enter your email and we'll send you a link to reset your password.
          </p>
          <div className="field" style={{ marginBottom: 16 }}>
            <label>Email</label>
            <input className="input" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
          </div>
          <button className="btn btn-primary btn-block" disabled={busy}>{busy ? "Sending…" : "Send reset link"}</button>
        </form>
      )}
      <p style={{ fontSize: 13, textAlign: "center", color: "color-mix(in srgb, var(--color-text) 55%, transparent)", marginTop: 16, marginBottom: 0 }}>
        <Link to="/login">Back to sign in</Link>
      </p>
    </AuthShell>
  );
}
