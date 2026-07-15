import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { MessageSquare, MessagesSquare, ArrowBigUp, Plus, X } from "lucide-react";
import { api } from "../lib/api.js";
import Spinner from "../components/Spinner.jsx";

const muted = (p = 60) => `color-mix(in srgb, var(--color-text) ${p}%, transparent)`;
const surface = { background: "var(--color-surface)", borderRadius: 22, boxShadow: "var(--shadow-sm)" };

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

export default function Discuss() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ title: "", body: "" });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const load = (silent = false) => {
    if (!silent) setLoading(true);
    return api
      .get("/community/discussions")
      .then(({ data }) => setItems(pickList(data, "discussions")))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    setBusy(true);
    setErr("");
    try {
      await api.post("/community/discussions", { title: form.title.trim(), body: form.body.trim() });
      setForm({ title: "", body: "" });
      setModal(false);
      await load(true);
    } catch (e2) {
      setErr(e2.response?.data?.message || e2.response?.data?.error || "Could not post discussion");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={{ maxWidth: 820 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18 }}>
        <div style={{ color: muted(65), fontSize: 14 }}>
          {items.length > 0 ? `${items.length} discussion${items.length === 1 ? "" : "s"}` : "Ask, share, and help others."}
        </div>
        <button className="btn btn-primary" style={{ marginLeft: "auto", gap: 6 }} onClick={() => setModal(true)}>
          <Plus size={16} strokeWidth={2.5} /> New discussion
        </button>
      </div>

      {loading ? (
        <Spinner label="Loading discussions…" />
      ) : items.length === 0 ? (
        <div style={{ ...surface, padding: "44px 44px", textAlign: "center", color: muted(60) }}>
          <MessagesSquare size={28} strokeWidth={2.5} color="var(--color-accent)" style={{ marginBottom: 12 }} />
          <div style={{ marginBottom: 4, fontFamily: "var(--font-heading)", fontSize: 18, color: "var(--color-text)" }}>No discussions yet</div>
          <div>Start the conversation — ask a question or share a tip.</div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {items.map((d) => {
            const author = d.user || d.author || {};
            const votes = d.votes ?? 0;
            const comments = d._count?.comments ?? d.commentCount ?? (Array.isArray(d.comments) ? d.comments.length : 0);
            return (
              <Link key={d.id} to={`/discuss/${d.id}`} className="hover-lift" style={{ ...surface, textDecoration: "none", color: "inherit", padding: "18px 22px", display: "flex", gap: 16, alignItems: "center" }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1, minWidth: 40, color: muted(60) }}>
                  <ArrowBigUp size={19} strokeWidth={2.2} />
                  <span style={{ fontWeight: 700, fontSize: 15, color: "var(--color-text)", fontVariantNumeric: "tabular-nums" }}>{votes}</span>
                  <span style={{ fontSize: 10, letterSpacing: "0.04em", textTransform: "uppercase" }}>votes</span>
                </div>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ fontFamily: "var(--font-heading)", fontSize: 17, marginBottom: 5, lineHeight: 1.25 }}>{d.title}</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5, color: muted(58), flexWrap: "wrap" }}>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                      <span style={{ width: 20, height: 20, borderRadius: "50%", background: "var(--color-accent-2-300)", color: "var(--color-accent-2-800)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 700 }}>{initialsOf(author.name, author.username)}</span>
                      {author.username ? `@${author.username}` : author.name || "member"}
                    </span>
                    <span>·</span>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}><MessageSquare size={13} /> {comments}</span>
                    <span>·</span>
                    <span>{timeAgo(d.createdAt)}</span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {modal && (
        <div className="dialog-backdrop" onMouseDown={(e) => e.target === e.currentTarget && setModal(false)}>
          <form className="dialog" onSubmit={submit} style={{ width: "min(520px, 100%)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div className="dialog-title">New discussion</div>
              <button type="button" className="btn btn-ghost btn-icon" onClick={() => setModal(false)} aria-label="Close"><X size={18} /></button>
            </div>
            {err && <div style={{ background: "var(--color-accent-100)", color: "var(--color-accent-800)", fontSize: 13, padding: "9px 12px", borderRadius: 12 }}>{err}</div>}
            <div className="field">
              <label>Title</label>
              <input className="input" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="What's your question or topic?" autoFocus />
            </div>
            <div className="field">
              <label>Details</label>
              <textarea className="input" rows={5} value={form.body} onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))} placeholder="Add context, code, or what you've tried…" style={{ borderRadius: 16 }} />
            </div>
            <div className="dialog-actions">
              <button type="button" className="btn btn-secondary" onClick={() => setModal(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={busy || !form.title.trim()}>{busy ? "Posting…" : "Post discussion"}</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
