import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Library, Clock, ArrowLeft, CheckCircle2, Circle, ChevronRight, ListChecks, Play, Check, Sparkles } from "lucide-react";
import { api } from "../lib/api.js";
import Spinner from "../components/Spinner.jsx";

const muted = (p = 60) => `color-mix(in srgb, var(--color-text) ${p}%, transparent)`;
const surface = { background: "var(--color-surface)", borderRadius: 24, boxShadow: "var(--shadow-sm)" };
const DIFF = {
  EASY: { bg: "var(--color-accent-2-100)", fg: "var(--color-accent-2-800)", label: "Easy" },
  MEDIUM: { bg: "var(--color-accent-100)", fg: "var(--color-accent-800)", label: "Medium" },
  HARD: { bg: "var(--color-accent-200)", fg: "var(--color-accent-900)", label: "Hard" },
};
const pct = (done, total) => (total > 0 ? Math.round((done / total) * 100) : 0);

// Circular progress ring — turns olive-green once complete.
function ProgressRing({ value = 0, size = 84, stroke = 9, children }) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const v = Math.max(0, Math.min(1, value));
  const done = v >= 1;
  const color = done ? "var(--color-accent-2-600)" : "var(--color-accent)";
  return (
    <div style={{ position: "relative", width: size, height: size, flex: "none" }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)", display: "block" }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="color-mix(in srgb, var(--color-text) 10%, transparent)" strokeWidth={stroke} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={circ * (1 - v)} style={{ transition: "stroke-dashoffset .55s cubic-bezier(.4,0,.2,1)" }} />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 1 }}>{children}</div>
    </div>
  );
}

// Slim inline bar used on list cards.
function ProgressBar({ done, total }) {
  const p = pct(done, total);
  const full = total > 0 && done >= total;
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: full ? "var(--color-accent-2-700)" : muted(62) }}>
          {full ? "Completed" : `${done} / ${total} solved`}
        </span>
        <span style={{ fontSize: 12, fontWeight: 700, color: full ? "var(--color-accent-2-700)" : "var(--color-accent-700)", fontVariantNumeric: "tabular-nums" }}>{p}%</span>
      </div>
      <div style={{ height: 7, borderRadius: 999, background: "color-mix(in srgb, var(--color-text) 9%, transparent)", overflow: "hidden" }}>
        <div style={{ width: `${p}%`, height: "100%", borderRadius: 999, background: full ? "var(--color-accent-2-500)" : "var(--color-accent)", transition: "width .5s cubic-bezier(.4,0,.2,1)" }} />
      </div>
    </div>
  );
}

export default function Sheets() {
  const { id } = useParams();
  return id ? <SheetDetail id={id} /> : <SheetList />;
}

