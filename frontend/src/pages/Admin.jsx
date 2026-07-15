import { useEffect, useMemo, useState } from "react";
import {
  Users,
  Activity,
  Send,
  IndianRupee,
  ListChecks,
  Flag,
  Search,
  Trash2,
} from "lucide-react";
import { api } from "../lib/api.js";
import Spinner from "../components/Spinner.jsx";

const DIFF = {
  EASY: { bg: "var(--color-accent-2-100)", fg: "var(--color-accent-2-800)", label: "Easy" },
  MEDIUM: { bg: "var(--color-accent-100)", fg: "var(--color-accent-800)", label: "Medium" },
  HARD: { bg: "var(--color-accent-200)", fg: "var(--color-accent-900)", label: "Hard" },
};
const muted = (p = 60) => `color-mix(in srgb, var(--color-text) ${p}%, transparent)`;
const surface = { background: "var(--color-surface)", borderRadius: 22, boxShadow: "var(--shadow-sm)" };

function Pill({ difficulty }) {
  const d = DIFF[difficulty] || DIFF.MEDIUM;
  return (
    <span style={{ fontSize: 11, padding: "3px 11px", borderRadius: 999, background: d.bg, color: d.fg, fontWeight: 600 }}>
      {d.label}
    </span>
  );
}

export default function Admin() {
  const [tab, setTab] = useState("overview");

  return (
    <div style={{ maxWidth: 1080 }}>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontFamily: "var(--font-heading)", fontSize: 32, lineHeight: 1.05, margin: "0 0 6px" }}>Admin</h1>
        <p style={{ margin: 0, fontSize: 15, color: muted(66) }}>Platform health and content management.</p>
      </div>

      <div className="seg" style={{ background: "var(--color-surface)", marginBottom: 18, width: "fit-content" }}>
        {[
          ["overview", "Overview"],
          ["problems", "Problems"],
        ].map(([v, label]) => (
          <label key={v} className="seg-opt">
            <input type="radio" name="admin-tab" checked={tab === v} onChange={() => setTab(v)} />
            <span>{label}</span>
          </label>
        ))}
      </div>

      {tab === "overview" ? <Overview /> : <Problems />}
    </div>
  );
}

/* ---------------------------------------------------------------- Overview */

