# Deploying CodeArena

The production runbook for **https://codearena.kodexa.in**. There is **no CI/CD** — every deploy is a manual `git pull` + `docker compose` on the box.

## What's running in production

| | |
|---|---|
| Host | **AWS Lightsail**, instance `codearena`, region `ap-south-1` |
| Public IP | `13.203.127.204` |
| Domain | `codearena.kodexa.in` (behind **Cloudflare** → **Caddy** for TLS) |
| OS / user | Ubuntu, login user `ubuntu` |
| Repo on box | `/home/ubuntu/CodeArena`, branch **`main`** (tracks `origin/main`) |
| Compose file | `docker-compose.prod.yml` |
| App containers | `codearena-{caddy,frontend,backend,postgres,redis}` |
| Executor | separate **Codebox** stack in `/home/ubuntu/codebox`, bound to `172.17.0.1:3000`, reached by the backend via `host.docker.internal` |
| Secrets | `.env` in the repo root on the box (**never committed**) |

> **Architecture:** Caddy (edge, auto-HTTPS) → `frontend` (SPA / nginx) + `backend` (API :8080) → Postgres + Redis. The Codebox code-execution engine runs from its own repo on the same host, never exposed publicly. See [`architecture.md`](./architecture.md).

---

## 0. Connect to the box (SSH)

The box has no static key checked in; mint a **temporary** key with the AWS CLI (already configured for `ap-south-1`):

```bash
mkdir -p ~/.codearena && cd ~/.codearena
aws lightsail get-instance-access-details --instance-name codearena --protocol ssh --region ap-south-1 > access.json
python3 - <<'PY'
import json, os
d = json.load(open("access.json"))["accessDetails"]
open("cak","w").write(d["privateKey"]); os.chmod("cak", 0o600)
open("cak-cert.pub","w").write(d["certKey"])          # ssh auto-loads <key>-cert.pub
print("key ready:", os.path.abspath("cak"))
PY

ssh -i cak -o StrictHostKeyChecking=accept-new ubuntu@13.203.127.204
```

The key + cert are short-lived — re-run the mint block whenever SSH stops authenticating. **To stop re-minting**, add your own key once (while a temp-key session is alive):

```bash
cat ~/.ssh/id_ed25519.pub | ssh -i ~/.codearena/cak ubuntu@13.203.127.204 'cat >> ~/.ssh/authorized_keys'
# then forever after:  ssh ubuntu@13.203.127.204
```

---

## 1. Redeploy after code changes  ← the everyday case

**Step 1 — push your changes to `main`** (from your laptop):

```bash
git push origin main
```

**Step 2 — pull + rebuild on the box** (over SSH from §0):

```bash
cd /home/ubuntu/CodeArena
git pull --ff-only origin main
docker compose -f docker-compose.prod.yml build
docker compose -f docker-compose.prod.yml run --rm -T backend npx prisma migrate deploy   # no-op if no new migration
docker compose -f docker-compose.prod.yml up -d
```

**Step 3 — verify:**

```bash
docker compose -f docker-compose.prod.yml ps            # all Up (healthy)
curl -s https://codearena.kodexa.in/api/v1/health       # {"success":true,"status":"ok","db":true}
```

### Faster: rebuild only what changed
Building both images is unnecessary if only one side changed. `postgres`/`redis`/`caddy` are prebuilt images and never need rebuilding.

```bash
# frontend only (React/Vite change)
docker compose -f docker-compose.prod.yml build frontend && docker compose -f docker-compose.prod.yml up -d frontend

# backend only (API change) — run migrate first if the schema changed
docker compose -f docker-compose.prod.yml build backend && docker compose -f docker-compose.prod.yml up -d backend
```

> **When do I need `prisma migrate deploy`?** Only when `backend/prisma/schema.prisma` changed **and** you added a migration under `backend/prisma/migrations/`. Running it otherwise is harmless (it reports "No pending migrations"). It requires the freshly built `backend` image, so run it **after** `build`.

### One-liner from your laptop (optional)
After `git push`, with a working `~/.codearena/cak`:

```bash
ssh -i ~/.codearena/cak ubuntu@13.203.127.204 'set -e; cd /home/ubuntu/CodeArena &&
  git pull --ff-only origin main &&
  docker compose -f docker-compose.prod.yml build &&
  docker compose -f docker-compose.prod.yml run --rm -T backend npx prisma migrate deploy &&
  docker compose -f docker-compose.prod.yml up -d'
```

---

## 2. First-time deploy (provisioning a fresh box)

Only needed to stand up a **new** server. Skip this if you're just shipping changes (§1).