function SheetList() {
  const [sheets, setSheets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    api.get("/sheets").then(({ data }) => active && setSheets(data.sheets || [])).catch(() => active && setSheets([])).finally(() => active && setLoading(false));
    return () => { active = false; };
  }, []);

  if (loading) return <Spinner label="Loading sheets…" full />;

  if (sheets.length === 0) {
    return (
      <div style={{ ...surface, maxWidth: 560, padding: "44px 46px", textAlign: "center", color: muted(62) }}>
        <span style={{ display: "inline-flex", width: 52, height: 52, borderRadius: 16, background: "var(--color-accent-100)", color: "var(--color-accent-700)", alignItems: "center", justifyContent: "center", marginBottom: 14 }}>
          <Library size={24} strokeWidth={2.5} />
        </span>
        <div style={{ fontSize: 15 }}>No study sheets yet — curated DSA paths are on the way. <Link to="/problems" style={{ color: "var(--color-accent-700)", fontWeight: 700 }}>Browse problems →</Link></div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1120 }}>
      <div style={{ marginBottom: 22 }}>
        <h1 style={{ fontFamily: "var(--font-heading)", fontSize: 32, lineHeight: 1.05, margin: "0 0 6px" }}>DSA Sheets</h1>
        <p style={{ margin: 0, fontSize: 15, color: muted(66) }}>Curated, day-by-day paths that take you from fundamentals to mastery.</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 18 }}>
        {sheets.map((s) => {
          const d = DIFF[s.difficulty] || DIFF.MEDIUM;
          const total = s.problemCount ?? (s.problemIds || []).length;
          const done = s.solvedCount ?? 0;
          const full = total > 0 && done >= total;
          return (
            <Link key={s.id} to={`/sheets/${s.id}`} className="hover-lift" style={{ ...surface, textDecoration: "none", color: "inherit", padding: "22px 24px", display: "flex", flexDirection: "column", gap: 14, position: "relative", overflow: "hidden" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10 }}>
                <span style={{ width: 44, height: 44, borderRadius: 13, background: full ? "var(--color-accent-2-100)" : "var(--color-accent-100)", color: full ? "var(--color-accent-2-700)" : "var(--color-accent-700)", display: "flex", alignItems: "center", justifyContent: "center", flex: "none" }}>
                  {full ? <Check size={22} strokeWidth={2.75} /> : <Library size={21} strokeWidth={2.5} />}
                </span>
                <span style={{ fontSize: 11, padding: "3px 11px", borderRadius: 999, background: d.bg, color: d.fg, fontWeight: 600, flex: "none" }}>{d.label}</span>
              </div>

              <div>
                <div style={{ fontFamily: "var(--font-heading)", fontSize: 19, lineHeight: 1.15, marginBottom: 5 }}>{s.title}</div>
                <div style={{ fontSize: 13.5, color: muted(66), lineHeight: 1.5, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{s.description}</div>
              </div>

              {total > 0 && <ProgressBar done={done} total={total} />}

              <div style={{ display: "flex", alignItems: "center", gap: 14, fontSize: 12.5, color: muted(58), marginTop: "auto", paddingTop: 2 }}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}><ListChecks size={14} /> {total} problems</span>
                {s.estimatedHours ? <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}><Clock size={14} /> {s.estimatedHours}h</span> : null}
                {s.topic ? <span style={{ marginLeft: "auto", fontSize: 11, padding: "2px 10px", borderRadius: 999, background: "var(--color-neutral-200)", color: "var(--color-neutral-800)", fontWeight: 600 }}>{s.topic}</span> : null}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

function SheetDetail({ id }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    api.get(`/sheets/${id}`).then(({ data }) => active && setData(data)).catch(() => active && setData(null)).finally(() => active && setLoading(false));
    return () => { active = false; };
  }, [id]);

  if (loading) return <Spinner label="Loading sheet…" full />;
  if (!data?.sheet) return <div style={{ color: muted() }}>Sheet not found. <Link to="/sheets" style={{ color: "var(--color-accent-700)", fontWeight: 600 }}>All sheets</Link></div>;

  const s = data.sheet;
  const days = data.days;
  // Fix: derive the real problem set from whatever is actually shown — the flat
  // list OR the day-by-day structure — so progress is never "0 / 0" on a
  // structured sheet whose top-level problemIds is empty.
  const allProblems = days && days.length ? days.flatMap((b) => b.problems) : (data.problems || []);
  const done = allProblems.filter((p) => p.solved).length;
  const total = allProblems.length;
  const nextProblem = allProblems.find((p) => !p.solved);
  const complete = total > 0 && done >= total;

  return (
    <div style={{ maxWidth: 820 }}>
      <Link to="/sheets" style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 13, color: "var(--color-accent-700)", textDecoration: "none", fontWeight: 600, marginBottom: 14 }}>
        <ArrowLeft size={15} strokeWidth={2.75} /> All sheets
      </Link>

      {/* Hero */}
      <div style={{ ...surface, padding: "28px 30px", marginBottom: 20, display: "flex", gap: 26, alignItems: "center", flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: 240 }}>
          <h1 style={{ fontFamily: "var(--font-heading)", fontSize: 30, margin: "0 0 10px", lineHeight: 1.08 }}>{s.title}</h1>
          {s.description && <p style={{ fontSize: 14.5, color: muted(72), lineHeight: 1.55, margin: "0 0 14px" }}>{s.description}</p>}
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
            {s.topic ? <span style={{ fontSize: 12, padding: "4px 12px", borderRadius: 999, background: "var(--color-accent-100)", color: "var(--color-accent-800)", fontWeight: 600 }}>{s.topic}</span> : null}
            {s.difficulty ? <span style={{ fontSize: 12, padding: "4px 12px", borderRadius: 999, background: (DIFF[s.difficulty] || DIFF.MEDIUM).bg, color: (DIFF[s.difficulty] || DIFF.MEDIUM).fg, fontWeight: 600 }}>{(DIFF[s.difficulty] || DIFF.MEDIUM).label}</span> : null}
            {s.estimatedHours ? <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 12.5, color: muted(60) }}><Clock size={14} /> {s.estimatedHours}h</span> : null}
            <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 12.5, color: muted(60) }}><ListChecks size={14} /> {total} problems</span>
          </div>
          {(s.prerequisites || []).length > 0 && (
            <div style={{ marginTop: 12, fontSize: 12.5, color: muted(58) }}>
              <span style={{ fontWeight: 600 }}>Prerequisites:</span> {(s.prerequisites || []).join(", ")}
            </div>
          )}
          {nextProblem ? (
            <Link to={`/sheets/${id}/${nextProblem.id}`} className="btn btn-primary" style={{ marginTop: 18, gap: 7, textDecoration: "none" }}>
              <Play size={15} strokeWidth={2.75} /> {done > 0 ? "Continue" : "Start solving"}
            </Link>
          ) : complete ? (
            <div style={{ marginTop: 18, display: "inline-flex", alignItems: "center", gap: 7, fontSize: 13, padding: "8px 15px", borderRadius: 999, background: "var(--color-accent-2-100)", color: "var(--color-accent-2-800)", fontWeight: 700 }}>
              <Sparkles size={15} strokeWidth={2.5} /> Sheet complete — nicely done!
            </div>
          ) : null}
        </div>
        <ProgressRing value={total ? done / total : 0} size={112} stroke={11}>
          <span style={{ fontFamily: "var(--font-heading)", fontSize: 26, lineHeight: 1, color: complete ? "var(--color-accent-2-700)" : "var(--color-text)" }}>{pct(done, total)}%</span>
          <span style={{ fontSize: 11.5, color: muted(55), fontVariantNumeric: "tabular-nums" }}>{done}/{total}</span>
        </ProgressRing>
      </div>

      {days && days.length ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          {days.map((blk, bi) => <DaySection key={`${blk.phaseIdx}-${blk.day}-${bi}`} blk={blk} sheetId={id} />)}
        </div>
      ) : allProblems.length === 0 ? (
        <div style={{ ...surface, padding: "30px 32px", textAlign: "center", color: muted(60) }}>No problems in this sheet yet.</div>
      ) : (
        <div style={{ ...surface, overflow: "hidden" }}>
          {allProblems.map((p, i) => <ProblemRow key={p.id} p={p} index={i} sheetId={id} last={i === allProblems.length - 1} />)}
        </div>
      )}
    </div>
  );
}

