import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ListPlus, Trash2, ChevronDown, ChevronRight, Plus, X, FolderOpen } from "lucide-react";
import { api } from "../lib/api.js";
import Spinner from "../components/Spinner.jsx";

const DIFF = {
  EASY: { bg: "var(--color-accent-2-100)", fg: "var(--color-accent-2-800)", label: "Easy" },
  MEDIUM: { bg: "var(--color-accent-100)", fg: "var(--color-accent-800)", label: "Medium" },
  HARD: { bg: "var(--color-accent-200)", fg: "var(--color-accent-900)", label: "Hard" },
};
const muted = (p = 60) => `color-mix(in srgb, var(--color-text) ${p}%, transparent)`;

function Pill({ difficulty }) {
  const d = DIFF[difficulty] || DIFF.MEDIUM;
  return <span style={{ fontSize: 11, padding: "3px 11px", borderRadius: 999, background: d.bg, color: d.fg, fontWeight: 600 }}>{d.label}</span>;
}

export default function Playlists() {
  const [playlists, setPlaylists] = useState([]);
  const [allProblems, setAllProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [creating, setCreating] = useState(false);

  const [expandedId, setExpandedId] = useState(null);
  const [addChoice, setAddChoice] = useState("");
  const [busy, setBusy] = useState(false); // guards add/remove/delete while in flight

  async function load() {
    setError("");
    try {
      const [{ data: pl }, { data: pr }] = await Promise.all([
        api.get("/playlist/"),
        api.get("/problems/get-all-problems", { params: { limit: 100 } }),
      ]);
      setPlaylists(pl.playlists || []);
      setAllProblems(pr.problems || []);
    } catch (e) {
      setError(e.response?.data?.error || e.response?.data?.message || "Failed to load playlists");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function createPlaylist(e) {
    e.preventDefault();
    const title = name.trim();
    if (!title) return;
    setCreating(true);
    setError("");
    try {
      await api.post("/playlist/create", { name: title, description: description.trim() });
      setName("");
      setDescription("");
      await load();
    } catch (e) {
      setError(e.response?.data?.message || e.response?.data?.error || "Failed to create playlist");
    } finally {
      setCreating(false);
    }
  }

  async function deletePlaylist(id) {
    if (!window.confirm("Delete this playlist? This can't be undone.")) return;
    setBusy(true);
    setError("");
    try {
      await api.delete(`/playlist/${id}`);
      if (expandedId === id) setExpandedId(null);
      await load();
    } catch (e) {
      setError(e.response?.data?.error || "Failed to delete playlist");
    } finally {
      setBusy(false);
    }
  }

  async function addProblem(playlistId) {
    if (!addChoice) return;
    setBusy(true);
    setError("");
    try {
      await api.post(`/playlist/${playlistId}/add-problem`, { problemIds: [addChoice] });
      setAddChoice("");
      await load();
    } catch (e) {
      setError(e.response?.data?.error || "Failed to add problem");
    } finally {
      setBusy(false);
    }
  }

  async function removeProblem(playlistId, problemId) {
    setBusy(true);
    setError("");
    try {
      await api.delete(`/playlist/${playlistId}/remove-problem`, { data: { problemIds: [problemId] } });
      await load();
    } catch (e) {
      setError(e.response?.data?.error || "Failed to remove problem");
    } finally {
      setBusy(false);
    }
  }

  function toggle(id) {
    setAddChoice("");
    setExpandedId((cur) => (cur === id ? null : id));
  }

  if (loading) return <Spinner label="Loading playlists…" full />;

  return (
    <div style={{ maxWidth: 1080 }}>
      <div style={{ marginBottom: 18 }}>
        <h1 style={{ fontFamily: "var(--font-heading)", fontSize: 30, margin: "0 0 4px" }}>Playlists</h1>
        <p style={{ margin: 0, fontSize: 14, color: muted(60) }}>Curate your own problem lists and bookmarks.</p>
      </div>

      {error && (
        <div style={{ background: "var(--color-accent-100)", color: "var(--color-accent-800)", padding: "10px 14px", borderRadius: 14, marginBottom: 14 }}>{error}</div>
      )}

      {/* Create playlist */}
      <form
        onSubmit={createPlaylist}
        style={{ background: "var(--color-surface)", borderRadius: 22, boxShadow: "var(--shadow-sm)", padding: "18px 20px", marginBottom: 18, display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}
      >
        <ListPlus size={20} strokeWidth={2.5} style={{ color: "var(--color-accent-700)" }} />
        <input className="input" placeholder="New playlist name…" value={name} onChange={(e) => setName(e.target.value)} style={{ flex: 1, minWidth: 200 }} />
        <input className="input" placeholder="Description (optional)" value={description} onChange={(e) => setDescription(e.target.value)} style={{ flex: 1, minWidth: 200 }} />
        <button className="btn btn-primary" type="submit" disabled={creating || !name.trim()}>
          {creating ? "Creating…" : "Create"}
        </button>
      </form>

      {/* Playlists */}
      {playlists.length === 0 ? (
        <div style={{ background: "var(--color-surface)", borderRadius: 22, boxShadow: "var(--shadow-sm)", padding: 44, textAlign: "center", color: muted(60) }}>
          <FolderOpen size={30} strokeWidth={2} style={{ color: muted(40), marginBottom: 10 }} />
          <p style={{ margin: 0 }}>No playlists yet — create your first one above.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {playlists.map((pl) => {
            const problems = pl.problems || [];
            const inList = new Set(problems.map((p) => p.problem?.id));
            const available = allProblems.filter((p) => !inList.has(p.id));
            const open = expandedId === pl.id;
            return (
              <div key={pl.id} style={{ background: "var(--color-surface)", borderRadius: 22, boxShadow: "var(--shadow-sm)", overflow: "hidden" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "16px 20px" }}>
                  <button className="btn-icon" onClick={() => toggle(pl.id)} aria-label={open ? "Collapse" : "Expand"} title={open ? "Collapse" : "Expand"}>
                    {open ? <ChevronDown size={18} strokeWidth={2.5} /> : <ChevronRight size={18} strokeWidth={2.5} />}
                  </button>
                  <div style={{ flex: 1, minWidth: 0, cursor: "pointer" }} onClick={() => toggle(pl.id)}>
                    <div style={{ fontWeight: 700, fontSize: 16 }}>{pl.name}</div>
                    {pl.description && <div style={{ fontSize: 13, color: muted(58), marginTop: 2 }}>{pl.description}</div>}
                  </div>
                  <span className="tag tag-neutral">{problems.length} problem{problems.length === 1 ? "" : "s"}</span>
                  <button className="btn-icon" onClick={() => deletePlaylist(pl.id)} disabled={busy} aria-label="Delete playlist" title="Delete playlist" style={{ color: "var(--color-accent-700)" }}>
                    <Trash2 size={17} strokeWidth={2.5} />
                  </button>
                </div>

                {open && (
                  <div style={{ borderTop: "1px solid var(--color-border, rgba(0,0,0,0.06))", padding: "14px 20px 18px" }}>
                    {/* Add a problem */}
                    <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 14, flexWrap: "wrap" }}>
                      <select className="input" value={addChoice} onChange={(e) => setAddChoice(e.target.value)} style={{ flex: 1, minWidth: 220, maxWidth: 460 }}>
                        <option value="">{available.length ? "Add a problem to this playlist…" : "All problems already added"}</option>
                        {available.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.title} · {DIFF[p.difficulty]?.label || p.difficulty}
                          </option>
                        ))}
                      </select>
                      <button className="btn btn-secondary" onClick={() => addProblem(pl.id)} disabled={busy || !addChoice}>
                        <Plus size={15} strokeWidth={2.5} style={{ marginRight: 4 }} /> Add
                      </button>
                    </div>

                    {problems.length === 0 ? (
                      <div style={{ padding: "14px 0", textAlign: "center", color: muted(55), fontSize: 14 }}>No problems in this playlist yet.</div>
                    ) : (
                      <table className="table">
                        <thead>
                          <tr>
                            <th>Title</th>
                            <th style={{ width: 110 }}>Difficulty</th>
                            <th style={{ width: 60 }} />
                          </tr>
                        </thead>
                        <tbody>
                          {problems.map((row) => {
                            const p = row.problem;
                            if (!p) return null;
                            return (
                              <tr key={row.id}>
                                <td style={{ fontWeight: 600 }}>
                                  <Link to={`/problems/${p.slug}`} style={{ color: "inherit", textDecoration: "none" }}>{p.title}</Link>
                                </td>
                                <td><Pill difficulty={p.difficulty} /></td>
                                <td>
                                  <button className="btn-icon" onClick={() => removeProblem(pl.id, p.id)} disabled={busy} aria-label="Remove from playlist" title="Remove from playlist">
                                    <X size={16} strokeWidth={2.5} />
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
