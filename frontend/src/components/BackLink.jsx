import { ArrowLeft } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useSmartBack } from "../lib/useSmartBack.js";

// Drop-in replacement for the inline "back" links every detail page uses. It
// stays a real <a href={fallback}> so styling, focus, hover-preview and
// middle/cmd-click "open parent in a new tab" all keep working — only a plain
// left-click is intercepted to pop history back to the true previous page.
// `fallback` is BOTH the href (for modified clicks / cold loads) AND the
// cold-load destination.
const base = {
  display: "inline-flex",
  alignItems: "center",
  gap: 5,
  fontSize: 13,
  color: "var(--color-accent-700)",
  textDecoration: "none",
  fontWeight: 600,
  marginBottom: 14,
};

export default function BackLink({ fallback = "/app", label = "Back", size = 15, style }) {
  const goBack = useSmartBack(fallback);
  const { key } = useLocation();
  const canGoBack = key && key !== "default";
  const onClick = (e) => {
    if (!canGoBack) return; // cold load → let the href hit the fallback
    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return; // new-tab intent → honor href
    e.preventDefault();
    goBack();
  };
  return (
    <Link to={fallback} onClick={onClick} style={{ ...base, ...style }}>
      <ArrowLeft size={size} strokeWidth={2.75} /> {label}
    </Link>
  );
}
