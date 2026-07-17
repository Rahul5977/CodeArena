import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowBigUp, ArrowBigDown, Code2, Plus, X } from "lucide-react";
import BackLink from "../components/BackLink.jsx";
import { api } from "../lib/api.js";
import Spinner from "../components/Spinner.jsx";
import Markdown from "../components/Markdown.jsx";

const muted = (p = 60) => `color-mix(in srgb, var(--color-text) ${p}%, transparent)`;
const surface = { background: "var(--color-surface)", borderRadius: 22, boxShadow: "var(--shadow-sm)" };
const LANG_LABEL = { PYTHON: "Python", JAVASCRIPT: "JavaScript", JAVA: "Java", CPP: "C++", C: "C" };
const DEFAULT_LANGS = ["PYTHON", "JAVASCRIPT", "JAVA", "CPP", "C"];

const timeAgo = (iso) => {
  if (!iso) return "";
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  if (s < 2592000) return `${Math.floor(s / 86400)}d ago`;
  return new Date(iso).toLocaleDateString();
};

const pickList = (data, ...keys) => {
  for (const k of keys) if (Array.isArray(data?.[k])) return data[k];
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  return [];
};

const initialsOf = (name, username) =>
  (name || username || "?").split(" ").map((s) => s[0]).slice(0, 2).join("").toUpperCase();

