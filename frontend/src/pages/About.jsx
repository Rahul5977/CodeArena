import { Link } from "react-router-dom";
import {
  Code2, Github, Linkedin, Mail, Heart, Trophy, GraduationCap, Sparkles,
  ArrowRight, ExternalLink, Braces, Users, BookOpen, MessageSquare,
} from "lucide-react";
import { useAuth } from "../store/auth.js";

const muted = (p) => `color-mix(in srgb, var(--color-text) ${p}%, transparent)`;

const FEATURES = [
  { Icon: Code2, title: "In-browser judge", body: "Monaco editor + sandboxed multi-language execution against real test cases, with instant verdicts." },
  { Icon: Trophy, title: "Contests & leaderboards", body: "Timed rounds with per-contest and global rankings that update live." },
  { Icon: BookOpen, title: "Day-by-day DSA sheets", body: "Curated, phase-ordered practice paths with progress tracked per problem." },
  { Icon: MessageSquare, title: "Community & AI review", body: "Discuss threads, shared solutions, and AI-assisted feedback on your code." },
];

const HIGHLIGHTS = [
  { Icon: GraduationCap, label: "IIT Bhilai · B.Tech, Data Science & AI" },
  { Icon: Sparkles, label: "AI Intern @ SuperLiving" },
  { Icon: Braces, label: "Maintainer @ OpenLake" },
  { Icon: Trophy, label: "Code Crusade Winner · 350+ LeetCode" },
  { Icon: Users, label: "100+ students mentored" },
];

const SOCIALS = [
  { Icon: Github, label: "GitHub", href: "https://github.com/Rahul5977" },
  { Icon: Linkedin, label: "LinkedIn", href: "https://www.linkedin.com/in/rahul-raj-iitbh/" },
  { Icon: ExternalLink, label: "LeetCode", href: "https://leetcode.com/u/Rahul_Raj_99/" },
  { Icon: ExternalLink, label: "Blog", href: "https://hashnode.com/@rajcode45" },
  { Icon: Mail, label: "Email", href: "mailto:rahul.raj9237@gmail.com" },
];

function Card({ children, style }) {
  return <div style={{ background: "var(--color-surface)", borderRadius: 24, boxShadow: "var(--shadow-sm)", ...style }}>{children}</div>;
}

