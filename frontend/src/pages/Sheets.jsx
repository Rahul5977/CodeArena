import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Library, Clock, ArrowLeft } from "lucide-react";
import { api } from "../lib/api.js";
import Spinner from "../components/Spinner.jsx";

const muted = (p = 60) => `color-mix(in srgb, var(--color-text) ${p}%, transparent)`;
const surface = { background: "var(--color-surface)", borderRadius: 22, boxShadow: "var(--shadow-sm)" };
const DIFF = {
  EASY: { bg: "var(--color-accent-2-100)", fg: "var(--color-accent-2-800)", label: "Easy" },
  MEDIUM: { bg: "var(--color-accent-100)", fg: "var(--color-accent-800)", label: "Medium" },
  HARD: { bg: "var(--color-accent-200)", fg: "var(--color-accent-900)", label: "Hard" },
};

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
      <div style={{ ...surface, maxWidth: 560, padding: "40px 44px", textAlign: "center", color: muted(60) }}>
        <Library size={26} strokeWidth={2.5} color="var(--color-accent)" style={{ marginBottom: 12 }} />
        <div>No study sheets yet — curated DSA sheets are on the way. <Link to="/problems" style={{ color: "var(--color-accent-700)", fontWeight: 600 }}>Browse problems →</Link></div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1080 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
        {sheets.map((s) => {
          const d = DIFF[s.difficulty] || DIFF.MEDIUM;
          return (
            <Link key={s.id} to={`/sheets/${s.id}`} className="hover-lift" style={{ ...surface, textDecoration: "none", color: "inherit", padding: "20px 22px", display: "block" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: 10 }}>
                <span style={{ width: 38, height: 38, borderRadius: 11, background: "var(--color-accent-100)", color: "var(--color-accent-700)", display: "flex", alignItems: "center", justifyContent: "center" }}><Library size={18} strokeWidth={2.5} /></span>
                <span style={{ fontSize: 11, padding: "2px 10px", borderRadius: 999, background: d.bg, color: d.fg, fontWeight: 600 }}>{d.label}</span>
              </div>
              <div style={{ fontFamily: "var(--font-heading)", fontSize: 18, marginBottom: 4 }}>{s.title}</div>
              <div style={{ fontSize: 13, color: muted(65), marginBottom: 12, lineHeight: 1.5 }}>{s.description}</div>
              <div style={{ display: "flex", gap: 14, fontSize: 12, color: muted(55) }}>
                <span>{(s.problemIds || []).length} problems</span>
                {s.estimatedHours ? <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}><Clock size={13} /> {s.estimatedHours}h</span> : null}
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
  if (!data?.sheet) return <div style={{ color: muted() }}>Sheet not found. <Link to="/sheets">All sheets</Link></div>;

  const s = data.sheet;
  const done = (data.progress || []).filter((p) => p.completed).length;
  const total = (s.problemIds || []).length;

  return (
    <div style={{ maxWidth: 760 }}>
      <Link to="/sheets" style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 13, color: "var(--color-accent-700)", textDecoration: "none", fontWeight: 600, marginBottom: 14 }}>
        <ArrowLeft size={15} strokeWidth={2.75} /> All sheets
      </Link>
      <div style={{ ...surface, padding: "26px 28px" }}>
        <h1 style={{ fontFamily: "var(--font-heading)", fontSize: 28, margin: "0 0 8px" }}>{s.title}</h1>
        <p style={{ color: muted(70), margin: "0 0 16px" }}>{s.description}</p>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 6 }}>
          <span style={{ color: muted(60) }}>{s.topic}</span>
          <span style={{ color: muted(55) }}>{done} / {total} done</span>
        </div>
        <div style={{ height: 8, borderRadius: 999, background: "var(--color-neutral-200)", overflow: "hidden" }}>
          <div style={{ width: `${total ? (done / total) * 100 : 0}%`, height: "100%", background: "var(--color-accent)", borderRadius: 999 }} />
        </div>
      </div>
    </div>
  );
}
