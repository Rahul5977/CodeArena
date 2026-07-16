# CodeArena — Database guide (view / edit / monitor)

Practical runbook for the **production Postgres 16** database running on the Lightsail server.
For schema *design* rationale see [`architecture.md`](./architecture.md); for deploy see [`DEPLOY.md`](./DEPLOY.md).

## 0. Your setup at a glance

| | |
|---|---|
| Engine | **PostgreSQL 16** (official `postgres:16-alpine` image) |
| Container | `codearena-postgres` |
| Database | `codearena` · user `codearena` · **22 tables** (Prisma-managed) |
| Host / port | server `13.203.127.204`; **not published to the host or internet** — only the backend (inside Docker) and `docker exec` can reach it |
| ORM | **Prisma** — the schema lives in [`backend/prisma/schema.prisma`](./backend/prisma/schema.prisma); table names are quoted CamelCase (`"User"`, `"Problem"`) |
| Data volume | Docker named volume `codearena_postgres_data` (survives container restarts) |

> **Golden rule:** change the **structure** (tables/columns) only through **Prisma migrations** (§2). Change **data** (rows) freely via Studio / SQL / the admin UI. Never hand-write `ALTER TABLE` — Prisma tracks the schema and raw DDL causes drift that breaks future migrations.

All server commands assume:
```bash
ssh -i <your-lightsail-key.pem> ubuntu@13.203.127.204
cd ~/CodeArena
```
Shorthand used below:
```bash
# psql inside the container — NO password needed (local socket = trusted)
alias dbsql='sudo docker compose -f docker-compose.prod.yml exec postgres psql -U codearena -d codearena'
```

---

## 1. Viewing tables & data

### Option A — `psql` on the server (fastest, zero setup)

```bash
sudo docker compose -f docker-compose.prod.yml exec postgres psql -U codearena -d codearena
```
You're now at the `codearena=#` prompt. Essentials:

| Command | Does |
|---|---|
| `\dt` | list all tables |
| `\d "User"` | describe the `User` table (columns, types, indexes) |
| `\d+ "Problem"` | describe + sizes |
| `SELECT * FROM "User" LIMIT 20;` | read rows (**quotes required** — CamelCase names) |
| `SELECT id,title,difficulty,"isPublished" FROM "Problem";` | pick columns |
| `\x` | toggle expanded (vertical) row view — great for wide tables |
| `\du` | list DB users/roles |
| `\l` | list databases |
| `\q` | quit |

One-liner without entering the shell:
```bash
sudo docker compose -f docker-compose.prod.yml exec -T postgres \
  psql -U codearena -d codearena -c 'SELECT email, role FROM "User";'
```

### Option B — Prisma Studio (nicest GUI: browse **and** click-to-edit)

Runs on your laptop, pointed at the remote DB through an SSH tunnel.

1. **One-time:** expose Postgres on the server's localhost only (not the internet), so the tunnel can reach it. Edit `docker-compose.prod.yml`, add under the `postgres:` service:
   ```yaml
       ports:
         - "127.0.0.1:5432:5432"     # localhost-only — never 0.0.0.0
   ```
   then `sudo docker compose -f docker-compose.prod.yml up -d postgres` (≈2 s recreate).

2. **Open the tunnel** (leave this terminal running):
   ```bash
   ssh -i <your-key.pem> -N -L 5433:localhost:5432 ubuntu@13.203.127.204
   ```

3. **Launch Studio locally** from the repo (uses your `backend/` Prisma schema):
   ```bash
   cd backend
   DATABASE_URL="postgresql://codearena:<POSTGRES_PASSWORD>@localhost:5433/codearena" npx prisma studio
   ```
   Browser opens at `http://localhost:5555` — click any table, edit cells, add/delete rows, save. `<POSTGRES_PASSWORD>` is the value in the server's `~/CodeArena/.env`.

> Prefer to keep Postgres fully unpublished? Skip step 1 and instead run Studio **on the server** inside the backend container, publishing 5555 through the same tunnel — but the tunnel approach above is simpler for occasional use. Either way, the `127.0.0.1:5432` bind is safe (localhost-only + your AWS firewall blocks 5432 anyway).

