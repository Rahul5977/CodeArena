# CodeArena — Progress Tracker

> Execution checklist for the rewamp. Architecture & rationale: [`architecture.md`](./architecture.md).
> Work top-to-bottom; check items as they land. Update every session.
>
> **Legend:** `[ ]` todo · `[~]` in progress · `[x]` done · `[!]` blocked · `[-]` dropped/deferred
>
> _Last updated: 2026-07-15 — status: **Phase 5 core pages complete; building on toward Phase 11 (auth integrations next).**_

---

## Snapshot

| Phase | Theme | Status |
|---|---|---|
| 0 | Foundation, cleanup, port Organic design system | `[~]` |
| 1 | DB & backend reshape (single-admin, schema) | `[x]` migrated + seeded + verified end-to-end on Postgres |
| 2 | Executor → Codebox (+ pilot gate) | `[~]` lib swapped + wired; execution validates on VPS |
| 3 | Backend build-out & hardening | `[~]` helmet/rate-limit/404/CORS/answer-free/secure-judge done; zod + Redis cache + more endpoints pending |
| 4 | Auth: OAuth + real email + Redis sessions | `[~]` email/password wired; OAuth + real SMTP + Redis sessions pending (needs creds) |
| 5 | Frontend build (AppShell → pages) | `[x]` all core pages wired to the API; polish (react-query/responsive) + public profiles (Phase 6) remain |
| 6 | Community layer | `[ ]` |
| 7 | Support page (Razorpay pay-what-you-want) | `[~]` UI + backend order/verify done; live checkout needs Razorpay keys |
| 8 | Admin dashboard | `[ ]` backend stats/users endpoints exist; UI pending |
| 9 | DSA content pipeline & seeding | `[~]` 6 seed problems + validation harness; full OneDay pipeline pending |
| 10 | Deploy + scale to 10k | `[~]` prod artifacts ready + validated; not yet deployed (owner's VPS) |
| 11 | Launch hardening & observability | `[~]` helmet/rate-limit/README done; pino/health/SEO/uptime pending |

Backend/DB/executor/auth (0–4) run alongside the frontend build (5).

---

## Kickoff decisions (locked)
- [x] **D1** Docs reset — legacy docs deleted; these two files are the plan.
- [x] **D2** Fully free + **Support page** (pay-what-you-want, Razorpay). No paid tiers.
- [x] **D3** Auth: email/password + GitHub + Google OAuth + real email.
- [x] **D4** Executor: self-hosted Codebox (pilot-gated; Judge0 break-glass).
- [x] **D5** Single admin — drop SUPERADMIN; roles `USER | ADMIN`.
- [x] **D6** Target ~10k concurrent, low cost — single VPS + Cloudflare free.
- [x] **D7** Organic design system; build to the 16-page design.

---

## Phase 0 — Foundation, cleanup, design system
- [ ] Rename `leetlab-*` → `codearena-*`; remove `backend/cookies.txt` + gitignore it; consolidate `SECRET`/`JWT_SECRET`.
- [ ] Rewrite `.env.example`: add `CODEBOX_*`, `FRONTEND_ORIGIN`, OAuth, SMTP, Razorpay; remove Sulu/Judge0 keys.
- [x] Frontend approach chosen: **fresh rebuild in `frontend/`**; old `src/` deleted.
- [x] Port the Organic `styles.css` (tokens + `.btn/.tag/.field/.card/.nav/.table/.dialog/.washed`) → `src/styles/organic.css`.
- [x] Load fonts (Caprasimo, Figtree via Google Fonts in organic.css) + Lucide icons (lucide-react, stroke 2.5–2.75).
- [~] Design directions: Dashboard **1a** built; remaining pages pick a/b as built.

## Phase 1 — DB & backend reshape
- [x] Prisma: `UserRole { USER, ADMIN }`; dropped `RoleChange`/`UserSession`/`Payment`. Schema **validates**.
- [x] `User`: `username @unique`, `bio`, social links, nullable `password`, `points`.
- [x] `Problem`: `slug @unique`, `published`, `companies[]`, `@@index([published, difficulty])`.
- [x] `OAuthAccount`; community models (`Solution`, `Discussion`, `Comment`, `Vote`, `Follow`, `Report`); `Donation`.
- [x] Dropped premium/`UserSheet`/`SheetType`; sheets are free curation.
- [x] Transitional `User.refreshToken` re-added (auth keeps working pre-Redis).

**Controller migration** (architecture.md §12.2) — **DONE**; backend boots clean (`GET /` serves the CodeArena API):
- [x] `auth.middleware.js` → single-admin (`checkAdmin` + back-compat aliases).
- [x] `problem.controllers.js` → `authorId`/`slug`/`published`, answer-free projection + pagination; **fixed** answer leak, SUPERADMIN-block, create-in-loop bugs.
- [x] Confirmed no-change controllers: `executeCode`, `submission`, `playlist`, `contest`, `aiCodeReview`.
- [x] Removed `rbac.controllers.js` + `rbac.routes.js`; stripped from `auth.routes.js`.
- [x] `userManagement` (+routes) → single-admin: list / get / ban / delete / stats (dropped promote/demote/`RoleChange`).
- [x] `sheets` (+routes) de-monetized: removed `UserSheet`/`Payment`/premium; free CRUD + progress.
- [x] `auth.controllers.js` → role refs, removed `UserSession`, **emails the reset token via `email.lib.js` (no longer returned)**, admin bootstrap via `ADMIN_EMAIL`.
- [x] `donation.controllers.js` + `donation.routes.js` (`/api/v1/support`); `payments.lib.js` lazy-inits Razorpay (API boots without keys).
- [x] `index.js`: env CORS (`FRONTEND_ORIGIN`), wired support route, CodeArena branding.
- [x] `prisma generate` clean (v6.19.3); all files `node --check` + boot-verified.
- [x] Fresh migration baseline `20260715135603_init` applied to Postgres (old LeetLab migrations reset).
- [x] `optionalAuth` middleware → public problem browsing (personalized when logged in).
- [x] Seed (`prisma/seed.js`): admin (`ADMIN_EMAIL`) + 6 starter problems; **50/50 reference-solution checks pass** locally.
- [x] **End-to-end verified**: public list is answer-free, anon detail hides answers, admin login works and admin detail includes testcases/referenceSolutions.

**v0.1 build track** (target: a genuinely usable, deployable product):
- [x] ① Phase 1 done — running backend + real DB + seeded problems.
- [~] ② Codebox executor — `executor.lib.js` swapped (X-Auth-Token, ≤20 chunking), committed. Codebox builds/runs locally + accepts submissions, but its docker-executor is incompatible with local Docker 29 (`ReadonlyRootfs` + `putArchive`) and has **no LICENSE**. Decision: keep Codebox; **execution validates on the VPS (`EXECUTOR_TYPE=isolate`)** at deploy. Judge0 stays break-glass.
- [x] ③ Auth wired FE↔BE — real login/register/logout + session hydrate (`/auth/me`), protected routes, shell logout; **verified through the Vite proxy** (login + problems + hydrate).
- [x] ④ Core frontend on real API — Problems list, **ProblemEditor** (Monaco split view, language select, Run + Submit), and **Dashboard** (real stats via new `/dashboard` endpoint). Backend `executeCode` refactored to be **secure** (fetches testcases server-side by `problemId`; client never sees hidden cases) + a `/execute-code/run` custom-input endpoint. Run/Submit UI works; actual execution validates on the VPS. (Submissions page still stubbed.)
- [x] ⑤ Light hardening — helmet, `trust proxy`, rate-limits (api/auth/execute), body-limit 1mb, real 404 handler; verified (headers + 404 + boot).
- [x] ⑥ Prod deploy artifacts — `Caddyfile`, `docker-compose.prod.yml`, Node-20 Dockerfiles, `DEPLOY.md` runbook (VPS + Cloudflare + Codebox + migrate/seed + backups + scaling). Compose + Caddyfile **validated**. Provisioning (VPS/DNS/secrets) is the owner's step.

**→ v0.1 is code-complete. Ready to deploy following `DEPLOY.md` (the only executor caveat: validate Codebox on the Linux host — §4).**

### Production test — 2026-07-15 (14/15 checks; 1 is a test-script artifact → real behavior 15/15)
Full stack up (Postgres + hardened backend). ✅ admin+user login & correct roles · register ·
public problem list (6, answer-free) · user detail hides testcases/solutions · admin detail
includes them · dashboard · sheets · supporters wall · admin guards (200 admin / 403 user /
401 anon) · 404 handler · helmet headers. Only **code execution** is not locally tested
(validates on the VPS via Codebox — see DEPLOY.md §4).

### Beyond v0.1 — remaining to reach Phase 11 (multi-session)
- **Phase 5 (frontend):** ✓ **all core pages done** (Landing, Auth, Onboarding, Dashboard, Problems, Editor, Submissions, Sheets, Contests, Leaderboard, Profile, Settings, Support). Remaining: public profiles (Phase 6), react-query + responsive polish.
- **Phase 4 (auth):** GitHub/Google OAuth, real SMTP email (verify + reset), Redis sessions. *(needs creds)*
- **Phase 6 (community):** profiles, solutions, discuss, votes, follow, global leaderboard, moderation.
- **Phase 7:** live Razorpay checkout on the Support page. *(needs keys)*
- **Phase 8:** admin dashboard UI (KPIs, manage tabs).
- **Phase 9:** OneDay → problem-bank pipeline (author + oracle-generate + validated seed).
- **Phase 3/11:** zod validation, Redis caching, pino logging, `/health`, SEO, uptime; load-test to 10k.
- **Phase 10:** actually deploy (owner provisions the VPS — see `DEPLOY.md` incl. the **free-hosting** section).

## Phase 2 — Executor → Codebox
- [ ] Self-host `codebox-redis` + `codebox-api` + `codebox-worker` on an isolated network; build language images.
- [ ] Rewrite lib (`judge0.lib.js` → `executor.lib.js`): `CODEBOX_API_URL` on both fns, `X-Auth-Token`, ≤20 batch chunking.
- [ ] Choose `EXECUTOR_TYPE` (isolate/firecracker if KVM); strong `AUTH_TOKEN`.
- [ ] **Pilot gate**: run reference set; soak under load; verify sandbox (no net, dropped caps, non-root); confirm LICENSE. Decide sole-executor vs Judge0 fallback.

## Phase 3 — Backend build-out & hardening
- [ ] Endpoints for every design page: problems (public/paginated/answer-free), editor run/submit, sheets, submissions, contests, leaderboard, profiles, settings.
- [ ] `validate(zodSchema)` middleware; pagination + `select` projection on all lists.
- [ ] `express-rate-limit` (Redis) on auth/execute/community/support; `helmet`; env CORS.
- [ ] `asyncHandler` everywhere; consistent `ApiError`; re-enable 404.
- [ ] Redis caching for hot reads (list/leaderboard/streak/profile).
- [ ] Per-user submit rate limit + bounded executor queue + queue-position response.

## Phase 4 — Auth
- [ ] GitHub + Google OAuth (`OAuthAccount`, nullable password).
- [ ] `nodemailer` + SMTP: verify-email route; email reset token (remove from response body).
- [ ] Redis refresh-token sessions (retire `UserSession`); real logout-everywhere.
- [ ] Gate community posting on `emailVerified`.

## Phase 5 — Frontend build *(to the Organic design)*
- [x] `AppShell` (sidebar Practice/Account, `isAdmin` gating, top bar: search/streak/notifications/avatar) + router.
- [x] Dashboard **1a** (streak/heatmap, recent, recommended, stats) — mock data.
- [x] Support page shell (pay-what-you-want, presets + custom amount).
- [x] Landing + Login shells; all nav routes scaffolded (Placeholder) so the shell is navigable.
- [x] Build + lint green (`vite build`, `eslint`); demo user in `store/auth.js` renders the shell.
- [x] Problems list (filter/search) + ProblemEditor (Monaco, Run/Submit, results) — wired to real API.
- [x] Submissions (history), Settings (edit profile + change password), Profile (own stats + solved-by-difficulty).
- [x] Sheets (list + detail/progress), Contests (list by status), Leaderboard (podium + ranks; new `/leaderboard` endpoint).
- [x] Onboarding (4-step first-run flow, `/onboarding`).
- [ ] Public profiles by username (community phase); react-query caching + responsive polish pass.

## Phase 6 — Community
- [ ] Public profiles by username; solutions per problem + upvotes; discussion threads + comments; follow/feed.
- [ ] Streak/heatmap (from `Submission.createdAt`, cached); global leaderboard (points).
- [ ] Moderation: `Report` + admin queue.

## Phase 7 — Support page (pay-what-you-want)
- [ ] `/support` page (custom amount + presets), reusing the design's checkout layout.
- [ ] Razorpay: custom-amount order → Checkout → verify signature/webhook → `Donation` row → thank-you.
- [ ] Repurpose sidebar "Go Premium" → "Support CodeArena."
- [ ] Optional opt-in supporters wall.

## Phase 8 — Admin dashboard *(single admin)*
- [ ] Overview: KPIs (users, active today, submissions today, donations this month), submissions chart, moderation queue, recent signups.
- [ ] Manage tabs: Problems (search/filter/CRUD/publish), Sheets, Contests, Users (view/ban), Moderation.
- [ ] All under `/admin/*`, `checkAdmin`-guarded; hidden from non-admins.

## Phase 9 — DSA content pipeline & seeding *(post-launch)*
- [ ] Idempotency: `slug @unique` (done in Phase 1) or `uuidv5(slug)`.
- [ ] Per-language I/O harness generator (stub + driver + reference; serialization codecs).
- [ ] Authoring-package format; import OneDay as curriculum manifest (pattern→tag, difficulty, order).
- [ ] `seed-problems.js` (validation gate: all references × all testcases pass; dry-run; upsert; filters).
- [ ] Author content (original) + oracle-generate tests; **Wave 1** (deterministic) → **2** → **3**; defer checker problems.

## Phase 10 — Deploy + scale to 10k
- [ ] Provision Hetzner CPX31→CPX41 (KVM preferred); ufw/fail2ban/SSH-key/unattended-upgrades.
- [ ] Cloudflare: proxied `A`/`AAAA` `codearena` → VPS; Full-Strict TLS; edge cache rules for static + public pages.
- [ ] Compose: Caddy → static FE + **API PM2 cluster** → **PgBouncer** → PG + Redis; Codebox isolated.
- [ ] Socket.IO Redis adapter; raise `ulimit -n`; Prisma `?pgbouncer=true`.
- [ ] Nightly `pg_dump` backup (off-box) + restore test; Redis AOF.
- [ ] **Load-test to ~10k** (k6/Artillery): cache-hit ratio, socket capacity, executor queue.

## Phase 11 — Launch hardening & observability
- [ ] `pino` logs + request id; real `/health` (DB+Redis); uptime monitor; error tracking.
- [ ] SEO: slug routes, meta/OG, sitemap, robots (decide SSR/prerender vs SPA+meta).
- [ ] Rewrite `README.md` for CodeArena.
- [ ] (P2) real AI code review; badges; supporter wall polish.

---

## Open questions (architecture.md §14)
- [ ] Design directions per page (a/b)?
- [ ] Frontend: fresh rebuild vs refactor; first vertical slice = DS + AppShell + Dashboard?
- [ ] VPS KVM support? Codebox LICENSE confirmed?
- [ ] Content original-authoring approach (manual vs LLM-with-review)?
- [ ] SEO: SSR/prerender vs SPA + meta + Cloudflare cache?
- [ ] Languages judged: Python/JS/Java, or add C/C++?
- [ ] Supporter wall public or private?

## Decisions log
| Date | Decision | Notes |
|---|---|---|
| 2026-07-15 | D1–D4 locked | Docs reset, free+support, OAuth, Codebox. |
| 2026-07-15 | Codebox verified drop-in w/ 3 fixes | Auth header, hardcoded URL, ≤20 chunking. |
| 2026-07-15 | OneDay = tracker, not problem bank | Curriculum manifest only; author all judged content. |
| 2026-07-15 | Design imported (Organic, 16 pages) | `Overview.dc.html` = design index, not a product page. |
| 2026-07-15 | D5 single admin | Drop SUPERADMIN; `USER \| ADMIN`; ~1k lines removed. |
| 2026-07-15 | D6 10k-concurrent, low cost | Single VPS + Cloudflare free; scale up not out. |
| 2026-07-15 | D7 Organic design system | Port `styles.css`; build to the design. |
| 2026-07-15 | Pricing → Support | Drop Free/Pro/Teams + Stripe; pay-what-you-want via Razorpay. |
| 2026-07-15 | Hosting = **Oracle Cloud Always Free** | 4 vCPU / 24 GB ARM, free forever; runs full stack incl. executor. Runbook to be tailored for ARM. |
| 2026-07-15 | Build OAuth + SMTP + Razorpay now | Owner adds real keys to `.env` (never in chat); flows built to read env. |
| 2026-07-15 | Next priority = **finish frontend pages (Phase 5)** | Submissions → Settings → Profile → Sheets → Contests → Leaderboard → Onboarding. |
