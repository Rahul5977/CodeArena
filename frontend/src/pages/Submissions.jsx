import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Check, X } from "lucide-react";
import { api } from "../lib/api.js";
import Spinner from "../components/Spinner.jsx";

const DIFF = {
  EASY: { bg: "var(--color-accent-2-100)", fg: "var(--color-accent-2-800)", label: "Easy" },
  MEDIUM: { bg: "var(--color-accent-100)", fg: "var(--color-accent-800)", label: "Medium" },
  HARD: { bg: "var(--color-accent-200)", fg: "var(--color-accent-900)", label: "Hard" },
};
const muted = (p = 60) => `color-mix(in srgb, var(--color-text) ${p}%, transparent)`;
const timeAgo = (iso) => {
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
};

export default function Submissions() {
  const [subs, setSubs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    api
      .get("/submission/get-all-submissions")
      .then(({ data }) => active && setSubs(data.submissions || []))
      .catch(() => active && setSubs([]))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  if (loading) return <Spinner label="Loading submissions…" full />;

  return (
    <div style={{ maxWidth: 960 }}>
      {subs.length === 0 ? (
        <div style={{ background: "var(--color-surface)", borderRadius: 22, boxShadow: "var(--shadow-sm)", padding: "40px 44px", textAlign: "center", color: muted(60) }}>
          No submissions yet. <Link to="/problems" style={{ color: "var(--color-accent-700)", fontWeight: 600 }}>Solve a problem →</Link>
        </div>
      ) : (
        <div style={{ background: "var(--color-surface)", borderRadius: 22, boxShadow: "var(--shadow-sm)", overflow: "hidden" }}>
          <table className="table">
            <thead>
              <tr>
                <th style={{ width: 36 }} />
                <th>Problem</th>
                <th>Difficulty</th>
                <th>Language</th>
                <th>Status</th>
                <th style={{ textAlign: "right" }}>When</th>
              </tr>
            </thead>
            <tbody>
              {subs.map((s) => {
                const ok = s.status === "Accepted";
                const d = DIFF[s.problem?.difficulty] || DIFF.MEDIUM;
                return (
                  <tr key={s.id}>
                    <td>
                      <span style={{ width: 22, height: 22, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", background: ok ? "var(--color-accent-2-200)" : "var(--color-neutral-300)", color: ok ? "var(--color-accent-2-800)" : "var(--color-neutral-800)" }}>
                        {ok ? <Check size={13} strokeWidth={3} /> : <X size={12} strokeWidth={3} />}
                      </span>
                    </td>
                    <td style={{ fontWeight: 600 }}>
                      {s.problem?.slug ? <Link to={`/problems/${s.problem.slug}`} style={{ color: "inherit", textDecoration: "none" }}>{s.problem.title}</Link> : s.problem?.title || "—"}
                    </td>
                    <td><span style={{ fontSize: 11, padding: "2px 9px", borderRadius: 999, background: d.bg, color: d.fg, fontWeight: 600 }}>{d.label}</span></td>
                    <td style={{ color: muted(62) }}>{s.language}</td>
                    <td style={{ color: ok ? "var(--color-accent-2-700)" : "var(--color-accent-800)", fontWeight: 600, fontSize: 13 }}>{s.status}</td>
                    <td style={{ textAlign: "right", color: muted(50) }}>{timeAgo(s.createdAt)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
