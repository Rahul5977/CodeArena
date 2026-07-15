import { useState } from "react";
import { Heart, Check, ShieldCheck } from "lucide-react";

// Pay-what-you-want support page (replaces the design's paid Pricing tiers).
// Razorpay order + verify wiring lands in Phase 7; this is the page shell.
const PRESETS = [99, 299, 499, 999];
const muted = (p = 60) => `color-mix(in srgb, var(--color-text) ${p}%, transparent)`;

export default function Support() {
  const [amount, setAmount] = useState(299);
  const [custom, setCustom] = useState("");
  const value = custom !== "" ? Number(custom) || 0 : amount;

  return (
    <div style={{ maxWidth: 1080, display: "grid", gridTemplateColumns: "1.15fr 1fr", gap: 22 }}>
      {/* Left — the ask + amount */}
      <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        <div style={{ background: "var(--color-surface)", borderRadius: 24, boxShadow: "var(--shadow-sm)", padding: "28px 30px" }}>
          <div style={{ width: 46, height: 46, borderRadius: 13, background: "var(--color-accent-2-100)", color: "var(--color-accent-2-700)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
            <Heart size={22} strokeWidth={2.5} />
          </div>
          <h1 style={{ fontFamily: "var(--font-heading)", fontSize: 30, margin: "0 0 8px" }}>CodeArena is free. Keep it that way.</h1>
          <p style={{ margin: "0 0 20px", fontSize: 15, color: muted(66) }}>
            Every problem, sheet, and contest is free for everyone — no paywalls. If it's helped you,
            chip in whatever it's worth to you. It covers the server and the judge.
          </p>

          <div style={{ fontSize: 12, fontWeight: 600, color: muted(70), marginBottom: 8 }}>Choose an amount (₹)</div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 14 }}>
            {PRESETS.map((p) => {
              const on = custom === "" && amount === p;
              return (
                <button key={p} onClick={() => { setAmount(p); setCustom(""); }}
                  className="btn"
                  style={{ padding: "10px 18px", fontSize: 15, background: on ? "var(--color-accent)" : "var(--color-surface)", color: on ? "var(--color-bg)" : "var(--color-text)", border: on ? "none" : "1px solid var(--color-divider)" }}>
                  ₹{p}
                </button>
              );
            })}
          </div>
          <div className="field">
            <label>Or enter a custom amount</label>
            <input className="input" inputMode="numeric" placeholder="e.g. 150" value={custom}
              onChange={(e) => setCustom(e.target.value.replace(/[^0-9]/g, ""))} style={{ maxWidth: 220 }} />
          </div>
        </div>

        <div style={{ background: "var(--color-surface)", borderRadius: 24, boxShadow: "var(--shadow-sm)", padding: "22px 26px" }}>
          <h3 style={{ fontFamily: "var(--font-heading)", fontSize: 17, margin: "0 0 12px" }}>Where it goes</h3>
          {["Keeps the code-execution judge running", "Server + database hosting", "New problems, sheets, and features"].map((t) => (
            <div key={t} style={{ display: "flex", gap: 9, alignItems: "center", fontSize: 14, color: muted(72), marginBottom: 9 }}>
              <Check size={15} strokeWidth={2.75} color="var(--color-accent-2-600)" /> {t}
            </div>
          ))}
        </div>
      </div>

      {/* Right — summary + pay */}
      <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        <div style={{ background: "var(--color-accent-2-100)", borderRadius: 22, padding: "24px 26px" }}>
          <div style={{ fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--color-accent-2-800)", fontWeight: 700, marginBottom: 12 }}>Your contribution</div>
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 16 }}>
            <div style={{ fontFamily: "var(--font-heading)", fontSize: 18, color: "var(--color-accent-2-900)" }}>One-time support</div>
            <div style={{ fontFamily: "var(--font-heading)", fontSize: 30, color: "var(--color-accent-2-900)" }}>₹{value || 0}</div>
          </div>
          <button className="btn btn-primary btn-block" disabled={!value} style={{ marginTop: 4 }}>
            Support with ₹{value || 0}
          </button>
          <div style={{ display: "flex", alignItems: "center", gap: 7, justifyContent: "center", fontSize: 11, color: "color-mix(in srgb, var(--color-accent-2-900) 70%, transparent)", marginTop: 12 }}>
            <ShieldCheck size={14} strokeWidth={2.5} /> Secured by Razorpay · no account needed
          </div>
        </div>
        <div style={{ background: "var(--color-surface)", borderRadius: 22, boxShadow: "var(--shadow-sm)", padding: "20px 24px", fontSize: 13.5, color: muted(70), lineHeight: 1.6 }}>
          A donation unlocks nothing extra — everything is already free. It's a thank-you, not a purchase.
          Add your name to the supporters wall at checkout if you'd like (optional).
        </div>
      </div>
    </div>
  );
}
