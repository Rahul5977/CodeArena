import { Link } from "react-router-dom";
import { ArrowRight, Clock, Check, X } from "lucide-react";

// Direction 1a — "editorial hub": calm, roomy, one clear next action.
// Mock data for now; Phase 3/5 wires this to /dashboard, /submissions, /problems.
const RECENT = [
  { title: "Merge k Sorted Lists", diff: "Hard", lang: "Python", when: "2m ago", ok: true },
  { title: "Word Break", diff: "Medium", lang: "Java", when: "1h ago", ok: true },
  { title: "Trapping Rain Water", diff: "Hard", lang: "C++", when: "3h ago", ok: false },
  { title: "Two Sum", diff: "Easy", lang: "Python", when: "5h ago", ok: true },
  { title: "Valid Parentheses", diff: "Easy", lang: "JS", when: "Yesterday", ok: true },
];
const RECOMMENDED = [
  { title: "LRU Cache", tags: "Design · Hash Table", diff: "Medium" },
  { title: "Course Schedule", tags: "Graph · DFS", diff: "Medium" },
  { title: "Number of Islands", tags: "Graph · BFS", diff: "Medium" },
  { title: "Coin Change", tags: "Dynamic Programming", diff: "Medium" },
];

const DIFF = {
  Easy: { bg: "var(--color-accent-2-100)", fg: "var(--color-accent-2-800)" },
  Medium: { bg: "var(--color-accent-100)", fg: "var(--color-accent-800)" },
  Hard: { bg: "var(--color-accent-200)", fg: "var(--color-accent-900)" },
};

function Pill({ diff }) {
  const d = DIFF[diff] || DIFF.Medium;
  return <span style={{ fontSize: 11, padding: "2px 9px", borderRadius: 999, background: d.bg, color: d.fg, fontWeight: 600 }}>{diff}</span>;
}

// Seeded activity heatmap (7 rows × 22 weeks), matching the design's generator.
function heatmap() {
  let seed = 7;
  const rnd = () => { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; };
  const colors = ["var(--color-neutral-200)", "var(--color-accent-200)", "var(--color-accent-300)", "var(--color-accent-500)", "var(--color-accent-700)"];
  const cells = [];
  for (let i = 0; i < 7 * 22; i++) {
    const r = rnd();
    let lvl = 0;
    if (r > 0.42) lvl = 1;
    if (r > 0.64) lvl = 2;
    if (r > 0.82) lvl = 3;
    if (r > 0.93) lvl = 4;
    cells.push(colors[lvl]);
  }
  return cells;
}

const surface = { background: "var(--color-surface)", borderRadius: 24, boxShadow: "var(--shadow-sm)" };
const muted = (p = 60) => `color-mix(in srgb, var(--color-text) ${p}%, transparent)`;

