import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Users,
  Activity,
  Send,
  IndianRupee,
  AlertTriangle,
  FileText,
  Plus,
  Search,
  Pencil,
  Trash2,
  Trophy,
  Ban,
} from "lucide-react";
import { api } from "../lib/api.js";
import Spinner from "../components/Spinner.jsx";
import ProblemFormModal from "../components/ProblemFormModal.jsx";
import ContestFormModal from "../components/ContestFormModal.jsx";

/* Rebuilt to match the Admin design (CodeArena Admin.html → 13a overview, 13b problem
   management). The design's premium metrics (Pro subscribers, MRR, Free/Pro plans) are
   swapped for this product's real, free-forever data — layout and styling kept faithful. */

const muted = (p = 60) => `color-mix(in srgb, var(--color-text) ${p}%, transparent)`;

const DIFF = {
  EASY: { bg: "var(--color-accent-2-100)", fg: "var(--color-accent-2-800)", label: "Easy" },
  MEDIUM: { bg: "var(--color-accent-100)", fg: "var(--color-accent-800)", label: "Medium" },
  HARD: { bg: "var(--color-accent-200)", fg: "var(--color-accent-900)", label: "Hard" },
};

/* Contest status badge palette — matches the Contests page. */
const STATUS = {
  LIVE: { bg: "var(--color-accent-100)", fg: "var(--color-accent-800)", label: "Live" },
  UPCOMING: { bg: "var(--color-accent-2-100)", fg: "var(--color-accent-2-800)", label: "Upcoming" },
  COMPLETED: { bg: "var(--color-neutral-200)", fg: "var(--color-neutral-800)", label: "Completed" },
  CANCELLED: { bg: "var(--color-neutral-200)", fg: "var(--color-neutral-700)", label: "Cancelled" },
};

const fmtWindow = (iso) => (iso ? new Date(iso).toLocaleString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) : "");

function Pill({ difficulty }) {
  const d = DIFF[difficulty] || DIFF.MEDIUM;
  return (
    <span style={{ fontSize: 11, padding: "2px 10px", borderRadius: 999, background: d.bg, color: d.fg, fontWeight: 600 }}>
      {d.label}
    </span>
  );
}

export default function Admin() {
  const [tab, setTab] = useState("overview");

  return (
    <div style={{ maxWidth: 1120 }}>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontFamily: "var(--font-heading)", fontSize: 32, lineHeight: 1.05, margin: "0 0 6px" }}>Admin</h1>
        <p style={{ margin: 0, fontSize: 15, color: muted(66) }}>Platform health and content management.</p>
      </div>

      <div className="seg" style={{ background: "var(--color-surface)", marginBottom: 18, width: "fit-content" }}>
        {[
          ["overview", "Overview"],
          ["problems", "Manage Problems"],
          ["contests", "Manage Contests"],
        ].map(([v, label]) => (
          <label key={v} className="seg-opt">
            <input type="radio" name="admin-tab" checked={tab === v} onChange={() => setTab(v)} />
            <span>{label}</span>
          </label>
        ))}
      </div>

      {tab === "overview" && <Overview onManageProblems={() => setTab("problems")} />}
      {tab === "problems" && <Problems />}
      {tab === "contests" && <Contests />}
    </div>
  );
}

/* ---------------------------------------------------------------- Overview (13a) */

