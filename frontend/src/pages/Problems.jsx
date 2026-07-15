import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Search, CheckCircle2 } from "lucide-react";
import { api } from "../lib/api.js";
import Spinner from "../components/Spinner.jsx";

const DIFF = {
  EASY: { bg: "var(--color-accent-2-100)", fg: "var(--color-accent-2-800)", label: "Easy" },
  MEDIUM: { bg: "var(--color-accent-100)", fg: "var(--color-accent-800)", label: "Medium" },
  HARD: { bg: "var(--color-accent-200)", fg: "var(--color-accent-900)", label: "Hard" },
};
const muted = (p = 60) => `color-mix(in srgb, var(--color-text) ${p}%, transparent)`;

function Pill({ difficulty }) {
  const d = DIFF[difficulty] || DIFF.MEDIUM;
  return <span style={{ fontSize: 11, padding: "3px 11px", borderRadius: 999, background: d.bg, color: d.fg, fontWeight: 600 }}>{d.label}</span>;
}

export default function Problems() {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [q, setQ] = useState("");
  const [diff, setDiff] = useState("");

  useEffect(() => {
    let active = true;
    api
      .get("/problems/get-all-problems", { params: { limit: 100 } })
      .then(({ data }) => active && setProblems(data.problems || []))
      .catch((e) => active && setError(e.response?.data?.error || "Failed to load problems"))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  const filtered = useMemo(
    () =>
      problems.filter(
        (p) => (!diff || p.difficulty === diff) && (!q || p.title.toLowerCase().includes(q.toLowerCase()))
      ),
    [problems, q, diff]
  );

  if (loading) return <Spinner label="Loading problems…" full />;

  return (
    <div style={{ maxWidth: 1080 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18, flexWrap: "wrap" }}>
        <div style={{ position: "relative", flex: 1, minWidth: 220, maxWidth: 360 }}>
          <Search size={16} strokeWidth={2.5} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: muted(50) }} />
          <input className="input" placeholder="Search problems…" value={q} onChange={(e) => setQ(e.target.value)} style={{ paddingLeft: 40, background: "var(--color-surface)" }} />
        </div>
        <div className="seg" style={{ background: "var(--color-surface)" }}>
          {[["", "All"], ["EASY", "Easy"], ["MEDIUM", "Medium"], ["HARD", "Hard"]].map(([v, label]) => (
            <label key={label} className="seg-opt">
              <input type="radio" name="diff" checked={diff === v} onChange={() => setDiff(v)} />
              <span>{label}</span>
            </label>
          ))}
        </div>
        <span style={{ marginLeft: "auto", fontSize: 13, color: muted(55) }}>{filtered.length} problems</span>
      </div>

      {error && <div style={{ background: "var(--color-accent-100)", color: "var(--color-accent-800)", padding: "10px 14px", borderRadius: 14, marginBottom: 14 }}>{error}</div>}

      <div style={{ background: "var(--color-surface)", borderRadius: 22, boxShadow: "var(--shadow-sm)", overflow: "hidden" }}>
        <table className="table">
          <thead>
            <tr>
              <th style={{ width: 40 }} />
              <th>Title</th>
              <th>Difficulty</th>
              <th>Tags</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => (
              <tr key={p.id}>
                <td style={{ color: muted(40) }}>
                  {p.solved ? <CheckCircle2 size={17} strokeWidth={2.5} color="var(--color-accent-2-600)" /> : null}
                </td>
                <td style={{ fontWeight: 600 }}>
                  <Link to={`/problems/${p.slug}`} style={{ color: "inherit", textDecoration: "none" }}>{p.title}</Link>
                </td>
                <td><Pill difficulty={p.difficulty} /></td>
                <td style={{ color: muted(62) }}>{(p.tags || []).join(" · ")}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div style={{ padding: 32, textAlign: "center", color: muted(55) }}>No problems match your filters.</div>
        )}
      </div>
    </div>
  );
}
