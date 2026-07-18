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
  Library,
  X,
  Clock,
  Mail,
  Github,
  Globe,
  RefreshCw,
  CheckCircle2,
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
          ["users", "Manage Users"],
          ["problems", "Manage Problems"],
          ["contests", "Manage Contests"],
          ["sheets", "Manage Sheets"],
        ].map(([v, label]) => (
          <label key={v} className="seg-opt">
            <input type="radio" name="admin-tab" checked={tab === v} onChange={() => setTab(v)} />
            <span>{label}</span>
          </label>
        ))}
      </div>

      {tab === "overview" && <Overview onManageProblems={() => setTab("problems")} />}
      {tab === "users" && <UsersManager />}
      {tab === "problems" && <Problems />}
      {tab === "contests" && <Contests />}
      {tab === "sheets" && <SheetsManager />}
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

/* ---------------------------------------------------------------- Manage Sheets */

// Union of a sheet's flat problemIds and any ids nested in its day structure.
function sheetProblemIds(sheet) {
  const set = new Set(sheet.problemIds || []);
  if (Array.isArray(sheet.structure)) for (const b of sheet.structure) for (const id of b.problemIds || []) set.add(id);
  return set;
}

function SheetsManager() {
  const [sheets, setSheets] = useState([]);
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selId, setSelId] = useState("");
  const [addChoice, setAddChoice] = useState("");
  const [busy, setBusy] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const emptyForm = { title: "", topic: "", difficulty: "EASY", description: "", estimatedHours: "", prerequisites: "" };
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    let active = true;
    setLoading(true);
    Promise.all([api.get("/sheets"), api.get("/problems/get-all-problems", { params: { limit: 200 } })])
      .then(([s, p]) => {
        if (!active) return;
        const list = s.data.sheets || [];
        setSheets(list);
        setProblems(p.data.problems || []);
        setError("");
        setSelId((cur) => cur || (list[0]?.id ?? ""));
      })
      .catch((e) => active && setError(e.response?.data?.message || "Failed to load sheets"))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [reloadKey]);

  const refresh = () => setReloadKey((k) => k + 1);
  const byId = useMemo(() => new Map(problems.map((p) => [p.id, p])), [problems]);
  const selected = sheets.find((s) => s.id === selId) || null;

  const added = selected ? (selected.problemIds || []).map((id) => byId.get(id)).filter(Boolean) : [];
  const inSheet = selected ? sheetProblemIds(selected) : new Set();
  const available = problems.filter((p) => !inSheet.has(p.id));

  const createSheet = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.topic.trim() || !form.description.trim()) {
      setError("Title, topic and description are required");
      return;
    }
    setCreating(true);
    setError("");
    try {
      const body = {
        title: form.title.trim(),
        description: form.description.trim(),
        topic: form.topic.trim(),
        difficulty: form.difficulty,
        prerequisites: form.prerequisites ? form.prerequisites.split(",").map((s) => s.trim()).filter(Boolean) : [],
      };
      if (form.estimatedHours) body.estimatedHours = Number(form.estimatedHours);
      const { data } = await api.post("/sheets/create", body);
      setForm(emptyForm);
      setShowCreate(false);
      if (data.sheet?.id) setSelId(data.sheet.id);
      refresh();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create sheet");
    } finally {
      setCreating(false);
    }
  };

  const addProblem = async () => {
    if (!selId || !addChoice) return;
    setBusy(true);
    setError("");
    try {
      await api.post(`/sheets/${selId}/problems`, { problemIds: [addChoice] });
      setAddChoice("");
      refresh();
    } catch (e) {
      setError(e.response?.data?.message || "Failed to add problem");
      setBusy(false);
    }
  };

  const removeProblem = async (pid) => {
    if (!selId) return;
    setBusy(true);
    setError("");
    try {
      await api.delete(`/sheets/${selId}/problems/${pid}`);
      refresh();
    } catch (e) {
      setError(e.response?.data?.message || "Failed to remove problem");
      setBusy(false);
    }
  };

  if (loading) return <Spinner label="Loading sheets…" full />;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 9, flexWrap: "wrap" }}>
        <span style={{ width: 34, height: 34, borderRadius: 10, background: "var(--color-accent-100)", color: "var(--color-accent-700)", display: "flex", alignItems: "center", justifyContent: "center", flex: "none" }}>
          <Library size={17} strokeWidth={2.5} />
        </span>
        <span style={{ fontSize: 13, color: muted(60) }}>Create sheets, and add or remove problems on any DSA sheet.</span>
        <button className="btn btn-primary" style={{ marginLeft: "auto", gap: 7 }} onClick={() => setShowCreate((v) => !v)}>
          <Plus size={16} strokeWidth={2.75} /> New sheet
        </button>
      </div>

      {error && <div style={{ background: "var(--color-accent-100)", color: "var(--color-accent-800)", padding: "10px 14px", borderRadius: 14 }}>{error}</div>}

      {showCreate && (
        <form onSubmit={createSheet} style={{ background: "var(--color-surface)", borderRadius: 22, boxShadow: "var(--shadow-sm)", padding: "20px 22px", display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ fontFamily: "var(--font-heading)", fontSize: 17 }}>New DSA sheet</div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <input className="input" placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} style={{ flex: 2, minWidth: 220 }} />
            <input className="input" placeholder="Topic (e.g. Arrays & Hashing)" value={form.topic} onChange={(e) => setForm({ ...form, topic: e.target.value })} style={{ flex: 1, minWidth: 170 }} />
            <select className="input" value={form.difficulty} onChange={(e) => setForm({ ...form, difficulty: e.target.value })} style={{ minWidth: 130 }}>
              <option value="EASY">Easy</option>
              <option value="MEDIUM">Medium</option>
              <option value="HARD">Hard</option>
            </select>
          </div>
          <textarea className="input" placeholder="Short intro — one or two lines (the day-by-day breakdown is managed separately, so keep this brief)" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} style={{ resize: "vertical", minHeight: 58, fontFamily: "inherit", lineHeight: 1.5 }} />
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
            <input className="input" type="number" min="0" placeholder="Est. hours (optional)" value={form.estimatedHours} onChange={(e) => setForm({ ...form, estimatedHours: e.target.value })} style={{ width: 190 }} />
            <input className="input" placeholder="Prerequisites, comma-separated (optional)" value={form.prerequisites} onChange={(e) => setForm({ ...form, prerequisites: e.target.value })} style={{ flex: 1, minWidth: 220 }} />
          </div>
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
            <button type="button" className="btn btn-secondary" onClick={() => { setShowCreate(false); setForm(emptyForm); }} disabled={creating}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={creating || !form.title.trim() || !form.topic.trim() || !form.description.trim()}>
              {creating ? "Creating…" : "Create sheet"}
            </button>
          </div>
        </form>
      )}

      {sheets.length === 0 ? (
        <div style={{ background: "var(--color-surface)", borderRadius: 22, boxShadow: "var(--shadow-sm)", padding: 40, textAlign: "center", color: muted(55) }}>
          No sheets yet — click <strong>New sheet</strong> to create your first one.
        </div>
      ) : (
        <div style={{ background: "var(--color-surface)", borderRadius: 22, boxShadow: "var(--shadow-sm)", padding: "20px 22px", display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Sheet picker */}
          <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: muted(70) }}>Sheet</label>
            <select className="input" value={selId} onChange={(e) => { setSelId(e.target.value); setAddChoice(""); }} style={{ flex: 1, minWidth: 240, maxWidth: 460 }}>
              {sheets.map((s) => (
                <option key={s.id} value={s.id}>{s.title}</option>
              ))}
            </select>
            {selected && (
              <span className="tag tag-neutral">{sheetProblemIds(selected).size} problems total</span>
            )}
          </div>

          {/* Add a problem */}
          <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
            <select className="input" value={addChoice} onChange={(e) => setAddChoice(e.target.value)} style={{ flex: 1, minWidth: 240, maxWidth: 460 }}>
              <option value="">{available.length ? "Add a problem to this sheet…" : "Every problem is already in this sheet"}</option>
              {available.map((p) => (
                <option key={p.id} value={p.id}>{p.title} · {(DIFF[p.difficulty] || DIFF.MEDIUM).label}</option>
              ))}
            </select>
            <button className="btn btn-primary" style={{ gap: 7 }} onClick={addProblem} disabled={busy || !addChoice}>
              <Plus size={16} strokeWidth={2.75} /> Add
            </button>
          </div>

          {/* Problems added to this sheet (flat list — removable) */}
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, color: muted(58), margin: "2px 2px 8px" }}>
              Added directly to this sheet ({added.length})
            </div>
            {added.length === 0 ? (
              <div style={{ padding: "16px 0", textAlign: "center", color: muted(55), fontSize: 13.5 }}>
                No problems added directly yet. Structured (day-by-day) problems are managed via the seed.
              </div>
            ) : (
              <div style={{ border: "1px solid var(--color-divider)", borderRadius: 14, overflow: "hidden" }}>
                {added.map((p, i) => (
                  <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 14px", borderBottom: i === added.length - 1 ? "none" : "1px solid var(--color-divider)" }}>
                    <span style={{ flex: 1, minWidth: 0, fontSize: 14, fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.title}</span>
                    <Pill difficulty={p.difficulty} />
                    <button className="btn btn-ghost btn-icon" style={{ width: 30, height: 30, color: "var(--color-accent-800)" }} disabled={busy} onClick={() => removeProblem(p.id)} title="Remove from sheet" aria-label="Remove">
                      <X size={15} strokeWidth={2.5} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------------------------------------------------------------- Manage Users */

const initialsOf = (u) =>
  (u?.name || u?.email || "?").split(" ").map((s) => s[0]).slice(0, 2).join("").toUpperCase();

// Relative time for "last seen / last login" — compact, degrades to a date past 30d.
const fmtRel = (iso) => {
  if (!iso) return "never";
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 45) return "just now";
  const m = Math.floor(s / 60);
  if (m < 60) return `${m || 1}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d}d ago`;
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
};

const fmtDateTime = (iso) =>
  iso ? new Date(iso).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" }) : "—";

function Avatar({ user, size = 34 }) {
  if (user?.image) {
    return <img src={user.image} alt="" width={size} height={size} style={{ borderRadius: "50%", objectFit: "cover", flex: "none" }} />;
  }
  return (
    <div style={{ width: size, height: size, borderRadius: "50%", background: "var(--color-accent-2-300)", color: "var(--color-accent-2-800)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: Math.round(size * 0.38), flex: "none" }}>
      {initialsOf(user)}
    </div>
  );
}

function LiveDot({ on }) {
  return (
    <span
      title={on ? "Live now" : "Offline"}
      style={{ width: 8, height: 8, borderRadius: "50%", flex: "none", background: on ? "var(--color-accent-2-500)" : "var(--color-neutral-400)", boxShadow: on ? "0 0 0 3px color-mix(in srgb, var(--color-accent-2-500) 22%, transparent)" : "none" }}
    />
  );
}

function RoleTag({ role }) {
  return <span className={role === "ADMIN" ? "tag tag-accent" : "tag tag-accent-2"}>{role === "ADMIN" ? "Admin" : "Member"}</span>;
}

function UsersManager() {
  const [online, setOnline] = useState([]);
  const [windowMs, setWindowMs] = useState(150000);
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [q, setQ] = useState("");
  const [detailId, setDetailId] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);

  // Live now — poll every 15s so the list tracks connects/disconnects.
  useEffect(() => {
    let active = true;
    const load = () =>
      api
        .get("/admin/users/online")
        .then(({ data }) => {
          if (!active) return;
          setOnline(data.users || []);
          if (data.onlineWindowMs) setWindowMs(data.onlineWindowMs);
        })
        .catch(() => {});
    load();
    const id = setInterval(load, 15000);
    return () => {
      active = false;
      clearInterval(id);
    };
  }, [reloadKey]);

  // Recently logged in — debounced search, ordered by last login.
  useEffect(() => {
    let active = true;
    setLoading(true);
    const t = setTimeout(() => {
      api
        .get("/admin/users", { params: { sort: "recent", limit: 100, search: q || undefined } })
        .then(({ data }) => {
          if (!active) return;
          setRecent(data.users || []);
          if (data.onlineWindowMs) setWindowMs(data.onlineWindowMs);
          setError("");
        })
        .catch((e) => active && setError(e.response?.data?.message || "Failed to load users"))
        .finally(() => active && setLoading(false));
    }, 250);
    return () => {
      active = false;
      clearTimeout(t);
    };
  }, [q, reloadKey]);

  const onlineIds = useMemo(() => new Set(online.map((u) => u.id)), [online]);
  const isLive = (u) => onlineIds.has(u.id) || (u.lastSeenAt && Date.now() - new Date(u.lastSeenAt).getTime() <= windowMs);
  const refresh = () => setReloadKey((k) => k + 1);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      {/* Live now */}
      <div style={{ background: "var(--color-surface)", borderRadius: 24, boxShadow: "var(--shadow-sm)", padding: "22px 24px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
          <span style={{ width: 34, height: 34, borderRadius: 10, background: "var(--color-accent-2-100)", color: "var(--color-accent-2-700)", display: "flex", alignItems: "center", justifyContent: "center", flex: "none" }}>
            <Activity size={17} strokeWidth={2.5} />
          </span>
          <div style={{ marginRight: "auto" }}>
            <h3 style={{ fontFamily: "var(--font-heading)", fontSize: 18, margin: 0 }}>Live now</h3>
            <div style={{ fontSize: 12, color: muted(55) }}>
              {online.length} online · active in the last {Math.round(windowMs / 60000)} min
            </div>
          </div>
          <button className="btn btn-ghost btn-icon" style={{ width: 32, height: 32 }} onClick={refresh} title="Refresh" aria-label="Refresh">
            <RefreshCw size={15} strokeWidth={2.5} />
          </button>
        </div>
        {online.length === 0 ? (
          <div style={{ padding: "18px 0", textAlign: "center", color: muted(55) }}>No one is online right now.</div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 10 }}>
            {online.map((u) => (
              <button
                key={u.id}
                onClick={() => setDetailId(u.id)}
                style={{ display: "flex", alignItems: "center", gap: 11, padding: "10px 12px", borderRadius: 14, background: "var(--color-neutral-100)", border: "none", cursor: "pointer", textAlign: "left", width: "100%" }}
              >
                <div style={{ position: "relative", flex: "none" }}>
                  <Avatar user={u} size={36} />
                  <span style={{ position: "absolute", bottom: -1, right: -1, width: 11, height: 11, borderRadius: "50%", background: "var(--color-accent-2-500)", border: "2px solid var(--color-surface)" }} />
                </div>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ fontSize: 13.5, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{u.name || u.email}</div>
                  <div style={{ fontSize: 11.5, color: muted(55) }}>active {fmtRel(u.lastSeenAt)}</div>
                </div>
                {u.role === "ADMIN" && <RoleTag role={u.role} />}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Recently logged in */}
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <div style={{ position: "relative", flex: 1, minWidth: 220, maxWidth: 340 }}>
            <Search size={16} strokeWidth={2.5} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: muted(50) }} />
            <input className="input" placeholder="Search name, email or username…" value={q} onChange={(e) => setQ(e.target.value)} style={{ paddingLeft: 40, background: "var(--color-surface)" }} />
          </div>
          <span style={{ marginLeft: "auto", fontSize: 12, color: muted(55) }}>Ordered by most recent login</span>
        </div>

        {error && <div style={{ background: "var(--color-accent-100)", color: "var(--color-accent-800)", padding: "10px 14px", borderRadius: 14 }}>{error}</div>}

        <div style={{ background: "var(--color-surface)", borderRadius: 22, boxShadow: "var(--shadow-sm)", overflow: "hidden" }}>
          {loading ? (
            <div style={{ padding: 40 }}>
              <Spinner label="Loading users…" />
            </div>
          ) : recent.length === 0 ? (
            <div style={{ padding: 32, textAlign: "center", color: muted(55) }}>No users match your search.</div>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th style={{ textAlign: "right" }}>Points</th>
                  <th style={{ textAlign: "right" }}>Last login</th>
                  <th style={{ textAlign: "center" }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((u) => (
                  <tr key={u.id} style={{ cursor: "pointer" }} onClick={() => setDetailId(u.id)}>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <LiveDot on={isLive(u)} />
                        <Avatar user={u} size={30} />
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{u.name || "—"}</div>
                          {u.username && <div style={{ fontSize: 11.5, color: muted(50) }}>@{u.username}</div>}
                        </div>
                      </div>
                    </td>
                    <td style={{ color: muted(62) }}>{u.email}</td>
                    <td><RoleTag role={u.role} /></td>
                    <td style={{ textAlign: "right", fontVariantNumeric: "tabular-nums", color: muted(62) }}>{(u.points ?? 0).toLocaleString("en-IN")}</td>
                    <td style={{ textAlign: "right", color: muted(55), fontSize: 13 }}>{fmtRel(u.lastLoginAt)}</td>
                    <td style={{ textAlign: "center" }}>
                      {u.isActive ? (
                        <span className="tag tag-accent-2">Active</span>
                      ) : (
                        <span className="tag tag-neutral">Banned</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {detailId && (
        <UserDrawer
          userId={detailId}
          onClose={() => setDetailId(null)}
          onChanged={refresh}
          onDeleted={() => {
            setDetailId(null);
            refresh();
          }}
        />
      )}
    </div>
  );
}

function StatCell({ label, value }) {
  return (
    <div style={{ background: "var(--color-neutral-100)", borderRadius: 12, padding: "10px 12px" }}>
      <div style={{ fontFamily: "var(--font-heading)", fontSize: 18, lineHeight: 1 }}>{(value ?? 0).toLocaleString("en-IN")}</div>
      <div style={{ fontSize: 11, color: muted(55), marginTop: 4 }}>{label}</div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div style={{ display: "flex", gap: 12, padding: "8px 0", borderBottom: "1px solid var(--color-divider)", fontSize: 13 }}>
      <span style={{ width: 120, flex: "none", color: muted(55) }}>{label}</span>
      <span style={{ flex: 1, minWidth: 0, wordBreak: "break-word" }}>{children}</span>
    </div>
  );
}

// Full-detail slide-over. Every non-secret field the API returns is shown here.
function UserDrawer({ userId, onClose, onChanged, onDeleted }) {
  const [u, setU] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let active = true;
    setLoading(true);
    api
      .get(`/admin/users/${userId}`)
      .then(({ data }) => active && (setU(data.user), setError("")))
      .catch((e) => active && setError(e.response?.data?.message || "Failed to load user"))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [userId]);

  const toggleStatus = async () => {
    setBusy(true);
    setError("");
    try {
      const { data } = await api.patch(`/admin/users/${userId}/status`);
      setU((prev) => ({ ...prev, isActive: data.user.isActive }));
      onChanged?.();
    } catch (e) {
      setError(e.response?.data?.message || "Failed to update status");
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    if (!window.confirm(`Delete ${u?.name || u?.email}? This permanently removes the user and all their data. This cannot be undone.`)) return;
    setBusy(true);
    setError("");
    try {
      await api.delete(`/admin/users/${userId}`);
      onDeleted?.();
    } catch (e) {
      setError(e.response?.data?.message || "Failed to delete user");
      setBusy(false);
    }
  };

  const c = u?._count || {};

  return (
    <div
      onClick={onClose}
      style={{ position: "fixed", inset: 0, background: "color-mix(in srgb, #000 42%, transparent)", zIndex: 60, display: "flex", justifyContent: "flex-end" }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{ width: "min(480px, 100%)", height: "100%", background: "var(--color-bg)", boxShadow: "var(--shadow-lg, -8px 0 30px rgba(0,0,0,.2))", overflowY: "auto", padding: "22px 24px 40px" }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
          <h2 style={{ fontFamily: "var(--font-heading)", fontSize: 22, margin: 0 }}>User details</h2>
          <button className="btn btn-ghost btn-icon" style={{ width: 32, height: 32 }} onClick={onClose} aria-label="Close">
            <X size={17} strokeWidth={2.5} />
          </button>
        </div>

        {loading ? (
          <Spinner label="Loading…" />
        ) : error && !u ? (
          <div style={{ background: "var(--color-accent-100)", color: "var(--color-accent-800)", padding: "12px 16px", borderRadius: 14 }}>{error}</div>
        ) : u ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            {/* Identity header */}
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{ position: "relative", flex: "none" }}>
                <Avatar user={u} size={56} />
                {u.online && <span style={{ position: "absolute", bottom: 1, right: 1, width: 14, height: 14, borderRadius: "50%", background: "var(--color-accent-2-500)", border: "2.5px solid var(--color-bg)" }} />}
              </div>
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                  <span style={{ fontFamily: "var(--font-heading)", fontSize: 19 }}>{u.name}</span>
                  <RoleTag role={u.role} />
                </div>
                <div style={{ fontSize: 13, color: muted(58) }}>
                  {u.username ? `@${u.username} · ` : ""}
                  {u.online ? "Live now" : `seen ${fmtRel(u.lastSeenAt)}`}
                </div>
              </div>
            </div>

            {error && <div style={{ background: "var(--color-accent-100)", color: "var(--color-accent-800)", padding: "10px 14px", borderRadius: 12, fontSize: 13 }}>{error}</div>}

            {/* Actions */}
            <div style={{ display: "flex", gap: 10 }}>
              <button className="btn btn-secondary" style={{ gap: 7 }} disabled={busy} onClick={toggleStatus}>
                {u.isActive ? <><Ban size={15} strokeWidth={2.5} /> Ban user</> : <><CheckCircle2 size={15} strokeWidth={2.5} /> Reactivate</>}
              </button>
              <button className="btn btn-ghost" style={{ gap: 7, color: "var(--color-accent-800)", marginLeft: "auto" }} disabled={busy} onClick={remove}>
                <Trash2 size={15} strokeWidth={2.5} /> Delete
              </button>
            </div>

            {/* Activity stats */}
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: muted(58), textTransform: "uppercase", letterSpacing: ".06em", margin: "2px 0 10px" }}>Activity</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
                <StatCell label="Points" value={u.points} />
                <StatCell label="Submissions" value={c.submissions} />
                <StatCell label="Solved" value={c.problemSolved} />
                <StatCell label="Solutions" value={c.solutions} />
                <StatCell label="Discussions" value={c.discussions} />
                <StatCell label="Comments" value={c.comments} />
                <StatCell label="Contests" value={c.contestParticipants} />
                <StatCell label="Followers" value={c.followers} />
                <StatCell label="Following" value={c.following} />
              </div>
            </div>

            {/* Account fields */}
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: muted(58), textTransform: "uppercase", letterSpacing: ".06em", margin: "2px 0 4px" }}>Account</div>
              <Field label="User ID"><code style={{ fontSize: 12 }}>{u.id}</code></Field>
              <Field label="Email">
                <span style={{ display: "inline-flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                  <Mail size={13} style={{ color: muted(50) }} /> {u.email}
                  {u.emailVerified ? (
                    <span className="tag tag-accent-2" style={{ fontSize: 10 }}>Verified</span>
                  ) : (
                    <span className="tag tag-neutral" style={{ fontSize: 10 }}>Unverified</span>
                  )}
                </span>
              </Field>
              <Field label="Status">{u.isActive ? <span className="tag tag-accent-2">Active</span> : <span className="tag tag-neutral">Banned</span>}</Field>
              {u.bio && <Field label="Bio">{u.bio}</Field>}
              {u.githubUrl && (
                <Field label="GitHub">
                  <a href={u.githubUrl} target="_blank" rel="noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "var(--color-accent-800)" }}>
                    <Github size={13} /> {u.githubUrl}
                  </a>
                </Field>
              )}
              {u.websiteUrl && (
                <Field label="Website">
                  <a href={u.websiteUrl} target="_blank" rel="noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "var(--color-accent-800)" }}>
                    <Globe size={13} /> {u.websiteUrl}
                  </a>
                </Field>
              )}
              <Field label="OAuth">
                {u.oauthAccounts?.length ? u.oauthAccounts.map((o) => <span key={o.provider} className="tag tag-neutral" style={{ marginRight: 6 }}>{o.provider}</span>) : <span style={{ color: muted(50) }}>Password login</span>}
              </Field>
              {(u.donationCount > 0 || u.totalDonated > 0) && (
                <Field label="Donated">₹{Math.round(u.totalDonated).toLocaleString("en-IN")} · {u.donationCount} payment{u.donationCount === 1 ? "" : "s"}</Field>
              )}
            </div>

            {/* Timeline */}
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: muted(58), textTransform: "uppercase", letterSpacing: ".06em", margin: "2px 0 4px" }}>Timeline</div>
              <Field label="Joined">{fmtDateTime(u.createdAt)}</Field>
              <Field label="Last login">{fmtDateTime(u.lastLoginAt)}</Field>
              <Field label="Last seen">{fmtDateTime(u.lastSeenAt)}</Field>
              <Field label="Updated">{fmtDateTime(u.updatedAt)}</Field>
            </div>

            {/* Recent submissions */}
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: muted(58), textTransform: "uppercase", letterSpacing: ".06em", margin: "2px 0 10px" }}>Recent submissions</div>
              {u.recentSubmissions?.length ? (
                <div style={{ border: "1px solid var(--color-divider)", borderRadius: 12, overflow: "hidden" }}>
                  {u.recentSubmissions.map((s, i) => (
                    <div key={s.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 12px", borderBottom: i === u.recentSubmissions.length - 1 ? "none" : "1px solid var(--color-divider)" }}>
                      <span style={{ flex: 1, minWidth: 0, fontSize: 13, fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{s.problem?.title || "—"}</span>
                      <span style={{ fontSize: 11, fontWeight: 700, color: s.status === "Accepted" ? "var(--color-accent-2-700)" : muted(55) }}>{s.status}</span>
                      <span style={{ fontSize: 11, color: muted(45), display: "inline-flex", alignItems: "center", gap: 4 }}><Clock size={11} /> {fmtRel(s.createdAt)}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ padding: "12px 0", textAlign: "center", color: muted(50), fontSize: 13 }}>No submissions yet.</div>
              )}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
