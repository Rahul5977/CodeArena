import { useEffect, useState } from "react";
import { Trophy, Clock } from "lucide-react";
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
const fmt = (iso) => (iso ? new Date(iso).toLocaleString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) : "");

export default function Contests() {
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
          <div key={c.id} style={{ ...surface, padding: "20px 24px", display: "flex", alignItems: "center", gap: 18 }}>
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
        );
      })}
    </div>
  );
}