export default function About() {
  const user = useAuth((s) => s.user);

  return (
    <div style={{ width: "100%", height: "100%", overflowY: "auto", overflowX: "hidden", background: "var(--color-bg)", color: "var(--color-text)", fontFamily: "var(--font-body)" }}>
      {/* ── Header ── */}
      <header style={{ position: "sticky", top: 0, zIndex: 20, background: "color-mix(in srgb, var(--color-bg) 88%, transparent)", backdropFilter: "blur(10px)", borderBottom: "1px solid var(--color-divider)" }}>
        <div style={{ maxWidth: 960, margin: "0 auto", padding: "0 28px", display: "flex", alignItems: "center", gap: 20, height: 68 }}>
          <Link to="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none", color: "var(--color-text)" }}>
            <div style={{ width: 34, height: 34, borderRadius: 10, background: "var(--color-accent)", color: "var(--color-bg)", display: "flex", alignItems: "center", justifyContent: "center" }}><Code2 size={19} strokeWidth={2.75} /></div>
            <span style={{ fontFamily: "var(--font-heading)", fontSize: 20 }}>CodeArena</span>
          </Link>
          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 12 }}>
            {user ? (
              <Link to="/app" className="btn btn-primary" style={{ textDecoration: "none", padding: "9px 18px" }}>Go to app</Link>
            ) : (
              <>
                <Link to="/login" style={{ fontSize: 14, fontWeight: 500, color: muted(72), textDecoration: "none" }}>Sign in</Link>
                <Link to="/register" className="btn btn-primary" style={{ textDecoration: "none", padding: "9px 18px" }}>Get started free</Link>
              </>
            )}
          </div>
        </div>
      </header>

      <div style={{ maxWidth: 960, margin: "0 auto", padding: "0 28px 64px" }}>
        {/* ── Hero ── */}
        <section style={{ textAlign: "center", padding: "62px 0 44px" }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 7, fontSize: 12.5, fontWeight: 700, letterSpacing: "0.04em", textTransform: "uppercase", color: "var(--color-accent-800)", background: "var(--color-accent-100)", padding: "6px 14px", borderRadius: 999 }}>
            <Sparkles size={14} strokeWidth={2.5} /> About
          </span>
          <h1 style={{ fontFamily: "var(--font-heading)", fontSize: 42, lineHeight: 1.08, margin: "18px 0 12px", letterSpacing: "-0.02em" }}>
            A free arena for people who love to solve.
          </h1>
          <p style={{ fontSize: 17, color: muted(66), maxWidth: 620, margin: "0 auto", lineHeight: 1.6 }}>
            CodeArena is a LeetCode-style platform to <strong>solve, submit, and compete</strong> — built from scratch,
            free forever, and made by one student who wanted a better place to practise.
          </p>
        </section>

        {/* ── The platform ── */}
        <section style={{ marginBottom: 34 }}>
          <h2 style={{ fontFamily: "var(--font-heading)", fontSize: 24, margin: "0 0 16px" }}>The platform</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(230px, 1fr))", gap: 14 }}>
            {FEATURES.map((f) => (
              <Card key={f.title} style={{ padding: "20px 22px" }}>
                <span style={{ display: "inline-flex", width: 40, height: 40, borderRadius: 12, background: "var(--color-accent-100)", color: "var(--color-accent-700)", alignItems: "center", justifyContent: "center", marginBottom: 12 }}>
                  <f.Icon size={19} strokeWidth={2.5} />
                </span>
                <div style={{ fontFamily: "var(--font-heading)", fontSize: 16.5, marginBottom: 5 }}>{f.title}</div>
                <div style={{ fontSize: 13.5, color: muted(64), lineHeight: 1.5 }}>{f.body}</div>
              </Card>
            ))}
          </div>
        </section>

        {/* ── The maker ── */}
        <section style={{ marginBottom: 34 }}>
          <h2 style={{ fontFamily: "var(--font-heading)", fontSize: 24, margin: "0 0 16px" }}>The maker</h2>
          <Card style={{ padding: "28px 30px" }}>
            <div style={{ display: "flex", gap: 22, alignItems: "center", flexWrap: "wrap", marginBottom: 20 }}>
              <div style={{ width: 76, height: 76, borderRadius: "50%", background: "var(--color-accent)", color: "var(--color-bg)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-heading)", fontSize: 30, fontWeight: 700, flex: "none" }}>RR</div>
              <div style={{ minWidth: 200, flex: 1 }}>
                <div style={{ fontFamily: "var(--font-heading)", fontSize: 26, lineHeight: 1.1 }}>Rahul Raj</div>
                <div style={{ fontSize: 14.5, color: muted(66), marginTop: 4 }}>AI/ML + Full-Stack Engineer · IIT Bhilai</div>
              </div>
            </div>
            <p style={{ fontSize: 15, color: muted(76), lineHeight: 1.65, margin: "0 0 18px" }}>
              Hi, I'm Rahul — a Data Science &amp; AI undergrad at IIT Bhilai. I like building products end to end,
              from AI/ML systems and agentic RAG to realtime, full-stack apps. CodeArena is one of them: I wanted a
              fast, free place to practise, run contests, and follow structured DSA sheets — so I built it. When I'm
              not shipping, I'm solving problems, maintaining open source at OpenLake, and mentoring students.
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {HIGHLIGHTS.map((h) => (
                <span key={h.label} style={{ display: "inline-flex", alignItems: "center", gap: 7, fontSize: 12.5, fontWeight: 600, color: "var(--color-accent-2-800)", background: "var(--color-accent-2-100)", padding: "6px 12px", borderRadius: 999 }}>
                  <h.Icon size={14} strokeWidth={2.5} /> {h.label}
                </span>
              ))}
            </div>

            {/* Socials */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 22 }}>
              {SOCIALS.map((s) => (
                <a key={s.label} href={s.href} target="_blank" rel="noreferrer" className="btn btn-secondary" style={{ textDecoration: "none", gap: 8, padding: "9px 15px" }}>
                  <s.Icon size={16} strokeWidth={2.5} /> {s.label}
                </a>
              ))}
            </div>
          </Card>
        </section>

        {/* ── Support CTA ── */}
        <section>
          <Card style={{ padding: "30px 32px", background: "var(--color-accent-2-100)", boxShadow: "none", textAlign: "center" }}>
            <span style={{ display: "inline-flex", width: 48, height: 48, borderRadius: 14, background: "var(--color-accent-2-200)", color: "var(--color-accent-2-800)", alignItems: "center", justifyContent: "center", marginBottom: 14 }}>
              <Heart size={22} strokeWidth={2.5} />
            </span>
            <h2 style={{ fontFamily: "var(--font-heading)", fontSize: 24, margin: "0 0 8px", color: "var(--color-accent-2-900)" }}>Support CodeArena</h2>
            <p style={{ fontSize: 15, color: "color-mix(in srgb, var(--color-accent-2-900) 78%, transparent)", maxWidth: 520, margin: "0 auto 20px", lineHeight: 1.6 }}>
              CodeArena is free, forever — no paywalls, no ads. If it's helped you, a small, pay-what-you-want
              contribution keeps the servers running and the problems coming.
            </p>
            <Link to="/support" className="btn btn-primary" style={{ textDecoration: "none", gap: 8, padding: "12px 24px", fontSize: 15 }}>
              <Heart size={16} strokeWidth={2.75} /> Chip in to keep it running <ArrowRight size={16} strokeWidth={2.5} />
            </Link>
          </Card>
        </section>
      </div>

      {/* ── Footer ── */}
      <footer style={{ background: "var(--color-surface)", borderTop: "1px solid var(--color-divider)", padding: "28px 0" }}>
        <div style={{ maxWidth: 960, margin: "0 auto", padding: "0 28px", display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 9, color: muted(60), fontSize: 13.5 }}>
            <Code2 size={17} strokeWidth={2.5} /> CodeArena — built by Rahul Raj
          </div>
          <div style={{ display: "flex", gap: 16 }}>
            <Link to="/" style={{ fontSize: 13.5, color: muted(64), textDecoration: "none" }}>Home</Link>
            <Link to="/sheets" style={{ fontSize: 13.5, color: muted(64), textDecoration: "none" }}>Sheets</Link>
            <Link to="/support" style={{ fontSize: 13.5, color: muted(64), textDecoration: "none" }}>Support</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
