# CodeArena — Project README

> An online coding-judge platform (LeetCode-style) — problems, contests with live leaderboards, DSA sheets, community solutions/discussions — with **server-side verdicting** and an **isolated code-execution pipeline**.
> Live: https://codearena.kodexa.in

This document does two jobs: it is the project README, **and** it is a line-by-line defence of the three resume bullets, written so that every claim maps to a file you can open and explain. Sections marked **🎤** are interview Q&A.

---

## Table of contents

1. [What the product does](#1-what-the-product-does)
2. [Tech stack](#2-tech-stack)
3. [Architecture](#3-architecture)
4. [Resume bullet 1 — secure judge & no test-case leakage](#4-resume-bullet-1--secure-judge--no-test-case-leakage)
5. [Resume bullet 2 — isolated execution pipeline (Judge0-compatible adapter + Codebox)](#5-resume-bullet-2--isolated-execution-pipeline)
6. [Resume bullet 3 — production deployment (Lightsail, Compose, Caddy, Cloudflare, networking)](#6-resume-bullet-3--production-deployment)
7. [Auth & security model](#7-auth--security-model)
8. [Data model](#8-data-model)
9. [Contests & real-time leaderboard](#9-contests--real-time-leaderboard)
10. [Payments (Razorpay) — webhook correctness](#10-payments-razorpay--webhook-correctness)
11. [Operational stuff — health, logging, rate limits, deploy](#11-operational-stuff)
12. [Honest gaps & what I'd do next (be ready for these)](#12-honest-gaps--what-id-do-next)
13. [Rapid-fire question bank](#13-rapid-fire-question-bank)
14. [Running locally](#14-running-locally)

---

## 1. What the product does

| Area | Features |
|---|---|
| Problems | Markdown statements, examples, constraints, hints, editorial, per-language starter snippets (Python, Java, JS, C++, C), **Run** (custom stdin) vs **Submit** (hidden testcases) |
| Submissions | Per-testcase pass/fail, time & memory, history per user |
| Contests | Timed, join/leave, ICPC-style scoring (100 pts on first AC + penalty minutes), **live leaderboard via Socket.IO** |
| DSA Sheets | Curated day-by-day structured plans with per-user progress |
| Playlists | User-owned problem lists |
| Community | Solutions, discussions, nested comments, votes, follows, reports, public profiles, global leaderboard with points (EASY 10 / MEDIUM 20 / HARD 30, awarded once per problem) |
| Auth | Email/password + GitHub/Google OAuth, email verification (nodemailer), password reset, single-admin role model |
| Admin | Problem/contest/sheet CRUD, user management, "live now" presence via heartbeat, content moderation |
| Support | Pay-what-you-want donations via Razorpay with webhook reconciliation |

---

## 2. Tech stack

| Layer | Choice | Where |
|---|---|---|
| Frontend | React 19 + Vite 7, React Router 7, Zustand, react-hook-form + zod, Monaco editor, Tailwind 4, framer-motion, socket.io-client, react-markdown | `frontend/` |
| Backend | Node 20, Express 4 (ESM), Prisma 6, jsonwebtoken, bcryptjs, helmet, express-rate-limit, pino, socket.io, nodemailer, razorpay | `backend/src/` |
| DB | PostgreSQL 16 (Prisma migrations) | `backend/prisma/` |
| Cache | Redis 7 (provisioned — see §12) | `docker-compose.prod.yml` |
| Executor | **Codebox** (self-hosted, Judge0-CE-compatible API, `isolate` sandbox) | separate compose on the same host |
| Edge | Caddy 2 (auto-TLS) → nginx (SPA) / Express (API); optional Cloudflare proxy | `Caddyfile`, `frontend/nginx.conf` |
| Infra | AWS Lightsail (ap-south-1), Docker Compose, manual `git pull` deploy | `backend/docs/DEPLOY.md` |

---

## 3. Architecture

```
 Browser ──HTTPS──▶ [Cloudflare (optional, CDN/DDoS)] ──▶ Caddy :443 (TLS, gzip/zstd, security headers)
                                                            │
                                   ┌────────────────────────┼──────────────────────────┐
                                   │  /api/*  /socket.io/*  │            everything else│
                                   ▼                        │                           ▼
                          backend :8080 (Express+Socket.IO) │                 frontend :80 (nginx, static SPA)
                                   │                        │
                     ┌─────────────┼──────────────┐         │      docker network: `codearena` (bridge)
                     ▼             ▼              ▼         │
               Postgres 16     Redis 7     host.docker.internal:3000  ──▶  Codebox API (bound to 172.17.0.1 only)
                                                            │                   │  X-Auth-Token
                                                            │                   ▼
                                                            │            Codebox Redis (BullMQ queue)
                                                            │                   │
                                                            │                   ▼
                                                            │            Codebox worker (privileged, `isolate` sandbox per run)
                                                            │      docker network: codebox's own compose network
```

**Request flow for a Submit:**

1. SPA `POST /api/v1/execute-code` `{ source_code, language_id, problemId }` (httpOnly JWT cookie rides along).
2. Caddy routes `/api/*` → backend. `executeLimiter` (30/min/IP) + `authMiddleware` + `requireVerified`.
3. Backend loads the problem's **full hidden testcases from Postgres** (`executeCode.controllers.js`).
4. Builds N executor submissions (one per testcase), `submitBatch` → Codebox (chunked ≤20), gets tokens.
5. `pollBatchResults` polls `GET /submissions/batch?tokens=…` every 2 s until no result is in `queued/processing` (status id 1/2), ≤180 s.
6. Compares `stdout.trim() === expected.trim()` per testcase; writes `Submission` + `TestCaseResult[]`; awards points on first AC.
7. Returns **only** `{ status, passed, total, results:[{testCase, passed, status, time, memory}] }` — no stdin, no expected output, no stdout.

---

## 4. Resume bullet 1 — secure judge & no test-case leakage

> *Built a secure online coding-judge platform (React, Node.js/Express, PostgreSQL, Redis) with server-side verdicting that prevents hidden test-case leakage by returning only minimal evaluation metadata to clients.*

### What "server-side verdicting" means here
The client never computes or sees a verdict input. The **only** thing the browser sends is source + language + problemId; the **only** thing it gets back is pass/fail metadata. All comparison happens in `backend/src/controllers/executeCode.controllers.js`.

### Three layers that prevent leakage

| Layer | File | Mechanism |
|---|---|---|
| **Read API** | `problem.controllers.js` → `PUBLIC_DETAIL_SELECT` / `PUBLIC_LIST_SELECT` | Prisma `select` whitelists that *omit* `testcases` and `referenceSolutions`. Non-admins can never fetch them — even `GET /problems/:id` uses the whitelist unless `req.user.role === "ADMIN"`. An allow-list (select) is safer than a deny-list (omit) because a new sensitive column is hidden by default. |
| **Submit response** | `executeCode.controllers.js` final `res.json` | `results.map(r => ({ testCase, passed, status, time, memory }))` — strips `stdout`, `expected`, `stdin`, `stderr`. You learn *that* test 7 failed, not *what* test 7 was. |
| **Run endpoint** | `runCode` | Executes only the user-supplied stdin, no DB read of testcases, no DB write. So "Run" can't be used as an oracle on hidden cases. |

### 🎤 Likely questions

**Q: Why not send testcases to the client and let it compare? Much simpler.**
Because then the client is the trust boundary. A user could read the expected outputs from the network tab, or forge an "Accepted" POST. Verdicts drive points, leaderboards, contest rankings — all must be produced by code the user can't modify.

**Q: Couldn't someone still leak a testcase by printing the input?**
The submit response doesn't include `stdout`, so printing stdin gets them nothing. `stderr`/`compile_output` are also stripped. The full detail is stored in `TestCaseResult` for admin debugging only. (Original version returned `stdout`/`expected` — that was an actual bug I fixed; the old `getAllProblem` also returned `testcases` to everyone. See `backend/docs/architecture.md` §2.3 "Answer leak".)

**Q: What about timing side-channels / testcase count?**
Testcase count and per-case timing *are* exposed. That's an accepted trade-off (LeetCode does the same — users want to know "3/40 passed"). If it mattered, I'd return only aggregate pass counts.

**Q: Is the comparison robust?**
It's deterministic stdout equality after `trim()`. Deliberately strict: no floating-point tolerance, no whitespace normalisation inside lines, no special judges. Problem authors must write outputs with a single canonical form. (Extension: a `checker` field per problem for token-based or epsilon comparison.)

**Q: How do you guarantee the expected outputs are even correct?**
`validateReferenceSolutions` in `problem.controllers.js` — on create/update of a *published* problem, every reference solution in every language is run through the executor against every testcase; the save is rejected on the first mismatch. So a problem can't go live with an answer key that the reference solution itself fails.

**Q: Where is Redis used?**
Honestly: Redis is provisioned in Compose (and Codebox uses its own Redis for BullMQ), but the app backend does not currently have Redis calls — rate limiting is in-memory and refresh tokens live in a Postgres column. The designed next step (documented in `architecture.md`) is Redis for the rate-limit store, refresh-token/session store, hot-read cache (problem list, leaderboard), and the Socket.IO adapter for multi-process. **Say this plainly if asked** — it's better than being caught.

---

## 5. Resume bullet 2 — isolated execution pipeline

> *Engineered an isolated code-execution pipeline via a Judge0-compatible adapter and self-hosted Codebox sandbox, routing execution through authenticated internal service calls and deterministic stdout-based validation for untrusted submissions.*

### The adapter — `backend/src/libs/executor.lib.js`

The app originally used hosted Judge0 (via Sulu's API). I swapped to self-hosted **Codebox**, which speaks the Judge0-CE wire protocol: same numeric language IDs (71 Python, 62 Java, 63 JS, 54 C++, 50 C), same `POST /submissions/batch` → tokens → `GET /submissions/batch?tokens=` model, same `status.id` semantics (1 = In Queue, 2 = Processing, 3 = Accepted, …).

Because the rest of the app only talks to `submitBatch` / `pollBatchResults` / `getJudge0LanguageId`, switching engines touched exactly **one file**. Differences absorbed by the adapter:

| Concern | Judge0/Sulu | Codebox | Handled by |
|---|---|---|---|
| Base URL | public SaaS | `http://host.docker.internal:3000` | `CODEBOX_API_URL` env |
| Auth header | `Authorization: Bearer` | `X-Auth-Token` | `authHeaders` |
| Batch size | unbounded | ≤20/request | `chunk(arr, 20)` on submit **and** poll |
| Response shape | `{ submissions: [...] }` | bare array on submit, `{submissions}` on poll | adapter normalises |
| Rate limiting | none | 429s on fast polling | 2 s cadence, 429 → sleep & retry instead of failing |
| Long runs | — | C++/Java compile *per testcase*, serial worker | poll budget 90 × 2 s ≈ 180 s (was 30 × 1 s → caused 500s on 40+ testcase problems; see commit `c317f1c`) |

### Why self-host instead of a Judge0 API key
- **Cost & quotas**: hosted Judge0 tiers cap requests/day; a single HARD problem with 75 testcases = 75 executions per submit.
- **Data control**: user code never leaves my box.
- **Latency**: same-host call instead of a cross-region round trip per poll.
- **Trade-off**: I own the security of the sandbox now.

### The sandbox — Codebox with `isolate`
- Codebox = API (Express) + Redis (BullMQ queue) + worker. Worker runs each submission inside **`isolate`** (the IOI/Codeforces sandbox): Linux namespaces + cgroup v2 limits on CPU time, wall time, memory, process count, and a read-only rootfs with no network.
- Worker container is `privileged` (required by isolate for cgroups/namespaces); `WORKER_CONCURRENCY=1` on a 2-vCPU box.
- Gotcha I hit and documented: Codebox's `docker` executor mode breaks on Docker ≥ 29, so `isolate` is mandatory; isolate also now needs `libseccomp-dev` at build time (I patch the Dockerfile in the runbook).

### Authenticated internal service calls
- Codebox's API port is published **only on the Docker gateway IP** `172.17.0.1:3000` — not `0.0.0.0`, so it's unreachable from the internet and from the Lightsail firewall's perspective doesn't exist.
- The backend reaches it through `host.docker.internal` (mapped via `extra_hosts: host-gateway` in Compose).
- Every call carries `X-Auth-Token: $CODEBOX_AUTH_TOKEN`, a shared secret set in both `.env` files; Codebox rejects requests without it. So even a container on the host that found the port couldn't submit code.

### Deterministic stdout-based validation
Untrusted code is treated as a black box: stdin in → stdout out. No function-signature harness, no injecting the user's code into a driver file per language. Advantages: language-agnostic, nothing for the user to "return", impossible to tamper with the checker because there is no checker in their process. Cost: problems must be phrased as stdin/stdout (we generate starter `codeSnippets` that read stdin).

### 🎤 Likely questions

**Q: Walk me through what happens when I click Submit, end to end.** → §3 request flow. Know the 7 steps cold.

**Q: Why polling instead of webhooks/callbacks from the executor?**
Judge0 supports `callback_url`, but polling keeps the executor unable to initiate connections into the app (simpler trust model, no public callback endpoint to secure), and for a same-host call the poll cost is trivial. Next step would be a job queue (BullMQ in the app) with the HTTP request returning a `submissionId` immediately and the client subscribing via Socket.IO — this also fixes the "request held open for 3 minutes" problem.

**Q: What stops a user from fork-bombing, reading `/etc/passwd`, or making network calls?**
isolate: pid limits (`--processes`), memory/cpu/wall limits, own mount namespace with a minimal rootfs, no network namespace. Their code can't see the host, other submissions, or the Codebox Redis.

**Q: What if Codebox is down?**
`submitBatch` throws → controller returns 500 "Error running your code"; nothing is written to DB. The `/api/v1/health` endpoint checks DB only; adding a Codebox `/health` check is an obvious TODO.

**Q: How would you scale execution?**
Executor is the real bottleneck, not web traffic. Options in order: raise `WORKER_CONCURRENCY` with more cores → run Codebox workers on separate boxes pointed at one Redis queue → per-user submit quotas & a bounded queue so a "Run" stampede degrades gracefully instead of OOMing the host. Also compile once per submission and run N times (Judge0 can't; a custom worker could) — this alone would make C++/Java ~N× cheaper.

**Q: How did you debug the 500s on many-testcase submissions?**
Symptom: Accepted on EASY, 500 on HARD C++. pino logs showed `Execution timeout - results not available` from the poll loop after 30 s, while Codebox was still happily processing. Root cause: poll budget assumed Judge0-style parallel execution; Codebox compiled each of 75 testcases serially. Fix: widen budget, slow cadence (which also stopped tripping Codebox's rate limiter), treat 429 as retryable.

---

## 6. Resume bullet 3 — production deployment

> *Deployed a production container stack on an AWS Lightsail single VPS using Docker Compose, with Caddy reverse proxy, optional Cloudflare edge proxy and segmented Docker networking for secure service-to-service communication.*

### What's actually running (`docker-compose.prod.yml`, `backend/docs/DEPLOY.md`)

| Container | Image | Exposed ports | Role |
|---|---|---|---|
| `codearena-caddy` | `caddy:2-alpine` | **80, 443** (the only public ports) | TLS termination, routing, compression, security headers |
| `codearena-frontend` | custom (node build → `nginx:alpine`) | none | Serves the Vite build; `/health` for Docker healthcheck |
| `codearena-backend` | custom (`node:20`) | none | Express API + Socket.IO on 8080 |
| `codearena-postgres` | `postgres:16-alpine` | none | `pg_isready` healthcheck; backend waits on `service_healthy` |
| `codearena-redis` | `redis:7-alpine` | none | AOF persistence |
| `codebox-{api,worker,redis}` | separate compose project | api on `172.17.0.1:3000` only | Execution engine |

### Caddy (`Caddyfile`)
- `codearena.kodexa.in { … }` — one site block; Caddy auto-provisions and renews a Let's Encrypt cert (HTTP-01) when the DNS record is grey-cloud.
- `@api path /api/* /socket.io/*` → `reverse_proxy backend:8080` (Caddy handles WebSocket upgrade transparently). Everything else → `frontend:80`.
- `encode zstd gzip`; headers `X-Frame-Options SAMEORIGIN`, `X-Content-Type-Options nosniff`, `Referrer-Policy`, and `-Server` to hide the server banner.
- Same-origin SPA + API ⇒ no CORS in prod for browser traffic, cookies are first-party, `sameSite: lax` works.

**Why Caddy over nginx at the edge?** Zero-config automatic HTTPS with renewal, a 20-line config vs ~100 for the nginx equivalent with certbot, native WebSocket proxying. nginx is still used *inside* the frontend container purely as a static file server.

### Optional Cloudflare
- Orange-cloud the A record → Cloudflare terminates TLS at the edge, caches static assets, absorbs L3/L4/L7 DDoS, hides the origin IP.
- Origin side: set SSL mode **Full (Strict)** and give Caddy a Cloudflare Origin Certificate (`tls /etc/caddy/origin.pem /etc/caddy/origin.key`) — or use the DNS-01 challenge with the `caddy-dns/cloudflare` plugin, because HTTP-01 won't complete through the proxy.
- Backend sets `app.set("trust proxy", 1)` so `express-rate-limit` sees the real client IP from `X-Forwarded-For` instead of rate-limiting Caddy itself, and `secure` cookies are honoured.

### Segmented Docker networking
- **App network (`codearena`, bridge)**: caddy, frontend, backend, postgres, redis. Services resolve each other by name (`postgres:5432`, `backend:8080`). Only Caddy publishes host ports; Postgres/Redis have **no** `ports:` at all, so they are unreachable even from the host's loopback.
- **Executor network (Codebox's own compose project)**: api, worker, redis — a separate bridge. The app cannot reach Codebox's Redis or worker; it can reach *only* the API, *only* via the gateway IP, *only* with the auth token.
- The two projects are connected through a single deliberate seam: `ports: ["172.17.0.1:3000:3000"]` on Codebox + `extra_hosts: host.docker.internal:host-gateway` on the backend. I chose the docker-gateway IP rather than `127.0.0.1` because a port bound to the host's loopback is not reachable from inside a bridge-network container via `host.docker.internal` on Linux.
- Lightsail firewall: 22, 80, 443 only.

### Deploy procedure (no CI/CD — deliberate for a solo project)
```bash
ssh ubuntu@<ip>
cd /home/ubuntu/CodeArena && git pull --ff-only origin main
docker compose -f docker-compose.prod.yml build
docker compose -f docker-compose.prod.yml run --rm -T backend npx prisma migrate deploy
docker compose -f docker-compose.prod.yml up -d
curl -s https://codearena.kodexa.in/api/v1/health    # {"success":true,"status":"ok","db":true}
```
Secrets live in an uncommitted `.env` on the box and are injected via Compose `${VAR}` interpolation. SSH uses short-lived keys minted with `aws lightsail get-instance-access-details`.

### 🎤 Likely questions

**Q: Single VPS — isn't that a SPOF?** Yes, and that's the right call for this stage: one box, ~$10–20/month, Compose restart policies (`unless-stopped`) + Docker healthchecks for self-healing. Scaling path is documented in `architecture.md`: PM2 cluster for the stateless API, PgBouncer in front of Postgres, Redis adapter for Socket.IO, executor workers on separate hosts, then managed Postgres. Multi-AZ/k8s would be premature.

**Q: How do you do zero-downtime deploys?** I don't — `up -d` recreates changed containers with a few seconds of 502 from Caddy. For zero-downtime I'd run two backend replicas behind Caddy's `reverse_proxy` with health-checked `lb_policy` and `--scale` one at a time, or move to a blue/green pair of compose projects.

**Q: Backups?** Postgres data is a named volume; a cron'd `pg_dump` to S3 is the intended next step (`MONITORING.md`). Be honest if it's not set up yet.

**Q: Why Lightsail and not EC2/ECS?** Fixed predictable pricing, bundled static IP and firewall, no VPC/IAM yak-shaving. Workload is one box anyway.

**Q: How are secrets handled?** `.env` on the box (chmod 600, never committed), referenced via Compose interpolation, `SECRET`/`REFRESH_SECRET`/`CODEBOX_AUTH_TOKEN` generated with `openssl rand -hex 32`. Next step: AWS SSM Parameter Store or Docker secrets.

**Q: What does `depends_on: condition: service_healthy` buy you?** Backend doesn't boot until `pg_isready` and `redis-cli ping` pass, so Prisma doesn't crash-loop on a cold start.

**Q: Why does the nginx healthcheck use `127.0.0.1` not `localhost`?** Alpine resolves `localhost` to `::1` first and nginx only listens on IPv4 → false "unhealthy". Small but it's the kind of detail that shows you actually ran it.

---

## 7. Auth & security model

| Topic | Implementation |
|---|---|
| Password hashing | bcrypt, cost 12 |
| Tokens | Two JWTs: access (`15m`, `SECRET`) + refresh (`7d`, or 30d with "remember me", `REFRESH_SECRET`), both in **httpOnly, secure, sameSite=lax** cookies |
| Refresh rotation | Refresh token stored on `User.refreshToken`; `/auth/refresh-token` verifies signature **and** equality with the stored value, then issues a new pair (rotation). Logout / password change null it → revocation. |
| Frontend | Axios interceptor: on 401, call refresh **once** (a shared `refreshPromise` coalesces concurrent 401s), replay the original request; excludes login/register/refresh from the retry to prevent loops |
| OAuth | GitHub + Google; `OAuthAccount` table with `@@unique([provider, providerId])`; OAuth users auto-verified |
| Email verification | `requireVerified` middleware gates **writes** (submit, post, vote); reads stay open |
| RBAC | `USER \| ADMIN` single-admin model (`ADMIN_EMAIL` bootstraps). `checkAdmin`, `checkOwnership(model, param, ownerField)` for per-row authorisation |
| Socket.IO auth | JWT passed in `handshake.auth.token`, verified in `io.use()` middleware; rooms `contest_<id>` |
| HTTP hardening | helmet (CSP off at API; CSP belongs on the SPA edge), CORS locked to `FRONTEND_ORIGIN` with credentials, body limit 1 MB, global 404 + error handler that hides stacks outside development |
| Rate limits | `/api` 300/min; `/auth` 40/15 min (brute-force); `/execute-code` 30/min; heartbeat mounted *before* the auth limiter so a 45 s ping doesn't exhaust the login budget |
| Webhooks | Raw body + HMAC-SHA256 + `crypto.timingSafeEqual` (§10) |

**🎤 Why cookies and not `Authorization: Bearer` from localStorage?** httpOnly cookies are immune to XSS token theft; `sameSite=lax` + CORS origin lock covers CSRF for JSON APIs (a cross-site form POST can't set `Content-Type: application/json`, and `lax` blocks cross-site POST cookies anyway). `lax` rather than `strict` so the cookie survives the OAuth provider → app top-level redirect. The middleware *also* accepts a Bearer header for the Socket.IO handshake and tooling.

**🎤 Why 15-minute access tokens?** Limits the blast radius of a leaked token while the refresh rotation gives long sessions. Tokens aren't stateless-revocable, so short expiry + stored refresh token is the compromise.

---

## 8. Data model

Prisma schema highlights (`backend/prisma/schema.prisma`, 4 migrations):

- **`Problem`** — `testcases Json`, `referenceSolutions Json`, `codeSnippets Json`, `examples Json`; `@@index([published, difficulty])`. JSON for testcases because they're always read as a whole and never queried individually; a `TestCase` table would be 75 rows × N problems for no benefit.
- **`Submission`** + **`TestCaseResult`** (1:N) — per-case detail kept for admin/debug even though the client gets a summary.
- **`ProblemSolved`** `@@unique([userId, problemId])` — the DB-level guard that points are awarded once even under concurrent submits.
- **`Contest` / `ContestParticipant` / `ContestSubmission` / `ContestLeaderboard`** — `@@index([contestId, totalScore, penalty])` matches the leaderboard `ORDER BY`.
- **Community**: `Solution`, `Discussion`, `Comment` (self-relation `parentId` for threads), `Vote` `@@unique([userId, targetType, targetId])` (polymorphic, one vote per user per target), `Follow`, `Report`.
- **`Donation`** + **`WebhookEvent`** (idempotency ledger keyed on `x-razorpay-event-id`).
- **`User`** — `points`, `lastSeenAt`/`lastLoginAt` (indexed, drives admin "live now"), `refreshToken`, `emailVerified`, reset-token fields.

**🎤 Points race condition?** `findUnique` then `create` isn't atomic, but the `@@unique([userId, problemId])` constraint makes the second concurrent `create` throw, so double-award can't persist. Cleaner: wrap in `db.$transaction` or use `INSERT … ON CONFLICT DO NOTHING RETURNING` and only increment when a row was inserted.

---

## 9. Contests & real-time leaderboard

- Scoring in `contest.controllers.js`: first AC on a problem = 100 points + penalty = minutes since contest start; subsequent ACs don't re-score. Leaderboard `ORDER BY totalScore DESC, penalty ASC, lastSubmission ASC`.
- After every accepted contest submission: `updateLeaderboard` (Prisma upsert with `increment`) then `io.to("contest_<id>").emit("leaderboardUpdate", fullBoard)`.
- Clients `joinContest` on mount, `leaveContest` on unmount; Socket.IO handshake is JWT-authenticated.

**🎤 Why push the whole leaderboard rather than a delta?** Boards are ≤ a few hundred rows; simplicity wins, and it's self-healing (a missed event doesn't leave a client stale). **Scaling:** the Socket.IO Redis adapter so multiple API processes share rooms; throttle emits to at most once per second per contest.

---

## 10. Payments (Razorpay) — webhook correctness

`donationWebhook.controllers.js`, mounted **before** `express.json()` with `express.raw()`:

1. Recompute `HMAC-SHA256(raw body, RAZORPAY_WEBHOOK_SECRET)` and compare to `x-razorpay-signature` with `crypto.timingSafeEqual` (constant-time; lengths checked first).
2. Insert `WebhookEvent` keyed on `x-razorpay-event-id` — a duplicate delivery is a no-op.
3. Apply a guarded state transition on `Donation` (`created → paid` only; never regress).
4. ACK 200 quickly; a background **reconciler** (`libs/reconcile.js`, started in `index.js`) periodically re-queries Razorpay for stuck orders because client-side success callbacks are unreliable.

**🎤 Why raw body?** HMAC is over the exact bytes; `express.json()` re-serialisation changes whitespace/key order and the signature would never match. **Why timing-safe compare?** `===` short-circuits on first mismatch → timing oracle on the signature.

---

## 11. Operational stuff

- **Health**: `GET /api/v1/health` → `{status, uptime, db:true|false}` (runs `SELECT 1`); nginx `/health` for the SPA container; Docker healthchecks on postgres/redis/frontend.
- **Logging**: `pino-http` structured JSON request logs; `pino-pretty` in dev. `docker compose logs -f backend` in prod.
- **Monitoring**: see `backend/docs/MONITORING.md` (uptime ping on `/health`).
- **Migrations**: `prisma migrate deploy` run as a one-off container *after* building the new image and *before* `up -d`. Migrations are additive so old containers tolerate the new schema during the swap.
- **Seeding**: `prisma/seed.js` creates the admin (`ADMIN_EMAIL`) + starter problems; `scripts/backfill-points.js` recomputed points when the scoring rule changed.

---

## 12. Honest gaps & what I'd do next

Interviewers respect candour. Lead with these before they find them.

| Gap | Status | Fix |
|---|---|---|
| Redis unused by app code | Provisioned, idle | Rate-limit store (`rate-limit-redis`), refresh-token store, problem-list/leaderboard cache, Socket.IO adapter |
| Submit holds the HTTP request open for up to 3 min | Works, but ties a Node event-loop slot & risks proxy timeouts | Enqueue → return `submissionId` → push verdict over Socket.IO |
| Compile once per testcase (C++/Java) | Slow on 40–75-case problems | Custom worker step: compile once, run N times |
| No tests | `backend/test.js` is a scratch file | Supertest integration tests for auth + execute + problem select-whitelist (a regression test that `testcases` never appears in a non-admin response is the single most valuable one) |
| No CI/CD | Manual `git pull` | GitHub Actions → build images → SSH deploy; or Watchtower |
| No DB backups | Named volume only | Nightly `pg_dump` → S3 lifecycle |
| `trust proxy: 1` | Correct for Caddy alone; with Cloudflare in front there are 2 hops | Set to 2 or trust Cloudflare IP ranges, else rate-limit keys on Cloudflare's IP |
| Points award not transactional | Guarded by unique constraint | `$transaction` / `ON CONFLICT` |
| AI code review route | Stub | Anthropic API call with the problem + submission as context |
| Output comparison is exact-match only | By design | Optional per-problem checker (token/epsilon/special judge) |

---

## 13. Rapid-fire question bank

**Design / trade-offs**
- Why Express over Nest/Fastify? → Familiarity, huge middleware ecosystem (helmet, rate-limit, pino-http), app is I/O-bound so framework overhead is irrelevant; the bottleneck is the executor.
- Why Prisma? → Type-safe queries, migrations as code, `select` whitelists make the no-leak guarantee explicit and reviewable.
- Why Postgres JSON for testcases? → Read-whole, write-whole, never filtered; avoids a join on every submit.
- Why Socket.IO not SSE? → Need rooms, reconnection, auth middleware; SSE would suffice for one-way leaderboard but Socket.IO was already needed for contests.
- Why Vite/React SPA + nginx rather than SSR? → App is behind login; no SEO need; static hosting is cheapest and cacheable at Cloudflare.
- Why Zustand? → Tiny, no boilerplate; only auth/user state is truly global.

**Security**
- Threat model for the executor? → Malicious code: resource exhaustion, filesystem/network escape, cross-submission snooping, host compromise. Mitigations: isolate limits, no network, private port + shared token, privileged container is the worker *not* the API.
- What's in the JWT? → `{ id, type: "access"|"refresh" }` only; user fields are re-read from DB on every request so deactivation (`isActive=false`) takes effect immediately.
- How do you stop a user editing someone else's playlist? → `checkOwnership("playlist", "id", "userId")` — admin bypass, else row's owner must equal `req.user.id`.
- SQL injection? → Prisma parameterises everything; the one `$queryRaw` is a constant `SELECT 1`.
- XSS in markdown statements/solutions? → `react-markdown` doesn't render raw HTML by default; no `rehype-raw`.

**Ops**
- How do you roll back? → `git checkout <prev-sha>` + rebuild + `up -d`; migrations are additive so no down-migration needed in practice.
- What happens on box reboot? → All services `restart: unless-stopped`; Caddy re-uses its cached cert from the `caddy_data` volume.
- How do you know it's down? → Uptime monitor on `/api/v1/health`; `db:false` in the payload distinguishes app-up/DB-down.

**Behavioural hooks (have a story ready)**
- Hardest bug → the poll-timeout 500s (§5).
- A decision you reversed → hosted Judge0 → self-hosted Codebox; also SUPERADMIN multi-role → single admin (simplicity).
- Something you'd do differently → queue-based async submit from day one.

---

## 14. Running locally

```bash
# Backend
cd backend && npm ci
cp .env.example .env        # DATABASE_URL, SECRET, REFRESH_SECRET, CODEBOX_API_URL, CODEBOX_AUTH_TOKEN …
npx prisma migrate dev && node prisma/seed.js
npm run dev                 # :8080

# Frontend
cd frontend && npm ci && npm run dev   # :3000, Vite proxies /api → :8080

# Or everything via compose (dev profile, hot reload)
docker compose -f docker-compose.dev.yml up --build
```

Executor for local dev: run Codebox (`docker compose up` in its repo) and point `CODEBOX_API_URL=http://localhost:3000` with a matching `AUTH_TOKEN`.

Further reading in-repo: `backend/docs/architecture.md` (target design & scaling), `backend/docs/DEPLOY.md` (prod runbook), `backend/docs/DATABASE.md`, `backend/docs/PAYMENTS.md`, `backend/docs/MONITORING.md`.
