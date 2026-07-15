import { Loader2 } from "lucide-react";

export default function Spinner({ label = "Loading…", full = false }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 12,
        color: "color-mix(in srgb, var(--color-text) 55%, transparent)",
        ...(full ? { width: "100%", height: "100%", minHeight: "60vh" } : { padding: 48 }),
      }}
    >
      <Loader2 size={26} strokeWidth={2.5} color="var(--color-accent)" style={{ animation: "ca-spin 0.8s linear infinite" }} />
      <span style={{ fontSize: 13 }}>{label}</span>
      <style>{`@keyframes ca-spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
