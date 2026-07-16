import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Trophy, Clock, ArrowLeft, Users, ListChecks, CheckCircle2 } from "lucide-react";
import { api } from "../lib/api.js";
import Spinner from "../components/Spinner.jsx";

const muted = (p = 60) => `color-mix(in srgb, var(--color-text) ${p}%, transparent)`;
const surface = { background: "var(--color-surface)", borderRadius: 22, boxShadow: "var(--shadow-sm)" };
const STATUS = {
  LIVE: { bg: "var(--color-accent-100)", fg: "var(--color-accent-800)", label: "Live" },
  UPCOMING: { bg: "var(--color-accent-2-100)", fg: "var(--color-accent-2-800)", label: "Upcoming" },
  COMPLETED: { bg: "var(--color-neutral-200)", fg: "var(--color-neutral-800)", label: "Completed" },
  CANCELLED: { bg: "var(--color-neutral-200)", fg: "var(--color-neutral-700)", label: "Cancelled" },
};
const DIFF = {
  EASY: { bg: "var(--color-accent-2-100)", fg: "var(--color-accent-2-800)", label: "Easy" },
  MEDIUM: { bg: "var(--color-accent-100)", fg: "var(--color-accent-800)", label: "Medium" },
  HARD: { bg: "var(--color-accent-200)", fg: "var(--color-accent-900)", label: "Hard" },
};
const PODIUM = ["var(--color-accent)", "var(--color-accent-2-500)", "var(--color-accent-400)"];
const initials = (n) => (n || "?").split(" ").map((s) => s[0]).slice(0, 2).join("").toUpperCase();
const fmt = (iso) => (iso ? new Date(iso).toLocaleString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) : "");

export default function Contests() {
  const { id } = useParams();
  return id ? <ContestDetail id={id} /> : <ContestList />;
}

function ContestList() {
  const [contests, setContests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    api
      .get("/contests")
      .then(({ data }) => active && setContests(data.contests || data.data || []))
      .catch(() => active && setContests([]))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  if (loading) return <Spinner label="Loading contests…" full />;

  if (contests.length === 0) {
    return (
      <div style={{ ...surface, maxWidth: 560, padding: "40px 44px", textAlign: "center", color: muted(60) }}>
        <Trophy size={26} strokeWidth={2.5} color="var(--color-accent)" style={{ marginBottom: 12 }} />
        <div>No contests scheduled yet. Timed challenges with a live leaderboard are coming.</div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1000, display: "flex", flexDirection: "column", gap: 14 }}>
      {contests.map((c) => {
        const st = STATUS[c.status] || STATUS.UPCOMING;
        return (
          <Link key={c.id} to={`/contests/${c.id}`} style={{ textDecoration: "none", color: "inherit" }}>
            <div style={{ ...surface, padding: "20px 24px", display: "flex", alignItems: "center", gap: 18 }}>
              <span style={{ width: 44, height: 44, borderRadius: 12, background: "var(--color-accent-100)", color: "var(--color-accent-700)", display: "flex", alignItems: "center", justifyContent: "center", flex: "none" }}><Trophy size={20} strokeWidth={2.5} /></span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: "var(--font-heading)", fontSize: 18 }}>{c.title}</div>
                <div style={{ fontSize: 13, color: muted(60), display: "flex", gap: 12, marginTop: 3 }}>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}><Clock size={13} /> {fmt(c.startTime)}</span>
                  {c.duration ? <span>{c.duration} min</span> : null}
                  {Array.isArray(c.problemIds) ? <span>{c.problemIds.length} problems</span> : null}
                </div>
              </div>
              <span style={{ fontSize: 11, padding: "4px 12px", borderRadius: 999, background: st.bg, color: st.fg, fontWeight: 700, flex: "none" }}>{st.label}</span>
            </div>
          </Link>
        );
      })}
    </div>
  );
}

