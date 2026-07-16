# CodeArena — Production setup & AWS monitoring

Companion to [`DEPLOY.md`](./DEPLOY.md) (first-time setup) and [`DATABASE.md`](./DATABASE.md) (DB runbook).
This doc answers two questions: **(1)** what a complete production setup should have (with current status), and
**(2)** how to monitor the app's usage and cost on **AWS Lightsail**.

> **Live as of 2026-07-16** — https://codearena.kodexa.in (Lightsail `13.203.127.204`). Verified this session:
> - `GET /api/v1/health` → **200**, `db:true`
> - HTTP → HTTPS **308 redirect** (Caddy)
> - TLS: **Let's Encrypt**, valid to **2026-10-13** (Caddy auto-renews)
> - Security headers present (helmet): HSTS, `X-Content-Type-Options`, `X-Frame-Options`
> - Codebox executor port `3000` is **NOT publicly reachable** ✅ (only the backend reaches it)
> - **Code execution end-to-end works**: Python `3 4`→`7` Accepted (0.015 s); C++ `10 20`→`30` Accepted (0.003 s)

---

## 1. Architecture recap

```
Internet
  │  443 / 80
  ▼
Caddy (edge, TLS, HTTP→HTTPS)  ──►  frontend (static SPA)
  │                                 backend  (Node API, :internal)
  │                                   ├─► Postgres 16   (codearena-postgres, not published)
  │                                   ├─► Redis         (cache/queue)
  │                                   └─► Codebox API   (host.docker.internal:3000 → 172.17.0.1)
  │                                         └─► isolate worker (privileged, sandbox)
  └─ only 80/443 exposed; 3000/5432/6379 are host-internal only
```

All app services run from `docker-compose.prod.yml`. The Codebox executor runs from its own compose
(`~/codebox/docker-compose.server.yml`) bound to the docker-gateway IP. See `DEPLOY.md` §4–5.

---

## 2. Production-readiness checklist

