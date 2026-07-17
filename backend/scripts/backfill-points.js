// One-time backfill for the global leaderboard `points`.
//
// The live scoring fix awards points only on FUTURE first-solves, so users who
// solved problems before it shipped have points = 0. This recomputes every
// user's points from their existing ProblemSolved rows (EASY 10 / MEDIUM 20 /
// HARD 30) and SETS the total (not increment), so it is idempotent — safe to
// re-run any time.
//
// Run:  docker compose -f docker-compose.prod.yml run --rm -T backend node scripts/backfill-points.js
import { db } from "../src/libs/db.js";

const POINTS = { EASY: 10, MEDIUM: 20, HARD: 30 };

async function main() {
  const solved = await db.problemSolved.findMany({
    select: { userId: true, problem: { select: { difficulty: true } } },
  });

  const totals = new Map();
  for (const s of solved) {
    const pts = POINTS[s.problem?.difficulty] ?? 10;
    totals.set(s.userId, (totals.get(s.userId) || 0) + pts);
  }

  const users = await db.user.findMany({ select: { id: true, points: true } });
  let changed = 0;
  for (const u of users) {
    const target = totals.get(u.id) || 0;
    if (u.points !== target) {
      await db.user.update({ where: { id: u.id }, data: { points: target } });
      changed++;
    }
  }

  console.log(
    `[backfill-points] scanned ${users.length} users, aggregated ${solved.length} solved records, updated ${changed} users.`,
  );
}

main()
  .then(() => db.$disconnect())
  .catch((e) => {
    console.error("[backfill-points] failed:", e);
    return db.$disconnect().finally(() => process.exit(1));
  });
