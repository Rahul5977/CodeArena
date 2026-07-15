import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Code2, Check, ArrowRight } from "lucide-react";

const muted = (p = 60) => `color-mix(in srgb, var(--color-text) ${p}%, transparent)`;
const LANGS = ["Python", "JavaScript", "Java", "C++", "C"];
const GOALS = ["Ace interviews", "Learn DSA from scratch", "Stay sharp / practice", "Compete in contests"];

export default function Onboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [langs, setLangs] = useState(["Python"]);
  const [goal, setGoal] = useState(GOALS[0]);

  const toggleLang = (l) => setLangs((p) => (p.includes(l) ? p.filter((x) => x !== l) : [...p, l]));
  const finish = () => {
    try {
      localStorage.setItem("ca_onboarded", "1");
      localStorage.setItem("ca_prefs", JSON.stringify({ langs, goal }));
    } catch { /* ignore */ }
    navigate("/app", { replace: true });
  };

  const steps = [
    {
      title: "Welcome to CodeArena",
      body: (
        <p style={{ color: muted(68), fontSize: 15 }}>
          A warm, focused place to grind DSA — a real editor, a sandboxed judge, and progress that
          actually motivates. Let's set you up in a few taps.
        </p>
      ),
    },
    {
      title: "Which languages do you use?",
      body: (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
          {LANGS.map((l) => {
            const on = langs.includes(l);
            return (
              <button key={l} onClick={() => toggleLang(l)} className="btn" style={{ padding: "10px 16px", fontSize: 14, background: on ? "var(--color-accent)" : "var(--color-surface)", color: on ? "var(--color-bg)" : "var(--color-text)", border: on ? "none" : "1px solid var(--color-divider)" }}>
                {on && <Check size={14} strokeWidth={3} />} {l}
              </button>
            );
          })}
        </div>
      ),
    },
    {
      title: "What's your goal?",
      body: (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {GOALS.map((g) => {
            const on = goal === g;
            return (
              <button key={g} onClick={() => setGoal(g)} className="btn" style={{ justifyContent: "flex-start", padding: "12px 16px", fontSize: 14, background: on ? "var(--color-accent-100)" : "var(--color-surface)", color: on ? "var(--color-accent-800)" : "var(--color-text)", border: on ? "1px solid var(--color-accent)" : "1px solid var(--color-divider)" }}>
                {g}
              </button>
            );
          })}
        </div>
      ),
    },
    {
      title: "You're all set!",
      body: (
        <p style={{ color: muted(68), fontSize: 15 }}>
          Jump into the problems and solve your first one. Your streak starts today. 🧡
        </p>
      ),
    },
  ];

  const cur = steps[step];
  const last = step === steps.length - 1;

  return (
    <div style={{ width: "100%", height: "100%", display: "grid", placeItems: "center", background: "var(--color-bg)", color: "var(--color-text)", fontFamily: "var(--font-body)", padding: 20 }}>
      <div style={{ width: "min(460px, 94vw)", background: "var(--color-surface)", borderRadius: 28, boxShadow: "var(--shadow-md)", padding: "32px 32px 28px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
          <div style={{ width: 34, height: 34, borderRadius: 11, background: "var(--color-accent)", color: "var(--color-bg)", display: "flex", alignItems: "center", justifyContent: "center" }}><Code2 size={18} strokeWidth={2.75} /></div>
          <div style={{ display: "flex", gap: 6, marginLeft: "auto" }}>
            {steps.map((_, i) => (
              <span key={i} style={{ width: i === step ? 22 : 7, height: 7, borderRadius: 999, background: i <= step ? "var(--color-accent)" : "var(--color-neutral-300)", transition: "width .2s" }} />
            ))}
          </div>
        </div>

        <h1 style={{ fontFamily: "var(--font-heading)", fontSize: 26, margin: "0 0 12px" }}>{cur.title}</h1>
        <div style={{ marginBottom: 26 }}>{cur.body}</div>

        <div style={{ display: "flex", gap: 10 }}>
          {step > 0 && !last && (
            <button className="btn btn-secondary" onClick={() => setStep((s) => s - 1)}>Back</button>
          )}
          {!last ? (
            <button className="btn btn-primary" style={{ marginLeft: "auto" }} onClick={() => setStep((s) => s + 1)}>
              Continue <ArrowRight size={15} strokeWidth={2.75} />
            </button>
          ) : (
            <button className="btn btn-primary btn-block" onClick={finish}>Enter CodeArena</button>
          )}
        </div>
        {step === 0 && (
          <button onClick={finish} style={{ background: "none", border: "none", color: muted(50), fontSize: 12, marginTop: 14, cursor: "pointer", width: "100%" }}>Skip for now</button>
        )}
      </div>
    </div>
  );
}
