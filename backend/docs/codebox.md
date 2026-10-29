# Codebox Executor — Sandbox Limits (verified)

> _Verified on production: 2026-10-29 — AWS Lightsail `codearena` (ap-south-1, 13.203.127.204)._
> Values below were **measured** by submitting probe programs to the live Codebox API
> (`http://172.17.0.1:3000`), not just read from config.

---

## 1. Deployment facts

| Item | Value |
|---|---|
| Engine | Codebox (Judge0-CE-compatible), repo at `/home/ubuntu/codebox`, commit `f314cfe` |
| Sandbox | `isolate` **2.6**, cgroup v2 (`--cg`), `EXECUTOR_TYPE=isolate` |
| Containers | `codebox-api-1`, `codebox-worker-1` (**privileged**, required by isolate), `codebox-redis-1` |
| Worker concurrency | `WORKER_CONCURRENCY=1` (submissions run serially) |
| Host | 2 vCPU, 1.9 GB RAM, kernel `6.17.0-1010-aws` |
| isolate config | `cg_root=/sys/fs/cgroup/isolate`, `first_uid=60000`, `num_boxes=1000` |
| Overrides | **None** — Codebox `.env` sets only `AUTH_TOKEN` + `WORKER_CONCURRENCY`, so all limits are Codebox defaults |

CodeArena's `backend/src/libs/executor.lib.js` sends only `source_code`, `language_id`, `stdin` —
**no limit fields** — so every submission gets the defaults below.

---

## 2. Configured defaults (Codebox `src/utils/config.js` + `IsolateExecutor.js`)

| Limit | Default | Max (per-request cap) | isolate flag |
|---|---|---|---|
| CPU time | 5 s | 15 s | `--time` |
| Wall time | 10 s | 30 s | `--wall-time` |
| Memory | 128,000 KB | 512,000 KB | `--cg-mem` (whole cgroup) |
| Processes/threads | 60 | 60 | `--processes` |
| Output file size | 1024 KB | 4096 KB | `--fsize` |
| Stack | 64,000 KB (validated) | — | **not passed** to isolate |
| CPU extra time | 1 s (validated) | 5 s | **not passed** to isolate |
| Compile CPU / wall | 15 s / 30 s | — | `--time` / `--wall-time` on compile step |
| Compile memory (C++/TS) | max(limit, 512,000 KB) | — | `min_memory` applies to **compile only** |
| Source size | 64 KB | — | API validation |
| Batch size | 20 submissions | — | API validation |
| stdout/stderr returned | truncated at 64 KB | — | API post-processing |

Language commands:

| Lang | ID | Compile | Run |
|---|---|---|---|
| Python | 71 | — | `python3 main.py` |
| JavaScript | 63 | — | `node main.js` |
| Java | 62 | `javac -cp .:/usr/local/lib/java/* *.java` | `java -cp .:/usr/local/lib/java/* Main` |
| C++ | 54 | `g++ -O2 -std=c++17 -I/usr/local/include -o main *.cpp` | `./main` |
| C | 50 | `gcc -O2 -std=c17 -o main main.c -lm` | `./main` |

Every command runs as `/bin/sh -c "cd /box && <cmd>"` inside the box.

---

## 3. Measured results

