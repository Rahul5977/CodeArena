import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { api } from "../lib/api.js";
import Spinner from "./Spinner.jsx";

/* Create a contest. Mirrors Admin.jsx's visual language: muted() helper, surface
   card, .input/.btn classes, the DIFF Pill pattern for the problem picker. */

const muted = (p = 60) => `color-mix(in srgb, var(--color-text) ${p}%, transparent)`;

const DIFF = {
  EASY: { bg: "var(--color-accent-2-100)", fg: "var(--color-accent-2-800)", label: "Easy" },
  MEDIUM: { bg: "var(--color-accent-100)", fg: "var(--color-accent-800)", label: "Medium" },
  HARD: { bg: "var(--color-accent-200)", fg: "var(--color-accent-900)", label: "Hard" },
};

function Pill({ difficulty }) {
  const d = DIFF[difficulty] || DIFF.MEDIUM;
  return (
    <span style={{ fontSize: 11, padding: "2px 10px", borderRadius: 999, background: d.bg, color: d.fg, fontWeight: 600 }}>
      {d.label}
    </span>
  );
}

export default function ContestFormModal({ onClose, onSaved }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [duration, setDuration] = useState("");
  const [maxParticipants, setMaxParticipants] = useState("");
  const [problemIds, setProblemIds] = useState([]);

  const [problems, setProblems] = useState([]);
  const [loadingProblems, setLoadingProblems] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    api
      .get("/admin/content/problems", { params: { status: "published", limit: 100 } })
      .then(({ data }) => active && setProblems(data.problems || []))
      .catch((e) => active && setError(e.response?.data?.message || "Failed to load problems"))
      .finally(() => active && setLoadingProblems(false));
    return () => {
      active = false;
    };
  }, []);

  const toggleProblem = (id) =>
    setProblemIds((ids) => (ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id]));

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!startTime || !endTime || new Date(startTime) >= new Date(endTime)) {
      setError("Start time must be before end time.");
      return;
    }
    if (problemIds.length < 1) {
      setError("Select at least one problem.");
      return;
    }
    setSaving(true);
    try {
      await api.post("/contests/create", {
        title: title.trim(),
        description: description.trim(),
        startTime: new Date(startTime).toISOString(),
        endTime: new Date(endTime).toISOString(),
        duration: Number(duration),
        maxParticipants: maxParticipants ? Number(maxParticipants) : undefined,
        problemIds,
      });
      onSaved();
    } catch (e) {
      setError(e.response?.data?.error || e.response?.data?.message || "Failed to create contest");
    } finally {
      setSaving(false);
    }
  };

  const labelStyle = { display: "block", fontSize: 12, marginBottom: 5, color: muted(70) };

  return (
    <div
      onMouseDown={(e) => e.target === e.currentTarget && !saving && onClose()}
      style={{ position: "fixed", inset: 0, zIndex: 60, background: "color-mix(in srgb, var(--color-text) 45%, transparent)", display: "flex", alignItems: "flex-start", justifyContent: "center", padding: "40px 16px", overflowY: "auto" }}
    >
      <form
        onSubmit={onSubmit}
        onMouseDown={(e) => e.stopPropagation()}
        style={{ background: "var(--color-surface)", borderRadius: 22, boxShadow: "var(--shadow-sm)", width: "100%", maxWidth: 600, display: "flex", flexDirection: "column", maxHeight: "calc(100vh - 80px)" }}
      >
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 22px", borderBottom: "1px solid var(--color-divider)", flex: "none" }}>
          <h2 style={{ fontFamily: "var(--font-heading)", fontSize: 20, margin: 0 }}>New contest</h2>
          <button type="button" className="btn btn-ghost btn-icon" onClick={onClose} disabled={saving} aria-label="Close">
            <X size={17} strokeWidth={2.5} />
          </button>
        </div>

        {/* Scrollable body */}
        <div style={{ padding: "20px 22px", overflowY: "auto", display: "flex", flexDirection: "column", gap: 16 }}>
          {error && (
            <div style={{ background: "var(--color-accent-100)", color: "var(--color-accent-800)", padding: "10px 14px", borderRadius: 14, fontSize: 13 }}>
              {error}
            </div>
          )}

          <div>
            <label style={labelStyle}>Title</label>
            <input className="input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Weekly Contest 1" required />
          </div>
          <div>
            <label style={labelStyle}>Description</label>
            <textarea className="input" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} style={{ borderRadius: 14 }} />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <div>
              <label style={labelStyle}>Start time</label>
              <input className="input" type="datetime-local" value={startTime} onChange={(e) => setStartTime(e.target.value)} required />
            </div>
            <div>
              <label style={labelStyle}>End time</label>
              <input className="input" type="datetime-local" value={endTime} onChange={(e) => setEndTime(e.target.value)} required />
            </div>
            <div>
              <label style={labelStyle}>Duration (minutes)</label>
              <input className="input" type="number" min="1" value={duration} onChange={(e) => setDuration(e.target.value)} placeholder="90" required />
            </div>
            <div>
              <label style={labelStyle}>Max participants (optional)</label>
              <input className="input" type="number" min="1" value={maxParticipants} onChange={(e) => setMaxParticipants(e.target.value)} placeholder="No limit" />
            </div>
          </div>

          {/* Problem picker */}
          <div>
            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 8 }}>
              <label style={{ ...labelStyle, marginBottom: 0 }}>Problems</label>
              <span style={{ fontSize: 12, color: muted(55) }}>{problemIds.length} selected</span>
            </div>
            <div style={{ border: "1px solid var(--color-divider)", borderRadius: 14, maxHeight: 240, overflowY: "auto" }}>
              {loadingProblems ? (
                <div style={{ padding: 24 }}>
                  <Spinner label="Loading problems…" />
                </div>
              ) : problems.length === 0 ? (
                <div style={{ padding: 20, textAlign: "center", color: muted(55), fontSize: 13 }}>
                  No published problems yet. Publish a problem first.
                </div>
              ) : (
                problems.map((p) => (
                  <label
                    key={p.id}
                    style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", cursor: "pointer", borderBottom: "1px solid var(--color-divider)" }}
                  >
                    <input type="checkbox" checked={problemIds.includes(p.id)} onChange={() => toggleProblem(p.id)} />
                    <span style={{ flex: 1, minWidth: 0, fontSize: 14, fontWeight: 600 }}>{p.title}</span>
                    <Pill difficulty={p.difficulty} />
                  </label>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "16px 22px", borderTop: "1px solid var(--color-divider)", flex: "none" }}>
          <button type="button" className="btn btn-secondary" style={{ marginLeft: "auto" }} onClick={onClose} disabled={saving}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? "Creating…" : "Create contest"}
          </button>
        </div>
      </form>
    </div>
  );
}