function Overview() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    api
      .get("/admin/content/overview")
      .then(({ data }) => active && setData(data))
      .catch((e) => active && setError(e.response?.data?.message || "Failed to load overview"))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  if (loading) return <Spinner label="Loading overview…" full />;
  if (error)
    return (
      <div style={{ background: "var(--color-accent-100)", color: "var(--color-accent-800)", padding: "12px 16px", borderRadius: 14 }}>
        {error}
      </div>
    );

  const k = data?.kpis || {};
  const series = data?.submissionsPerDay || [];
  const days = data?.submissionDays || [];
  const signups = data?.recentSignups || [];
  const max = Math.max(1, ...series);

  const cards = [
    { label: "Total users", value: k.totalUsers ?? 0, icon: Users, color: "var(--color-accent)" },
    { label: "Active today", value: k.activeToday ?? 0, icon: Activity, color: "var(--color-accent-2-700)" },
    { label: "Submissions today", value: k.submissionsToday ?? 0, icon: Send },
    { label: "Donations this month", value: `₹${Math.round(k.donationsThisMonth ?? 0).toLocaleString("en-IN")}`, icon: IndianRupee, color: "var(--color-accent-2-700)" },
    { label: "Problems", value: k.problemCount ?? 0, icon: ListChecks },
    { label: "Open reports", value: k.openReports ?? 0, icon: Flag, color: (k.openReports ?? 0) > 0 ? "var(--color-accent-800)" : undefined },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14 }}>
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <div key={c.label} style={{ ...surface, borderRadius: 20, padding: "18px 20px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                <span style={{ fontSize: 12, color: muted(60) }}>{c.label}</span>
                <Icon size={16} strokeWidth={2.2} style={{ color: muted(45) }} />
              </div>
              <div style={{ fontFamily: "var(--font-heading)", fontSize: 30, lineHeight: 1, color: c.color || "var(--color-text)" }}>
                {c.value}
              </div>
            </div>
          );
        })}
      </div>

      {/* 14-day submissions bar chart */}
      <div style={{ ...surface, padding: "20px 22px" }}>
        <h3 style={{ fontFamily: "var(--font-heading)", fontSize: 18, margin: "0 0 4px" }}>Submissions</h3>
        <p style={{ margin: "0 0 16px", fontSize: 13, color: muted(55) }}>Last 14 days</p>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 140 }}>
          {series.map((count, i) => {
            const label = days[i] ? new Date(days[i]).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "";
            return (
              <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6, height: "100%", justifyContent: "flex-end" }} title={`${label}: ${count} submissions`}>
                <span style={{ fontSize: 11, color: muted(50), fontWeight: 600 }}>{count > 0 ? count : ""}</span>
                <div
                  style={{
                    width: "100%",
                    height: `${Math.max(count > 0 ? 6 : 2, (count / max) * 100)}%`,
                    minHeight: 3,
                    borderRadius: 6,
                    background: count > 0 ? "var(--color-accent)" : "var(--color-neutral-200)",
                    transition: "height .2s",
                  }}
                />
              </div>
            );
          })}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8, fontSize: 11, color: muted(45) }}>
          <span>{days[0] ? new Date(days[0]).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : ""}</span>
          <span>{days.length ? new Date(days[days.length - 1]).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : ""}</span>
        </div>
      </div>

      {/* Recent signups */}
      <div style={{ ...surface, overflow: "hidden" }}>
        <div style={{ padding: "18px 22px 4px" }}>
          <h3 style={{ fontFamily: "var(--font-heading)", fontSize: 18, margin: 0 }}>Recent signups</h3>
        </div>
        {signups.length === 0 ? (
          <div style={{ padding: 28, textAlign: "center", color: muted(55) }}>No signups yet.</div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th style={{ textAlign: "right" }}>Joined</th>
              </tr>
            </thead>
            <tbody>
              {signups.map((u) => (
                <tr key={u.id}>
                  <td style={{ fontWeight: 600 }}>{u.name || "—"}</td>
                  <td style={{ color: muted(62) }}>{u.email}</td>
                  <td>
                    <span
                      style={{
                        fontSize: 11,
                        padding: "3px 10px",
                        borderRadius: 999,
                        fontWeight: 600,
                        background: u.role === "ADMIN" ? "var(--color-accent-100)" : "var(--color-neutral-200)",
                        color: u.role === "ADMIN" ? "var(--color-accent-800)" : muted(70),
                      }}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td style={{ textAlign: "right", color: muted(55), fontSize: 13 }}>
                    {new Date(u.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------- Problems */

function Problems() {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");
  const [busyId, setBusyId] = useState(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    const t = setTimeout(() => {
      api
        .get("/admin/content/problems", { params: { search: q || undefined, status, limit: 100 } })
        .then(({ data }) => active && (setProblems(data.problems || []), setError("")))
        .catch((e) => active && setError(e.response?.data?.message || "Failed to load problems"))
        .finally(() => active && setLoading(false));
    }, 250);
    return () => {
      active = false;
      clearTimeout(t);
    };
  }, [q, status]);

  const togglePublish = async (p) => {
    setBusyId(p.id);
    const next = !p.published;
    try {
      await api.patch(`/admin/content/problems/${p.id}/publish`, { published: next });
      setProblems((list) => list.map((x) => (x.id === p.id ? { ...x, published: next } : x)));
    } catch (e) {
      setError(e.response?.data?.message || "Failed to update problem");
    } finally {
      setBusyId(null);
    }
  };

  const remove = async (p) => {
    if (!window.confirm(`Delete "${p.title}"? This removes the problem and all its submissions. This cannot be undone.`)) return;
    setBusyId(p.id);
    try {
      await api.delete(`/admin/content/problems/${p.id}`);
      setProblems((list) => list.filter((x) => x.id !== p.id));
    } catch (e) {
      setError(e.response?.data?.message || "Failed to delete problem");
    } finally {
      setBusyId(null);
    }
  };

  const count = useMemo(() => problems.length, [problems]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        <div style={{ position: "relative", flex: 1, minWidth: 220, maxWidth: 360 }}>
          <Search size={16} strokeWidth={2.5} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: muted(50) }} />
          <input
            className="input"
            placeholder="Search problems…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            style={{ paddingLeft: 40, background: "var(--color-surface)" }}
          />
        </div>
        <div className="seg" style={{ background: "var(--color-surface)" }}>
          {[
            ["all", "All"],
            ["published", "Published"],
            ["draft", "Draft"],
          ].map(([v, label]) => (
            <label key={v} className="seg-opt">
              <input type="radio" name="admin-status" checked={status === v} onChange={() => setStatus(v)} />
              <span>{label}</span>
            </label>
          ))}
        </div>
        <span style={{ marginLeft: "auto", fontSize: 13, color: muted(55) }}>{count} problems</span>
      </div>

      {error && (
        <div style={{ background: "var(--color-accent-100)", color: "var(--color-accent-800)", padding: "10px 14px", borderRadius: 14 }}>{error}</div>
      )}

      <div style={{ ...surface, overflow: "hidden", position: "relative" }}>
        {loading ? (
          <div style={{ padding: 40 }}>
            <Spinner label="Loading problems…" />
          </div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th style={{ width: 44 }}>#</th>
                <th>Title</th>
                <th>Difficulty</th>
                <th style={{ textAlign: "center" }}>Published</th>
                <th style={{ width: 60 }} />
              </tr>
            </thead>
            <tbody>
              {problems.map((p, i) => (
                <tr key={p.id}>
                  <td style={{ color: muted(45), fontVariantNumeric: "tabular-nums" }}>{i + 1}</td>
                  <td style={{ fontWeight: 600 }}>
                    {p.title}
                    <span style={{ display: "block", fontSize: 11, color: muted(45), fontWeight: 400, marginTop: 2 }}>
                      {p.submissionCount} submission{p.submissionCount === 1 ? "" : "s"}
                      {(p.tags || []).length ? ` · ${p.tags.join(" · ")}` : ""}
                    </span>
                  </td>
                  <td>
                    <Pill difficulty={p.difficulty} />
                  </td>
                  <td style={{ textAlign: "center" }}>
                    <Toggle on={p.published} disabled={busyId === p.id} onClick={() => togglePublish(p)} />
                  </td>
                  <td style={{ textAlign: "right" }}>
                    <button
                      className="btn btn-ghost"
                      title="Delete problem"
                      disabled={busyId === p.id}
                      onClick={() => remove(p)}
                      style={{ padding: 8, color: "var(--color-accent-800)" }}
                    >
                      <Trash2 size={16} strokeWidth={2.2} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {!loading && problems.length === 0 && (
          <div style={{ padding: 32, textAlign: "center", color: muted(55) }}>No problems match your filters.</div>
        )}
      </div>
    </div>
  );
}

function Toggle({ on, disabled, onClick }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      disabled={disabled}
      onClick={onClick}
      title={on ? "Published — click to unpublish" : "Draft — click to publish"}
      style={{
        width: 42,
        height: 24,
        borderRadius: 999,
        border: "none",
        padding: 0,
        cursor: disabled ? "default" : "pointer",
        opacity: disabled ? 0.5 : 1,
        background: on ? "var(--color-accent-2-500)" : "var(--color-neutral-300)",
        position: "relative",
        transition: "background .15s",
        verticalAlign: "middle",
      }}
    >
      <span
        style={{
          position: "absolute",
          top: 3,
          left: on ? 21 : 3,
          width: 18,
          height: 18,
          borderRadius: "50%",
          background: "#fff",
          boxShadow: "0 1px 2px rgba(0,0,0,.2)",
          transition: "left .15s",
        }}
      />
    </button>
  );
}