function KpiCard(props) {
  const { label, value, sub, subTone, chipBg, chipFg } = props;
  const Icon = props.Icon; // local const → covered by varsIgnorePattern (^[A-Z_])
  return (
    <div style={{ background: "var(--color-surface)", borderRadius: 20, boxShadow: "var(--shadow-sm)", padding: "18px 20px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
        <span style={{ fontSize: 12, color: muted(60) }}>{label}</span>
        <span style={{ width: 30, height: 30, borderRadius: 9, background: chipBg, color: chipFg, display: "flex", alignItems: "center", justifyContent: "center", flex: "none" }}>
          <Icon size={15} strokeWidth={2.5} />
        </span>
      </div>
      <div style={{ fontFamily: "var(--font-heading)", fontSize: 28, lineHeight: 1 }}>{value}</div>
      {sub != null && (
        <div style={{ fontSize: 11, marginTop: 6, fontWeight: 600, color: subTone || "var(--color-accent-2-700)" }}>{sub}</div>
      )}
    </div>
  );
}

function ModRow(props) {
  const { iconFg, highlight, title, subtitle, action, to, onClick } = props;
  const Icon = props.Icon; // local const → covered by varsIgnorePattern (^[A-Z_])
  const ActionEl = to ? Link : "button";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 11, padding: "11px 13px", borderRadius: 14, background: highlight ? "var(--color-accent-100)" : "var(--color-neutral-100)" }}>
      <span style={{ width: 32, height: 32, borderRadius: 10, background: "var(--color-surface)", color: iconFg, display: "flex", alignItems: "center", justifyContent: "center", flex: "none" }}>
        <Icon size={16} strokeWidth={2.5} />
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 600 }}>{title}</div>
        <div style={{ fontSize: 11, color: muted(55) }}>{subtitle}</div>
      </div>
      {action && (
        <ActionEl
          to={to}
          onClick={onClick}
          className={to ? undefined : "btn btn-ghost"}
          style={{ fontSize: 12, color: "var(--color-accent-800)", textDecoration: "none", fontWeight: 700, background: "transparent", padding: to ? 0 : "2px 6px" }}
        >
          {action}
        </ActionEl>
      )}
    </div>
  );
}

