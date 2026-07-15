import { Github } from "lucide-react";

// Full-page navigations (OAuth needs a top-level redirect, not fetch). The API
// base is same-origin via the Vite proxy (dev) / Caddy (prod).
function GoogleG() {
  return (
    <svg width="16" height="16" viewBox="0 0 48 48" aria-hidden>
      <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9 3.6l6.7-6.7C35.6 2.4 30.1 0 24 0 14.6 0 6.4 5.4 2.5 13.3l7.9 6.1C12.3 13.2 17.6 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.1 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.4c-.5 2.9-2.1 5.3-4.6 6.9l7.1 5.5c4.1-3.8 6.5-9.4 6.5-16.9z" />
      <path fill="#FBBC05" d="M10.4 28.6c-.5-1.4-.7-2.9-.7-4.6s.3-3.2.7-4.6l-7.9-6.1C.9 16.5 0 20.1 0 24s.9 7.5 2.5 10.7l7.9-6.1z" />
      <path fill="#34A853" d="M24 48c6.1 0 11.3-2 15-5.5l-7.1-5.5c-2 1.3-4.6 2.1-7.9 2.1-6.4 0-11.7-3.7-13.6-9l-7.9 6.1C6.4 42.6 14.6 48 24 48z" />
    </svg>
  );
}

export default function OAuthButtons() {
  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "16px 0" }}>
        <div style={{ flex: 1, height: 1, background: "var(--color-divider)" }} />
        <span style={{ fontSize: 12, color: "color-mix(in srgb, var(--color-text) 50%, transparent)" }}>or continue with</span>
        <div style={{ flex: 1, height: 1, background: "var(--color-divider)" }} />
      </div>
      <div style={{ display: "flex", gap: 10 }}>
        <a href="/api/v1/auth/oauth/github" className="btn btn-secondary" style={{ flex: 1, textDecoration: "none", gap: 7 }}>
          <Github size={16} strokeWidth={2.5} /> GitHub
        </a>
        <a href="/api/v1/auth/oauth/google" className="btn btn-secondary" style={{ flex: 1, textDecoration: "none", gap: 7 }}>
          <GoogleG /> Google
        </a>
      </div>
    </div>
  );
}
