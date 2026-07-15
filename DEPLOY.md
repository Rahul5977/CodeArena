# Deploying CodeArena to production

Target: a single VPS serving **`codearena.kodexa.in`**, behind **Cloudflare (free)**, with **Caddy** for TLS. Est. cost **~€15–30/mo** + Razorpay per-transaction (donations only).

> **Architecture:** Caddy (edge) → `frontend` (SPA) + `backend` (API) → Postgres + Redis, all in one `docker compose`. The **Codebox** code-execution engine runs from its own repo on the same host, bound to `127.0.0.1:3000`, reached by the backend via `host.docker.internal`. See [`architecture.md`](./architecture.md) §9.

---

## 0. Where to host it — including free-forever options

You don't need to spend much, or anything. Ranked by fit for the **full stack** (Postgres + Redis + Node API + the **Codebox** executor + Caddy — wants ~2 GB+ RAM):

| Option | Free? | Specs | Verdict |
|---|---|---|---|
| **Oracle Cloud — Always Free (ARM Ampere A1)** | ✅ **forever** | up to **4 vCPU / 24 GB RAM** / 200 GB | **Best free option** — runs the whole stack comfortably, executor included. It's arm64 (all our images have arm64 builds). A1 capacity can be scarce — retry, or pick a different home region. |
| **AWS EC2 Free Tier** | ⏳ 12 months | `t2/t3.micro` = **1 GB RAM** | Too small for the full stack + Codebox (it will OOM). Workable only if you drop the executor or add swap and trim hard. Realistic AWS floor is `t3.small` (2 GB, ~$15/mo). |
| **GCP Free Tier** | ✅ forever | `e2-micro` **1 GB** | Same 1 GB limitation as AWS micro. |
| **GitHub Student Pack** | ✅ if a student | DigitalOcean **$200** credit, Azure $100, etc. | If eligible: months of a proper 2–4 GB droplet for free, plus a free domain. |
| **Hostinger VPS** | 💶 ~$5–9/mo | KVM 2: 2 vCPU / 8 GB | Easy hPanel, full root; **no cloud firewall to configure** (just `ufw`). |
| **Hetzner / DigitalOcean / Vultr** | 💶 ~€4–14/mo | 2–8 GB | Cheapest *paid* — best price/perf once you outgrow free. |

**Recommendation: Oracle Cloud Always Free (4 vCPU / 24 GB ARM)** — genuinely free forever and powerful enough for everything. The runbook below is cloud-agnostic; on Oracle also open **80/443 in the instance's Security List / NSG** (in addition to `ufw`). On a 1 GB box (AWS/GCP micro) run only Postgres + API + Caddy and host the executor elsewhere — not recommended for the full experience.

> ⚠️ **You provision the server + DNS — I can't create cloud accounts or handle their credentials.** Pick a host and I'll tailor the exact commands (incl. the AWS EC2 or Oracle specifics).

---

## 1. Provision the VPS

Recommended: **Hetzner CPX31** (4 vCPU / 8 GB, ~€14/mo), scale to **CPX41** (8 vCPU / 16 GB) under load. Ubuntu 24.04, **KVM-capable** (so Codebox can use the `isolate` sandbox).

```bash
# as root on the fresh VPS
apt update && apt upgrade -y
# Docker
curl -fsSL https://get.docker.com | sh
# Firewall — only SSH + HTTP(S)
ufw allow OpenSSH && ufw allow 80 && ufw allow 443 && ufw --force enable
# Hardening
apt install -y fail2ban unattended-upgrades
# (SSH: disable password + root login in /etc/ssh/sshd_config → PasswordAuthentication no, PermitRootLogin no)
```

## 2. DNS + Cloudflare

In Cloudflare (add `kodexa.in` as a zone if not already):

| Type | Name | Content | Proxy |
|---|---|---|---|
| A | `codearena` | `<VPS IPv4>` | see below |

- **Simplest:** set the record to **DNS only** (grey cloud). Caddy will auto-issue a Let's Encrypt cert. Done.
- **Recommended (CDN + DDoS):** **Proxied** (orange cloud) + SSL/TLS mode **Full (Strict)** + a **Cloudflare Origin Certificate** referenced from the `Caddyfile` (`tls /etc/caddy/origin.pem /etc/caddy/origin.key`). Cache static assets at the edge.