function ContestDetail({ id }) {
  const [contest, setContest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tab, setTab] = useState("problems"); // problems | leaderboard
  const [registering, setRegistering] = useState(false);
  const [regError, setRegError] = useState("");

  const load = () => {
    return api
      .get(`/contests/${id}`)
      .then(({ data }) => setContest(data.contest))
      .catch((e) => setError(e.response?.data?.message || "Failed to load contest"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    let active = true;
    setLoading(true);
    api
      .get(`/contests/${id}`)
      .then(({ data }) => active && setContest(data.contest))
      .catch((e) => active && setError(e.response?.data?.message || "Failed to load contest"))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [id]);

  const register = async () => {
    setRegistering(true);
    setRegError("");
    try {
      await api.post(`/contests/${id}/register`);
      await load();
    } catch (e) {
      setRegError(e.response?.data?.message || "Could not register for this contest.");
    } finally {
      setRegistering(false);
    }
  };

  if (loading) return <Spinner label="Loading contest…" full />;
  if (error || !contest) {
    return (
      <div style={{ maxWidth: 820 }}>
        <BackLink />
        <div style={{ ...surface, padding: "40px 44px", textAlign: "center", color: muted(60) }}>{error || "Contest not found."}</div>
      </div>
    );
  }

  const st = STATUS[contest.status] || STATUS.UPCOMING;
  const problems = contest.problems || [];

  return (
    <div style={{ maxWidth: 900 }}>
      <BackLink />

      <div style={{ ...surface, padding: "26px 28px", marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
          <span style={{ width: 48, height: 48, borderRadius: 14, background: "var(--color-accent-100)", color: "var(--color-accent-700)", display: "flex", alignItems: "center", justifyContent: "center", flex: "none" }}><Trophy size={22} strokeWidth={2.5} /></span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
              <h1 style={{ fontFamily: "var(--font-heading)", fontSize: 26, margin: 0 }}>{contest.title}</h1>
              <span style={{ fontSize: 11, padding: "4px 12px", borderRadius: 999, background: st.bg, color: st.fg, fontWeight: 700 }}>{st.label}</span>
            </div>
            {contest.description && <p style={{ fontSize: 14.5, lineHeight: 1.6, color: muted(80), margin: "10px 0 0" }}>{contest.description}</p>}
            <div style={{ display: "flex", gap: 18, flexWrap: "wrap", marginTop: 14, fontSize: 13, color: muted(65) }}>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}><Clock size={14} /> {fmt(contest.startTime)} – {fmt(contest.endTime)}</span>
              {contest.duration ? <span>{contest.duration} min</span> : null}
              <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}><Users size={14} /> {contest.participantCount ?? 0} registered</span>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}><ListChecks size={14} /> {contest.problemIds?.length ?? problems.length} problems</span>
            </div>
          </div>
          <div style={{ flex: "none", textAlign: "right" }}>
            {contest.isRegistered ? (
              <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, padding: "6px 14px", borderRadius: 999, background: "var(--color-accent-2-100)", color: "var(--color-accent-2-800)", fontWeight: 700 }}>
                <CheckCircle2 size={14} strokeWidth={2.5} /> Registered
              </span>
            ) : contest.status === "UPCOMING" ? (
              <button className="btn btn-primary" onClick={register} disabled={registering}>{registering ? "Registering…" : "Register"}</button>
            ) : null}
          </div>
        </div>
        {regError && <div style={{ marginTop: 12, fontSize: 13, color: "var(--color-accent-800)" }}>{regError}</div>}
      </div>

      {/* Tabs */}
      <div className="seg" style={{ background: "var(--color-surface)", marginBottom: 16 }}>
        {[["problems", "Problems"], ["leaderboard", "Leaderboard"]].map(([v, label]) => (
          <label key={v} className="seg-opt">
            <input type="radio" name="contest-tab" checked={tab === v} onChange={() => setTab(v)} />
            <span>{label}</span>
          </label>
        ))}
      </div>

      {tab === "problems" ? (
        <ProblemsTab contest={contest} problems={problems} />
      ) : (
        <ContestLeaderboard id={id} live={contest.status === "LIVE"} />
      )}
    </div>
  );
}

function BackLink() {
  return (
    <Link to="/contests" style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 13, color: "var(--color-accent-700)", textDecoration: "none", fontWeight: 600, marginBottom: 14 }}>
      <ArrowLeft size={15} strokeWidth={2.75} /> All contests
    </Link>
  );
}

