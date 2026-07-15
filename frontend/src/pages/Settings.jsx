import { useEffect, useState } from "react";
import { api } from "../lib/api.js";
import { useAuth } from "../store/auth.js";
import Spinner from "../components/Spinner.jsx";

const muted = (p = 60) => `color-mix(in srgb, var(--color-text) ${p}%, transparent)`;
const card = { background: "var(--color-surface)", borderRadius: 24, boxShadow: "var(--shadow-sm)", padding: "24px 26px" };
const good = { background: "var(--color-accent-2-100)", color: "var(--color-accent-2-800)", fontSize: 13, padding: "9px 12px", borderRadius: 12, marginBottom: 12 };
const bad = { background: "var(--color-accent-100)", color: "var(--color-accent-800)", fontSize: 13, padding: "9px 12px", borderRadius: 12, marginBottom: 12 };

export default function Settings() {
  const hydrate = useAuth((s) => s.hydrate);
  const [loading, setLoading] = useState(true);
  const [f, setF] = useState({ name: "", username: "", bio: "", githubUrl: "", websiteUrl: "", email: "" });
  const [pMsg, setPMsg] = useState(""); const [pErr, setPErr] = useState(""); const [pBusy, setPBusy] = useState(false);
  const [cur, setCur] = useState(""); const [nw, setNw] = useState("");
  const [pwMsg, setPwMsg] = useState(""); const [pwErr, setPwErr] = useState(""); const [pwBusy, setPwBusy] = useState(false);

  useEffect(() => {
    let active = true;
    api.get("/auth/profile").then(({ data }) => {
      if (!active) return;
      const u = data?.data?.user || {};
      setF({ name: u.name || "", username: u.username || "", bio: u.bio || "", githubUrl: u.githubUrl || "", websiteUrl: u.websiteUrl || "", email: u.email || "" });
    }).finally(() => active && setLoading(false));
    return () => { active = false; };
  }, []);

  const set = (k) => (e) => setF((p) => ({ ...p, [k]: e.target.value }));

  const saveProfile = async (e) => {
    e.preventDefault(); setPMsg(""); setPErr(""); setPBusy(true);
    try {
      await api.put("/auth/profile", { name: f.name, username: f.username, bio: f.bio, githubUrl: f.githubUrl, websiteUrl: f.websiteUrl });
      await hydrate();
      setPMsg("Profile saved.");
    } catch (err) { setPErr(err.response?.data?.message || "Could not save profile"); }
    finally { setPBusy(false); }
  };

  const changePw = async (e) => {
    e.preventDefault(); setPwMsg(""); setPwErr(""); setPwBusy(true);
    try {
      await api.post("/auth/change-password", { currentPassword: cur, newPassword: nw });
      setPwMsg("Password changed."); setCur(""); setNw("");
    } catch (err) { setPwErr(err.response?.data?.message || "Could not change password"); }
    finally { setPwBusy(false); }
  };

  if (loading) return <Spinner label="Loading settings…" full />;

  return (
    <div style={{ maxWidth: 640, display: "flex", flexDirection: "column", gap: 18 }}>
      <form onSubmit={saveProfile} style={card}>
        <h3 style={{ fontFamily: "var(--font-heading)", fontSize: 19, margin: "0 0 16px" }}>Profile</h3>
        {pMsg && <div style={good}>{pMsg}</div>}
        {pErr && <div style={bad}>{pErr}</div>}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <div className="field"><label>Name</label><input className="input" value={f.name} onChange={set("name")} /></div>
          <div className="field"><label>Username</label><input className="input" value={f.username} onChange={set("username")} placeholder="handle" /></div>
        </div>
        <div className="field" style={{ marginTop: 14 }}><label>Email</label><input className="input" value={f.email} disabled style={{ opacity: 0.6 }} /></div>
        <div className="field" style={{ marginTop: 14 }}><label>Bio</label><textarea className="input" value={f.bio} onChange={set("bio")} rows={3} style={{ borderRadius: 16 }} /></div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginTop: 14 }}>
          <div className="field"><label>GitHub URL</label><input className="input" value={f.githubUrl} onChange={set("githubUrl")} placeholder="https://github.com/…" /></div>
          <div className="field"><label>Website</label><input className="input" value={f.websiteUrl} onChange={set("websiteUrl")} placeholder="https://…" /></div>
        </div>
        <button className="btn btn-primary" disabled={pBusy} style={{ marginTop: 18 }}>{pBusy ? "Saving…" : "Save profile"}</button>
      </form>

      <form onSubmit={changePw} style={card}>
        <h3 style={{ fontFamily: "var(--font-heading)", fontSize: 19, margin: "0 0 16px" }}>Password</h3>
        {pwMsg && <div style={good}>{pwMsg}</div>}
        {pwErr && <div style={bad}>{pwErr}</div>}
        <div className="field" style={{ marginBottom: 12 }}><label>Current password</label><input className="input" type="password" value={cur} onChange={(e) => setCur(e.target.value)} /></div>
        <div className="field"><label>New password</label><input className="input" type="password" value={nw} onChange={(e) => setNw(e.target.value)} /></div>
        <div style={{ fontSize: 11, color: muted(50), marginTop: 6 }}>At least 8 characters, with an uppercase, a lowercase, and a number.</div>
        <button className="btn btn-secondary" disabled={pwBusy} style={{ marginTop: 16 }}>{pwBusy ? "Changing…" : "Change password"}</button>
      </form>
    </div>
  );
}