### Option C — Desktop SQL client (TablePlus, DBeaver, pgAdmin)

Same tunnel as Option B (steps 1–2), then create a connection:

| Field | Value |
|---|---|
| Host | `localhost` |
| Port | `5433` |
| Database | `codearena` |
| User | `codearena` |
| Password | `<POSTGRES_PASSWORD>` (from server `.env`) |

DBeaver/TablePlus can also SSH-tunnel natively (point them at your `.pem`, remote host `localhost:5432`) — then you don't need step 1 at all.

---

## 2. Creating & editing the database

### 2a. Schema changes (add/rename tables, columns, indexes) — **Prisma migrations**

This is the **only** correct way to change structure. Workflow: edit schema → generate+test migration locally → deploy to prod.

1. **Edit** `backend/prisma/schema.prisma`. Example — add a `country` field to `User`:
   ```prisma
   model User {
     // ...existing fields...
     country String?   // nullable so existing rows are fine
   }
   ```

2. **Create + apply the migration locally** (against your local dev DB):
   ```bash
   cd backend
   npx prisma migrate dev --name add_user_country
   ```
   This writes a new folder under `prisma/migrations/`, applies it locally, and regenerates the Prisma client.

3. **Commit** the schema + the new migration folder:
   ```bash
   git add prisma/schema.prisma prisma/migrations
   git commit -m "db: add User.country"
   git push
   ```

4. **Deploy to production** (on the server):
   ```bash
   cd ~/CodeArena && git pull
   sudo docker compose -f docker-compose.prod.yml run --rm backend npx prisma migrate deploy
   sudo docker compose -f docker-compose.prod.yml up -d --build backend   # rebuild if app code changed too
   ```
   `migrate deploy` applies only new, unapplied migrations — safe and idempotent.

**Rules of thumb**
- Additive changes (new nullable column, new table) are safe and zero-downtime.
- Renames/drops/`NOT NULL`-without-default can lose data or block — review the generated SQL in the migration file before deploying, and back up first (§4).
- Never run `prisma migrate dev` against production, and never `prisma db push` on prod (it bypasses migration history).
- After changing the schema, always redeploy the backend so its generated client matches.

### 2b. Data changes (add/edit/delete rows)

| Tool | Best for |
|---|---|
| **Prisma Studio** (§1B) | quick manual edits — click a cell, change it, save |
| **psql** | scripted/bulk changes, one-offs |
| **Admin dashboard** (in-app, `/admin`) | managing **problems** (publish/unpublish/delete) without touching SQL |
| **`prisma/seed.js`** | bulk-loading starter problems (`node prisma/seed.js`) |

psql examples:
```sql
-- make a user an admin
UPDATE "User" SET role = 'ADMIN' WHERE email = 'someone@example.com';

-- unpublish a problem
UPDATE "Problem" SET "isPublished" = false WHERE slug = 'nth-fibonacci';

-- delete spam (respect FKs — delete children first or rely on cascade)
DELETE FROM "Comment" WHERE "authorId" = '<uuid>';
```
Run non-interactively:
```bash
sudo docker compose -f docker-compose.prod.yml exec -T postgres \
  psql -U codearena -d codearena -c "UPDATE \"Problem\" SET \"isPublished\"=true WHERE slug='factorial';"
```

> ⚠️ Always take a backup (§4) before bulk `UPDATE`/`DELETE` on production.

---

## 3. Monitoring usage

### 3a. Container resources (live)

```bash
sudo docker stats                     # live, all containers — Ctrl-C to exit
sudo docker stats --no-stream codearena-postgres     # one-shot snapshot
```
Watch **MEM %** and **CPU %** for `codearena-postgres`. (Baseline today: ~23 MB / <1 %.)

### 3b. Database & table sizes (growth over time)

