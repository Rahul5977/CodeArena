import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../store/auth.js";
import { AuthShell } from "./Login.jsx";

export default function Register() {
  const navigate = useNavigate();
  const register = useAuth((s) => s.register);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await register(name.trim(), email.trim(), password);
      navigate("/app", { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthShell title="Create your account">
      <form onSubmit={submit}>
        <div className="field" style={{ marginBottom: 12 }}>
          <label>Name</label>
          <input className="input" required value={name} onChange={(e) => setName(e.target.value)} placeholder="Ada Lovelace" />
        </div>
        <div className="field" style={{ marginBottom: 12 }}>
          <label>Email</label>
          <input className="input" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
        </div>
        <div className="field" style={{ marginBottom: 8 }}>
          <label>Password</label>
          <input className="input" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
        </div>
        <div style={{ fontSize: 11, color: "color-mix(in srgb, var(--color-text) 50%, transparent)", marginBottom: 16 }}>
          At least 8 characters, with an uppercase, a lowercase, and a number.
        </div>
        {error && <div style={{ background: "var(--color-accent-100)", color: "var(--color-accent-800)", fontSize: 13, padding: "9px 12px", borderRadius: 12, marginBottom: 14 }}>{error}</div>}
        <button className="btn btn-primary btn-block" disabled={busy}>{busy ? "Creating…" : "Create account"}</button>
      </form>
      <p style={{ fontSize: 13, textAlign: "center", color: "color-mix(in srgb, var(--color-text) 55%, transparent)", marginTop: 16, marginBottom: 0 }}>
        Already have an account? <Link to="/login">Sign in</Link>
      </p>
    </AuthShell>
  );
}
