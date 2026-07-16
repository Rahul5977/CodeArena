import { useState } from "react";
import { X, Plus, Trash2 } from "lucide-react";
import { api } from "../lib/api.js";

/* Create / edit a problem. Mirrors Admin.jsx's visual language: muted() helper,
   surface cards, .input/.field/.btn classes, lucide icons. Publishing runs the
   reference solutions through the executor server-side — surface that error and
   let the admin fall back to saving a draft (published=false). */

const muted = (p = 60) => `color-mix(in srgb, var(--color-text) ${p}%, transparent)`;

const LANGS = ["PYTHON", "JAVASCRIPT", "JAVA", "CPP", "C"];
const LANG_LABEL = { PYTHON: "Python", JAVASCRIPT: "JavaScript", JAVA: "Java", CPP: "C++", C: "C" };

const csv = (arr) => (Array.isArray(arr) ? arr.join(", ") : "");
const toArr = (s) =>
  (s || "")
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean);

export default function ProblemFormModal({ mode, problem, onClose, onSaved }) {
  const editing = mode === "edit";
  const p = problem || {};

  const [title, setTitle] = useState(p.title || "");
  const [slug, setSlug] = useState(p.slug || "");
  const [slugTouched, setSlugTouched] = useState(editing);
  const [difficulty, setDifficulty] = useState(p.difficulty || "EASY");
  const [tags, setTags] = useState(csv(p.tags));
  const [companies, setCompanies] = useState(csv(p.companies));
  const [published, setPublished] = useState(!!p.published);
  const [description, setDescription] = useState(p.description || "");
  const [constraints, setConstraints] = useState(p.constraints || "");
  const [hints, setHints] = useState(p.hints || "");
  const [editorial, setEditorial] = useState(p.editorial || "");
  const [examples, setExamples] = useState(
    Array.isArray(p.examples) && p.examples.length
      ? p.examples.map((e) => ({ input: e.input || "", output: e.output || "", explanation: e.explanation || "" }))
      : [{ input: "", output: "", explanation: "" }],
  );
  const [testcases, setTestcases] = useState(
    Array.isArray(p.testcases) && p.testcases.length
      ? p.testcases.map((t) => ({ input: t.input || "", output: t.output || "" }))
      : [{ input: "", output: "" }],
  );
  const [snippets, setSnippets] = useState(() => {
    const cs = p.codeSnippets || {};
    return LANGS.reduce((o, l) => ((o[l] = cs[l] || ""), o), {});
  });
  const [solutions, setSolutions] = useState(() => {
    const rs = p.referenceSolutions || {};
    return LANGS.reduce((o, l) => ((o[l] = rs[l] || ""), o), {});
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const onTitle = (v) => {
    setTitle(v);
    if (!editing && !slugTouched) {
      setSlug(
        v
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-+|-+$/g, ""),
      );
    }
  };

  const setExample = (i, key, v) => setExamples((xs) => xs.map((x, j) => (j === i ? { ...x, [key]: v } : x)));
  const addExample = () => setExamples((xs) => [...xs, { input: "", output: "", explanation: "" }]);
  const removeExample = (i) => setExamples((xs) => (xs.length > 1 ? xs.filter((_, j) => j !== i) : xs));

  const setTestcase = (i, key, v) => setTestcases((ts) => ts.map((t, j) => (j === i ? { ...t, [key]: v } : t)));
  const addTestcase = () => setTestcases((ts) => [...ts, { input: "", output: "" }]);
  const removeTestcase = (i) => setTestcases((ts) => (ts.length > 1 ? ts.filter((_, j) => j !== i) : ts));

  const buildPayload = (publishedFlag) => {
    const codeSnippets = {};
    const referenceSolutions = {};
    for (const l of LANGS) {
      if (snippets[l].trim()) codeSnippets[l] = snippets[l];
      if (solutions[l].trim()) referenceSolutions[l] = solutions[l];
    }
    return {
      title: title.trim(),
      slug: slug.trim(),
      description,
      difficulty,
      tags: toArr(tags),
      companies: toArr(companies),
      published: publishedFlag,
      examples: examples.filter((e) => e.input.trim() || e.output.trim()),
      constraints,
      hints: hints.trim() || undefined,
      editorial: editorial.trim() || undefined,
      testcases: testcases.filter((t) => t.input.trim() || t.output.trim()),
      codeSnippets,
      referenceSolutions,
    };
  };

  const save = async (publishedFlag) => {
    setSaving(true);
    setError("");
    try {
      const payload = buildPayload(publishedFlag);
      if (editing) await api.put(`/problems/update-problem/${problem.id}`, payload);
      else await api.post("/problems/create-problem", payload);
      onSaved();
    } catch (e) {
      setError(e.response?.data?.error || e.response?.data?.message || "Failed to save problem");
      setPublished(false); // publishing failed → let them save as draft
    } finally {
      setSaving(false);
    }
  };

  const onSubmit = (e) => {
    e.preventDefault();
    save(published);
  };

  const labelStyle = { display: "block", fontSize: 12, marginBottom: 5, color: muted(70) };
  const sectionTitle = { fontFamily: "var(--font-heading)", fontSize: 15, margin: "0 0 10px" };

  return (
    <div
      onMouseDown={(e) => e.target === e.currentTarget && !saving && onClose()}
      style={{ position: "fixed", inset: 0, zIndex: 60, background: "color-mix(in srgb, var(--color-text) 45%, transparent)", display: "flex", alignItems: "flex-start", justifyContent: "center", padding: "40px 16px", overflowY: "auto" }}
    >
      <form
        onSubmit={onSubmit}
        onMouseDown={(e) => e.stopPropagation()}
        style={{ background: "var(--color-surface)", borderRadius: 22, boxShadow: "var(--shadow-sm)", width: "100%", maxWidth: 720, display: "flex", flexDirection: "column", maxHeight: "calc(100vh - 80px)" }}
      >
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 22px", borderBottom: "1px solid var(--color-divider)", flex: "none" }}>
          <h2 style={{ fontFamily: "var(--font-heading)", fontSize: 20, margin: 0 }}>{editing ? "Edit problem" : "New problem"}</h2>
          <button type="button" className="btn btn-ghost btn-icon" onClick={onClose} disabled={saving} aria-label="Close">
            <X size={17} strokeWidth={2.5} />
          </button>
        </div>

        {/* Scrollable body */}
        <div style={{ padding: "20px 22px", overflowY: "auto", display: "flex", flexDirection: "column", gap: 18 }}>
          {error && (
            <div style={{ background: "var(--color-accent-100)", color: "var(--color-accent-800)", padding: "10px 14px", borderRadius: 14, fontSize: 13 }}>
              {error}
            </div>
          )}

          {/* Basics */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <div>
              <label style={labelStyle}>Title</label>
              <input className="input" value={title} onChange={(e) => onTitle(e.target.value)} placeholder="Two Sum" required />
            </div>
            <div>
              <label style={labelStyle}>Slug</label>
              <input className="input" value={slug} onChange={(e) => (setSlug(e.target.value), setSlugTouched(true))} placeholder="two-sum" required />
            </div>
            <div>
              <label style={labelStyle}>Difficulty</label>
              <select className="input" value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
                <option value="EASY">Easy</option>
                <option value="MEDIUM">Medium</option>
                <option value="HARD">Hard</option>
              </select>
            </div>
            <div style={{ display: "flex", alignItems: "flex-end" }}>
              <label style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 14, cursor: "pointer", paddingBottom: 8 }}>
                <input type="checkbox" checked={published} onChange={(e) => setPublished(e.target.checked)} />
                Published
              </label>
            </div>
            <div>
              <label style={labelStyle}>Tags (comma-separated)</label>
              <input className="input" value={tags} onChange={(e) => setTags(e.target.value)} placeholder="arrays, hash-table" />
            </div>
            <div>
              <label style={labelStyle}>Companies (comma-separated)</label>
              <input className="input" value={companies} onChange={(e) => setCompanies(e.target.value)} placeholder="Google, Amazon" />
            </div>
          </div>

          <div>
            <label style={labelStyle}>Description</label>
            <textarea className="input" value={description} onChange={(e) => setDescription(e.target.value)} rows={5} style={{ borderRadius: 14 }} required />
          </div>
          <div>
            <label style={labelStyle}>Constraints</label>
            <textarea className="input" value={constraints} onChange={(e) => setConstraints(e.target.value)} rows={3} style={{ borderRadius: 14 }} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <div>
              <label style={labelStyle}>Hints (optional)</label>
              <textarea className="input" value={hints} onChange={(e) => setHints(e.target.value)} rows={3} style={{ borderRadius: 14 }} />
            </div>
            <div>
              <label style={labelStyle}>Editorial (optional)</label>
              <textarea className="input" value={editorial} onChange={(e) => setEditorial(e.target.value)} rows={3} style={{ borderRadius: 14 }} />
            </div>
          </div>

          {/* Examples */}
          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
              <h3 style={sectionTitle}>Examples</h3>
              <button type="button" className="btn btn-secondary" style={{ gap: 6, fontSize: 12, padding: "5px 10px" }} onClick={addExample}>
                <Plus size={14} strokeWidth={2.75} /> Add
              </button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {examples.map((ex, i) => (
                <div key={i} style={{ background: "var(--color-neutral-100)", borderRadius: 14, padding: "12px 14px", display: "flex", flexDirection: "column", gap: 10 }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: muted(60) }}>Example {i + 1}</span>
                    <button type="button" className="btn btn-ghost btn-icon" style={{ width: 28, height: 28, color: "var(--color-accent-800)" }} onClick={() => removeExample(i)} disabled={examples.length <= 1} aria-label="Remove example">
                      <Trash2 size={14} strokeWidth={2.5} />
                    </button>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                    <div>
                      <label style={labelStyle}>Input</label>
                      <textarea className="input" value={ex.input} onChange={(e) => setExample(i, "input", e.target.value)} rows={2} style={{ borderRadius: 12, minHeight: 44 }} />
                    </div>
                    <div>
                      <label style={labelStyle}>Output</label>
                      <textarea className="input" value={ex.output} onChange={(e) => setExample(i, "output", e.target.value)} rows={2} style={{ borderRadius: 12, minHeight: 44 }} />
                    </div>
                  </div>
                  <div>
                    <label style={labelStyle}>Explanation (optional)</label>
                    <textarea className="input" value={ex.explanation} onChange={(e) => setExample(i, "explanation", e.target.value)} rows={2} style={{ borderRadius: 12, minHeight: 44 }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Testcases */}
          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
              <h3 style={sectionTitle}>Testcases</h3>
              <button type="button" className="btn btn-secondary" style={{ gap: 6, fontSize: 12, padding: "5px 10px" }} onClick={addTestcase}>
                <Plus size={14} strokeWidth={2.75} /> Add
              </button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {testcases.map((tc, i) => (
                <div key={i} style={{ background: "var(--color-neutral-100)", borderRadius: 14, padding: "12px 14px", display: "flex", gap: 10, alignItems: "flex-end" }}>
                  <div style={{ flex: 1 }}>
                    <label style={labelStyle}>Input {i + 1}</label>
                    <textarea className="input" value={tc.input} onChange={(e) => setTestcase(i, "input", e.target.value)} rows={2} style={{ borderRadius: 12, minHeight: 44 }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={labelStyle}>Expected output</label>
                    <textarea className="input" value={tc.output} onChange={(e) => setTestcase(i, "output", e.target.value)} rows={2} style={{ borderRadius: 12, minHeight: 44 }} />
                  </div>
                  <button type="button" className="btn btn-ghost btn-icon" style={{ width: 30, height: 30, color: "var(--color-accent-800)", marginBottom: 4 }} onClick={() => removeTestcase(i)} disabled={testcases.length <= 1} aria-label="Remove testcase">
                    <Trash2 size={15} strokeWidth={2.5} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Per-language code */}
          <div>
            <h3 style={sectionTitle}>Starter code & reference solutions</h3>
            <p style={{ margin: "0 0 12px", fontSize: 12, color: muted(55) }}>
              Fill in only the languages you support. Publishing validates each reference solution against the testcases via the executor.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {LANGS.map((l) => (
                <div key={l} style={{ background: "var(--color-neutral-100)", borderRadius: 14, padding: "12px 14px" }}>
                  <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 10 }}>{LANG_LABEL[l]}</div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                    <div>
                      <label style={labelStyle}>Starter snippet</label>
                      <textarea className="input" value={snippets[l]} onChange={(e) => setSnippets((s) => ({ ...s, [l]: e.target.value }))} rows={4} style={{ borderRadius: 12, fontFamily: "monospace", fontSize: 12.5 }} spellCheck={false} />
                    </div>
                    <div>
                      <label style={labelStyle}>Reference solution</label>
                      <textarea className="input" value={solutions[l]} onChange={(e) => setSolutions((s) => ({ ...s, [l]: e.target.value }))} rows={4} style={{ borderRadius: 12, fontFamily: "monospace", fontSize: 12.5 }} spellCheck={false} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "16px 22px", borderTop: "1px solid var(--color-divider)", flex: "none" }}>
          <span style={{ fontSize: 12, color: muted(55), marginRight: "auto" }}>
            {published ? "Will publish — reference solutions are validated." : "Saved as a draft."}
          </span>
          <button type="button" className="btn btn-secondary" onClick={onClose} disabled={saving}>
            Cancel
          </button>
          {published && (
            <button type="button" className="btn btn-secondary" onClick={() => save(false)} disabled={saving}>
              Save as draft
            </button>
          )}
          <button type="submit" className="btn btn-primary" disabled={saving} style={{ gap: 7 }}>
            {saving ? "Saving…" : editing ? "Save changes" : "Create problem"}
          </button>
        </div>
      </form>
    </div>
  );
}
