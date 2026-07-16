import { Link } from "react-router-dom";
import {
  Code2, BookOpen, Trophy, LineChart, Sparkles, Flame, Play, Star, Github, ArrowRight,
} from "lucide-react";

/* Rebuilt from the Landing.dc.html design. Fabricated marketing figures (invented user
   counts, a named testimonial, and Premium/Pricing tiers) are replaced with honest copy —
   this product is free-forever with a pay-what-you-want Support page, no paid plans. */

const REPO_URL = "https://github.com/Rahul5977/CodeArena";
const muted = (p) => `color-mix(in srgb, var(--color-text) ${p}%, transparent)`;

const FEATURES = [
  { Icon: Code2, chip: ["var(--color-accent-100)", "var(--color-accent-700)"], title: "In-browser editor",
    body: "Five languages, instant test runs, and a distraction-free warm theme that's easy on the eyes." },
  { Icon: BookOpen, chip: ["var(--color-accent-2-100)", "var(--color-accent-2-700)"], title: "Curated DSA sheets",
    body: "Follow structured paths — Blind 75, Neetcode 150, company sets — with progress tracked per topic." },
  { Icon: Trophy, chip: ["var(--color-accent-100)", "var(--color-accent-700)"], title: "Contests",
    body: "Rated rounds, a global leaderboard, and replayable editorials afterwards." },
  { Icon: LineChart, chip: ["var(--color-accent-2-100)", "var(--color-accent-2-700)"], title: "Progress analytics",
    body: "Heatmaps, difficulty breakdowns and acceptance trends show exactly where to focus next." },
  { Icon: Sparkles, chip: ["var(--color-accent-100)", "var(--color-accent-700)"], title: "AI hints, not answers",
    body: "Stuck? Get a nudge toward the right approach that never spoils the solution outright." },
  { Icon: Flame, accent: true, title: "Streaks & XP",
    body: "Daily goals, streak-freezes and badges turn consistency into a habit worth keeping." },
];

const STATS = [
  ["5", "languages"],
  ["100%", "free"],
  ["24/7", "open"],
  ["₹0", "no paywall"],
];

