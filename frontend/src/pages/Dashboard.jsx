import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Check, X, Flame } from "lucide-react";
import { api } from "../lib/api.js";
import { useAuth } from "../store/auth.js";
import Spinner from "../components/Spinner.jsx";

const DIFF = {
  EASY: { bg: "var(--color-accent-2-100)", fg: "var(--color-accent-2-800)", bar: "var(--color-accent-2-500)", label: "Easy" },
  MEDIUM: { bg: "var(--color-accent-100)", fg: "var(--color-accent-800)", bar: "var(--color-accent-500)", label: "Medium" },
  HARD: { bg: "var(--color-accent-200)", fg: "var(--color-accent-900)", bar: "var(--color-accent-800)", label: "Hard" },
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
const HEAT = ["var(--color-neutral-200)", "var(--color-accent-200)", "var(--color-accent-300)", "var(--color-accent-500)", "var(--color-accent-700)"];
const heatLevel = (c) => (c === 0 ? 0 : c === 1 ? 1 : c <= 3 ? 2 : c <= 5 ? 3 : 4);

export default function Dashboard() {
  const user = useAuth((s) => s.user);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    api
      .get("/dashboard")
      .then(({ data }) => active && setData(data))
      .catch(() => active && setData({ stats: {}, recent: [], heatmap: [], recommended: [] }))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  if (loading) return <Spinner label="Loading your dashboard…" full />;

  const s = data?.stats || {};
  const recent = data?.recent || [];
  const heatmap = data?.heatmap || [];
  const recommended = data?.recommended || [];
  const first = (user?.name || "there").split(" ")[0];
  const solvedInYear = heatmap.reduce((a, c) => a + (c.count || 0), 0);

  return (
    <div style={{ maxWidth: 1080 }}>
      <div style={{ marginBottom: 22 }}>
        <h1 style={{ fontFamily: "var(--font-heading)", fontSize: 32, lineHeight: 1.05, margin: "0 0 6px" }}>Welcome back, {first}</h1>
        <p style={{ margin: 0, fontSize: 15, color: muted(66) }}>
          {s.streak > 0
            ? `You're on a ${s.streak}-day streak — keep it alive by solving one today.`
            : s.solved
              ? `You've solved ${s.solved} of ${s.totalProblems} problems. Start a streak today.`
              : "Solve your first problem to get started."}
        </p>
      </div>

      {/* Stat cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 14, marginBottom: 18 }}>
        <Stat label="Problems solved" value={s.solved ?? 0} note={`of ${s.totalProblems ?? 0} published`} valueColor="var(--color-accent-2-700)" />
        <Stat label="Day streak" value={s.streak ?? 0} note={s.longestStreak ? `Longest ${s.longestStreak} days` : "Start today"} valueColor="var(--color-accent)" icon={<Flame size={18} strokeWidth={2.5} color="var(--color-accent)" />} />
        <Stat label="Submissions" value={s.submissions ?? 0} note={`${s.acceptanceRate ?? 0}% accepted`} />
        <Stat label="Global rank" value={s.rank ? `#${s.rank.toLocaleString("en-IN")}` : "—"} note={s.totalUsers ? `of ${s.totalUsers.toLocaleString("en-IN")} users` : ""} />
      </div>

      {/* Activity heatmap */}
      <div style={{ ...surface, padding: "20px 22px", marginBottom: 18 }}>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 16 }}>
          <h3 style={{ fontFamily: "var(--font-heading)", fontSize: 18, margin: 0 }}>Activity</h3>
          <span style={{ fontSize: 12, color: muted(55) }}>{solvedInYear} submissions in the last {Math.round(heatmap.length / 7)} weeks</span>
        </div>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 16, flexWrap: "wrap" }}>
          <div style={{ overflowX: "auto", maxWidth: "100%" }}>
            <div style={{ display: "grid", gridTemplateRows: "repeat(7, 12px)", gridAutoFlow: "column", gridAutoColumns: "12px", gap: 4 }}>
              {heatmap.map((c) => (
                <div key={c.date} title={`${c.date}: ${c.count} submission${c.count === 1 ? "" : "s"}`} style={{ width: 12, height: 12, borderRadius: 3, background: HEAT[heatLevel(c.count)] }} />
              ))}
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: muted(50), marginLeft: "auto" }}>
            Less
            {HEAT.map((c) => <span key={c} style={{ width: 11, height: 11, borderRadius: 3, background: c }} />)}
            More
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 18 }}>
        {/* Recent submissions */}
        <div style={{ ...surface, padding: "20px 22px" }}>
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 14 }}>
            <h3 style={{ fontFamily: "var(--font-heading)", fontSize: 18, margin: 0 }}>Recent submissions</h3>
            <Link to="/submissions" style={{ fontSize: 12, color: "var(--color-accent-700)", textDecoration: "none", fontWeight: 600 }}>View all</Link>
          </div>
          {recent.length === 0 ? (
            <div style={{ padding: "24px 0", textAlign: "center", color: muted(55) }}>
              No submissions yet.{" "}
              <Link to="/problems" style={{ color: "var(--color-accent-700)", fontWeight: 600 }}>Solve a problem →</Link>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column" }}>
              {recent.map((r, i) => {
                const ok = r.status === "Accepted";
                const dd = DIFF[r.difficulty] || DIFF.MEDIUM;
                return (
                  <Link key={r.id} to={r.slug ? `/problems/${r.slug}` : "#"} className="hover-row" style={{ display: "flex", alignItems: "center", gap: 12, padding: "9px 6px", textDecoration: "none", color: "inherit", borderBottom: i < recent.length - 1 ? "1px solid color-mix(in srgb, var(--color-text) 7%, transparent)" : "none" }}>
                    <span style={{ width: 22, height: 22, borderRadius: "50%", flex: "none", display: "flex", alignItems: "center", justifyContent: "center", background: ok ? "var(--color-accent-2-200)" : "var(--color-neutral-300)", color: ok ? "var(--color-accent-2-800)" : "var(--color-neutral-800)" }}>
                      {ok ? <Check size={13} strokeWidth={3} /> : <X size={12} strokeWidth={3} />}
                    </span>
                    <span style={{ flex: 1, fontSize: 14, fontWeight: 500 }}>{r.title}</span>
                    <span style={{ fontSize: 11, padding: "2px 9px", borderRadius: 999, background: dd.bg, color: dd.fg, fontWeight: 600 }}>{dd.label}</span>
                    <span style={{ fontSize: 12, color: muted(55), width: 66 }}>{r.language}</span>
                    <span style={{ fontSize: 12, color: muted(45), width: 74, textAlign: "right" }}>{timeAgo(r.when)}</span>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Right column: Recommended + difficulty + CTA */}
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div style={{ ...surface, padding: "20px 22px" }}>
            <h3 style={{ fontFamily: "var(--font-heading)", fontSize: 18, margin: "0 0 12px" }}>Recommended</h3>
            {recommended.length === 0 ? (
              <div style={{ fontSize: 13, color: muted(55), padding: "8px 0" }}>You've solved everything available. 🎉</div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                {recommended.map((p) => {
                  const dd = DIFF[p.difficulty] || DIFF.MEDIUM;
                  return (
                    <Link key={p.slug} to={`/problems/${p.slug}`} className="hover-row" style={{ display: "flex", alignItems: "center", gap: 12, textDecoration: "none", color: "inherit", padding: "8px 6px", borderRadius: 12 }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 3 }}>{p.title}</div>
                        <div style={{ fontSize: 11, color: muted(55) }}>{(p.tags || []).slice(0, 2).join(" · ") || "Practice"}</div>
                      </div>
                      <span style={{ fontSize: 11, padding: "2px 9px", borderRadius: 999, background: dd.bg, color: dd.fg, fontWeight: 600 }}>{dd.label}</span>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          <div style={{ ...surface, padding: "20px 22px" }}>
            <h3 style={{ fontFamily: "var(--font-heading)", fontSize: 18, margin: "0 0 14px" }}>Solved by difficulty</h3>
            {["EASY", "MEDIUM", "HARD"].map((k) => {
              const dd = DIFF[k];
              const val = s.byDifficulty?.[k] ?? 0;
              const total = s.totalProblems || 1;
              return (
                <div key={k} style={{ marginBottom: 12 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 5 }}>
                    <span style={{ color: dd.fg, fontWeight: 600 }}>{dd.label}</span>
                    <span style={{ color: muted(55) }}>{val} solved</span>
                  </div>
                  <div style={{ height: 8, borderRadius: 999, background: "var(--color-neutral-200)", overflow: "hidden" }}>
                    <div style={{ width: `${Math.min(100, (val / total) * 100)}%`, height: "100%", background: dd.bar, borderRadius: 999 }} />
                  </div>
                </div>
              );
            })}
          </div>

          <Link to="/problems" style={{ ...surface, textDecoration: "none", color: "var(--color-bg)", background: "var(--color-accent)", padding: "20px 22px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <div style={{ fontFamily: "var(--font-heading)", fontSize: 18, marginBottom: 2 }}>Browse problems</div>
              <div style={{ fontSize: 13, opacity: 0.85 }}>Pick your next challenge</div>
            </div>
            <ArrowRight size={22} strokeWidth={2.5} />
          </Link>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, note, valueColor, icon }) {
  return (
    <div style={{ background: "var(--color-surface)", borderRadius: 20, boxShadow: "var(--shadow-sm)", padding: "18px 20px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
        <div style={{ fontSize: 12, color: muted(60) }}>{label}</div>
        {icon || null}
      </div>
      <div style={{ fontFamily: "var(--font-heading)", fontSize: 32, lineHeight: 1, color: valueColor || "var(--color-text)" }}>{value}</div>
      <div style={{ fontSize: 11, color: muted(55), marginTop: 7 }}>{note}</div>
    </div>
  );
}
