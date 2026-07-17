import { NavLink, Link, useLocation, useNavigate, Outlet } from "react-router-dom";
import {
  Code2, LayoutDashboard, Library, ListChecks, Trophy, BarChart3,
  FileCheck2, MessagesSquare, User, Settings, ShieldCheck, Heart, Flame, Bell, Search, LogOut, Info,
} from "lucide-react";
import { useAuth } from "../store/auth.js";
import VerifyBanner from "./VerifyBanner.jsx";

// Sidebar model — mirrors AppShell.dc.html. `title` drives the top-bar heading;
// `search:false` hides the header search on that route.
const NAV = [
  { group: "Practice", items: [
    { key: "dashboard", label: "Dashboard", to: "/app", title: "Dashboard", Icon: LayoutDashboard },
    { key: "problems", label: "Problems", to: "/problems", title: "Problems", Icon: Code2 },
    { key: "sheets", label: "DSA Sheets", to: "/sheets", title: "DSA Sheets", Icon: Library },
    { key: "playlists", label: "Playlists", to: "/playlists", title: "Playlists", Icon: ListChecks },
    { key: "contests", label: "Contests", to: "/contests", title: "Contests", Icon: Trophy },
    { key: "leaderboard", label: "Leaderboard", to: "/leaderboard", title: "Leaderboard", Icon: BarChart3 },
    { key: "submissions", label: "Submissions", to: "/submissions", title: "Submissions", Icon: FileCheck2 },
    { key: "discuss", label: "Discuss", to: "/discuss", title: "Discuss", Icon: MessagesSquare },
  ]},
  { group: "Account", items: [
    { key: "profile", label: "Profile", to: "/profile", title: "Profile", Icon: User },
    { key: "about", label: "About", to: "/about", title: "About", search: false, Icon: Info },
    { key: "settings", label: "Settings", to: "/settings", title: "Settings", search: false, Icon: Settings },
    { key: "admin", label: "Admin", to: "/admin", title: "Admin", search: false, adminOnly: true, Icon: ShieldCheck },
  ]},
];

// Routes reachable outside the main nav still need a title / search preference.
const EXTRA_TITLES = {
  "/support": { title: "Support CodeArena", search: false },
};

function matchRoute(pathname) {
  const all = NAV.flatMap((g) => g.items);
  // longest `to` prefix wins so /problems/:slug still highlights Problems
  const hit = all
    .filter((i) => pathname === i.to || pathname.startsWith(i.to + "/"))
    .sort((a, b) => b.to.length - a.to.length)[0];
  if (hit) return hit;
  for (const [to, meta] of Object.entries(EXTRA_TITLES)) {
    if (pathname === to || pathname.startsWith(to + "/")) return { key: null, ...meta };
  }
  return { key: null, title: "CodeArena", search: true };
}

