import { useCallback, useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, ArrowBigUp, ArrowBigDown, MessageSquare } from "lucide-react";
import { api } from "../lib/api.js";
import Spinner from "../components/Spinner.jsx";
import Markdown from "../components/Markdown.jsx";

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

const initialsOf = (name, username) =>
  (name || username || "?").split(" ").map((s) => s[0]).slice(0, 2).join("").toUpperCase();

export default function DiscussionThread() {
  const { id } = useParams();
  const [disc, setDisc] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [body, setBody] = useState("");
  const [posting, setPosting] = useState(false);
  const [postErr, setPostErr] = useState("");
  const [voteBusy, setVoteBusy] = useState(false);

  const load = useCallback(
    (silent = false) => {
      if (!silent) setLoading(true);
      return api
        .get(`/community/discussions/${id}`)
        .then(({ data }) => {
          const d = data.discussion || data.data?.discussion || data.data || data;
          setDisc(d);
          const cs = Array.isArray(d?.comments) ? d.comments : Array.isArray(data.comments) ? data.comments : [];
          setComments(cs);
          setNotFound(false);
        })
        .catch((e) => {
          if (e.response?.status === 404) setNotFound(true);
          else setNotFound(true);
          setDisc(null);
        })
        .finally(() => setLoading(false));
    },
    [id],
  );

  useEffect(() => {
    load();
  }, [load]);

  const vote = async (targetType, targetId, value) => {
    if (voteBusy) return;
    setVoteBusy(true);
    try {
      await api.post("/community/vote", { targetType, targetId, value });
      await load(true);
    } catch {
      /* ignore — refetch keeps the count honest */
    } finally {
      setVoteBusy(false);
    }
  };

  const submitComment = async (e) => {
    e.preventDefault();
    if (!body.trim()) return;
    setPosting(true);
    setPostErr("");
    try {
      await api.post("/community/comments", { body: body.trim(), discussionId: id });
      setBody("");
      await load(true);
    } catch (e2) {
      setPostErr(e2.response?.data?.message || e2.response?.data?.error || "Could not post comment");
    } finally {
      setPosting(false);
    }
  };

  if (loading) return <Spinner label="Loading discussion…" full />;

  if (notFound || !disc) {
    return (
      <div style={{ maxWidth: 720 }}>
        <BackLink />
        <div style={{ ...surface, padding: "40px 44px", textAlign: "center", color: muted(60) }}>Discussion not found. <Link to="/discuss" style={{ color: "var(--color-accent-700)", fontWeight: 600 }}>All discussions →</Link></div>
      </div>
    );
  }

  const author = disc.user || disc.author || {};
  const myVote = disc.myVote ?? disc.userVote ?? 0;

  return (
    <div style={{ maxWidth: 720 }}>
      <BackLink />

      {/* the post */}
      <div style={{ ...surface, padding: "24px 26px", display: "flex", gap: 18 }}>
        <Voter votes={disc.votes ?? 0} myVote={myVote} busy={voteBusy} onVote={(v) => vote("discussion", disc.id, v)} />
        <div style={{ minWidth: 0, flex: 1 }}>
          <h1 style={{ fontFamily: "var(--font-heading)", fontSize: 26, margin: "0 0 8px", lineHeight: 1.2 }}>{disc.title}</h1>
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: muted(58), marginBottom: 16 }}>
            <span style={{ width: 22, height: 22, borderRadius: "50%", background: "var(--color-accent-2-300)", color: "var(--color-accent-2-800)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700 }}>{initialsOf(author.name, author.username)}</span>
            {author.username ? (
              <Link to={`/u/${author.username}`} style={{ color: "var(--color-accent-700)", textDecoration: "none", fontWeight: 600 }}>@{author.username}</Link>
            ) : (
              <span>{author.name || "member"}</span>
            )}
            <span>·</span>
            <span>{timeAgo(disc.createdAt)}</span>
          </div>
          {disc.body && <Markdown>{disc.body}</Markdown>}
        </div>
      </div>

      {/* comments */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, margin: "24px 2px 14px", fontFamily: "var(--font-heading)", fontSize: 18 }}>
        <MessageSquare size={18} strokeWidth={2.5} color="var(--color-accent)" /> {comments.length} {comments.length === 1 ? "comment" : "comments"}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {comments.map((c) => {
          const ca = c.user || c.author || {};
          return (
            <div key={c.id} style={{ ...surface, padding: "16px 20px", display: "flex", gap: 16 }}>
              <Voter votes={c.votes ?? 0} myVote={c.myVote ?? c.userVote ?? 0} busy={voteBusy} onVote={(v) => vote("comment", c.id, v)} compact />
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5, color: muted(58), marginBottom: 6 }}>
                  <span style={{ width: 20, height: 20, borderRadius: "50%", background: "var(--color-accent-2-300)", color: "var(--color-accent-2-800)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 700 }}>{initialsOf(ca.name, ca.username)}</span>
                  {ca.username ? (
                    <Link to={`/u/${ca.username}`} style={{ color: "var(--color-accent-700)", textDecoration: "none", fontWeight: 600 }}>@{ca.username}</Link>
                  ) : (
                    <span style={{ fontWeight: 600, color: "var(--color-text)" }}>{ca.name || "member"}</span>
                  )}
                  <span>·</span>
                  <span>{timeAgo(c.createdAt)}</span>
                </div>
                <Markdown>{c.body}</Markdown>
              </div>
            </div>
          );
        })}
      </div>

      {/* comment box */}
      <form onSubmit={submitComment} style={{ ...surface, padding: "18px 20px", marginTop: 16 }}>
        <div style={{ fontFamily: "var(--font-heading)", fontSize: 16, marginBottom: 10 }}>Add a comment</div>
        {postErr && <div style={{ background: "var(--color-accent-100)", color: "var(--color-accent-800)", fontSize: 13, padding: "9px 12px", borderRadius: 12, marginBottom: 10 }}>{postErr}</div>}
        <textarea className="input" rows={4} value={body} onChange={(e) => setBody(e.target.value)} placeholder="Share your thoughts…" style={{ borderRadius: 16 }} />
        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 12 }}>
          <button type="submit" className="btn btn-primary" disabled={posting || !body.trim()}>{posting ? "Posting…" : "Post comment"}</button>
        </div>
      </form>
    </div>
  );
}

