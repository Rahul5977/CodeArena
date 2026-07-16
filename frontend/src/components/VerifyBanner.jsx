import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { AlertTriangle, CheckCircle2, X } from "lucide-react";
import { api } from "../lib/api.js";
import { useAuth } from "../store/auth.js";

// Slim strip above the app content. Prompts email/password users to verify (with
// a Resend button) until emailVerified is true; OAuth users are already verified
// so they never see it. Also catches the ?verified=1 redirect from the email link
// to refresh the session and confirm success.
export default function VerifyBanner() {
  const user = useAuth((s) => s.user);
  const hydrate = useAuth((s) => s.hydrate);
  const [params, setParams] = useSearchParams();
  const [justVerified, setJustVerified] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [resend, setResend] = useState("idle"); // idle | sending | sent | error
  const [msg, setMsg] = useState("");

  useEffect(() => {
    if (params.get("verified") === "1") {
      setJustVerified(true);
      hydrate(); // refresh emailVerified so the prompt disappears
      const next = new URLSearchParams(params);
      next.delete("verified");
      setParams(next, { replace: true });
    }
    // run once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const doResend = async () => {
    setResend("sending");
    try {
      const { data } = await api.post("/auth/resend-verification");
      setResend("sent");
      setMsg(data?.data?.alreadyVerified ? "Already verified — refresh the page." : "Sent! Check your inbox (and spam).");
    } catch (e) {
      setResend("error");
      setMsg(e.response?.data?.message || "Couldn't send — try again shortly.");
    }
  };

  if (justVerified && !dismissed) {
    return (
      <Bar bg="var(--color-accent-2-100)" fg="var(--color-accent-2-800)" onClose={() => setDismissed(true)}>
        <CheckCircle2 size={16} strokeWidth={2.5} style={{ flex: "none" }} />
        <span>Your email is verified — you're all set.</span>
      </Bar>
    );
  }

  if (!user || user.emailVerified || dismissed) return null;

  return (
    <Bar bg="var(--color-accent-100)" fg="var(--color-accent-800)" onClose={() => setDismissed(true)}>
      <AlertTriangle size={16} strokeWidth={2.5} style={{ flex: "none" }} />
      <span style={{ minWidth: 0 }}>
        Verify your email to submit solutions and post — link sent to <strong>{user.email}</strong>.
      </span>
      {resend === "sent" || resend === "error" ? (
        <span style={{ fontWeight: 600, whiteSpace: "nowrap" }}>{msg}</span>
      ) : (
        <button onClick={doResend} disabled={resend === "sending"} className="btn btn-secondary" style={{ fontSize: 12, padding: "4px 12px", flex: "none" }}>
          {resend === "sending" ? "Sending…" : "Resend email"}
        </button>
      )}
    </Bar>
  );
}

function Bar({ bg, fg, children, onClose }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 28px", background: bg, color: fg, fontSize: 13, borderBottom: "1px solid var(--color-divider)", flex: "none" }}>
      {children}
      <button onClick={onClose} aria-label="Dismiss" style={{ marginLeft: "auto", background: "transparent", border: "none", cursor: "pointer", color: "inherit", display: "flex", opacity: 0.7, flex: "none" }}>
        <X size={16} strokeWidth={2.5} />
      </button>
    </div>
  );
}
