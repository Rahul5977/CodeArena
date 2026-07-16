import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Editor from "@monaco-editor/react";
import Split from "react-split";
import { Play, Send, CheckCircle2, XCircle, ArrowLeft } from "lucide-react";
import { api } from "../lib/api.js";
import Spinner from "../components/Spinner.jsx";

const LANG_ID = { PYTHON: 71, JAVASCRIPT: 63, JAVA: 62, CPP: 54, C: 50 };
const MONACO_LANG = { PYTHON: "python", JAVASCRIPT: "javascript", JAVA: "java", CPP: "cpp", C: "c" };
const LANG_LABEL = { PYTHON: "Python", JAVASCRIPT: "JavaScript", JAVA: "Java", CPP: "C++", C: "C" };
// Every language the executor supports is always offered — even when a problem
// ships starter snippets for only some. Missing ones fall back to a stdin/stdout stub.
const ALL_LANGS = ["PYTHON", "JAVASCRIPT", "JAVA", "CPP", "C"];
const STARTER = {
  PYTHON: `import sys\n\ndef main():\n    data = sys.stdin.read().split()\n    # TODO: read input and solve\n\nmain()\n`,
  JAVASCRIPT: `const input = require("fs").readFileSync(0, "utf8").trim().split(/\\s+/);\n// TODO: read input and solve\n`,
  JAVA: `import java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // TODO: read input and solve\n    }\n}\n`,
  CPP: `#include <bits/stdc++.h>\nusing namespace std;\n\nint main() {\n    // TODO: read input and solve\n    return 0;\n}\n`,
  C: `#include <stdio.h>\n\nint main() {\n    // TODO: read input and solve\n    return 0;\n}\n`,
};
// Problem's own snippet wins; otherwise the generic per-language stub.
const starterFor = (problem, l) => problem?.codeSnippets?.[l] || STARTER[l] || "";
const DIFF = {
  EASY: { bg: "var(--color-accent-2-100)", fg: "var(--color-accent-2-800)", label: "Easy" },
  MEDIUM: { bg: "var(--color-accent-100)", fg: "var(--color-accent-800)", label: "Medium" },
  HARD: { bg: "var(--color-accent-200)", fg: "var(--color-accent-900)", label: "Hard" },
};
const muted = (p = 60) => `color-mix(in srgb, var(--color-text) ${p}%, transparent)`;
const surface = { background: "var(--color-surface)", borderRadius: 18, boxShadow: "var(--shadow-sm)" };

