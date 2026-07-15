import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Github, Globe, Hammer } from "lucide-react";
import { api } from "../lib/api.js";
import Spinner from "../components/Spinner.jsx";

const muted = (p = 60) => `color-mix(in srgb, var(--color-text) ${p}%, transparent)`;
const surface = { background: "var(--color-surface)", borderRadius: 24, boxShadow: "var(--shadow-sm)" };
const DIFF = {
  EASY: { fg: "var(--color-accent-2-700)", bar: "var(--color-accent-2-500)", label: "Easy" },
  MEDIUM: { fg: "var(--color-accent-700)", bar: "var(--color-accent-500)", label: "Medium" },
  HARD: { fg: "var(--color-accent-900)", bar: "var(--color-accent-800)", label: "Hard" },
};

export default function Profile() {
  const { username } = useParams();
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    Promise.all([api.get("/auth/profile"), api.get("/dashboard")])
      .then(([p, d]) => {
        if (!active) return;
        setProfile(p.data?.data?.user || null);
        setStats(d.data?.stats || null);
      })
      .catch(() => active && setProfile(null))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  if (loading) return <Spinner label="Loading profile…" full />;

  // Viewing someone else's handle — public profiles are a community-phase feature.
  if (username && profile && username !== profile.username) {
    return (
      <div style={{ ...surface, maxWidth: 560, padding: "40px 44px" }}>
        <div style={{ width: 46, height: 46, borderRadius: 13, background: "var(--color-accent-100)", color: "var(--color-accent-700)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
          <Hammer size={22} strokeWidth={2.5} />
        </div>
        <h1 style={{ fontFamily: "var(--font-heading)", fontSize: 26, margin: "0 0 8px" }}>Public profiles are coming</h1>
        <p style={{ color: muted(66), margin: 0 }}>Viewing <strong>@{username}</strong> lands with the community layer. <Link to="/profile">Your profile →</Link></p>
      </div>
    );
  }

  const p = profile || {};
  const initials = (p.name || "?").split(" ").map((s) => s[0]).slice(0, 2).join("").toUpperCase();

  return (
    <div style={{ maxWidth: 880, display: "grid", gridTemplateColumns: "1fr 1.4fr", gap: 18 }}>
      {/* identity card */}
      <div style={{ ...surface, padding: "28px 26px", height: "fit-content" }}>
        <div style={{ width: 72, height: 72, borderRadius: "50%", background: "var(--color-accent-2-300)", color: "var(--color-accent-2-800)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-heading)", fontSize: 26, marginBottom: 14 }}>{initials}</div>
        <h1 style={{ fontFamily: "var(--font-heading)", fontSize: 24, margin: "0 0 2px" }}>{p.name}</h1>
        {p.username && <div style={{ color: muted(55), marginBottom: 10 }}>@{p.username}</div>}
        {p.bio && <p style={{ fontSize: 14, color: muted(75), margin: "0 0 12px" }}>{p.bio}</p>}
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {p.githubUrl && <a href={p.githubUrl} target="_blank" rel="noreferrer" style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "var(--color-accent-700)", textDecoration: "none" }}><Github size={15} /> GitHub</a>}
          {p.websiteUrl && <a href={p.websiteUrl} target="_blank" rel="noreferrer" style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "var(--color-accent-700)", textDecoration: "none" }}><Globe size={15} /> Website</a>}
        </div>
        <Link to="/settings" className="btn btn-secondary btn-block" style={{ textDecoration: "none", marginTop: 18 }}>Edit profile</Link>
      </div>

      {/* stats */}
      <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14 }}>
          <Stat label="Solved" value={stats?.solved ?? 0} />
          <Stat label="Submissions" value={stats?.submissions ?? 0} />
          <Stat label="Acceptance" value={`${stats?.acceptanceRate ?? 0}%`} />
        </div>
        <div style={{ ...surface, padding: "20px 22px" }}>
          <h3 style={{ fontFamily: "var(--font-heading)", fontSize: 17, margin: "0 0 14px" }}>Solved by difficulty</h3>
          {["EASY", "MEDIUM", "HARD"].map((k) => {
            const d = DIFF[k];
            const val = stats?.byDifficulty?.[k] ?? 0;
            const total = stats?.totalProblems || 1;
            return (
              <div key={k} style={{ marginBottom: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 5 }}>
                  <span style={{ color: d.fg, fontWeight: 600 }}>{d.label}</span>
                  <span style={{ color: muted(55) }}>{val} solved</span>
                </div>
                <div style={{ height: 8, borderRadius: 999, background: "var(--color-neutral-200)", overflow: "hidden" }}>
                  <div style={{ width: `${Math.min(100, (val / total) * 100)}%`, height: "100%", background: d.bar, borderRadius: 999 }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div style={{ ...surface, padding: "16px 18px" }}>
      <div style={{ fontSize: 12, color: muted(60), marginBottom: 6 }}>{label}</div>
      <div style={{ fontFamily: "var(--font-heading)", fontSize: 26, lineHeight: 1 }}>{value}</div>
    </div>
  );
}