export default function AppShell() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const active = matchRoute(location.pathname);
  const showSearch = active.search !== false;

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  return (
    <div style={{ display: "flex", width: "100%", height: "100%", background: "var(--color-bg)", color: "var(--color-text)", fontFamily: "var(--font-body)", overflow: "hidden" }}>
      {/* ── Sidebar ── */}
      <aside style={{ width: 248, flex: "none", height: "100%", background: "var(--color-surface)", display: "flex", flexDirection: "column", padding: "20px 16px 18px", overflowY: "auto" }}>
        <Link to="/" style={{ display: "flex", alignItems: "center", gap: 11, padding: "2px 8px 20px", textDecoration: "none", color: "var(--color-text)" }}>
          <div style={{ width: 38, height: 38, borderRadius: 12, background: "var(--color-accent)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--color-bg)", flex: "none" }}>
            <Code2 size={21} strokeWidth={2.75} />
          </div>
          <span style={{ fontFamily: "var(--font-heading)", fontSize: 20, letterSpacing: "-0.01em" }}>CodeArena</span>
        </Link>

        {NAV.map((g, gi) => (
          <div key={g.group}>
            {gi > 0 && <div style={{ height: 1, background: "var(--color-divider)", margin: "12px 10px 8px" }} />}
            <div style={{ fontSize: 10, letterSpacing: "0.11em", textTransform: "uppercase", color: "color-mix(in srgb, var(--color-text) 48%, transparent)", padding: "6px 10px 6px", fontWeight: 600 }}>{g.group}</div>
            {g.items.filter((i) => !i.adminOnly || user?.isAdmin).map((item) => (
              <NavLink key={item.key} to={item.to} end={item.to === "/app"} className={({ isActive }) => "nav-item" + (isActive ? " active" : "")}>
                <item.Icon size={19} strokeWidth={2.5} />
                <span>{item.label}</span>
              </NavLink>
            ))}
          </div>
        ))}

        <div style={{ flex: 1, minHeight: 16 }} />

        <Link to="/support" style={{ display: "block", textDecoration: "none", background: "var(--color-accent-2-100)", borderRadius: 20, padding: "15px 16px", marginBottom: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--color-accent-2-800)", fontFamily: "var(--font-heading)", fontSize: 15, marginBottom: 4 }}>
            <Heart size={17} strokeWidth={2.5} /> Support CodeArena
          </div>
          <div style={{ fontSize: 12, color: "color-mix(in srgb, var(--color-accent-2-900) 80%, transparent)", lineHeight: 1.45 }}>
            Free forever. Chip in any amount to keep it running.
          </div>
        </Link>

        <div style={{ display: "flex", alignItems: "center", gap: 11, padding: "2px 4px" }}>
          <div style={{ width: 36, height: 36, borderRadius: "50%", background: "var(--color-accent-2-300)", color: "var(--color-accent-2-800)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 13, flex: "none" }}>{user?.initials}</div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{user?.name}</div>
            <div style={{ fontSize: 11, color: "color-mix(in srgb, var(--color-text) 55%, transparent)" }}>{user?.role}</div>
          </div>
          <button onClick={handleLogout} className="btn btn-ghost btn-icon" title="Log out" aria-label="Log out" style={{ width: 30, height: 30, color: "color-mix(in srgb, var(--color-text) 55%, transparent)" }}>
            <LogOut size={16} strokeWidth={2.5} />
          </button>
        </div>
      </aside>

      {/* ── Main column ── */}
      <div style={{ flex: 1, minWidth: 0, height: "100%", display: "flex", flexDirection: "column" }}>
        <VerifyBanner />
        <header style={{ height: 68, flex: "none", display: "flex", alignItems: "center", gap: 16, padding: "0 28px", background: "var(--color-bg)", borderBottom: "1px solid var(--color-divider)" }}>
          <div style={{ marginRight: "auto", minWidth: 0 }}>
            <div style={{ fontFamily: "var(--font-heading)", fontSize: 23, lineHeight: 1.1, letterSpacing: "-0.01em" }}>{active.title}</div>
          </div>
          {showSearch && (
            <div style={{ position: "relative", width: 270 }}>
              <Search size={17} strokeWidth={2.5} style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", color: "color-mix(in srgb, var(--color-text) 50%, transparent)" }} />
              <input className="input" placeholder="Search problems, sheets…" style={{ paddingLeft: 38, height: 40, background: "var(--color-surface)" }} />
            </div>
          )}
          <div style={{ display: "flex", alignItems: "center", gap: 6, background: "var(--color-accent-100)", color: "var(--color-accent-800)", padding: "7px 13px", borderRadius: 999, fontSize: 13, fontWeight: 700, flex: "none" }}>
            <Flame size={16} strokeWidth={2.5} color="var(--color-accent)" /> {user?.streak}
          </div>
          <button className="btn btn-secondary btn-icon" style={{ position: "relative", flex: "none" }} aria-label="Notifications">
            <Bell size={18} strokeWidth={2.5} />
            <span style={{ position: "absolute", top: 6, right: 7, width: 7, height: 7, borderRadius: "50%", background: "var(--color-accent)", border: "1.5px solid var(--color-bg)" }} />
          </button>
          <div style={{ width: 38, height: 38, borderRadius: "50%", background: "var(--color-accent-2-300)", color: "var(--color-accent-2-800)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 13, flex: "none" }}>{user?.initials}</div>
        </header>

        <main style={{ flex: 1, minHeight: 0, overflowY: "auto", padding: "28px 30px 40px" }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