export default function ProblemSolutions() {
  const { slug } = useParams();
  const [problem, setProblem] = useState(null);
  const [solutions, setSolutions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", body: "", language: "PYTHON", code: "" });
  const [busy, setBusy] = useState(false);
  const [formErr, setFormErr] = useState("");
  const [voteBusy, setVoteBusy] = useState(false);

  const fetchSolutions = (problemId) =>
    api.get(`/community/problems/${problemId}/solutions`).then(({ data }) => setSolutions(pickList(data, "solutions")));

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    api
      .get(`/problems/get-all-problems/${slug}`)
      .then(async ({ data }) => {
        if (!active) return;
        const p = data.problem;
        if (!p) throw new Error("not found");
        setProblem(p);
        const langs = Object.keys(p.codeSnippets || {});
        if (langs[0]) setForm((f) => ({ ...f, language: langs[0] }));
        await fetchSolutions(p.id);
      })
      .catch((e) => active && setError(e.response?.data?.error || "Could not load solutions"))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [slug]);

  const vote = async (solutionId, value) => {
    if (voteBusy || !problem) return;
    setVoteBusy(true);
    try {
      await api.post("/community/vote", { targetType: "solution", targetId: solutionId, value });
      await fetchSolutions(problem.id);
    } catch {
      /* ignore — refetch keeps counts honest */
    } finally {
      setVoteBusy(false);
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!problem || !form.title.trim() || !form.code.trim()) return;
    setBusy(true);
    setFormErr("");
    try {
      await api.post(`/community/problems/${problem.id}/solutions`, {
        title: form.title.trim(),
        body: form.body.trim(),
        language: form.language,
        code: form.code,
      });
      setForm((f) => ({ title: "", body: "", language: f.language, code: "" }));
      setShowForm(false);
      await fetchSolutions(problem.id);
    } catch (e2) {
      setFormErr(e2.response?.data?.message || e2.response?.data?.error || "Could not share solution");
    } finally {
      setBusy(false);
    }
  };

  if (loading) return <Spinner label="Loading solutions…" full />;
  if (error || !problem) {
    return (
      <div style={{ maxWidth: 820 }}>
        <BackLink fallback="/problems" label="All problems" />
        <div style={{ ...surface, padding: "40px 44px", textAlign: "center", color: muted(60) }}>{error || "Problem not found."}</div>
      </div>
    );
  }

  const langOpts = Object.keys(problem.codeSnippets || {});
  const options = langOpts.length ? langOpts : DEFAULT_LANGS;

  return (
    <div style={{ maxWidth: 820 }}>
      <BackLink fallback={`/problems/${slug}`} label="Back to editor" />

      <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 18 }}>
        <div style={{ minWidth: 0 }}>
          <h1 style={{ fontFamily: "var(--font-heading)", fontSize: 26, margin: "0 0 3px" }}>{problem.title}</h1>
          <div style={{ color: muted(60), fontSize: 14 }}>Community solutions</div>
        </div>
        <button className="btn btn-primary" style={{ marginLeft: "auto", gap: 6, flex: "none" }} onClick={() => setShowForm((v) => !v)}>
          {showForm ? <X size={16} strokeWidth={2.5} /> : <Plus size={16} strokeWidth={2.5} />} {showForm ? "Close" : "Share your solution"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={submit} style={{ ...surface, padding: "22px 24px", marginBottom: 18 }}>
          <h3 style={{ fontFamily: "var(--font-heading)", fontSize: 18, margin: "0 0 14px" }}>Share your solution</h3>
          {formErr && <div style={{ background: "var(--color-accent-100)", color: "var(--color-accent-800)", fontSize: 13, padding: "9px 12px", borderRadius: 12, marginBottom: 12 }}>{formErr}</div>}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 180px", gap: 14 }}>
            <div className="field"><label>Title</label><input className="input" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="e.g. Two-pointer, O(n)" /></div>
            <div className="field">
              <label>Language</label>
              <select className="input" value={form.language} onChange={(e) => setForm((f) => ({ ...f, language: e.target.value }))}>
                {options.map((l) => <option key={l} value={l}>{LANG_LABEL[l] || l}</option>)}
              </select>
            </div>
          </div>
          <div className="field" style={{ marginTop: 14 }}><label>Write-up</label><textarea className="input" rows={3} value={form.body} onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))} placeholder="Explain your approach, complexity, edge cases…" style={{ borderRadius: 16 }} /></div>
          <div className="field" style={{ marginTop: 14 }}>
            <label>Code</label>
            <textarea className="input" rows={10} value={form.code} onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))} placeholder="Paste your solution code…" spellCheck={false} style={{ borderRadius: 14, fontFamily: "ui-monospace, Menlo, monospace", fontSize: 13, lineHeight: 1.5 }} />
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 16 }}>
            <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={busy || !form.title.trim() || !form.code.trim()}>{busy ? "Sharing…" : "Post solution"}</button>
          </div>
        </form>
      )}

      {solutions.length === 0 ? (
        <div style={{ ...surface, padding: "44px 44px", textAlign: "center", color: muted(60) }}>
          <Code2 size={28} strokeWidth={2.5} color="var(--color-accent)" style={{ marginBottom: 12 }} />
          <div style={{ marginBottom: 4, fontFamily: "var(--font-heading)", fontSize: 18, color: "var(--color-text)" }}>No solutions yet</div>
          <div>Be the first to share how you cracked <strong>{problem.title}</strong>.</div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {solutions.map((s) => {
            const author = s.user || s.author || {};
            const lang = s.language || "";
            return (
              <div key={s.id} style={{ ...surface, padding: "20px 22px", display: "flex", gap: 16 }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1, flex: "none" }}>
                  <button type="button" className="btn btn-ghost btn-icon" onClick={() => vote(s.id, 1)} disabled={voteBusy} aria-label="Upvote" style={{ width: 32, height: 30, color: (s.myVote ?? s.userVote ?? 0) === 1 ? "var(--color-accent)" : muted(50) }}>
                    <ArrowBigUp size={20} strokeWidth={2.2} fill={(s.myVote ?? s.userVote ?? 0) === 1 ? "var(--color-accent)" : "none"} />
                  </button>
                  <span style={{ fontWeight: 700, fontSize: 15, fontVariantNumeric: "tabular-nums" }}>{s.votes ?? 0}</span>
                  <button type="button" className="btn btn-ghost btn-icon" onClick={() => vote(s.id, -1)} disabled={voteBusy} aria-label="Downvote" style={{ width: 32, height: 30, color: (s.myVote ?? s.userVote ?? 0) === -1 ? "var(--color-accent-700)" : muted(50) }}>
                    <ArrowBigDown size={20} strokeWidth={2.2} fill={(s.myVote ?? s.userVote ?? 0) === -1 ? "var(--color-accent-700)" : "none"} />
                  </button>
                </div>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 6 }}>
                    <h3 style={{ fontFamily: "var(--font-heading)", fontSize: 18, margin: 0 }}>{s.title || "Solution"}</h3>
                    {lang && <span style={{ fontSize: 11, padding: "2px 10px", borderRadius: 999, background: "var(--color-accent-2-100)", color: "var(--color-accent-2-800)", fontWeight: 600 }}>{LANG_LABEL[lang] || lang}</span>}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5, color: muted(58), marginBottom: 12 }}>
                    <span style={{ width: 20, height: 20, borderRadius: "50%", background: "var(--color-accent-2-300)", color: "var(--color-accent-2-800)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 700 }}>{initialsOf(author.name, author.username)}</span>
                    {author.username ? (
                      <Link to={`/u/${author.username}`} style={{ color: "var(--color-accent-700)", textDecoration: "none", fontWeight: 600 }}>@{author.username}</Link>
                    ) : (
                      <span>{author.name || "member"}</span>
                    )}
                    <span>·</span>
                    <span>{timeAgo(s.createdAt)}</span>
                  </div>
                  {s.body && <div style={{ margin: "0 0 12px" }}><Markdown>{s.body}</Markdown></div>}
                  {s.code && (
                    <pre style={{ margin: 0, background: "var(--color-bg)", borderRadius: 14, padding: "14px 16px", overflowX: "auto", fontFamily: "ui-monospace, Menlo, monospace", fontSize: 13, lineHeight: 1.55, color: "var(--color-text)" }}>
                      <code>{s.code}</code>
                    </pre>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
