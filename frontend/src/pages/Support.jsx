import { useEffect, useState } from "react";
import { Heart, Check, ShieldCheck, AlertCircle, Sparkles, Quote } from "lucide-react";
import { api } from "../lib/api.js";

// Pay-what-you-want support page (replaces the design's paid Pricing tiers).
// Live Razorpay checkout: POST /support/order → open checkout → POST /support/verify.
// A donation grants nothing extra — everything on CodeArena is free.
const PRESETS = [99, 299, 499, 999];
const RZP_SCRIPT = "https://checkout.razorpay.com/v1/checkout.js";
const muted = (p = 60) => `color-mix(in srgb, var(--color-text) ${p}%, transparent)`;

// Load the Razorpay checkout script once, on demand.
function loadRazorpay() {
  return new Promise((resolve, reject) => {
    if (typeof window !== "undefined" && window.Razorpay) return resolve(true);
    const existing = document.getElementById("razorpay-checkout-js");
    if (existing) {
      existing.addEventListener("load", () => resolve(true));
      existing.addEventListener("error", () => reject(new Error("Failed to load Razorpay")));
      if (window.Razorpay) resolve(true);
      return;
    }
    const s = document.createElement("script");
    s.id = "razorpay-checkout-js";
    s.src = RZP_SCRIPT;
    s.async = true;
    s.onload = () => resolve(true);
    s.onerror = () => reject(new Error("Failed to load Razorpay"));
    document.body.appendChild(s);
  });
}

