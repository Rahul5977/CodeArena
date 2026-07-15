import { Link } from "react-router-dom";
import { Hammer } from "lucide-react";

// Temporary page scaffold, styled in the Organic system. Each real page replaces
// this as its phase lands (see progress.md). `design` names the source .dc.html.
export default function Placeholder({ title, design, phase, children }) {
  return (
    <div style={{ maxWidth: 1120 }}>
      <div style={{ background: "var(--color-surface)", borderRadius: 24, boxShadow: "var(--shadow-sm)", padding: "40px 44px", maxWidth: 720 }}>
        <div style={{ width: 46, height: 46, borderRadius: 13, background: "var(--color-accent-100)", color: "var(--color-accent-700)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 18 }}>
          <Hammer size={22} strokeWidth={2.5} />
        </div>
        <h1 style={{ fontFamily: "var(--font-heading)", fontSize: 30, margin: "0 0 8px" }}>{title}</h1>
        <p style={{ margin: "0 0 6px", fontSize: 15, color: "color-mix(in srgb, var(--color-text) 66%, transparent)" }}>
          {children || "This page is scaffolded and ready to build out."}
        </p>
        <div style={{ display: "flex", gap: 8, marginTop: 16, flexWrap: "wrap" }}>
          {design && <span className="tag tag-neutral">design · {design}</span>}
          {phase && <span className="tag tag-accent-2">{phase}</span>}
        </div>
        <Link to="/app" className="btn btn-secondary" style={{ textDecoration: "none", marginTop: 22 }}>Back to dashboard</Link>
      </div>
    </div>
  );
}