function DaySection({ blk, sheetId }) {
  const dn = blk.problems.filter((p) => p.solved).length;
  const dtotal = blk.problems.length;
  const dayDone = dtotal > 0 && dn >= dtotal;
  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "0 4px 9px", flexWrap: "wrap" }}>
        <span style={{ width: 26, height: 26, borderRadius: 9, flex: "none", display: "flex", alignItems: "center", justifyContent: "center", background: dayDone ? "var(--color-accent-2-500)" : "var(--color-accent-100)", color: dayDone ? "var(--color-bg)" : "var(--color-accent-700)" }}>
          {dayDone ? <Check size={15} strokeWidth={3} /> : <span style={{ fontSize: 12, fontWeight: 700 }}>{blk.day}</span>}
        </span>
        <span style={{ fontFamily: "var(--font-heading)", fontSize: 17 }}>{blk.phase ? `${blk.phase} · ` : ""}Day {blk.day}</span>
        {blk.focus ? <span style={{ fontSize: 13, color: muted(60) }}>{blk.focus}</span> : null}
        <span style={{ marginLeft: "auto", fontSize: 12, fontWeight: 700, color: dayDone ? "var(--color-accent-2-700)" : muted(52), fontVariantNumeric: "tabular-nums" }}>{dn}/{dtotal}</span>
      </div>
      <div style={{ ...surface, overflow: "hidden", ...(dayDone ? { boxShadow: "none", background: "color-mix(in srgb, var(--color-accent-2-100) 55%, var(--color-surface))" } : {}) }}>
        {blk.problems.map((p, i) => <ProblemRow key={p.id} p={p} index={i} sheetId={sheetId} last={i === blk.problems.length - 1} />)}
      </div>
    </div>
  );
}

function ProblemRow({ p, index, sheetId, last }) {
  const d = DIFF[p.difficulty] || DIFF.MEDIUM;
  return (
    <Link
      to={`/sheets/${sheetId}/${p.id}`}
      className="hover-row"
      style={{ display: "flex", alignItems: "center", gap: 13, padding: "13px 18px", textDecoration: "none", color: "inherit", borderBottom: last ? "none" : "1px solid color-mix(in srgb, var(--color-text) 7%, transparent)" }}
    >
      <span style={{ width: 22, color: muted(42), fontSize: 13, fontVariantNumeric: "tabular-nums", flex: "none" }}>{index + 1}</span>
      {p.solved ? <CheckCircle2 size={19} strokeWidth={2.5} color="var(--color-accent-2-600)" style={{ flex: "none" }} /> : <Circle size={19} strokeWidth={2} color={muted(26)} style={{ flex: "none" }} />}
      <span style={{ flex: 1, minWidth: 0, fontSize: 14.5, fontWeight: 500, color: p.solved ? muted(70) : "var(--color-text)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.title}</span>
      <span style={{ fontSize: 11, padding: "2px 11px", borderRadius: 999, background: d.bg, color: d.fg, fontWeight: 600, flex: "none" }}>{d.label}</span>
      <ChevronRight size={16} strokeWidth={2.5} color={muted(30)} style={{ flex: "none" }} />
    </Link>
  );
}