### 2.1 Provision the Lightsail instance
In the Lightsail console: **Create instance** → Linux/Unix → **Ubuntu 22.04/24.04**, region `ap-south-1`, plan with **≥ 2 GB RAM** (4 GB recommended — Postgres + Redis + API + the isolate executor). Then:

- **Networking → attach a static IP** (this becomes your `A` record target).
- **Networking → IPv4 Firewall → add rules:** `HTTP 80`, `HTTPS 443` (SSH 22 is open by default).

### 2.2 Install Docker (on the box)
```bash
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker ubuntu && newgrp docker      # run docker without sudo
```

### 2.3 DNS + Cloudflare
Add `kodexa.in` as a Cloudflare zone, then an `A` record: `codearena → <static IP>`.
- **Simplest:** set it **DNS only** (grey cloud) — Caddy auto-issues a Let's Encrypt cert.
- **Recommended:** **Proxied** (orange cloud) + SSL/TLS **Full (Strict)** + a Cloudflare **Origin Certificate** referenced in the `Caddyfile`.

### 2.4 Get the code + create `.env`
```bash
cd /home/ubuntu
git clone https://github.com/Rahul5977/CodeArena.git && cd CodeArena
```
Create `.env` in the repo root (used by `docker-compose.prod.yml` — **never commit it**). Generate secrets with `openssl rand -hex 32`:
```env
POSTGRES_USER=codearena
POSTGRES_PASSWORD=<strong-random>
POSTGRES_DB=codearena
SECRET=<strong-random>
REFRESH_SECRET=<strong-random>
ADMIN_EMAIL=you@example.com            # this account becomes the single admin
FRONTEND_ORIGIN=https://codearena.kodexa.in
CODEBOX_API_URL=http://host.docker.internal:3000
CODEBOX_AUTH_TOKEN=<strong-random>     # must match Codebox's AUTH_TOKEN (§2.5)
# optional — pay-what-you-want donations
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
RAZORPAY_WEBHOOK_SECRET=
# optional — OAuth + email verification (email/password signups can't submit until SMTP is set)
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
SMTP_FROM=
```

### 2.5 Deploy the code executor (Codebox — **isolate** sandbox)
> ⚠️ The `docker` executor does **not** work on Docker ≥ 29. `get.docker.com` installs Docker 29+, so always use **`isolate`** (needs cgroup v2 — Ubuntu 22.04+ — and a `privileged` worker).

```bash
cd /home/ubuntu
git clone https://github.com/hiteshchoudhary/Codebox.git codebox && cd codebox
# isolate now needs libseccomp-dev at build time
sed -i 's/libcap-dev libsystemd-dev/libcap-dev libsystemd-dev libseccomp-dev/' docker/worker/Dockerfile
# auth token must equal the app's CODEBOX_AUTH_TOKEN
grep '^CODEBOX_AUTH_TOKEN=' /home/ubuntu/CodeArena/.env | sed 's/^CODEBOX_AUTH_TOKEN=/AUTH_TOKEN=/' > .env
echo "WORKER_CONCURRENCY=1" >> .env

cat > docker-compose.server.yml <<'YML'
services:
  redis:
    image: redis:7-alpine
    command: redis-server --appendonly yes
    restart: unless-stopped
  api:
    build: { context: ., dockerfile: docker/api/Dockerfile }
    environment: [ NODE_ENV=production, REDIS_URL=redis://redis:6379, AUTH_TOKEN=${AUTH_TOKEN}, PORT=3000 ]
    ports: [ "172.17.0.1:3000:3000" ]       # docker-gateway IP, NOT 127.0.0.1
    depends_on: [redis]
    restart: unless-stopped
  worker:
    build: { context: ., dockerfile: docker/worker/Dockerfile }
    command: node src/queue/worker.js
    privileged: true
    environment: [ NODE_ENV=production, REDIS_URL=redis://redis:6379, EXECUTOR_TYPE=isolate, WORKER_CONCURRENCY=${WORKER_CONCURRENCY:-1} ]
    depends_on: [redis]
    restart: unless-stopped
YML

docker compose -f docker-compose.server.yml up -d --build       # worker build ~10–15 min (compiles isolate + toolchains)
curl -s -H "X-Auth-Token: $(grep '^AUTH_TOKEN=' .env | cut -d= -f2)" http://172.17.0.1:3000/health   # → healthy
cd /home/ubuntu/CodeArena
```

### 2.6 Build + migrate + seed + launch
```bash
docker compose -f docker-compose.prod.yml build
docker compose -f docker-compose.prod.yml run --rm backend npx prisma migrate deploy   # apply schema
docker compose -f docker-compose.prod.yml run --rm backend node prisma/seed.js          # optional: admin + starter problems
docker compose -f docker-compose.prod.yml up -d
```