function BackLink() {
  return (
    <Link to="/discuss" style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 13, color: "var(--color-accent-700)", textDecoration: "none", fontWeight: 600, marginBottom: 14 }}>
      <ArrowLeft size={15} strokeWidth={2.75} /> All discussions
    </Link>
  );
}

function Voter({ votes, myVote = 0, busy, onVote, compact = false }) {
  const size = compact ? 18 : 22;
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1, flex: "none" }}>
      <button type="button" className="btn btn-ghost btn-icon" onClick={() => onVote(1)} disabled={busy} aria-label="Upvote" style={{ width: 32, height: 30, color: myVote === 1 ? "var(--color-accent)" : muted(50) }}>
        <ArrowBigUp size={size} strokeWidth={2.2} fill={myVote === 1 ? "var(--color-accent)" : "none"} />
      </button>
      <span style={{ fontWeight: 700, fontSize: compact ? 14 : 16, fontVariantNumeric: "tabular-nums" }}>{votes}</span>
      <button type="button" className="btn btn-ghost btn-icon" onClick={() => onVote(-1)} disabled={busy} aria-label="Downvote" style={{ width: 32, height: 30, color: myVote === -1 ? "var(--color-accent-700)" : muted(50) }}>
        <ArrowBigDown size={size} strokeWidth={2.2} fill={myVote === -1 ? "var(--color-accent-700)" : "none"} />
      </button>
    </div>
  );
}
