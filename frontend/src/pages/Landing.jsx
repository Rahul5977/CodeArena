import { Link } from "react-router-dom";
import { Code2, ArrowRight } from "lucide-react";
export default function Landing() {
  return (
    <div style={{ width: "100%", height: "100%", overflowY: "auto", background: "var(--color-bg)", color: "var(--color-text)", fontFamily: "var(--font-body)" }}>
      <div style={{ maxWidth: 720, margin: "0 auto", padding: "96px 32px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
          <div style={{ width: 44, height: 44, borderRadius: 13, background: "var(--color-accent)", color: "var(--color-bg)", display: "flex", alignItems: "center", justifyContent: "center" }}><Code2 size={24} strokeWidth={2.75} /></div>
          <span style={{ fontFamily: "var(--font-heading)", fontSize: 26 }}>CodeArena</span>
        </div>
        <h1 style={{ fontFamily: "var(--font-heading)", fontSize: 48, lineHeight: 1.04, margin: "0 0 14px" }}>Practice DSA. Free, forever.</h1>
        <p style={{ fontSize: 17, color: "color-mix(in srgb, var(--color-text) 66%, transparent)", maxWidth: 540, margin: "0 0 28px" }}>A warm, focused place to grind problems, follow curated sheets, and compete — built for the community. (Landing.dc.html — Phase 5.)</p>
        <div style={{ display: "flex", gap: 12 }}>
          <Link to="/app" className="btn btn-primary" style={{ textDecoration: "none", padding: "12px 22px", fontSize: 15 }}>Enter the app <ArrowRight size={16} strokeWidth={2.75} /></Link>
          <Link to="/login" className="btn btn-secondary" style={{ textDecoration: "none", padding: "12px 22px", fontSize: 15 }}>Sign in</Link>
        </div>
      </div>
    </div>
  );
}
