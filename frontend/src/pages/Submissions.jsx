import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Check, X, Search, ExternalLink } from "lucide-react";
import { api } from "../lib/api.js";
import Spinner from "../components/Spinner.jsx";

const DIFF = {
  EASY: { bg: "var(--color-accent-2-100)", fg: "var(--color-accent-2-800)", label: "Easy" },
  MEDIUM: { bg: "var(--color-accent-100)", fg: "var(--color-accent-800)", label: "Medium" },
  HARD: { bg: "var(--color-accent-200)", fg: "var(--color-accent-900)", label: "Hard" },
};
const muted = (p = 60) => `color-mix(in srgb, var(--color-text) ${p}%, transparent)`;
const surface = { background: "var(--color-surface)", borderRadius: 22, boxShadow: "var(--shadow-sm)" };
const timeAgo = (iso) => {
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
};
const repStat = (json, kind) => {
  try {
    const nums = (JSON.parse(json) || []).map((v) => parseFloat(String(v))).filter((n) => !Number.isNaN(n));
    if (!nums.length) return null;
    const m = Math.max(...nums);
    return kind === "time" ? `${m} s` : `${Math.round(m)} KB`;
  } catch {
    return null;
  }
};
const isError = (status) => status !== "Accepted" && status !== "Wrong Answer";