## 3. Get the code + configure

```bash
git clone https://github.com/Rahul5977/CodeArena.git && cd CodeArena
```

Create a **`.env`** in the repo root (used by `docker-compose.prod.yml` — never commit it):

```env
POSTGRES_USER=codearena
POSTGRES_PASSWORD=<strong-random>
POSTGRES_DB=codearena
SECRET=<strong-random>
REFRESH_SECRET=<strong-random>
ADMIN_EMAIL=you@example.com            # this account becomes the single admin
FRONTEND_ORIGIN=https://codearena.kodexa.in
CODEBOX_API_URL=http://host.docker.internal:3000
CODEBOX_AUTH_TOKEN=<strong-random>     # must match Codebox's AUTH_TOKEN (step 4)
# optional — pay-what-you-want donations
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
```

Generate strong secrets with `openssl rand -hex 32`.

## 4. Deploy the code executor (Codebox)

```bash
git clone https://github.com/hiteshchoudhary/Codebox.git codebox && cd codebox
# Build the language runner images (Python, Node, GCC, Java, …)
bash scripts/build-images.sh
```

Edit Codebox's `docker-compose.yml` so it:
- binds the API to localhost only: `ports: ["127.0.0.1:3000:3000"]`
- uses a strong token: `AUTH_TOKEN=<same as CODEBOX_AUTH_TOKEN>`
- (recommended on a KVM host) sets the worker to `EXECUTOR_TYPE=isolate` with `privileged: true` — the mature sandbox. The default `docker` executor also works on standard Linux Docker; if it errors with *"rootfs is marked read-only"* on a very new Docker, switch to `isolate`.

```bash
docker compose up -d --build
curl -s -H "X-Auth-Token: <token>" http://127.0.0.1:3000/health   # → healthy
cd ..
```

> Codebox is **never exposed publicly** — only the backend (on the host) talks to it.

## 5. Bring up the app + migrate + seed

```bash
# build images
docker compose -f docker-compose.prod.yml build
# apply the database schema
docker compose -f docker-compose.prod.yml run --rm backend npx prisma migrate deploy
# (optional) seed the admin + starter problems
docker compose -f docker-compose.prod.yml run --rm backend node prisma/seed.js
# launch everything
docker compose -f docker-compose.prod.yml up -d
```

## 6. Verify

```bash
docker compose -f docker-compose.prod.yml ps          # all healthy
curl -s https://codearena.kodexa.in/api/v1/problems/get-all-problems | head
```

Open **https://codearena.kodexa.in**, register with `ADMIN_EMAIL` (→ admin), and solve a problem to confirm the executor works end-to-end.

## 7. Backups

```bash
# nightly pg_dump (cron), rotate, and push off-box (e.g. Cloudflare R2 / rclone)
0 3 * * * docker exec codearena-postgres pg_dump -U codearena codearena | gzip > /root/backups/ca-$(date +\%F).sql.gz
```
Test a restore at least once. Redis runs with AOF persistence.

## 8. Updates / redeploy

```bash
git pull
docker compose -f docker-compose.prod.yml build
docker compose -f docker-compose.prod.yml run --rm backend npx prisma migrate deploy
docker compose -f docker-compose.prod.yml up -d
```

## 9. Scaling to ~10k concurrent (when needed)

- **API:** run the backend under **PM2 cluster** (one worker per core) or scale the `backend` service replicas behind Caddy; the API is stateless (JWT).
- **DB:** add **PgBouncer** (transaction pooling) + `?pgbouncer=true` on `DATABASE_URL`.
- **Realtime:** add the **Socket.IO Redis adapter** so all workers share rooms; raise `ulimit -n`.
- **Rate limits:** swap the in-memory limiter for a **Redis store** so limits are shared across workers.
- **Reads:** cache the problem list / leaderboard in Redis; let Cloudflare edge-cache public pages.
- **Execution:** tune Codebox `WORKER_CONCURRENCY` + keep the per-user submit rate limit — the queue absorbs "Run" stampedes.

See [`architecture.md`](./architecture.md) §9 for the full scaling design.