export default function Support() {
  const [amount, setAmount] = useState(299);
  const [custom, setCustom] = useState("");
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [showOnWall, setShowOnWall] = useState(false);

  const [status, setStatus] = useState("idle"); // idle | processing | done
  const [error, setError] = useState("");
  const [paidAmount, setPaidAmount] = useState(0);

  const [supporters, setSupporters] = useState([]);

  const value = custom !== "" ? Number(custom) || 0 : amount;

  const loadSupporters = async () => {
    try {
      const { data } = await api.get("/support/supporters");
      setSupporters(Array.isArray(data?.supporters) ? data.supporters : []);
    } catch {
      setSupporters([]);
    }
  };

  useEffect(() => {
    loadSupporters();
  }, []);

  const donate = async () => {
    setError("");
    if (!value || value < 1) return;
    setStatus("processing");

    let order, keyId;
    try {
      const { data } = await api.post("/support/order", {
        amount: value,
        name: name.trim() || undefined,
        message: message.trim() || undefined,
        showOnWall,
      });
      order = data.order;
      keyId = data.keyId;
      if (!order?.id || !keyId) throw new Error("missing order");
    } catch (err) {
      setStatus("idle");
      if (err?.response?.status === 401) {
        setError("Please sign in first — then you can support CodeArena.");
      } else {
        setError("Donations aren't enabled yet. Please check back soon!");
      }
      return;
    }

    try {
      await loadRazorpay();
    } catch {
      setStatus("idle");
      setError("Couldn't reach the payment provider. Check your connection and try again.");
      return;
    }

    const rzp = new window.Razorpay({
      key: keyId,
      order_id: order.id,
      amount: order.amount,
      currency: order.currency || "INR",
      name: "CodeArena",
      description: "Support",
      prefill: name.trim() ? { name: name.trim() } : undefined,
      handler: async (resp) => {
        try {
          await api.post("/support/verify", {
            razorpayOrderId: resp.razorpay_order_id,
            razorpayPaymentId: resp.razorpay_payment_id,
            razorpaySignature: resp.razorpay_signature,
          });
          setPaidAmount(value);
          setStatus("done");
          loadSupporters();
        } catch {
          setStatus("idle");
          setError("We couldn't confirm the payment. If you were charged, it'll still be recorded — thank you!");
        }
      },
      modal: {
        ondismiss: () => setStatus("idle"),
      },
    });

    rzp.on("payment.failed", () => {
      setStatus("idle");
      setError("The payment didn't go through. No charge was made — feel free to try again.");
    });

    rzp.open();
  };

  return (
    <div style={{ maxWidth: 1080, display: "flex", flexDirection: "column", gap: 22 }}>
      <div style={{ display: "grid", gridTemplateColumns: "1.15fr 1fr", gap: 22, alignItems: "start" }}>
        {/* Left — the ask + amount + optional note */}
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
            <h3 style={{ fontFamily: "var(--font-heading)", fontSize: 17, margin: "0 0 4px" }}>Leave your mark (optional)</h3>
            <p style={{ margin: "0 0 14px", fontSize: 13, color: muted(64) }}>
              Add your name and a note to the supporters wall — only shown if you opt in below.
            </p>
            <div className="field" style={{ marginBottom: 12 }}>
              <label>Name</label>
              <input className="input" placeholder="How should we thank you?" value={name} maxLength={60}
                onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="field" style={{ marginBottom: 12 }}>
              <label>Message</label>
              <input className="input" placeholder="A word of encouragement (optional)" value={message} maxLength={140}
                onChange={(e) => setMessage(e.target.value)} />
            </div>
            <label style={{ display: "flex", alignItems: "center", gap: 9, fontSize: 14, color: muted(78), cursor: "pointer" }}>
              <input type="checkbox" checked={showOnWall} onChange={(e) => setShowOnWall(e.target.checked)}
                style={{ width: 16, height: 16, accentColor: "var(--color-accent)", cursor: "pointer" }} />
              Show my name on the public supporters wall
            </label>
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

        {/* Right — summary + pay, or thank-you */}
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          {status === "done" ? (
            <div style={{ background: "var(--color-accent-2-100)", borderRadius: 22, padding: "28px 26px", textAlign: "center" }}>
              <div style={{ width: 52, height: 52, borderRadius: 15, background: "var(--color-accent-2-200)", color: "var(--color-accent-2-800)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px" }}>
                <Sparkles size={24} strokeWidth={2.5} />
              </div>
              <div style={{ fontFamily: "var(--font-heading)", fontSize: 22, color: "var(--color-accent-2-900)", marginBottom: 6 }}>
                Thank you{name.trim() ? `, ${name.trim().split(" ")[0]}` : ""}!
              </div>
              <p style={{ margin: "0 0 18px", fontSize: 14, color: "color-mix(in srgb, var(--color-accent-2-900) 78%, transparent)" }}>
                Your ₹{paidAmount} keeps CodeArena free and the judge humming. It genuinely means a lot.
              </p>
              <button className="btn btn-secondary" onClick={() => { setStatus("idle"); setError(""); }}>
                Support again
              </button>
            </div>
          ) : (
            <div style={{ background: "var(--color-accent-2-100)", borderRadius: 22, padding: "24px 26px" }}>
              <div style={{ fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--color-accent-2-800)", fontWeight: 700, marginBottom: 12 }}>Your contribution</div>
              <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 16 }}>
                <div style={{ fontFamily: "var(--font-heading)", fontSize: 18, color: "var(--color-accent-2-900)" }}>One-time support</div>
                <div style={{ fontFamily: "var(--font-heading)", fontSize: 30, color: "var(--color-accent-2-900)" }}>₹{value || 0}</div>
              </div>

              {error && (
                <div role="alert" style={{ display: "flex", gap: 8, alignItems: "flex-start", background: "color-mix(in srgb, var(--color-accent-2-900) 8%, transparent)", borderRadius: 12, padding: "10px 12px", marginBottom: 12, fontSize: 13, color: "var(--color-accent-2-900)" }}>
                  <AlertCircle size={16} strokeWidth={2.5} style={{ flex: "none", marginTop: 1 }} />
                  <span>{error}</span>
                </div>
              )}

              <button className="btn btn-primary btn-block" disabled={!value || status === "processing"} onClick={donate} style={{ marginTop: 4 }}>
                {status === "processing" ? "Opening checkout…" : `Support with ₹${value || 0}`}
              </button>
              <div style={{ display: "flex", alignItems: "center", gap: 7, justifyContent: "center", fontSize: 11, color: "color-mix(in srgb, var(--color-accent-2-900) 70%, transparent)", marginTop: 12 }}>
                <ShieldCheck size={14} strokeWidth={2.5} /> Secured by Razorpay · no account needed
              </div>
            </div>
          )}

          <div style={{ background: "var(--color-surface)", borderRadius: 22, boxShadow: "var(--shadow-sm)", padding: "20px 24px", fontSize: 13.5, color: muted(70), lineHeight: 1.6 }}>
            A donation unlocks nothing extra — everything is already free. It's a thank-you, not a purchase.
            Add your name to the supporters wall above if you'd like (optional).
          </div>
        </div>
      </div>

      {/* Supporters wall */}
      <div style={{ background: "var(--color-surface)", borderRadius: 24, boxShadow: "var(--shadow-sm)", padding: "24px 28px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 4 }}>
          <Heart size={18} strokeWidth={2.5} color="var(--color-accent-2-600)" />
          <h3 style={{ fontFamily: "var(--font-heading)", fontSize: 18, margin: 0 }}>Supporters wall</h3>
        </div>
        <p style={{ margin: "0 0 18px", fontSize: 13.5, color: muted(64) }}>
          The wonderful people keeping CodeArena free for everyone.
        </p>

        {supporters.length === 0 ? (
          <div style={{ fontSize: 14, color: muted(58), padding: "8px 0" }}>
            No names on the wall yet — be the first to add yours.
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 12 }}>
            {supporters.map((s, i) => {
              const initial = (s.name || "?").trim().charAt(0).toUpperCase() || "?";
              return (
                <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start", border: "1px solid var(--color-divider)", borderRadius: 16, padding: "12px 14px" }}>
                  <div style={{ width: 34, height: 34, flex: "none", borderRadius: 10, background: "var(--color-accent-2-100)", color: "var(--color-accent-2-800)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 14, fontFamily: "var(--font-heading)" }}>
                    {initial}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "baseline", gap: 8, justifyContent: "space-between" }}>
                      <div style={{ fontWeight: 600, fontSize: 14, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.name}</div>
                      {s.amount ? <div style={{ fontSize: 12, fontWeight: 700, color: "var(--color-accent-2-700)", flex: "none" }}>₹{s.amount}</div> : null}
                    </div>
                    {s.message ? (
                      <div style={{ display: "flex", gap: 5, marginTop: 3, fontSize: 12.5, color: muted(66) }}>
                        <Quote size={12} strokeWidth={2.5} style={{ flex: "none", marginTop: 2, opacity: 0.6 }} />
                        <span>{s.message}</span>
                      </div>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