```bash
sudo docker compose -f docker-compose.prod.yml exec postgres \
  psql -U codearena -d codearena <<'SQL'
-- total DB size
SELECT pg_size_pretty(pg_database_size(current_database())) AS db_size;
-- per-table rows + size, biggest first
SELECT relname AS "table", n_live_tup AS rows,
       pg_size_pretty(pg_total_relation_size(relid)) AS size
  FROM pg_stat_user_tables ORDER BY pg_total_relation_size(relid) DESC;
SQL
```

### 3c. Connections (the number that matters for scaling)

Postgres allows **100** connections by default; the backend uses a pool. If you scale the API, watch this.
```sql
-- how many, and in what state
SELECT count(*), state FROM pg_stat_activity
  WHERE datname = current_database() GROUP BY state;

-- who's connected right now
SELECT pid, usename, state, query_start,
       left(query, 60) AS query
  FROM pg_stat_activity WHERE datname = current_database();
```
If `active_conns` creeps toward ~80/100, add **PgBouncer** (see `DEPLOY.md §9`).

### 3d. Health signals (cache hit ratio, slow/blocked queries)

```sql
-- cache hit ratio — want > 0.99; if lower, the DB needs more RAM
SELECT sum(blks_hit)::float / nullif(sum(blks_hit) + sum(blks_read), 0) AS cache_hit_ratio
  FROM pg_stat_database WHERE datname = current_database();

-- queries running longer than 5s right now
SELECT pid, now() - query_start AS runtime, left(query,80)
  FROM pg_stat_activity
  WHERE state = 'active' AND now() - query_start > interval '5 seconds'
  ORDER BY runtime DESC;
```
To find *repeatedly* slow queries, enable the `pg_stat_statements` extension (optional, small overhead).

### 3e. Disk (the resource most likely to fill on a small VPS)

```bash
df -h /                                  # whole disk
sudo docker system df                    # docker's images/containers/volumes usage
sudo docker system df -v | grep postgres # the postgres data volume specifically
```
Reclaim space safely: `sudo docker image prune -f` (removes only dangling images).

### 3f. Log tailing (errors, query patterns)

```bash
sudo docker compose -f docker-compose.prod.yml logs -f postgres     # Postgres logs
sudo docker compose -f docker-compose.prod.yml logs -f backend      # app + DB errors
```

### 3g. Automated / ongoing monitoring (optional, when you want it)

- **Lightweight:** a cron that appends size + connection count to a log daily (drop the §3b/§3c queries into a script).
- **Dashboards:** `postgres_exporter` → Prometheus → Grafana gives graphs of connections, cache-hit, size, slow queries. Heavier (~150 MB RAM); worth it once you have real traffic. (Codebox already ships a Prometheus/Grafana compose you can crib from.)
- **Uptime/alerting:** point an external monitor (UptimeRobot, free) at `https://codearena.kodexa.in/api/v1/health` — it already returns `db:true` when Postgres is reachable.

---

## 4. Backups (do this before any risky change)

```bash
# one-off dump to your home dir
sudo docker exec codearena-postgres pg_dump -U codearena codearena | gzip > ~/ca-$(date +%F).sql.gz

# restore (into the running container)
gunzip -c ~/ca-2026-07-16.sql.gz | \
  sudo docker exec -i codearena-postgres psql -U codearena -d codearena
```
For a nightly cron + off-box copy, see [`DEPLOY.md §7`](./DEPLOY.md). Test a restore at least once.

---

## Cheat sheet

```bash
# open a SQL shell
sudo docker compose -f docker-compose.prod.yml exec postgres psql -U codearena -d codearena

# quick one-liners
… exec -T postgres psql -U codearena -d codearena -c '\dt'                      # list tables
… exec -T postgres psql -U codearena -d codearena -c 'SELECT email,role FROM "User";'
sudo docker stats --no-stream codearena-postgres                                # resources
sudo docker exec codearena-postgres pg_dump -U codearena codearena | gzip > backup.sql.gz

# schema change (structure)
cd backend && npx prisma migrate dev --name <desc>        # local
… && git push
# on server:
cd ~/CodeArena && git pull && sudo docker compose -f docker-compose.prod.yml run --rm backend npx prisma migrate deploy
```
