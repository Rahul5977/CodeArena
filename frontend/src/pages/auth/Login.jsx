import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Code2 } from "lucide-react";
import { useAuth } from "../../store/auth.js";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const login = useAuth((s) => s.login);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const dest = location.state?.from || "/app";

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await login(email.trim(), password);
      navigate(dest, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthShell title="Welcome back">
      <form onSubmit={submit}>
        <div className="field" style={{ marginBottom: 12 }}>
          <label>Email</label>
          <input className="input" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
        </div>
        <div className="field" style={{ marginBottom: 16 }}>
          <label>Password</label>
          <input className="input" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
        </div>
        {error && <div style={errorStyle}>{error}</div>}
        <button className="btn btn-primary btn-block" disabled={busy}>{busy ? "Signing in…" : "Continue"}</button>
      </form>
      <p style={footStyle}>
        New here? <Link to="/register">Create an account</Link>
      </p>
    </AuthShell>
  );
}

export function AuthShell({ title, children }) {
  return (
    <div style={{ width: "100%", height: "100%", display: "grid", placeItems: "center", background: "var(--color-bg)", color: "var(--color-text)", fontFamily: "var(--font-body)", padding: 20 }}>
      <div style={{ width: "min(400px, 92vw)", background: "var(--color-surface)", borderRadius: 28, boxShadow: "var(--shadow-md)", padding: "32px 30px" }}>
        <Link to="/" style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20, textDecoration: "none", color: "var(--color-text)" }}>
          <div style={{ width: 38, height: 38, borderRadius: 12, background: "var(--color-accent)", color: "var(--color-bg)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Code2 size={20} strokeWidth={2.75} />
          </div>
          <span style={{ fontFamily: "var(--font-heading)", fontSize: 20 }}>{title}</span>
        </Link>
        {children}
      </div>
    </div>
  );
}

const errorStyle = { background: "var(--color-accent-100)", color: "var(--color-accent-800)", fontSize: 13, padding: "9px 12px", borderRadius: 12, marginBottom: 14 };
const footStyle = { fontSize: 13, textAlign: "center", color: "color-mix(in srgb, var(--color-text) 55%, transparent)", marginTop: 16, marginBottom: 0 };