export default function Dashboard() {
  const cells = heatmap();
  return (
    <div style={{ maxWidth: 1120 }}>
      <div style={{ marginBottom: 22 }}>
        <h1 style={{ fontFamily: "var(--font-heading)", fontSize: 34, lineHeight: 1.05, margin: "0 0 6px", letterSpacing: "-0.01em" }}>Good afternoon, Alex</h1>
        <p style={{ margin: 0, fontSize: 15, color: muted(68) }}>You've solved 3 problems today — 2 more to reach your daily goal.</p>
      </div>

      {/* Resume + daily challenge */}
      <div style={{ display: "grid", gridTemplateColumns: "1.7fr 1fr", gap: 18, marginBottom: 18 }}>
        <div style={{ position: "relative", background: "var(--color-surface)", borderRadius: 26, boxShadow: "var(--shadow-sm)", padding: "24px 26px", overflow: "hidden" }}>
          <div style={{ position: "absolute", right: -70, top: -70, width: 200, height: 200, borderRadius: "50%", background: "var(--color-accent-2-200)", opacity: 0.55 }} />
          <div style={{ position: "relative" }}>
            <div style={{ fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--color-accent-700)", fontWeight: 600, marginBottom: 12 }}>Pick up where you left off</div>
            <h2 style={{ fontFamily: "var(--font-heading)", fontSize: 26, margin: "0 0 10px" }}>Merge k Sorted Lists</h2>
            <div style={{ display: "flex", gap: 7, marginBottom: 16 }}>
              <Pill diff="Hard" />
              <span style={{ fontSize: 11, padding: "3px 11px", borderRadius: 999, background: "var(--color-neutral-200)", color: "var(--color-neutral-800)" }}>Heap</span>
              <span style={{ fontSize: 11, padding: "3px 11px", borderRadius: 999, background: "var(--color-neutral-200)", color: "var(--color-neutral-800)" }}>Linked List</span>
            </div>
            <div style={{ fontSize: 12, color: muted(60), marginBottom: 8 }}>Attempt 2 · 3 of 8 tests passing</div>
            <div style={{ height: 7, borderRadius: 999, background: "var(--color-neutral-200)", overflow: "hidden", maxWidth: 340, marginBottom: 20 }}>
              <div style={{ width: "37%", height: "100%", background: "var(--color-accent)", borderRadius: 999 }} />
            </div>
            <Link to="/problems/merge-k-sorted-lists" className="btn btn-primary" style={{ textDecoration: "none", padding: "10px 20px", fontSize: 14 }}>
              Resume solving <ArrowRight size={15} strokeWidth={2.75} />
            </Link>
          </div>
        </div>

        <div style={{ background: "var(--color-accent-100)", borderRadius: 26, padding: "24px", display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--color-accent-700)", fontWeight: 600, marginBottom: 12 }}>Daily challenge</div>
          <h2 style={{ fontFamily: "var(--font-heading)", fontSize: 23, margin: "0 0 8px", color: "var(--color-accent-900)" }}>Word Ladder II</h2>
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "var(--color-accent-800)", marginBottom: 6 }}>
            <Clock size={15} strokeWidth={2.5} /> Ends in 6h 12m · +50 XP
          </div>
          <div style={{ flex: 1 }} />
          <Link to="/problems/word-ladder-ii" className="btn btn-primary" style={{ textDecoration: "none", justifyContent: "center", padding: 10, fontSize: 14, marginTop: 14 }}>Start challenge</Link>
        </div>
      </div>

      {/* Stat cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 18 }}>
        <Stat label="Problems solved" value="247" note="+3 today" noteColor="var(--color-accent-2-700)" valueColor="var(--color-accent-2-700)" />
        <Stat label="Day streak" value="12" note="Longest 34 days" valueColor="var(--color-accent)" />
        <Stat label="Submissions" value="512" note="68% accepted" />
        <Stat label="Global rank" value="#1,284" note="Top 8%" noteColor="var(--color-accent-2-700)" />
      </div>

      {/* Recent + recommended */}
      <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 18, marginBottom: 18 }}>
        <div style={{ ...surface, padding: "20px 22px" }}>
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 14 }}>
            <h3 style={{ fontFamily: "var(--font-heading)", fontSize: 18, margin: 0 }}>Recent submissions</h3>
            <Link to="/submissions" style={{ fontSize: 12, color: "var(--color-accent-700)", textDecoration: "none", fontWeight: 600 }}>View all</Link>
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            {RECENT.map((r, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "9px 6px", borderBottom: i < RECENT.length - 1 ? "1px solid color-mix(in srgb, var(--color-text) 7%, transparent)" : "none" }}>
                <span style={{ width: 22, height: 22, borderRadius: "50%", flex: "none", display: "flex", alignItems: "center", justifyContent: "center", background: r.ok ? "var(--color-accent-2-200)" : "var(--color-neutral-300)", color: r.ok ? "var(--color-accent-2-800)" : "var(--color-neutral-800)" }}>
                  {r.ok ? <Check size={13} strokeWidth={3} /> : <X size={12} strokeWidth={3} />}
                </span>
                <span style={{ flex: 1, fontSize: 14, fontWeight: 500 }}>{r.title}</span>
                <Pill diff={r.diff} />
                <span style={{ fontSize: 12, color: muted(55), width: 66 }}>{r.lang}</span>
                <span style={{ fontSize: 12, color: muted(45), width: 74, textAlign: "right" }}>{r.when}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ ...surface, padding: "20px 22px" }}>
          <h3 style={{ fontFamily: "var(--font-heading)", fontSize: 18, margin: "0 0 14px" }}>Recommended</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {RECOMMENDED.map((p, i) => (
              <Link key={i} to="/problems" className="hover-row" style={{ display: "flex", alignItems: "center", gap: 12, textDecoration: "none", color: "inherit", padding: 8, borderRadius: 14 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 3 }}>{p.title}</div>
                  <div style={{ fontSize: 11, color: muted(55) }}>{p.tags}</div>
                </div>
                <Pill diff={p.diff} />
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Activity heatmap */}
      <div style={{ ...surface, padding: "20px 22px" }}>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 16 }}>
          <h3 style={{ fontFamily: "var(--font-heading)", fontSize: 18, margin: 0 }}>Activity</h3>
          <span style={{ fontSize: 12, color: muted(55) }}>247 solved in the last year</span>
        </div>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 16 }}>
          <div style={{ display: "grid", gridTemplateRows: "repeat(7,12px)", gridAutoFlow: "column", gridAutoColumns: 12, gap: 4 }}>
            {cells.map((c, i) => <div key={i} style={{ width: 12, height: 12, borderRadius: 3, background: c }} />)}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: muted(50), marginLeft: "auto" }}>
            Less
            {["var(--color-neutral-200)", "var(--color-accent-200)", "var(--color-accent-300)", "var(--color-accent-500)", "var(--color-accent-700)"].map((c) => (
              <span key={c} style={{ width: 11, height: 11, borderRadius: 3, background: c }} />
            ))}
            More
          </div>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, note, valueColor, noteColor }) {
  return (
    <div style={{ background: "var(--color-surface)", borderRadius: 20, boxShadow: "var(--shadow-sm)", padding: "18px 20px" }}>
      <div style={{ fontSize: 12, color: muted(60), marginBottom: 8 }}>{label}</div>
      <div style={{ fontFamily: "var(--font-heading)", fontSize: 34, lineHeight: 1, color: valueColor || "var(--color-text)" }}>{value}</div>
      <div style={{ fontSize: 11, color: noteColor || muted(55), marginTop: 7, fontWeight: noteColor ? 600 : 400 }}>{note}</div>
    </div>
  );
}