| Restriction | Probe | Result |
|---|---|---|
| **CPU time** | Python `while True: pass` | Killed at **5.031 s** CPU (5.10 s wall) → Time Limit Exceeded |
| **Wall time** | Python `time.sleep(20)` | Killed at **10.101 s** wall (0.013 s CPU) → TLE (wall clock) |
| **Memory — C** | malloc + touch 64 / 120 / 160 / 300 MB | 64 ✅ (67 MB), 120 ✅ (124 MB); 160 ❌, 300 ❌ killed at ~128.5 MB |
| **Memory — Python** | `bytearray` 100 / 200 MB | 100 ✅ (110 MB); 200 ❌ killed at ~132 MB |
| **Memory — Java** | 20 / 60 / 150 × 1 MB arrays | 20 ✅ (63 MB RSS), 60 ✅ (111 MB); 150 ❌ killed. JVM reports `maxHeap=478MB` |
| **Memory — raw isolate** | `isolate --cg-mem=128000` + 300 MB Python | `cg-oom-killed:1`, signal 9 — cgroup limit confirmed |
| **Stack** | C recursion 8 / 64 / 200 MB | 8 ✅, 64 ✅; 200 ❌ killed by memory cap. `RLIMIT_STACK` = unlimited |
| **Processes** | C `fork()` × 100 | Only **58** succeeded (`RLIMIT_NPROC`=60 incl. sh + main) |
| **Output size** | Python writes 3 MB to stdout | `OSError: [Errno 27] File too large` → NZEC; `RLIMIT_FSIZE`=1 MB |
| **Open files** | `getrlimit` | `RLIMIT_NOFILE` = 64 |
| **Network — internet** | TCP 1.1.1.1:53, 8.8.8.8:443 | `Network is unreachable` |
| **Network — host/internal** | TCP 172.17.0.1:3000 (Codebox API), 169.254.169.254:80 (metadata) | `Network is unreachable` |
| **DNS** | `gethostbyname("google.com")` | `Temporary failure in name resolution` |
| **User** | `getuid()` | uid/gid **60499** (non-root, per-box) |
| **PID namespace** | count `/proc/<pid>` | **2** visible processes |
| **Environment** | `os.environ` | Only `HOME, LANG, LIBC_FATAL_STDERR_, OLDPWD, PATH, PWD` — no secrets |
| **Filesystem root** | `ls /` | `bin box dev etc lib lib64 proc usr` (no `/sys`, no `/tmp`, no `/var`) |
| **Writes** | write to `/usr`, `/etc`, `/box`, `/tmp` | `/usr` ❌ RO, `/etc` ❌ RO, `/box` ✅, `/tmp` ❌ does not exist |
| **Host leaks** | `/var/run/docker.sock`, `/var/local/lib/isolate` | Not present |
| **Visible CPUs** | `os.cpu_count()` | 2 (host count) |
| **Static analyzer** | Python `import socket` | Rejected before execution (returned as Compilation Error) |

**Bottom line:** CPU, wall time, memory, process count, output size, network and filesystem
isolation are all enforced as configured.

---

## 4. Known issues / gaps

1. **Memory-limit kills are reported as "Runtime Error (NZEC)", not MLE.**
   Programs run under `sh -c`; when the cgroup OOM-kills the child, `sh` exits 137 and isolate
   records `RE` instead of `SG`. Users see "Runtime Error" with stderr `Killed`.
   _Fix (Codebox):_ check isolate meta `cg-oom-killed:1` → map to Memory Limit Exceeded, or
   `exec` the run command so the program is isolate's direct child.

2. **Java heap is sized from host RAM (478 MB) while the cgroup cap is 128 MB.**
   Java programs get SIGKILLed instead of throwing `OutOfMemoryError`; practical data limit
   is ~60 MB.
   _Fix:_ add `-Xmx96m` (or `-XX:MaxRAM=128m`) to the Java `run_cmd`, or raise `memory_limit`
   for Java submissions.

3. **No `/tmp` inside the sandbox.** Codebox's `--dir=/tmp=` *removes* isolate's default
   writable `/tmp` instead of mounting one. Not breaking today, but code writing temp files fails.
   _Fix:_ use `--dir=/tmp:tmp` or drop the flag.

4. **`stack_limit` and `cpu_extra_time` are validated but never passed to isolate.**
   Stack is bounded only by the memory cap — acceptable for a judge.

5. **Static analyzer is regex-only** (e.g. `__import__("soc"+"ket")` bypasses it). Defense in
   depth only — isolate is the real boundary, and the probe confirmed it blocks network anyway.

6. **Privileged worker container.** Required by isolate; an isolate escape would reach the host.
   Keep isolate updated.

---

## 5. Re-running the verification

1. Temp SSH (see deploy notes):
   `aws lightsail get-instance-access-details --instance-name codearena --protocol ssh --region ap-south-1`
2. On the box:
   ```bash
   CODEBOX_URL=http://172.17.0.1:3000 \
   CODEBOX_TOKEN=$(grep '^CODEBOX_AUTH_TOKEN=' ~/CodeArena/.env | cut -d= -f2) \
   python3 probe_codebox.py
   ```
3. Probe tips:
   - C/C++ compile with `-O2` — GCC **removes unused malloc/memset and tail-recursion**.
     Touch memory with a `volatile` pointer and read it back, and use the recursion result after the call.
   - Avoid literal `socket`, `/proc/self/`, `/etc/passwd`, etc. in probe source or the analyzer
     rejects it before isolate is tested.
   - Keep probes bounded (≤300 MB, ≤100 procs, ≤25 s) — the host has only ~1 GB free RAM.
4. Direct isolate check (inside the worker container):
   ```bash
   isolate --box-id=900 --cg --init
   isolate --box-id=900 --cg --cg-mem=128000 --meta=/tmp/m900 --time=5 --wall-time=10 \
     --processes=60 --run -- /usr/bin/python3 -c "b=bytearray(300<<20)"
   cat /tmp/m900        # expect cg-oom-killed:1, status:SG
   isolate --box-id=900 --cg --cleanup
   ```
