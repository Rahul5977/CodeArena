<div align="center">

# 🏟️ CodeArena

### A self-hosted, LeetCode-style DSA platform — built for personal mastery and community.

*Grind problems in a real code editor, judged by a sandboxed executor, on infrastructure engineered to serve **~10,000 concurrent users from a single low-cost VPS.***

[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)](https://react.dev)
[![Node.js](https://img.shields.io/badge/Node.js-20+-339933?logo=node.js&logoColor=white)](https://nodejs.org)
[![Express](https://img.shields.io/badge/Express-4-000000?logo=express&logoColor=white)](https://expressjs.com)
[![Prisma](https://img.shields.io/badge/Prisma-6-2D3748?logo=prisma&logoColor=white)](https://www.prisma.io)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?logo=postgresql&logoColor=white)](https://www.postgresql.org)
[![Redis](https://img.shields.io/badge/Redis-7-DC382D?logo=redis&logoColor=white)](https://redis.io)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker&logoColor=white)](https://www.docker.com)
[![Vite](https://img.shields.io/badge/Vite-7-646CFF?logo=vite&logoColor=white)](https://vite.dev)

**Live (soon):** [`codearena.kodexa.in`](https://codearena.kodexa.in) &nbsp;·&nbsp; **Status:** 🚧 active rewamp toward v0.1

</div>

---

## ✨ What is CodeArena?

CodeArena is a full-stack competitive-programming platform in the spirit of LeetCode — a warm, focused place to solve data-structures & algorithms problems in a Monaco-powered editor, run your code against real test cases in a **sandboxed executor**, track your progress, and (soon) share solutions with a community.

It's **free forever** — no paywalls, no premium tiers. If it helps you, there's a *pay-what-you-want* support page. That's it.

It is also, deliberately, an **engineering showcase**: a from-scratch rewamp designed to prove that a genuinely useful, secure, real-time coding platform can be run for a community of thousands **without a cloud bill that hurts** — one modest VPS, one `docker compose up`, fronted by Cloudflare's free tier.

---

## 🎯 Highlights (the fun engineering)

- **🔒 Answer-free by construction.** The problem API ships a strict projection — a normal user can read a problem's statement, examples, and starter code, but **never** its hidden test cases or reference solutions. Judging happens entirely server-side: the client submits code + a `problemId`, the server fetches the real test cases and runs them. No answers ever cross the wire.
- **🧩 A pluggable execution engine.** All code execution sits behind a single lib boundary (`executor.lib.js`) speaking the **Judge0-CE protocol**. The default is self-hosted **[Codebox](https://github.com/hiteshchoudhary/Codebox)** (sandbox-per-run: no network, dropped capabilities, non-root, CPU/memory/PID limits); Judge0 remains a drop-in break-glass fallback — swappable by config, not by rewrite.
- **⚡ Engineered for 10k concurrent on one box.** Cloudflare edge-caches the reads; a stateless **PM2-cluster** API scales across cores; **PgBouncer** multiplexes DB connections; **Redis** backs caching, sessions, rate-limits, and the Socket.IO adapter; and — the key insight — code execution is a **bounded queue with per-user rate limits**, so 10k users hitting "Run" degrades gracefully instead of melting the host.
- **🎨 A real design system.** The entire UI is built on **Organic** — a warm, token-driven design language (cream & terracotta, `Caprasimo` + `Figtree`, over-rounded shapes, OKLCH tonal ramps). Every color, radius, and shadow comes from CSS variables; nothing is hard-coded.
- **👑 Radically simple RBAC.** One admin, one flag. Roles collapse to `USER | ADMIN` — the admin is whoever registers with `ADMIN_EMAIL`. No promote/demote machinery, no role-change audit tables. Less code, fewer bugs.
- **✅ Content that can't lie.** Seed problems are validated by running every reference solution against every test case before they're accepted — a correct solution is *guaranteed* to pass the live judge.

---

## 🏗️ Architecture

```mermaid
flowchart TB
  users([~10k concurrent users]) -->|HTTPS| cf[Cloudflare free tier<br/>CDN · TLS · cache · DDoS]
  cf --> edge[Caddy — reverse proxy + auto-TLS]

  subgraph vps[Single VPS · Docker Compose]
    edge --> fe[React SPA<br/>static, edge-cached]
    edge --> be[API — PM2 cluster<br/>Express · Prisma · Socket.IO]
    be --> pgb[PgBouncer] --> pg[(PostgreSQL 16)]
    be --> rd[(Redis 7<br/>cache · sessions · rate-limit · pub/sub)]

    subgraph exec[Executor network · no public ingress]
      be -->|X-Auth-Token| cbapi[Codebox API]
      cbapi --> cbq[(BullMQ / Redis)]
      cbwrk[Worker · sandbox-per-run] --> cbq
    end
  end
```

**The request lifecycle for a submission:** browser → Cloudflare → Caddy → API (`/api/v1/execute-code`) → server fetches the problem's test cases → batches them to Codebox over the internal network → Codebox runs each in an isolated container → the API compares `stdout`, records a `Submission` + per-test-case results, marks the problem solved, and returns a **safe verdict** (pass/fail per case + timings, no hidden I/O).

---

## 🧰 Tech stack

| Layer | Choice | Why |
|---|---|---|
| **Frontend** | React 19 · Vite 7 · React Router · Zustand | Fast, modern, minimal |
| **Editor** | Monaco (`@monaco-editor/react`) · `react-split` | The VS Code editor, in the browser |
| **Design** | **Organic** design system (token-driven CSS) | One warm, consistent visual language |
| **Backend** | Node 20 · Express (ESM) · Prisma ORM | Simple, typed data access, easy to reason about |
| **Database** | PostgreSQL 16 (+ PgBouncer at scale) | Relational integrity + connection pooling |
| **Cache / realtime** | Redis 7 · Socket.IO | Caching, sessions, rate-limits, live leaderboards |
| **Executor** | Self-hosted **Codebox** (Judge0-CE compatible) | Sandboxed code execution, no per-run cloud cost |
| **Auth** | JWT (access + refresh) · bcrypt · OAuth *(planned)* | Cookie sessions today, GitHub/Google next |
| **Payments** | Razorpay — *donations only* | Pay-what-you-want support, INR-native |
| **Infra** | Docker Compose · Caddy · **Cloudflare (free)** | One box, auto-TLS, free CDN/DDoS |

---

## 📂 Project structure

```
CodeArena/
├── backend/                  # Node + Express + Prisma API
│   ├── prisma/
│   │   ├── schema.prisma      # single-admin, community, donations, slugs
│   │   └── seed.js            # admin + starter problems (validated)
│   └── src/
│       ├── controllers/       # auth · problem · executeCode · dashboard · …
│       ├── routes/            # /api/v1/*
│       ├── middleware/        # auth + single-admin RBAC + optionalAuth
│       └── libs/              # executor (Codebox) · db · email · payments · socket
├── frontend/                 # React 19 + Vite SPA (Organic design system)
│   └── src/
│       ├── components/        # AppShell, ProtectedRoute, …
│       ├── pages/             # Dashboard · Problems · ProblemEditor · Support · …
│       ├── store/             # Zustand auth store
│       └── styles/organic.css # the design tokens + components
├── design/                   # the imported Organic design (16 screens)
├── architecture.md           # the full architecture & phased plan
└── progress.md               # what's built, phase by phase
```

---

## 🚀 Quickstart (local dev)

**Prerequisites:** Node 20+, Docker.

```bash
# 1) Database (Postgres in Docker)
docker run -d --name codearena-pg \
  -e POSTGRES_USER=myuser -e POSTGRES_PASSWORD=mypassword -e POSTGRES_DB=codearena \
  -p 5432:5432 postgres:16-alpine

# 2) Backend
cd backend
npm install
cp ../.env.example .env          # then edit values (DATABASE_URL, SECRET, ADMIN_EMAIL, …)
npx prisma migrate dev           # apply the schema
node prisma/seed.js              # admin + 6 starter problems
npm run dev                      # → http://localhost:8080

# 3) Frontend (second terminal)
cd frontend
npm install
npm run dev                      # → http://localhost:3000
```

Open **http://localhost:3000**, register (or log in as the seeded admin), and start solving.

> **Code execution** needs the Codebox engine running — see `architecture.md` §8. On the production VPS it runs with `EXECUTOR_TYPE=isolate`; the app itself runs fine without it (you just can't Run/Submit until it's up).

---

## 🌍 Deployment

CodeArena is designed to deploy to a **single VPS** (e.g. Hetzner CPX31 → CPX41, ~€15–30/mo) behind **Cloudflare's free tier**:

- **Caddy** terminates TLS and reverse-proxies the SPA + API (`codearena.kodexa.in`).
- One `docker compose` brings up frontend, API (PM2 cluster), Postgres, Redis, and the isolated Codebox executor.
- Cloudflare provides CDN, caching, and DDoS protection for free — the origin sees a fraction of the traffic.
- Nightly `pg_dump` backups, `ufw` + `fail2ban` + key-only SSH.

Full runbook and the 12-phase build plan live in [`architecture.md`](./architecture.md) and [`progress.md`](./progress.md).

---

## 🗺️ Status & roadmap

CodeArena is being rebuilt from the ground up. Current state:

- ✅ **Backend reshaped** — single-admin schema, community + donation models, answer-free problem API, secure server-side judging. Runs, migrated, and seeded.
- ✅ **Auth** — email/password with cookie sessions, wired end-to-end.
- ✅ **Solving loop** — public problem browsing + a Monaco editor with Run/Submit.
- 🚧 **Executor** — Codebox integrated; final validation on the deploy VPS.
- 🔜 **Next** — community (solutions, discuss, profiles, leaderboard), OAuth, the DSA content library, and production deploy.

See [`progress.md`](./progress.md) for the phase-by-phase tracker.

---

<div align="center">

**Built by Rahul Raj** · a free platform for the community, and a playground for doing infrastructure *right* on a budget.

*If CodeArena helps you, the in-app **Support** page keeps the lights on. 🧡*

</div>