export default function Landing() {
  return (
    <div style={{ width: "100%", height: "100%", overflowY: "auto", overflowX: "hidden", background: "var(--color-bg)", color: "var(--color-text)", fontFamily: "var(--font-body)" }}>
      <style>{`
        .lp-navlink{font-size:14px;font-weight:500;color:color-mix(in srgb, var(--color-text) 72%, transparent);text-decoration:none}
        .lp-navlink:hover{color:var(--color-accent-800)}
      `}</style>

      {/* ── Sticky header ── */}
      <header style={{ position: "sticky", top: 0, zIndex: 20, background: "color-mix(in srgb, var(--color-bg) 88%, transparent)", backdropFilter: "blur(10px)", borderBottom: "1px solid var(--color-divider)" }}>
        <div style={{ maxWidth: 1120, margin: "0 auto", padding: "0 32px", display: "flex", alignItems: "center", gap: 28, height: 70 }}>
          <Link to="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none", color: "var(--color-text)" }}>
            <div style={{ width: 34, height: 34, borderRadius: 10, background: "var(--color-accent)", color: "var(--color-bg)", display: "flex", alignItems: "center", justifyContent: "center" }}><Code2 size={19} strokeWidth={2.75} /></div>
            <span style={{ fontFamily: "var(--font-heading)", fontSize: 20 }}>CodeArena</span>
          </Link>
          <nav style={{ display: "flex", gap: 24, marginLeft: 14, flexWrap: "wrap" }}>
            <a className="lp-navlink" href="#features">Features</a>
            <Link className="lp-navlink" to="/sheets">Sheets</Link>
            <Link className="lp-navlink" to="/contests">Contests</Link>
            <Link className="lp-navlink" to="/support">Support</Link>
          </nav>
          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 12 }}>
            <Link to="/login" className="lp-navlink">Sign in</Link>
            <Link to="/register" className="btn btn-primary" style={{ textDecoration: "none", padding: "9px 18px" }}>Get started free</Link>
          </div>
        </div>
      </header>

      {/* ── Hero ── */}
      <section style={{ position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", right: -140, top: -120, width: 440, height: 440, borderRadius: "50%", background: "var(--color-accent-2-200)", opacity: 0.4 }} />
        <div style={{ position: "absolute", left: -120, bottom: -160, width: 380, height: 380, borderRadius: "50%", background: "var(--color-accent-200)", opacity: 0.35 }} />
        <div style={{ position: "relative", maxWidth: 1120, margin: "0 auto", padding: "72px 32px 80px", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 48, alignItems: "center" }}>
          <div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "var(--color-accent-2-100)", color: "var(--color-accent-2-800)", padding: "6px 14px", borderRadius: 999, fontSize: 13, fontWeight: 600, marginBottom: 22 }}>
              <span style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--color-accent-2-600)" }} />Now with weekly rated contests
            </div>
            <h1 style={{ fontFamily: "var(--font-heading)", fontSize: 56, lineHeight: 1.03, letterSpacing: "-0.015em", margin: "0 0 20px", textWrap: "balance" }}>The warm place to get seriously good at DSA.</h1>
            <p style={{ fontSize: 18, lineHeight: 1.6, color: muted(70), margin: "0 0 30px", maxWidth: 480 }}>Hand-picked problems, structured study sheets and a code editor that stays out of your way. Build the streak that lands the offer.</p>
            <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 30, flexWrap: "wrap" }}>
              <Link to="/register" className="btn btn-primary" style={{ textDecoration: "none", padding: "13px 26px", fontSize: 15 }}>Start solving — it's free</Link>
              <Link to="/sheets" className="btn btn-secondary" style={{ textDecoration: "none", padding: "13px 22px", fontSize: 15, gap: 8 }}><Play size={17} strokeWidth={2.5} />See the sheets</Link>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{ display: "flex" }}>
                {["var(--color-accent-300)", "var(--color-accent-2-300)", "var(--color-neutral-400)", "var(--color-accent-500)"].map((bg, i) => (
                  <div key={i} style={{ width: 34, height: 34, borderRadius: "50%", background: bg, border: "2px solid var(--color-bg)", marginLeft: i ? -10 : 0 }} />
                ))}
              </div>
              <div style={{ fontSize: 13, color: muted(65) }}><strong style={{ color: "var(--color-text)" }}>Free, forever</strong> — built for the community</div>
            </div>
          </div>

          {/* Browser mock with a faux editor (self-contained, no external asset) */}
          <div style={{ position: "relative" }}>
            <div style={{ position: "absolute", inset: -14, background: "var(--color-accent)", borderRadius: 32, transform: "rotate(-2.5deg)", opacity: 0.12 }} />
            <div style={{ position: "relative", background: "var(--color-surface)", borderRadius: 24, boxShadow: "var(--shadow-lg)", overflow: "hidden", border: "1px solid var(--color-divider)" }}>
              <div style={{ height: 38, display: "flex", alignItems: "center", gap: 6, padding: "0 14px", borderBottom: "1px solid var(--color-divider)" }}>
                <span style={{ width: 11, height: 11, borderRadius: "50%", background: "var(--color-accent-300)" }} />
                <span style={{ width: 11, height: 11, borderRadius: "50%", background: "var(--color-accent-2-300)" }} />
                <span style={{ width: 11, height: 11, borderRadius: "50%", background: "var(--color-neutral-300)" }} />
                <span style={{ marginLeft: 10, fontSize: 12, color: muted(50), fontFamily: "ui-monospace, Menlo, monospace" }}>codearena.kodexa.in/problems/two-sum</span>
              </div>
              <div style={{ height: 300, display: "grid", gridTemplateColumns: "1fr 1.15fr" }}>
                <div style={{ padding: "16px 16px", borderRight: "1px solid var(--color-divider)" }}>
                  <div style={{ fontFamily: "var(--font-heading)", fontSize: 16, marginBottom: 8 }}>1. Two Sum</div>
                  <span style={{ fontSize: 10, fontWeight: 600, padding: "2px 9px", borderRadius: 999, background: "var(--color-accent-2-100)", color: "var(--color-accent-2-800)" }}>Easy</span>
                  <p style={{ fontSize: 11.5, lineHeight: 1.55, color: muted(66), marginTop: 12 }}>Return the indices of the two numbers that add up to <code>target</code>.</p>
                  <div style={{ background: "var(--color-bg)", borderRadius: 10, padding: "8px 10px", fontFamily: "ui-monospace, Menlo, monospace", fontSize: 10.5, color: muted(72) }}>
                    nums = [2,7,11,15]<br />target = 9 → [0,1]
                  </div>
                </div>
                <div style={{ background: "var(--color-bg)", padding: "14px 16px", fontFamily: "ui-monospace, Menlo, monospace", fontSize: 11.5, lineHeight: 1.7 }}>
                  <div><span style={{ color: "var(--color-accent-700)" }}>def</span> <span style={{ color: "var(--color-accent-2-800)" }}>twoSum</span>(nums, target):</div>
                  <div style={{ paddingLeft: 18 }}>seen = {"{}"}</div>
                  <div style={{ paddingLeft: 18 }}><span style={{ color: "var(--color-accent-700)" }}>for</span> i, n <span style={{ color: "var(--color-accent-700)" }}>in</span> enumerate(nums):</div>
                  <div style={{ paddingLeft: 36 }}><span style={{ color: "var(--color-accent-700)" }}>if</span> target - n <span style={{ color: "var(--color-accent-700)" }}>in</span> seen:</div>
                  <div style={{ paddingLeft: 54 }}><span style={{ color: "var(--color-accent-700)" }}>return</span> [seen[target-n], i]</div>
                  <div style={{ paddingLeft: 36 }}>seen[n] = i</div>
                  <div style={{ marginTop: 10, display: "inline-flex", alignItems: "center", gap: 5, fontSize: 10.5, fontWeight: 600, color: "var(--color-accent-2-700)" }}>
                    <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--color-accent-2-500)" }} />Accepted · 4/4 tests
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats strip ── */}
      <section style={{ background: "var(--color-surface)", borderTop: "1px solid var(--color-divider)", borderBottom: "1px solid var(--color-divider)" }}>
        <div style={{ maxWidth: 1120, margin: "0 auto", display: "flex", justifyContent: "space-between", gap: 24, padding: "28px 32px", flexWrap: "wrap" }}>
          {STATS.map(([v, l]) => (
            <div key={l} style={{ textAlign: "center", flex: 1, minWidth: 120 }}>
              <div style={{ fontFamily: "var(--font-heading)", fontSize: 34, color: "var(--color-accent-700)" }}>{v}</div>
              <div style={{ fontSize: 13, color: muted(62) }}>{l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" style={{ padding: "88px 0" }}>
        <div style={{ maxWidth: 1120, margin: "0 auto", padding: "0 32px" }}>
          <div style={{ maxWidth: 600, marginBottom: 52 }}>
            <div style={{ fontSize: 13, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--color-accent-700)", fontWeight: 700, marginBottom: 12 }}>Everything in one place</div>
            <h2 style={{ fontFamily: "var(--font-heading)", fontSize: 40, lineHeight: 1.08, margin: "0 0 14px" }}>A practice loop that actually sticks.</h2>
            <p style={{ fontSize: 17, lineHeight: 1.6, color: muted(68), margin: 0 }}>From your first array problem to your final onsite — the tools grow with you.</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20 }}>
            {FEATURES.map((f) => f.accent ? (
              <div key={f.title} style={{ background: "var(--color-accent)", borderRadius: 24, padding: 28, color: "var(--color-bg)", position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", right: -30, bottom: -30, width: 130, height: 130, borderRadius: "50%", background: "rgba(255,255,255,.12)" }} />
                <div style={{ position: "relative" }}>
                  <div style={{ width: 52, height: 52, borderRadius: 16, background: "rgba(255,255,255,.2)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 18 }}><f.Icon size={26} strokeWidth={2.5} /></div>
                  <h3 style={{ fontFamily: "var(--font-heading)", fontSize: 21, margin: "0 0 8px" }}>{f.title}</h3>
                  <p style={{ fontSize: 14.5, lineHeight: 1.6, opacity: 0.9, margin: 0 }}>{f.body}</p>
                </div>
              </div>
            ) : (
              <div key={f.title} style={{ background: "var(--color-surface)", borderRadius: 24, padding: 28, boxShadow: "var(--shadow-sm)" }}>
                <div style={{ width: 52, height: 52, borderRadius: 16, background: f.chip[0], color: f.chip[1], display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 18 }}><f.Icon size={26} strokeWidth={2.5} /></div>
                <h3 style={{ fontFamily: "var(--font-heading)", fontSize: 21, margin: "0 0 8px" }}>{f.title}</h3>
                <p style={{ fontSize: 14.5, lineHeight: 1.6, color: muted(66), margin: 0 }}>{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Sheets showcase ── */}
      <section style={{ padding: "0 0 88px" }}>
        <div style={{ maxWidth: 1120, margin: "0 auto", padding: "0 32px" }}>
          <div style={{ background: "var(--color-accent-2-100)", borderRadius: 32, padding: 52, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 44, alignItems: "center", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", right: -60, top: -60, width: 220, height: 220, borderRadius: "50%", background: "var(--color-accent-2-200)", opacity: 0.6 }} />
            <div style={{ position: "relative" }}>
              <div style={{ fontSize: 13, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--color-accent-2-800)", fontWeight: 700, marginBottom: 12 }}>Study sheets</div>
              <h2 style={{ fontFamily: "var(--font-heading)", fontSize: 34, lineHeight: 1.1, margin: "0 0 14px", color: "var(--color-accent-2-900)" }}>Follow a path, not a random shuffle.</h2>
              <p style={{ fontSize: 16, lineHeight: 1.6, color: "color-mix(in srgb, var(--color-accent-2-900) 82%, transparent)", margin: "0 0 24px" }}>Every sheet is sequenced by topic and difficulty, so each problem builds on the last. Track completion, bookmark tricky ones, and pick up right where you stopped.</p>
              <Link to="/sheets" className="btn btn-primary" style={{ textDecoration: "none", padding: "12px 22px" }}>Browse all sheets</Link>
            </div>
            <div style={{ position: "relative", display: "flex", flexDirection: "column", gap: 12 }}>
              {[
                { badge: "75", name: "Blind 75", pct: 64, bar: "var(--color-accent-2-500)", chip: ["var(--color-accent-100)", "var(--color-accent-700)"], meta: "48/75" },
                { badge: "150", name: "Neetcode 150", pct: 32, bar: "var(--color-accent-500)", chip: ["var(--color-accent-2-100)", "var(--color-accent-2-700)"], meta: "48/150" },
                { badge: "50", name: "Google · Top 50", pct: 18, bar: "var(--color-accent-2-500)", chip: ["var(--color-neutral-200)", "var(--color-text)"], meta: "9/50" },
              ].map((s) => (
                <div key={s.name} style={{ background: "var(--color-surface)", borderRadius: 18, padding: "16px 18px", boxShadow: "var(--shadow-sm)", display: "flex", alignItems: "center", gap: 14 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 13, background: s.chip[0], color: s.chip[1], display: "flex", alignItems: "center", justifyContent: "center", flex: "none", fontFamily: "var(--font-heading)", fontSize: 14 }}>{s.badge}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 5 }}>{s.name}</div>
                    <div style={{ height: 6, borderRadius: 999, background: "var(--color-neutral-200)", overflow: "hidden" }}><div style={{ width: `${s.pct}%`, height: "100%", background: s.bar }} /></div>
                  </div>
                  <span style={{ fontSize: 12, color: muted(55) }}>{s.meta}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Why CodeArena (honest, in place of the fabricated testimonial) ── */}
      <section style={{ padding: "0 0 88px" }}>
        <div style={{ maxWidth: 1120, margin: "0 auto", padding: "0 32px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 20 }}>
            <div style={{ background: "var(--color-surface)", borderRadius: 24, padding: 40, boxShadow: "var(--shadow-sm)" }}>
              <div style={{ display: "flex", gap: 3, marginBottom: 18 }}>
                {Array.from({ length: 5 }).map((_, i) => <Star key={i} size={18} fill="var(--color-accent)" stroke="none" />)}
              </div>
              <p style={{ fontFamily: "var(--font-heading)", fontSize: 23, lineHeight: 1.35, margin: "0 0 22px", letterSpacing: "-0.01em" }}>&ldquo;A warm, focused place to grind problems and build the habit — no paywalls, no noise, just you and the next problem.&rdquo;</p>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 46, height: 46, borderRadius: "50%", background: "var(--color-accent)", color: "var(--color-bg)", display: "flex", alignItems: "center", justifyContent: "center" }}><Code2 size={22} strokeWidth={2.75} /></div>
                <div><div style={{ fontWeight: 700, fontSize: 15 }}>The CodeArena philosophy</div><div style={{ fontSize: 13, color: muted(60) }}>Built for learners, by learners</div></div>
              </div>
            </div>
            <div style={{ background: "var(--color-accent)", borderRadius: 24, padding: 40, color: "var(--color-bg)", position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", left: -40, bottom: -50, width: 180, height: 180, borderRadius: "50%", background: "rgba(255,255,255,.1)" }} />
              <div style={{ position: "relative" }}>
                <div style={{ fontFamily: "var(--font-heading)", fontSize: 52, lineHeight: 1, marginBottom: 10 }}>₹0</div>
                <p style={{ fontSize: 17, lineHeight: 1.5, opacity: 0.92, margin: "0 0 26px", maxWidth: 320 }}>Free forever to practice. Support the project any amount, only if you want to.</p>
                <div style={{ display: "flex", gap: 26 }}>
                  <div><div style={{ fontFamily: "var(--font-heading)", fontSize: 26 }}>5</div><div style={{ fontSize: 12, opacity: 0.8 }}>languages</div></div>
                  <div><div style={{ fontFamily: "var(--font-heading)", fontSize: 26 }}>24/7</div><div style={{ fontSize: 12, opacity: 0.8 }}>open access</div></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section style={{ padding: "0 0 96px" }}>
        <div style={{ maxWidth: 1120, margin: "0 auto", padding: "0 32px" }}>
          <div style={{ position: "relative", background: "var(--color-surface)", borderRadius: 32, padding: 64, textAlign: "center", overflow: "hidden", boxShadow: "var(--shadow-md)" }}>
            <div style={{ position: "absolute", left: -70, top: -70, width: 240, height: 240, borderRadius: "50%", background: "var(--color-accent-200)", opacity: 0.4 }} />
            <div style={{ position: "absolute", right: -80, bottom: -90, width: 280, height: 280, borderRadius: "50%", background: "var(--color-accent-2-200)", opacity: 0.4 }} />
            <div style={{ position: "relative" }}>
              <h2 style={{ fontFamily: "var(--font-heading)", fontSize: 44, lineHeight: 1.06, margin: "0 auto 16px", maxWidth: 620, textWrap: "balance" }}>Your next offer starts with one problem.</h2>
              <p style={{ fontSize: 18, color: muted(66), margin: "0 auto 30px", maxWidth: 480 }}>Free forever to start. No credit card, no catch — just you and the problems.</p>
              <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
                <Link to="/register" className="btn btn-primary" style={{ textDecoration: "none", padding: "14px 30px", fontSize: 16 }}>Create free account</Link>
                <Link to="/problems" className="btn btn-secondary" style={{ textDecoration: "none", padding: "14px 26px", fontSize: 16 }}>Browse problems</Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={{ background: "var(--color-surface)", borderTop: "1px solid var(--color-divider)", padding: "52px 0 32px" }}>
        <div style={{ maxWidth: 1120, margin: "0 auto", padding: "0 32px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 32, marginBottom: 40 }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                <div style={{ width: 32, height: 32, borderRadius: 9, background: "var(--color-accent)", color: "var(--color-bg)", display: "flex", alignItems: "center", justifyContent: "center" }}><Code2 size={18} strokeWidth={2.75} /></div>
                <span style={{ fontFamily: "var(--font-heading)", fontSize: 18 }}>CodeArena</span>
              </div>
              <p style={{ fontSize: 14, lineHeight: 1.6, color: muted(60), margin: 0, maxWidth: 280 }}>The warm, focused way to master data structures and algorithms.</p>
            </div>
            <FooterCol title="Product" links={[["Problems", "/problems"], ["Sheets", "/sheets"], ["Contests", "/contests"], ["Leaderboard", "/leaderboard"]]} />
            <FooterCol title="Community" links={[["Discuss", "/discuss"], ["Support", "/support"], ["Sign in", "/login"], ["Get started", "/register"]]} />
            <div>
              <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 14 }}>Project</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <a className="lp-navlink" href={REPO_URL} target="_blank" rel="noreferrer">GitHub</a>
                <a className="lp-navlink" href="#features">About</a>
                <Link className="lp-navlink" to="/support">Donate</Link>
              </div>
            </div>
          </div>
          <div style={{ borderTop: "1px solid var(--color-divider)", paddingTop: 24, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
            <span style={{ fontSize: 13, color: muted(55) }}>© 2026 CodeArena · Free forever.</span>
            <div style={{ display: "flex", gap: 14 }}>
              <a href={REPO_URL} target="_blank" rel="noreferrer" className="btn btn-ghost btn-icon" style={{ width: 36, height: 36 }} aria-label="GitHub"><Github size={18} /></a>
              <Link to="/support" className="btn btn-ghost btn-icon" style={{ width: 36, height: 36 }} aria-label="Support"><Star size={18} /></Link>
              <Link to="/register" className="btn btn-ghost btn-icon" style={{ width: 36, height: 36 }} aria-label="Get started"><ArrowRight size={18} /></Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FooterCol({ title, links }) {
  return (
    <div>
      <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 14 }}>{title}</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {links.map(([label, to]) => <Link key={label} className="lp-navlink" to={to}>{label}</Link>)}
      </div>
    </div>
  );
}