export default function ProblemEditor() {
  const { slug } = useParams();
  const [problem, setProblem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lang, setLang] = useState("PYTHON");
  const [code, setCode] = useState("");
  const [customInput, setCustomInput] = useState("");
  const [running, setRunning] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [output, setOutput] = useState(null);
  const [verdict, setVerdict] = useState(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    api
      .get(`/problems/get-all-problems/${slug}`)
      .then(({ data }) => {
        if (!active) return;
        const p = data.problem;
        setProblem(p);
        const langs = Object.keys(p.codeSnippets || {});
        const first = langs[0] || "PYTHON";
        setLang(first);
        setCode(starterFor(p, first));
        setCustomInput(p.examples?.[0]?.input || "");
      })
      .catch((e) => active && setError(e.response?.data?.error || "Failed to load problem"))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [slug]);

  const changeLang = (l) => {
    setLang(l);
    setCode(starterFor(problem, l));
  };

  const run = async () => {
    setRunning(true);
    setOutput(null);
    setVerdict(null);
    try {
      const { data } = await api.post("/execute-code/run", { source_code: code, language_id: LANG_ID[lang], stdin: customInput });
      setOutput(data);
    } catch (e) {
      setOutput({ error: e.response?.data?.message || "Run failed — the executor may not be running yet." });
    } finally {
      setRunning(false);
    }
  };

  const submit = async () => {
    setSubmitting(true);
    setVerdict(null);
    setOutput(null);
    try {
      const { data } = await api.post("/execute-code", { source_code: code, language_id: LANG_ID[lang], problemId: problem.id });
      setVerdict(data);
    } catch (e) {
      setVerdict({ error: e.response?.data?.message || "Submit failed — the executor may not be running yet." });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Spinner label="Loading problem…" full />;
  if (error || !problem) return <div style={{ color: muted() }}>{error || "Problem not found."}</div>;

  const d = DIFF[problem.difficulty] || DIFF.MEDIUM;

  return (
    <Split className="ca-split" sizes={[42, 58]} minSize={320} gutterSize={10} style={{ display: "flex", height: "calc(100vh - 150px)", minHeight: 460 }}>
      {/* Left — problem statement */}
      <div style={{ ...surface, overflowY: "auto", padding: "22px 24px" }}>
        <Link to="/problems" style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 13, color: "var(--color-accent-700)", textDecoration: "none", fontWeight: 600, marginBottom: 14 }}>
          <ArrowLeft size={15} strokeWidth={2.75} /> All problems
        </Link>
        <h1 style={{ fontFamily: "var(--font-heading)", fontSize: 26, margin: "0 0 10px" }}>{problem.title}</h1>
        <div style={{ display: "flex", gap: 7, marginBottom: 16, flexWrap: "wrap" }}>
          <span style={{ fontSize: 11, padding: "3px 11px", borderRadius: 999, background: d.bg, color: d.fg, fontWeight: 600 }}>{d.label}</span>
          {(problem.tags || []).map((t) => (
            <span key={t} style={{ fontSize: 11, padding: "3px 11px", borderRadius: 999, background: "var(--color-neutral-200)", color: "var(--color-neutral-800)" }}>{t}</span>
          ))}
        </div>
        <p style={{ fontSize: 14.5, lineHeight: 1.6, whiteSpace: "pre-wrap", color: muted(88) }}>{problem.description}</p>

        {(problem.examples || []).map((ex, i) => (
          <div key={i} style={{ marginTop: 16 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: muted(70), marginBottom: 6 }}>Example {i + 1}</div>
            <div style={{ background: "var(--color-bg)", borderRadius: 12, padding: "12px 14px", fontFamily: "ui-monospace, Menlo, monospace", fontSize: 13, lineHeight: 1.6 }}>
              <div><span style={{ color: muted(55) }}>Input:</span> {ex.input}</div>
              <div><span style={{ color: muted(55) }}>Output:</span> {ex.output}</div>
              {ex.explanation && <div style={{ color: muted(60), marginTop: 4 }}>{ex.explanation}</div>}
            </div>
          </div>
        ))}

        {problem.constraints && (
          <div style={{ marginTop: 16 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: muted(70), marginBottom: 6 }}>Constraints</div>
            <div style={{ fontSize: 13, fontFamily: "ui-monospace, Menlo, monospace", color: muted(75) }}>{problem.constraints}</div>
          </div>
        )}
      </div>

      {/* Right — editor + run/submit + results */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12, minWidth: 0 }}>
        <div style={{ ...surface, flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", minHeight: 240 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", borderBottom: "1px solid var(--color-divider)" }}>
            <select className="input" value={lang} onChange={(e) => changeLang(e.target.value)} style={{ width: "auto", minHeight: 34, padding: "4px 12px", background: "var(--color-bg)" }}>
              {ALL_LANGS.map((l) => (
                <option key={l} value={l}>{LANG_LABEL[l] || l}</option>
              ))}
            </select>
            <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
              <button className="btn btn-secondary" onClick={run} disabled={running || submitting} style={{ gap: 6 }}>
                <Play size={15} strokeWidth={2.5} /> {running ? "Running…" : "Run"}
              </button>
              <button className="btn btn-primary" onClick={submit} disabled={running || submitting} style={{ gap: 6 }}>
                <Send size={15} strokeWidth={2.5} /> {submitting ? "Submitting…" : "Submit"}
              </button>
            </div>
          </div>
          <div style={{ flex: 1, minHeight: 0 }}>
            <Editor height="100%" theme="vs" language={MONACO_LANG[lang] || "plaintext"} value={code} onChange={(v) => setCode(v ?? "")} options={{ fontSize: 13, minimap: { enabled: false }, scrollBeyondLastLine: false, padding: { top: 12 }, tabSize: 2 }} />
          </div>
        </div>

        <div style={{ ...surface, padding: "12px 14px", maxHeight: 220, overflowY: "auto" }}>
          <ResultPanel verdict={verdict} output={output} customInput={customInput} setCustomInput={setCustomInput} />
        </div>
      </div>
    </Split>
  );
}

function ResultPanel({ verdict, output, customInput, setCustomInput }) {
  if (verdict) {
    if (verdict.error) return <div style={{ color: "var(--color-accent-800)" }}>{verdict.error}</div>;
    const ok = verdict.status === "Accepted";
    return (
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
          {ok ? <CheckCircle2 size={18} color="var(--color-accent-2-600)" /> : <XCircle size={18} color="var(--color-accent-700)" />}
          <span style={{ fontFamily: "var(--font-heading)", fontSize: 16, color: ok ? "var(--color-accent-2-700)" : "var(--color-accent-800)" }}>{verdict.status}</span>
          <span style={{ fontSize: 12, color: muted(55) }}>{verdict.passed}/{verdict.total} testcases passed</span>
        </div>
        <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
          {verdict.results?.map((r) => (
            <span key={r.testCase} title={`Testcase ${r.testCase}: ${r.status}`} style={{ width: 26, height: 26, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, background: r.passed ? "var(--color-accent-2-100)" : "var(--color-accent-100)", color: r.passed ? "var(--color-accent-2-800)" : "var(--color-accent-800)" }}>{r.testCase}</span>
          ))}
        </div>
      </div>
    );
  }
  if (output) {
    if (output.error) return <div style={{ color: "var(--color-accent-800)" }}>{output.error}</div>;
    return (
      <div>
        <div style={{ fontSize: 12, fontWeight: 700, color: muted(70), marginBottom: 6 }}>Output · {output.status}</div>
        <pre style={{ margin: 0, fontFamily: "ui-monospace, Menlo, monospace", fontSize: 13, whiteSpace: "pre-wrap" }}>{output.stderr || output.compileOutput || output.stdout || "(no output)"}</pre>
      </div>
    );
  }
  return (
    <div>
      <div style={{ fontSize: 12, fontWeight: 700, color: muted(70), marginBottom: 6 }}>Custom input (for Run)</div>
      <textarea className="input" value={customInput} onChange={(e) => setCustomInput(e.target.value)} rows={3} style={{ fontFamily: "ui-monospace, Menlo, monospace", fontSize: 13, borderRadius: 12 }} />
    </div>
  );
}