### 2.7 Verify
```bash
docker compose -f docker-compose.prod.yml ps
curl -s https://codearena.kodexa.in/api/v1/health
```
Open the site, register with `ADMIN_EMAIL` (→ becomes admin), and solve a problem to confirm the executor works end-to-end.

---

## 3. One-off tasks

Run from `/home/ubuntu/CodeArena` on the box.

```bash
# Recompute global leaderboard points from existing solves (idempotent)
docker compose -f docker-compose.prod.yml run --rm -T backend node scripts/backfill-points.js

# Apply DB migrations manually
docker compose -f docker-compose.prod.yml run --rm -T backend npx prisma migrate deploy

# Open a shell in the backend container
docker compose -f docker-compose.prod.yml exec backend sh

# Open a psql shell on the prod DB
docker compose -f docker-compose.prod.yml exec postgres psql -U codearena -d codearena
```

---

## 4. See the database in a GUI

Postgres is **not** exposed publicly (no host port). Browse it by SSH-tunnelling to the container, then pointing any Postgres GUI at `localhost`.

```bash
# 1) Mint the SSH key (§0), then find the DB password:
ssh -i ~/.codearena/cak ubuntu@13.203.127.204 'grep -E "^POSTGRES_(USER|PASSWORD|DB)=" /home/ubuntu/CodeArena/.env'

# 2) Open the tunnel: local 127.0.0.1:5433 -> prod Postgres 5432 (auto-resolves the container IP)
PGIP=$(ssh -i ~/.codearena/cak ubuntu@13.203.127.204 \
  'docker inspect -f "{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}" codearena-postgres')
ssh -i ~/.codearena/cak -N -L 5433:$PGIP:5432 ubuntu@13.203.127.204     # leave running; Ctrl-C to close
```

Then in **TablePlus / DBeaver / pgAdmin / Postico**, create a PostgreSQL connection:

| Field | Value |
|---|---|
| Host | `127.0.0.1` |
| Port | `5433` |
| Database | `codearena` |
| User | `codearena` |
| Password | *(from step 1)* |
| SSL mode | `disable` / `prefer` |

Terminal check instead of a GUI:
```bash
psql "postgresql://codearena:<PASSWORD>@127.0.0.1:5433/codearena" -c '\dt'
```

---

## 5. Logs, health & troubleshooting

```bash
# tail logs
docker compose -f docker-compose.prod.yml logs backend --tail 100 -f
docker compose -f docker-compose.prod.yml logs frontend --tail 50

# container status / health
docker compose -f docker-compose.prod.yml ps

# restart a service without rebuilding
docker compose -f docker-compose.prod.yml restart backend
```

- **`git pull` fails (non-fast-forward):** something was committed on the box. Run `git status`; if it's throwaway, `git reset --hard origin/main` then re-pull.
- **Live socket updates / leaderboard not updating:** `FRONTEND_ORIGIN` in `.env` must equal `https://codearena.kodexa.in` (used by both Express and Socket.IO CORS), then restart `backend`.
- **Submissions error out:** check the Codebox executor is healthy — `curl -s -H "X-Auth-Token: <token>" http://172.17.0.1:3000/health` and `docker compose -f /home/ubuntu/codebox/docker-compose.server.yml logs worker --tail 50`.
- **Email/password users can't submit:** SMTP isn't configured, so verification emails never send (`requireVerified` gates submits). Set the `SMTP_*` vars, or sign in via OAuth (auto-verified).

---

## 6. Backups

```bash
# nightly pg_dump via cron, rotated, pushed off-box (e.g. Cloudflare R2 / rclone)
0 3 * * * docker exec codearena-postgres pg_dump -U codearena codearena | gzip > /home/ubuntu/backups/ca-$(date +\%F).sql.gz
```
Redis persists via AOF. **Test a restore at least once.**

Restore into a fresh DB:
```bash
gunzip -c ca-YYYY-MM-DD.sql.gz | docker exec -i codearena-postgres psql -U codearena -d codearena
```

---

## 7. Scaling (when needed)

- **API:** scale `backend` replicas behind Caddy (it's stateless / JWT).
- **DB:** add **PgBouncer** (transaction pooling) + `?pgbouncer=true` on `DATABASE_URL`.
- **Realtime:** add the **Socket.IO Redis adapter** so replicas share rooms.
- **Rate limits:** move the limiter to a **Redis store** so limits are shared.
- **Reads:** cache problem list / leaderboard in Redis; let Cloudflare edge-cache public pages.
- **Execution:** tune Codebox `WORKER_CONCURRENCY`; the queue absorbs "Run" stampedes.

See [`architecture.md`](./architecture.md) for the full scaling design.