export default function Submissions() {
  const [subs, setSubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");
  const [langFilter, setLangFilter] = useState("all");
  const [detailId, setDetailId] = useState(null);

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

  const languages = useMemo(() => [...new Set(subs.map((s) => s.language).filter(Boolean))], [subs]);
  const stats = useMemo(() => {
    const total = subs.length;
    const accepted = subs.filter((s) => s.status === "Accepted").length;
    return { total, accepted, rate: total ? Math.round((accepted / total) * 100) : 0, langs: languages.length };
  }, [subs, languages]);

  const filtered = useMemo(() => {
    return subs.filter((s) => {
      if (q && !(s.problem?.title || "").toLowerCase().includes(q.toLowerCase())) return false;
      if (langFilter !== "all" && s.language !== langFilter) return false;
      if (status === "accepted" && s.status !== "Accepted") return false;
      if (status === "wrong" && s.status !== "Wrong Answer") return false;
      if (status === "errors" && !isError(s.status)) return false;
      return true;
    });
  }, [subs, q, status, langFilter]);

  if (loading) return <Spinner label="Loading submissions…" full />;

  if (subs.length === 0) {
    return (
      <div style={{ maxWidth: 960 }}>
        <div style={{ ...surface, padding: "40px 44px", textAlign: "center", color: muted(60) }}>
          No submissions yet. <Link to="/problems" style={{ color: "var(--color-accent-700)", fontWeight: 600 }}>Solve a problem →</Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 980 }}>
      {/* Stat strip */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 14, marginBottom: 18 }}>
        <StatCard label="Total submissions" value={stats.total} />
        <StatCard label="Accepted" value={stats.accepted} color="var(--color-accent-2-700)" />
        <StatCard label="Acceptance" value={`${stats.rate}%`} />
        <StatCard label="Languages used" value={stats.langs} color="var(--color-accent)" />
      </div>

      {/* Filters */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16, flexWrap: "wrap" }}>
        <div style={{ position: "relative", flex: 1, minWidth: 200, maxWidth: 320 }}>
          <Search size={16} strokeWidth={2.5} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: muted(50) }} />
          <input className="input" placeholder="Search problems…" value={q} onChange={(e) => setQ(e.target.value)} style={{ paddingLeft: 40, background: "var(--color-surface)" }} />
        </div>
        <div className="seg" style={{ background: "var(--color-surface)" }}>
          {[["all", "All"], ["accepted", "Accepted"], ["wrong", "Wrong"], ["errors", "Errors"]].map(([v, label]) => (
            <label key={v} className="seg-opt">
              <input type="radio" name="sub-status" checked={status === v} onChange={() => setStatus(v)} />
              <span>{label}</span>
            </label>
          ))}
        </div>
        {languages.length > 1 && (
          <select className="input" value={langFilter} onChange={(e) => setLangFilter(e.target.value)} style={{ width: "auto", minHeight: 38, background: "var(--color-surface)" }}>
            <option value="all">All languages</option>
            {languages.map((l) => <option key={l} value={l}>{l}</option>)}
          </select>
        )}
        <span style={{ marginLeft: "auto", fontSize: 13, color: muted(55) }}>{filtered.length} shown</span>
      </div>

      <div style={{ ...surface, overflow: "hidden" }}>
        <table className="table">
          <thead>
            <tr>
              <th style={{ width: 36 }} />
              <th>Problem</th>
              <th>Difficulty</th>
              <th>Language</th>
              <th style={{ textAlign: "right" }}>Runtime</th>
              <th>Status</th>
              <th style={{ textAlign: "right" }}>When</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((s) => {
              const ok = s.status === "Accepted";
              const dd = DIFF[s.problem?.difficulty] || DIFF.MEDIUM;
              const rt = repStat(s.time, "time");
              return (
                <tr key={s.id} onClick={() => setDetailId(s.id)} style={{ cursor: "pointer" }}>
                  <td>
                    <span style={{ width: 22, height: 22, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", background: ok ? "var(--color-accent-2-200)" : "var(--color-neutral-300)", color: ok ? "var(--color-accent-2-800)" : "var(--color-neutral-800)" }}>
                      {ok ? <Check size={13} strokeWidth={3} /> : <X size={12} strokeWidth={3} />}
                    </span>
                  </td>
                  <td style={{ fontWeight: 600 }}>{s.problem?.title || "—"}</td>
                  <td><span style={{ fontSize: 11, padding: "2px 9px", borderRadius: 999, background: dd.bg, color: dd.fg, fontWeight: 600 }}>{dd.label}</span></td>
                  <td style={{ color: muted(62) }}>{s.language}</td>
                  <td style={{ textAlign: "right", color: muted(60), fontVariantNumeric: "tabular-nums" }}>{rt || "—"}</td>
                  <td style={{ color: ok ? "var(--color-accent-2-700)" : "var(--color-accent-800)", fontWeight: 600, fontSize: 13 }}>{s.status}</td>
                  <td style={{ textAlign: "right", color: muted(50) }}>{timeAgo(s.createdAt)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filtered.length === 0 && <div style={{ padding: 28, textAlign: "center", color: muted(55) }}>No submissions match your filters.</div>}
      </div>

      {detailId && <DetailModal id={detailId} onClose={() => setDetailId(null)} />}
    </div>
  );
}

function StatCard({ label, value, color }) {
  return (
    <div style={{ background: "var(--color-surface)", borderRadius: 20, boxShadow: "var(--shadow-sm)", padding: "16px 18px" }}>
      <div style={{ fontSize: 12, color: muted(60), marginBottom: 8 }}>{label}</div>
      <div style={{ fontFamily: "var(--font-heading)", fontSize: 28, lineHeight: 1, color: color || "var(--color-text)" }}>{value}</div>
    </div>
  );
}

function DetailModal({ id, onClose }) {
  const [sub, setSub] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    let active = true;
    setLoading(true);
    api
      .get(`/submission/get-submission-detail/${id}`)
      .then(({ data }) => active && setSub(data.submission))
      .catch((e) => active && setErr(e.response?.data?.message || "Failed to load submission"))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [id]);

  const ok = sub?.status === "Accepted";
  const rt = repStat(sub?.time, "time");
  const mem = repStat(sub?.memory, "memory");

  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 50, display: "grid", placeItems: "center", padding: 20, background: "color-mix(in srgb, var(--color-neutral-900) 45%, transparent)" }}>
      <div onClick={(e) => e.stopPropagation()} style={{ width: "min(760px, 100%)", maxHeight: "88vh", display: "flex", flexDirection: "column", background: "var(--color-surface)", borderRadius: 24, boxShadow: "var(--shadow-lg)", overflow: "hidden" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "16px 20px", borderBottom: "1px solid var(--color-divider)" }}>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ fontFamily: "var(--font-heading)", fontSize: 18, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{sub?.problem?.title || "Submission"}</div>
            {sub && (
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 4, fontSize: 12, color: muted(60), flexWrap: "wrap" }}>
                <span style={{ color: ok ? "var(--color-accent-2-700)" : "var(--color-accent-800)", fontWeight: 700 }}>{sub.status}</span>
                <span>· {sub.language}</span>
                {rt && <span>· {rt}</span>}
                {mem && <span>· {mem}</span>}
              </div>
            )}
          </div>
          {sub?.problem?.slug && (
            <Link to={`/problems/${sub.problem.slug}`} className="btn btn-secondary" style={{ gap: 6, fontSize: 12 }}>
              <ExternalLink size={14} strokeWidth={2.5} /> Open problem
            </Link>
          )}
          <button onClick={onClose} className="btn btn-ghost btn-icon" aria-label="Close" style={{ width: 32, height: 32 }}><X size={18} strokeWidth={2.5} /></button>
        </div>

        <div style={{ flex: 1, minHeight: 0, overflowY: "auto", padding: 20 }}>
          {loading ? (
            <Spinner label="Loading…" />
          ) : err ? (
            <div style={{ color: "var(--color-accent-800)" }}>{err}</div>
          ) : (
            <>
              {sub.testCases?.length > 0 && (
                <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginBottom: 16 }}>
                  {sub.testCases.map((t) => (
                    <span key={t.id} title={`Testcase ${t.testCase}: ${t.status}`} style={{ width: 26, height: 26, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, background: t.passed ? "var(--color-accent-2-100)" : "var(--color-accent-100)", color: t.passed ? "var(--color-accent-2-800)" : "var(--color-accent-800)" }}>{t.testCase}</span>
                  ))}
                </div>
              )}
              <div style={{ fontSize: 12, fontWeight: 700, color: muted(70), marginBottom: 6 }}>Your code</div>
              <pre style={{ margin: 0, padding: "14px 16px", background: "var(--color-bg)", borderRadius: 14, fontFamily: "ui-monospace, Menlo, monospace", fontSize: 12.5, lineHeight: 1.6, overflowX: "auto" }}>{sub.sourceCode?.code || "(code unavailable)"}</pre>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