function Overview({ onManageProblems }) {
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
  const totalSubs = series.reduce((a, b) => a + (b || 0), 0);
  const totalUsers = k.totalUsers ?? 0;
  const activeToday = k.activeToday ?? 0;
  const subsToday = k.submissionsToday ?? 0;
  const subsDelta = series.length >= 2 ? subsToday - (series[series.length - 2] || 0) : null;
  const openReports = k.openReports ?? 0;
  const activePct = totalUsers ? Math.round((activeToday / totalUsers) * 100) : 0;

  const fmtDay = (d) => (d ? new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      {/* KPI row — 4 cards, matching the design (real metrics substituted for premium) */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))", gap: 14 }}>
        <KpiCard
          label="Total users" value={totalUsers.toLocaleString("en-IN")} Icon={Users}
          chipBg="var(--color-accent-100)" chipFg="var(--color-accent-700)"
          sub={`${activeToday.toLocaleString("en-IN")} active today`} subTone={activeToday > 0 ? "var(--color-accent-2-700)" : muted(50)}
        />
        <KpiCard
          label="Active today" value={activeToday.toLocaleString("en-IN")} Icon={Activity}
          chipBg="var(--color-accent-2-100)" chipFg="var(--color-accent-2-700)"
          sub={`${activePct}% of all users`}
        />
        <KpiCard
          label="Submissions today" value={subsToday.toLocaleString("en-IN")} Icon={Send}
          chipBg="var(--color-accent-100)" chipFg="var(--color-accent-700)"
          sub={subsDelta == null ? "today" : `${subsDelta >= 0 ? "+" : ""}${subsDelta} vs yesterday`}
          subTone={subsDelta > 0 ? "var(--color-accent-2-700)" : muted(50)}
        />
        <KpiCard
          label="Donations this month" value={`₹${Math.round(k.donationsThisMonth ?? 0).toLocaleString("en-IN")}`} Icon={IndianRupee}
          chipBg="var(--color-accent-2-100)" chipFg="var(--color-accent-2-700)"
          sub="this month" subTone={muted(50)}
        />
      </div>

      {/* Row 2 — submissions chart + moderation queue */}
      <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: 18 }}>
        <div style={{ background: "var(--color-surface)", borderRadius: 24, boxShadow: "var(--shadow-sm)", padding: "22px 24px" }}>
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 18 }}>
            <h3 style={{ fontFamily: "var(--font-heading)", fontSize: 18, margin: 0 }}>Submissions per day</h3>
            <span style={{ fontSize: 12, color: muted(55) }}>Last {series.length || 14} days · {totalSubs.toLocaleString("en-IN")} total</span>
          </div>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 9, height: 170 }}>
            {series.map((count, i) => (
              <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "flex-end", height: "100%" }} title={`${fmtDay(days[i])}: ${count} submissions`}>
                <div style={{ height: `${Math.max(count > 0 ? 4 : 1.5, (count / max) * 100)}%`, background: i >= series.length - 2 ? "var(--color-accent)" : "var(--color-accent-2-400)", borderRadius: "7px 7px 3px 3px", transition: "height .2s" }} />
              </div>
            ))}
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: muted(45), marginTop: 10 }}>
            <span>{fmtDay(days[0])}</span>
            <span>{fmtDay(days[Math.floor(days.length / 2)])}</span>
            <span>{fmtDay(days[days.length - 1])}</span>
          </div>
        </div>

        <div style={{ background: "var(--color-surface)", borderRadius: 24, boxShadow: "var(--shadow-sm)", padding: "22px 24px" }}>
          <h3 style={{ fontFamily: "var(--font-heading)", fontSize: 18, margin: "0 0 16px" }}>Moderation queue</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
            <ModRow
              Icon={AlertTriangle} iconFg="var(--color-accent-700)" highlight={openReports > 0}
              title={`${openReports} open report${openReports === 1 ? "" : "s"}`}
              subtitle={openReports > 0 ? "Awaiting review" : "Nothing flagged"}
            />
            <ModRow
              Icon={FileText} iconFg="var(--color-accent-2-700)"
              title={`${(k.problemCount ?? 0).toLocaleString("en-IN")} problems`}
              subtitle="Publish & manage" action="Open" onClick={onManageProblems}
            />
            <ModRow
              Icon={IndianRupee} iconFg="var(--color-accent-700)"
              title="Support & donations" subtitle="Pay-what-you-want" action="View" to="/support"
            />
          </div>
        </div>
      </div>

      {/* Recent signups */}
      <div style={{ background: "var(--color-surface)", borderRadius: 24, boxShadow: "var(--shadow-sm)", padding: "22px 24px" }}>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 12 }}>
          <h3 style={{ fontFamily: "var(--font-heading)", fontSize: 18, margin: 0 }}>Recent signups</h3>
        </div>
        {signups.length === 0 ? (
          <div style={{ padding: "18px 0", textAlign: "center", color: muted(55) }}>No signups yet.</div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>User</th>
                <th>Email</th>
                <th>Role</th>
                <th style={{ textAlign: "right" }}>Joined</th>
              </tr>
            </thead>
            <tbody>
              {signups.map((u) => (
                <tr key={u.id}>
                  <td style={{ fontWeight: 600 }}>{u.name || "—"}</td>
                  <td style={{ color: muted(60) }}>{u.email}</td>
                  <td>
                    <span className={u.role === "ADMIN" ? "tag tag-accent" : "tag tag-accent-2"}>{u.role === "ADMIN" ? "Admin" : "Member"}</span>
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

/* ---------------------------------------------------------------- Manage Problems (13b) */

function StatusIndicator({ published, busy, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={busy}
      title={published ? "Published — click to unpublish" : "Draft — click to publish"}
      style={{ display: "inline-flex", alignItems: "center", gap: 5, background: "transparent", border: "none", cursor: busy ? "default" : "pointer", opacity: busy ? 0.5 : 1, fontSize: 11, fontWeight: 600, color: published ? "var(--color-accent-2-700)" : muted(50) }}
    >
      <span style={{ width: 7, height: 7, borderRadius: "50%", background: published ? "var(--color-accent-2-500)" : "var(--color-neutral-400)" }} />
      {published ? "Published" : "Draft"}
    </button>
  );
}

function Problems() {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");
  const [busyId, setBusyId] = useState(null);
  const [modal, setModal] = useState(null); // { mode:"create" } | { mode:"edit", problem }
  const [reloadKey, setReloadKey] = useState(0);

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
  }, [q, status, reloadKey]);

  const openEdit = async (p) => {
    setBusyId(p.id);
    setError("");
    try {
      const { data } = await api.get(`/problems/get-all-problems/${p.id}`);
      setModal({ mode: "edit", problem: data.problem });
    } catch (e) {
      setError(e.response?.data?.message || "Failed to load problem");
    } finally {
      setBusyId(null);
    }
  };

  const onSaved = () => {
    setModal(null);
    setReloadKey((k) => k + 1);
  };

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
  const publishedCount = useMemo(() => problems.filter((p) => p.published).length, [problems]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Toolbar: search · filter · New problem */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        <div style={{ position: "relative", flex: 1, minWidth: 220, maxWidth: 340 }}>
          <Search size={16} strokeWidth={2.5} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: muted(50) }} />
          <input className="input" placeholder="Search problems…" value={q} onChange={(e) => setQ(e.target.value)} style={{ paddingLeft: 40, background: "var(--color-surface)" }} />
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
        <button className="btn btn-primary" style={{ marginLeft: "auto", gap: 7 }} onClick={() => setModal({ mode: "create" })}>
          <Plus size={16} strokeWidth={2.75} /> New problem
        </button>
      </div>

      {error && (
        <div style={{ background: "var(--color-accent-100)", color: "var(--color-accent-800)", padding: "10px 14px", borderRadius: 14 }}>{error}</div>
      )}

      <div style={{ background: "var(--color-surface)", borderRadius: 22, boxShadow: "var(--shadow-sm)", overflow: "hidden" }}>
        {loading ? (
          <div style={{ padding: 40 }}>
            <Spinner label="Loading problems…" />
          </div>
        ) : (
          <>
            <table className="table">
              <thead>
                <tr>
                  <th style={{ width: 44 }}>#</th>
                  <th>Title</th>
                  <th>Difficulty</th>
                  <th>Topic</th>
                  <th style={{ textAlign: "right" }}>Submissions</th>
                  <th style={{ textAlign: "center" }}>Status</th>
                  <th style={{ textAlign: "right", width: 90 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {problems.map((p, i) => (
                  <tr key={p.id}>
                    <td style={{ color: muted(50), fontVariantNumeric: "tabular-nums" }}>{i + 1}</td>
                    <td style={{ fontWeight: 600 }}>{p.title}</td>
                    <td><Pill difficulty={p.difficulty} /></td>
                    <td style={{ color: muted(62) }}>{(p.tags || [])[0] || "—"}</td>
                    <td style={{ textAlign: "right", fontVariantNumeric: "tabular-nums", color: muted(62) }}>{p.submissionCount ?? 0}</td>
                    <td style={{ textAlign: "center" }}>
                      <StatusIndicator published={p.published} busy={busyId === p.id} onClick={() => togglePublish(p)} />
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: 4, justifyContent: "flex-end" }}>
                        <button className="btn btn-ghost btn-icon" style={{ width: 30, height: 30 }} disabled={busyId === p.id} onClick={() => openEdit(p)} title="Edit problem" aria-label="Edit">
                          <Pencil size={15} strokeWidth={2.5} />
                        </button>
                        <button className="btn btn-ghost btn-icon" style={{ width: 30, height: 30, color: "var(--color-accent-800)" }} disabled={busyId === p.id} onClick={() => remove(p)} title="Delete problem" aria-label="Delete">
                          <Trash2 size={15} strokeWidth={2.5} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {problems.length === 0 ? (
              <div style={{ padding: 32, textAlign: "center", color: muted(55) }}>No problems match your filters.</div>
            ) : (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 20px", borderTop: "1px solid var(--color-divider)" }}>
                <span style={{ fontSize: 12, color: muted(55) }}>{count} problems · {publishedCount} published</span>
                <span style={{ width: 30, height: 30, borderRadius: 9, background: "var(--color-accent)", color: "var(--color-bg)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700 }}>1</span>
              </div>
            )}
          </>
        )}
      </div>

      {modal && (
        <ProblemFormModal
          mode={modal.mode}
          problem={modal.problem}
          onClose={() => setModal(null)}
          onSaved={onSaved}
        />
      )}
    </div>
  );
}

/* ---------------------------------------------------------------- Manage Contests */

function Contests() {
  const [contests, setContests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState(null);
  const [showNew, setShowNew] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let active = true;
    setLoading(true);
    api
      .get("/contests", { params: { status: "all", limit: 100 } })
      .then(({ data }) => active && (setContests(data.contests || []), setError("")))
      .catch((e) => active && setError(e.response?.data?.message || "Failed to load contests"))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [reloadKey]);

  const refresh = () => setReloadKey((k) => k + 1);

  const cancel = async (c) => {
    if (!window.confirm(`Cancel "${c.title}"? Participants will no longer be able to compete.`)) return;
    setBusyId(c.id);
    try {
      await api.patch(`/contests/${c.id}/status`, { status: "CANCELLED" });
      refresh();
    } catch (e) {
      setError(e.response?.data?.message || "Failed to cancel contest");
      setBusyId(null);
    }
  };

  const remove = async (c) => {
    if (!window.confirm(`Delete "${c.title}"? This removes the contest and all its submissions. This cannot be undone.`)) return;
    setBusyId(c.id);
    try {
      await api.delete(`/contests/${c.id}`);
      refresh();
    } catch (e) {
      setError(e.response?.data?.message || "Failed to delete contest");
      setBusyId(null);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
          <span style={{ width: 34, height: 34, borderRadius: 10, background: "var(--color-accent-100)", color: "var(--color-accent-700)", display: "flex", alignItems: "center", justifyContent: "center", flex: "none" }}>
            <Trophy size={17} strokeWidth={2.5} />
          </span>
          <span style={{ fontSize: 13, color: muted(60) }}>Timed challenges with a live leaderboard.</span>
        </div>
        <button className="btn btn-primary" style={{ marginLeft: "auto", gap: 7 }} onClick={() => setShowNew(true)}>
          <Plus size={16} strokeWidth={2.75} /> New contest
        </button>
      </div>

      {error && (
        <div style={{ background: "var(--color-accent-100)", color: "var(--color-accent-800)", padding: "10px 14px", borderRadius: 14 }}>{error}</div>
      )}

      <div style={{ background: "var(--color-surface)", borderRadius: 22, boxShadow: "var(--shadow-sm)", overflow: "hidden" }}>
        {loading ? (
          <div style={{ padding: 40 }}>
            <Spinner label="Loading contests…" />
          </div>
        ) : contests.length === 0 ? (
          <div style={{ padding: 40, textAlign: "center", color: muted(55) }}>No contests yet. Create one to get started.</div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Window</th>
                <th style={{ textAlign: "right" }}>Problems</th>
                <th style={{ textAlign: "right" }}>Participants</th>
                <th style={{ textAlign: "center" }}>Status</th>
                <th style={{ textAlign: "right", width: 90 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {contests.map((c) => {
                const st = STATUS[c.status] || STATUS.UPCOMING;
                return (
                  <tr key={c.id}>
                    <td style={{ fontWeight: 600 }}>{c.title}</td>
                    <td style={{ color: muted(60), fontSize: 13 }}>{fmtWindow(c.startTime)} – {fmtWindow(c.endTime)}</td>
                    <td style={{ textAlign: "right", fontVariantNumeric: "tabular-nums", color: muted(62) }}>{(c.problemIds || []).length}</td>
                    <td style={{ textAlign: "right", fontVariantNumeric: "tabular-nums", color: muted(62) }}>{c._count?.participants ?? 0}</td>
                    <td style={{ textAlign: "center" }}>
                      <span style={{ fontSize: 11, padding: "3px 11px", borderRadius: 999, background: st.bg, color: st.fg, fontWeight: 700 }}>{st.label}</span>
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: 4, justifyContent: "flex-end" }}>
                        <button className="btn btn-ghost btn-icon" style={{ width: 30, height: 30 }} disabled={busyId === c.id || c.status === "CANCELLED"} onClick={() => cancel(c)} title="Cancel contest" aria-label="Cancel">
                          <Ban size={15} strokeWidth={2.5} />
                        </button>
                        <button className="btn btn-ghost btn-icon" style={{ width: 30, height: 30, color: "var(--color-accent-800)" }} disabled={busyId === c.id} onClick={() => remove(c)} title="Delete contest" aria-label="Delete">
                          <Trash2 size={15} strokeWidth={2.5} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {showNew && <ContestFormModal onClose={() => setShowNew(false)} onSaved={() => (setShowNew(false), refresh())} />}
    </div>
  );
}
