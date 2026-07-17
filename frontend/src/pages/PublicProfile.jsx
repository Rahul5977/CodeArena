import { useCallback, useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Github, Globe, UserPlus, UserCheck, UserX, Users } from "lucide-react";
import { api } from "../lib/api.js";
import { useAuth } from "../store/auth.js";
import Spinner from "../components/Spinner.jsx";
import BackLink from "../components/BackLink.jsx";

const muted = (p = 60) => `color-mix(in srgb, var(--color-text) ${p}%, transparent)`;
const surface = { background: "var(--color-surface)", borderRadius: 22, boxShadow: "var(--shadow-sm)" };
const DIFF = {
  EASY: { bg: "var(--color-accent-2-100)", fg: "var(--color-accent-2-800)", label: "Easy" },
  MEDIUM: { bg: "var(--color-accent-100)", fg: "var(--color-accent-800)", label: "Medium" },
  HARD: { bg: "var(--color-accent-200)", fg: "var(--color-accent-900)", label: "Hard" },
};

const num = (...vals) => {
  for (const v of vals) if (typeof v === "number" && !Number.isNaN(v)) return v;
  return 0;
};
const firstArray = (...vals) => vals.find((v) => Array.isArray(v)) || [];
const initialsOf = (name, username) =>
  (name || username || "?").split(" ").map((s) => s[0]).slice(0, 2).join("").toUpperCase();

// Normalizes whatever shape the community API returns into a flat profile.
function parse(raw) {
  const d = raw || {};
  const p = d.profile || d.user || d.data?.user || d.data || d;
  const st = d.stats || p.stats || {};
  const c = p._count || {};
  const solvedList = firstArray(
    d.solvedProblems, d.recentSolved, d.solved, p.solvedProblems, p.recentSolved, p.solved,
  ).map((it) => it?.problem || it).filter(Boolean);
  return {
    id: p.id || p.userId || d.userId,
    name: p.name || "",
    username: p.username || "",
    bio: p.bio || "",
    githubUrl: p.githubUrl || "",
    websiteUrl: p.websiteUrl || "",
    solved: num(st.solved, p.solved, p.solvedCount, c.problemSolved),
    submissions: num(st.submissions, p.submissions, p.submissionCount, c.submissions),
    followers: num(st.followers, p.followers, p.followersCount, c.followers),
    following: num(st.following, p.following, p.followingCount, c.following),
    followed: Boolean(
      d.isFollowing ?? p.isFollowing ?? d.followedByMe ?? p.followedByMe ?? false,
    ),
    solvedProblems: solvedList,
  };
}

