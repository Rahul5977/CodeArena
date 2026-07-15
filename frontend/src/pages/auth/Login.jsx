import { Link } from "react-router-dom";
import { Code2 } from "lucide-react";
export default function Login() {
  return (
    <div style={{ width: "100%", height: "100%", display: "grid", placeItems: "center", background: "var(--color-bg)", color: "var(--color-text)", fontFamily: "var(--font-body)" }}>
      <div style={{ width: "min(400px, 92vw)", background: "var(--color-surface)", borderRadius: 28, boxShadow: "var(--shadow-md)", padding: "32px 30px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
          <div style={{ width: 38, height: 38, borderRadius: 12, background: "var(--color-accent)", color: "var(--color-bg)", display: "flex", alignItems: "center", justifyContent: "center" }}><Code2 size={20} strokeWidth={2.75} /></div>
          <span style={{ fontFamily: "var(--font-heading)", fontSize: 20 }}>Sign in</span>
        </div>
        <div className="field" style={{ marginBottom: 12 }}><label>Email</label><input className="input" type="email" placeholder="you@example.com" /></div>
        <div className="field" style={{ marginBottom: 18 }}><label>Password</label><input className="input" type="password" placeholder="••••••••" /></div>
        <button className="btn btn-primary btn-block">Continue</button>
        <div style={{ display: "flex", gap: 10, margin: "14px 0" }}>
          <button className="btn btn-secondary" style={{ flex: 1 }}>GitHub</button>
          <button className="btn btn-secondary" style={{ flex: 1 }}>Google</button>
        </div>
        <p style={{ fontSize: 12, textAlign: "center", color: "color-mix(in srgb, var(--color-text) 55%, transparent)", margin: 0 }}>Auth wiring lands in Phase 4. <Link to="/app">Skip to app</Link></p>
      </div>
    </div>
  );
}