| Area | Item | Status | Action if not done |
|---|---|---|---|
| Compute | Lightsail 2 GB + **swap** (RAM-tight with isolate) | ✅ live | `free -h` — if no swap, add 2 GB (see §4) |
| App | `docker-compose.prod.yml` stack up + healthy | ✅ | `… ps` should show all `Up` |
| DB | Prisma migrations applied + seeded | ✅ | `… run --rm backend npx prisma migrate deploy` |
| Executor | Codebox **isolate** worker running | ✅ verified | see §6 smoke test |
| Edge | DNS + TLS (Caddy/Let's Encrypt) | ✅ | — |
| Firewall | Lightsail SG + `ufw` = only 22/80/443 | ✅ (3000 blocked) | confirm in Lightsail → Networking |
| Secrets | `SECRET`, `REFRESH_SECRET`, `POSTGRES_PASSWORD`, `CODEBOX_AUTH_TOKEN`, `ADMIN_EMAIL`, `FRONTEND_ORIGIN` in server `.env` | ✅ (app runs) | `openssl rand -hex 32` for each |
| Auth (opt) | GitHub/Google OAuth keys | ⬜ gap | add `GITHUB_*`/`GOOGLE_*` to `.env`; email+password already works |
| Email (opt) | SMTP for verify/reset | ⬜ gap | add `SMTP_*`; without it emails are dev-logged only |
| Payments (opt) | Razorpay keys + webhook secret | ⬜ gap | add `RAZORPAY_*` to enable donations |
| **Backups** | nightly `pg_dump` off-box + tested restore | ⬜ **do this** | §5 below / `DEPLOY.md` §7 |
| **Monitoring** | Lightsail alarms + memory/disk + uptime | ⬜ **do this** | §3 below |
| Scale (later) | PgBouncer / PM2 cluster / Cloudflare | ⬜ future | `DEPLOY.md` §9 — only when traffic grows |

The three ⬜ **do-this** rows (backups, monitoring, and — if you want them — the optional integration keys)
are the gap between "works" and "operable". The rest is done.

---

## 3. Monitoring usage on AWS

Lightsail's built-in metrics cover **CPU, network, and status checks** — but **not memory or disk**, which are the
two resources most likely to bite a 2 GB box running the isolate sandbox. So the plan is: Lightsail alarms for the
built-ins, the CloudWatch agent for memory/disk, snapshots for DR, and a budget for cost.

### 3.1 Lightsail built-in metrics (zero setup)
Console → your instance → **Metrics** tab. Watch:
- **CPU utilization** and **CPU burst capacity %** — the 2 GB plan is burstable; if burst capacity trends toward 0 %
  under load, you're CPU-starved (raise Codebox `WORKER_CONCURRENCY` cautiously, or resize the instance).
- **Network in/out** — feeds the monthly data-transfer allowance (see §3.5).
- **Status check failed** — instance/system reachability.

### 3.2 Lightsail alarms → email (simplest AWS-native alerting)
Console → instance → **Metrics** → pick a metric → **Add alarm**. Set at least:
- **CPU utilization > 80 %** for 2 evaluation periods.
- **Status check failed ≥ 1** (instance unreachable).
- **CPU burst capacity < 20 %** (sustained CPU pressure).

Add a **notification email** (Lightsail verifies the address once). No SNS/IAM setup needed for these.

### 3.3 Memory + disk via the CloudWatch agent — **the important one on 2 GB**
Because Lightsail doesn't chart RAM/disk, install the CloudWatch agent to publish them as custom metrics.

```bash
# on the server
sudo apt-get install -y wget
wget https://s3.amazonaws.com/amazoncloudwatch-agent/ubuntu/arm64/latest/amazon-cloudwatch-agent.deb  # use amd64 if x86
sudo dpkg -i amazon-cloudwatch-agent.deb
```
Create an **IAM user** with the AWS-managed policy **`CloudWatchAgentServerPolicy`**, generate an access key, and
put it in `/opt/aws/amazon-cloudwatch-agent/.aws/credentials` (or `aws configure`). Then a minimal config that ships
`mem_used_percent` and disk usage every 60 s:

```bash
sudo tee /opt/aws/amazon-cloudwatch-agent/etc/config.json >/dev/null <<'JSON'
{ "metrics": { "namespace": "CodeArena",
  "append_dimensions": { "InstanceId": "${aws:InstanceId}" },
  "metrics_collected": {
    "mem":  { "measurement": ["mem_used_percent"], "metrics_collection_interval": 60 },
    "disk": { "measurement": ["used_percent"], "resources": ["/"], "metrics_collection_interval": 60 },
    "swap": { "measurement": ["swap_used_percent"] } } } }
JSON
sudo /opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-ctl \
  -a fetch-config -m onPremise -s -c file:/opt/aws/amazon-cloudwatch-agent/etc/config.json
```
Then in **CloudWatch → Alarms** (region `ap-south-1`, namespace `CodeArena`) add:
- **`mem_used_percent` > 85 %** — the OOM early-warning that matters most for isolate.
- **`disk used_percent` (/) > 80 %** — small SSD fills from Docker images/logs + Postgres growth.

> Don't want to manage the agent + an IAM user? The lighter alternative: keep swap on (§4) so RAM spikes page instead
> of OOM-killing, add a cron that appends `free -h`/`df -h` to a log, and rely on §3.2 + UptimeRobot (§5). The agent
> is the "proper" answer once you have real traffic.

### 3.4 Automatic snapshots (backup / disaster recovery)
Console → instance → **Snapshots** → enable **Automatic snapshots** (daily, keeps 7). A snapshot is a full-instance
restore point — complements the DB-only `pg_dump` in §5. Take a **manual** snapshot before any risky change.

### 3.5 Cost / billing alarms
Lightsail is flat-rate, but two things cost money: the **free-tier window ending** (first 3 months) and **data-transfer
overage** beyond the plan's monthly allowance. Set an early warning:
- **AWS Budgets** (Billing console) → create a **monthly cost budget** (e.g. $15) with an email alert at 80 % / 100 %.
  Two budgets are free.
- Optionally a **CloudWatch billing alarm** (must be created in **us-east-1**) on `EstimatedCharges`.
- Watch **Network out** (§3.1) against your plan's transfer allowance so a traffic spike doesn't silently bill overage.

### 3.6 Notifications
Lightsail alarms email directly. For CloudWatch alarms, point them at an **SNS topic** with your email subscribed
(confirm the subscription email once). One topic, reused by every alarm.

---

## 4. On-box monitoring (host + containers)

```bash
ssh -i <key.pem> ubuntu@13.203.127.204
free -h                     # RAM + swap — swap SHOULD be non-zero on a 2 GB box
df -h /                     # disk headroom
sudo docker stats           # live CPU/MEM per container (Ctrl-C to exit)
sudo docker compose -f docker-compose.prod.yml ps          # all Up?
sudo docker system df       # image/volume disk usage; `docker image prune -f` reclaims dangling
```
**Add swap if missing** (prevents isolate/Codebox OOM on 2 GB):
```bash
sudo fallocate -l 2G /swapfile && sudo chmod 600 /swapfile && sudo mkswap /swapfile && sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

---

## 5. App, uptime & error tracking

- **Health:** `curl -s https://codearena.kodexa.in/api/v1/health` → `{"db":true}`.
- **Uptime monitor (free, do this):** point **UptimeRobot** (or Better Uptime) at `/api/v1/health`, 5-min interval,
  email/Slack on failure. This is your cheapest, highest-value alert — it catches "site down" before users do.
- **App logs:** `sudo docker compose -f docker-compose.prod.yml logs -f backend` (pino JSON; auth/cookies redacted).
- **Error tracking (optional):** Sentry free tier — add the DSN and wrap the Express error handler; gives stack traces
  + release tracking instead of grepping logs.

- **Nightly DB backup (do this):**
  ```bash
  0 3 * * * docker exec codearena-postgres pg_dump -U codearena codearena | gzip > ~/backups/ca-$(date +\%F).sql.gz
  ```
  Rotate (keep ~14), push off-box (Cloudflare R2 / S3 via `rclone`), and **test a restore once** (DATABASE.md §4).

---

## 6. Executor (Codebox) monitoring

```bash
cd ~/codebox
sudo docker compose -f docker-compose.server.yml ps           # redis + api + worker all Up
sudo docker compose -f docker-compose.server.yml logs -f worker   # expect worker_started; watch for OOM/timeouts
```
**Smoke test from anywhere** (needs a logged-in token; this is the exact check used to verify prod):
```bash
curl -s -X POST https://codearena.kodexa.in/api/v1/execute-code/run \
  -H "Authorization: Bearer <accessToken>" -H 'Content-Type: application/json' \
  -d '{"language_id":71,"stdin":"3 4","source_code":"a,b=map(int,input().split())\nprint(a+b)"}'
# → {"success":true,"stdout":"7\n","status":"Accepted", ...}
```
`language_id`: Python 71 · Java 62 · JavaScript 63 · C++ 54 · C 50. If runs hang or return `Internal Error`, check the
worker log and that `CODEBOX_AUTH_TOKEN` (app `.env`) == `AUTH_TOKEN` (codebox `.env`).

---

## 7. Database monitoring
See **[`DATABASE.md`](./DATABASE.md) §3** — DB/table sizes, connection counts (100-conn ceiling → PgBouncer),
cache-hit ratio, slow queries, disk. All the SQL is there.

---

## 8. Operational cadence

| When | Do |
|---|---|
| **Daily** (automated) | UptimeRobot ping; nightly `pg_dump`; Lightsail/CloudWatch alarms armed |
| **Weekly** (2 min) | `docker stats` + `df -h` + `free -h`; skim `logs backend` for errors; check DB size trend (DATABASE.md §3b) |
| **Monthly** | verify a backup restores; check AWS Budget vs actual; `docker image prune -f`; review data-transfer usage |
| **Before any change** | manual Lightsail snapshot + `pg_dump` |

---

## 9. Do-this-now shortlist (highest value first)
1. **UptimeRobot** on `/api/v1/health` (5 min, email alert) — 5 minutes, catches outages.
2. **Nightly `pg_dump`** cron + one tested restore — 10 minutes, your safety net.
3. **Confirm swap is on** (§4) — prevents isolate OOM on 2 GB.
4. **Lightsail alarms**: CPU > 80 %, status-check-failed, burst < 20 % → your email (§3.2).
5. **AWS Budget** $15/mo alert (§3.5) — no surprise bills when the free window ends.
6. *(when traffic is real)* CloudWatch agent for memory/disk (§3.3) + Sentry.