export default function PublicProfile() {
  const { username } = useParams();
  const me = useAuth((s) => s.user);
  const [profile, setProfile] = useState(null);
  const [followed, setFollowed] = useState(false);
  const [followers, setFollowers] = useState(0);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [followBusy, setFollowBusy] = useState(false);

  const load = useCallback(() => {
    let active = true;
    setLoading(true);
    setNotFound(false);
    api
      .get(`/community/profiles/${username}`)
      .then(({ data }) => {
        if (!active) return;
        const parsed = parse(data);
        setProfile(parsed);
        setFollowed(parsed.followed);
        setFollowers(parsed.followers);
      })
      .catch((e) => {
        if (!active) return;
        if (e.response?.status === 404) setNotFound(true);
        else setNotFound(true);
        setProfile(null);
      })
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [username]);

  useEffect(() => load(), [load]);

  const isSelf =
    me && profile && (me.id === profile.id || (me.username && me.username === profile.username));
  const canFollow = me && profile?.id && !isSelf;

  const toggleFollow = async () => {
    if (!canFollow) return;
    const next = !followed;
    setFollowBusy(true);
    setFollowed(next);
    setFollowers((f) => Math.max(0, f + (next ? 1 : -1)));
    try {
      await api.post(`/community/follow/${profile.id}`);
    } catch {
      // revert on failure
      setFollowed(!next);
      setFollowers((f) => Math.max(0, f + (next ? -1 : 1)));
    } finally {
      setFollowBusy(false);
    }
  };

  if (loading) return <Spinner label="Loading profile…" full />;

  if (notFound || !profile) {
    return (
      <div style={{ ...surface, maxWidth: 560, padding: "40px 44px", textAlign: "center", color: muted(60) }}>
        <UserX size={26} strokeWidth={2.5} color="var(--color-accent)" style={{ marginBottom: 12 }} />
        <h1 style={{ fontFamily: "var(--font-heading)", fontSize: 22, margin: "0 0 6px", color: "var(--color-text)" }}>User not found</h1>
        <div>No member goes by <strong>@{username}</strong>. <Link to="/leaderboard" style={{ color: "var(--color-accent-700)", fontWeight: 600 }}>Browse the leaderboard →</Link></div>
      </div>
    );
  }

  const p = profile;

  return (
    <div style={{ maxWidth: 900, display: "grid", gridTemplateColumns: "1fr 1.5fr", gap: 18, alignItems: "start" }}>
      <div style={{ gridColumn: "1 / -1" }}><BackLink fallback="/leaderboard" label="Back" /></div>
      {/* identity card */}
      <div style={{ ...surface, padding: "28px 26px" }}>
        <div style={{ width: 72, height: 72, borderRadius: "50%", background: "var(--color-accent-2-300)", color: "var(--color-accent-2-800)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-heading)", fontSize: 26, marginBottom: 14 }}>
          {initialsOf(p.name, p.username)}
        </div>
        <h1 style={{ fontFamily: "var(--font-heading)", fontSize: 24, margin: "0 0 2px" }}>{p.name || p.username}</h1>
        {p.username && <div style={{ color: muted(55), marginBottom: 10 }}>@{p.username}</div>}
        {p.bio && <p style={{ fontSize: 14, color: muted(75), margin: "0 0 12px", lineHeight: 1.55 }}>{p.bio}</p>}
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {p.githubUrl && <a href={p.githubUrl} target="_blank" rel="noreferrer" style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "var(--color-accent-700)", textDecoration: "none" }}><Github size={15} /> GitHub</a>}
          {p.websiteUrl && <a href={p.websiteUrl} target="_blank" rel="noreferrer" style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "var(--color-accent-700)", textDecoration: "none" }}><Globe size={15} /> Website</a>}
        </div>

        {isSelf ? (
          <Link to="/settings" className="btn btn-secondary btn-block" style={{ textDecoration: "none", marginTop: 18 }}>Edit profile</Link>
        ) : canFollow ? (
          <button
            onClick={toggleFollow}
            disabled={followBusy}
            className={followed ? "btn btn-secondary btn-block" : "btn btn-primary btn-block"}
            style={{ marginTop: 18, gap: 7 }}
          >
            {followed ? <UserCheck size={16} strokeWidth={2.5} /> : <UserPlus size={16} strokeWidth={2.5} />}
            {followed ? "Following" : "Follow"}
          </button>
        ) : null}
      </div>

      {/* stats + recent solved */}
      <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 14 }}>
          <Stat label="Solved" value={p.solved} />
          <Stat label="Submissions" value={p.submissions} />
          <Stat label="Followers" value={followers} icon={<Users size={13} />} />
          <Stat label="Following" value={p.following} icon={<Users size={13} />} />
        </div>

        <div style={{ ...surface, padding: "20px 22px" }}>
          <h3 style={{ fontFamily: "var(--font-heading)", fontSize: 17, margin: "0 0 14px" }}>Recent solved problems</h3>
          {p.solvedProblems.length === 0 ? (
            <div style={{ fontSize: 13.5, color: muted(60) }}>No solved problems yet.</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {p.solvedProblems.slice(0, 12).map((prob, i) => {
                const d = DIFF[prob.difficulty] || DIFF.MEDIUM;
                const inner = (
                  <>
                    <span style={{ fontWeight: 600, fontSize: 14 }}>{prob.title}</span>
                    <span style={{ fontSize: 11, padding: "2px 10px", borderRadius: 999, background: d.bg, color: d.fg, fontWeight: 600, flex: "none" }}>{d.label}</span>
                  </>
                );
                const rowStyle = { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, padding: "9px 4px", borderBottom: i < p.solvedProblems.slice(0, 12).length - 1 ? "1px solid var(--color-divider)" : "none", textDecoration: "none", color: "inherit" };
                return prob.slug ? (
                  <Link key={prob.id || prob.slug || i} to={`/problems/${prob.slug}`} style={rowStyle}>{inner}</Link>
                ) : (
                  <div key={prob.id || i} style={rowStyle}>{inner}</div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, icon }) {
  return (
    <div style={{ ...surface, padding: "16px 18px" }}>
      <div style={{ fontSize: 12, color: muted(60), marginBottom: 6, display: "flex", alignItems: "center", gap: 5 }}>{icon}{label}</div>
      <div style={{ fontFamily: "var(--font-heading)", fontSize: 26, lineHeight: 1 }}>{value}</div>
    </div>
  );
}
