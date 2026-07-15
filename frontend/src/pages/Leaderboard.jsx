import { useEffect, useState } from "react";
import { Trophy } from "lucide-react";
import { api } from "../lib/api.js";
import Spinner from "../components/Spinner.jsx";

const muted = (p = 60) => `color-mix(in srgb, var(--color-text) ${p}%, transparent)`;
const surface = { background: "var(--color-surface)", borderRadius: 22, boxShadow: "var(--shadow-sm)" };
const PODIUM = ["var(--color-accent)", "var(--color-accent-2-500)", "var(--color-accent-400)"];
const initials = (n) => (n || "?").split(" ").map((s) => s[0]).slice(0, 2).join("").toUpperCase();

export default function Leaderboard() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    api
      .get("/leaderboard")
      .then(({ data }) => active && setRows(data.leaderboard || []))
      .catch(() => active && setRows([]))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  if (loading) return <Spinner label="Loading leaderboard…" full />;

  if (rows.length === 0) {
    return (
      <div style={{ ...surface, maxWidth: 560, padding: "40px 44px", textAlign: "center", color: muted(60) }}>
        <Trophy size={26} strokeWidth={2.5} color="var(--color-accent)" style={{ marginBottom: 12 }} />
        <div>No one's on the board yet. Solve a problem to claim rank #1.</div>
      </div>
    );
  }

  const top3 = rows.slice(0, 3);
  const rest = rows.slice(3);

  return (
    <div style={{ maxWidth: 820 }}>
      {/* podium */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14, marginBottom: 18 }}>
        {top3.map((u, i) => (
          <div key={u.id} style={{ ...surface, padding: "22px 18px", textAlign: "center", order: i === 0 ? 2 : i === 1 ? 1 : 3, transform: i === 0 ? "scale(1.04)" : "none" }}>
            <div style={{ width: 52, height: 52, borderRadius: "50%", margin: "0 auto 10px", background: PODIUM[i], color: "var(--color-bg)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-heading)", fontSize: 18 }}>{initials(u.name)}</div>
            <div style={{ fontSize: 12, fontWeight: 700, color: PODIUM[i] }}>#{u.rank}</div>
            <div style={{ fontFamily: "var(--font-heading)", fontSize: 16, margin: "3px 0" }}>{u.name}</div>
            <div style={{ fontSize: 12, color: muted(55) }}>{u.solved} solved</div>
          </div>
        ))}
      </div>

      {rest.length > 0 && (
        <div style={{ ...surface, overflow: "hidden" }}>
          <table className="table">
            <thead>
              <tr>
                <th style={{ width: 60 }}>Rank</th>
                <th>User</th>
                <th style={{ textAlign: "right" }}>Solved</th>
              </tr>
            </thead>
            <tbody>
              {rest.map((u) => (
                <tr key={u.id}>
                  <td style={{ fontVariantNumeric: "tabular-nums", color: muted(60) }}>#{u.rank}</td>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{ width: 28, height: 28, borderRadius: "50%", background: "var(--color-accent-2-300)", color: "var(--color-accent-2-800)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700 }}>{initials(u.name)}</span>
                      <span style={{ fontWeight: 600 }}>{u.name}</span>
                      {u.username && <span style={{ color: muted(45), fontSize: 12 }}>@{u.username}</span>}
                    </div>
                  </td>
                  <td style={{ textAlign: "right", fontWeight: 600 }}>{u.solved}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