function ProblemsTab({ contest, problems }) {
  if (!contest.isRegistered || contest.status !== "LIVE") {
    const msg =
      contest.status === "COMPLETED"
        ? "This contest has ended."
        : contest.status === "CANCELLED"
        ? "This contest was cancelled."
        : contest.isRegistered
        ? "You're registered — problems unlock when the contest starts."
        : "Register and wait for the contest to start to view its problems.";
    return <div style={{ ...surface, padding: "36px 40px", textAlign: "center", color: muted(60) }}>{msg}</div>;
  }
  if (problems.length === 0) {
    return <div style={{ ...surface, padding: "36px 40px", textAlign: "center", color: muted(60) }}>No problems in this contest yet.</div>;
  }
  return (
    <div style={{ ...surface, overflow: "hidden" }}>
      <table className="table">
        <thead>
          <tr>
            <th style={{ width: 44 }}>#</th>
            <th>Problem</th>
            <th style={{ textAlign: "right", width: 120 }}>Difficulty</th>
          </tr>
        </thead>
        <tbody>
          {problems.map((p, i) => {
            const d = DIFF[p.difficulty] || DIFF.MEDIUM;
            return (
              <tr key={p.id}>
                <td style={{ color: muted(55), fontVariantNumeric: "tabular-nums" }}>{i + 1}</td>
                <td>
                  <Link to={`/contests/${contest.id}/problems/${p.id}`} style={{ fontWeight: 600, color: "var(--color-accent-800)", textDecoration: "none" }}>{p.title}</Link>
                </td>
                <td style={{ textAlign: "right" }}>
                  <span style={{ fontSize: 11, padding: "3px 11px", borderRadius: 999, background: d.bg, color: d.fg, fontWeight: 600 }}>{d.label}</span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function ContestLeaderboard({ id, live }) {
  const [rows, setRows] = useState(null);

  useEffect(() => {
    let active = true;
    const fetchBoard = () =>
      api
        .get(`/contests/${id}/leaderboard`)
        .then(({ data }) => active && setRows(data.leaderboard || []))
        .catch(() => active && setRows([]));
    fetchBoard();
    // While the contest is live, keep the board fresh.
    const timer = live ? setInterval(fetchBoard, 10000) : null;
    return () => {
      active = false;
      if (timer) clearInterval(timer);
    };
  }, [id, live]);

  if (rows === null) return <Spinner label="Loading leaderboard…" />;
  if (rows.length === 0) {
    return <div style={{ ...surface, padding: "36px 40px", textAlign: "center", color: muted(60) }}>No submissions yet.</div>;
  }

  const top3 = rows.slice(0, 3);
  const rest = rows.slice(3);

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14, marginBottom: 18 }}>
        {top3.map((u, i) => (
          <div key={u.userId} style={{ ...surface, padding: "22px 18px", textAlign: "center", order: i === 0 ? 2 : i === 1 ? 1 : 3, transform: i === 0 ? "scale(1.04)" : "none" }}>
            <div style={{ width: 52, height: 52, borderRadius: "50%", margin: "0 auto 10px", background: PODIUM[i], color: "var(--color-bg)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-heading)", fontSize: 18 }}>{initials(u.user?.name)}</div>
            <div style={{ fontSize: 12, fontWeight: 700, color: PODIUM[i] }}>#{u.rank}</div>
            <div style={{ fontFamily: "var(--font-heading)", fontSize: 16, margin: "3px 0" }}>{u.user?.name}</div>
            <div style={{ fontSize: 12, color: muted(55) }}>{u.totalScore} pts · {u.problemsSolved} solved</div>
          </div>
        ))}
      </div>

      {rest.length > 0 && (
        <div style={{ ...surface, overflow: "hidden" }}>
          <table className="table">
            <thead>
              <tr>
                <th style={{ width: 60 }}>Rank</th>
                <th>User</th>
                <th style={{ textAlign: "right" }}>Solved</th>
                <th style={{ textAlign: "right" }}>Penalty</th>
                <th style={{ textAlign: "right" }}>Score</th>
              </tr>
            </thead>
            <tbody>
              {rest.map((u) => (
                <tr key={u.userId}>
                  <td style={{ fontVariantNumeric: "tabular-nums", color: muted(60) }}>#{u.rank}</td>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{ width: 28, height: 28, borderRadius: "50%", background: "var(--color-accent-2-300)", color: "var(--color-accent-2-800)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700 }}>{initials(u.user?.name)}</span>
                      <span style={{ fontWeight: 600 }}>{u.user?.name}</span>
                      {u.user?.username && <span style={{ color: muted(45), fontSize: 12 }}>@{u.user.username}</span>}
                    </div>
                  </td>
                  <td style={{ textAlign: "right", fontWeight: 600 }}>{u.problemsSolved}</td>
                  <td style={{ textAlign: "right", color: muted(60), fontVariantNumeric: "tabular-nums" }}>{u.penalty}</td>
                  <td style={{ textAlign: "right", fontWeight: 600 }}>{u.totalScore}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
