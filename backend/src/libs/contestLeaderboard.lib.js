import { db } from "./db.js";
import { getIO } from "./socket.js";
import { createCache } from "./cache.js";

const LEADERBOARD_LIMIT = 100;
const LEADERBOARD_CACHE_MS = 5000;
const LEADERBOARD_BROADCAST_MS = 3000;
export const LEADERBOARD_USER = { select: { id: true, name: true, username: true, image: true } };

export const toLeaderboardEntry = (entry, rank) => ({
  rank,
  userId: entry.userId,
  user: entry.user,
  totalScore: entry.totalScore,
  penalty: entry.penalty,
  problemsSolved: entry.problemsSolved,
  lastSubmission: entry.lastSubmission,
});

// The top of the ranked board. generatedAt lets clients discard a REST response
// that arrives after a newer socket push.
const loadContestLeaderboard = async (contestId) => {
  const generatedAt = Date.now();
  const rows = await db.contestLeaderboard.findMany({
    where: { contestId },
    include: { user: LEADERBOARD_USER },
    orderBy: [{ totalScore: "desc" }, { penalty: "asc" }, { lastSubmission: "asc" }],
    take: LEADERBOARD_LIMIT + 1,
  });

  return {
    leaderboard: rows.slice(0, LEADERBOARD_LIMIT).map((entry, i) => toLeaderboardEntry(entry, i + 1)),
    truncated: rows.length > LEADERBOARD_LIMIT,
    generatedAt,
  };
};

export const contestBoardCache = createCache({ ttlMs: LEADERBOARD_CACHE_MS, load: loadContestLeaderboard });

// Coalesces a burst of accepted submissions into one query and one emit per
// window. The flush also refreshes the cache, so a client that joins the room
// and then reads the board can't miss an update between the two.
const pendingBroadcasts = new Set();
export const scheduleLeaderboardBroadcast = (contestId) => {
  if (pendingBroadcasts.has(contestId)) return;
  pendingBroadcasts.add(contestId);
  setTimeout(async () => {
    pendingBroadcasts.delete(contestId);
    try {
      const board = await contestBoardCache.refresh(contestId);
      getIO()?.to(`contest_${contestId}`).emit("leaderboardUpdate", board);
    } catch (error) {
      console.error("Leaderboard broadcast error:", error);
      scheduleLeaderboardBroadcast(contestId); // no later AC may come to deliver this one
    }
  }, LEADERBOARD_BROADCAST_MS);
};

// Upsert the leaderboard row for (user, contest), inside the caller's transaction.
export const updateLeaderboard = (tx, contestId, userId, scoreToAdd, penaltyToAdd = 0) =>
  tx.contestLeaderboard.upsert({
    where: { userId_contestId: { userId, contestId } },
    update: {
      totalScore: { increment: scoreToAdd },
      penalty: { increment: penaltyToAdd },
      problemsSolved: { increment: 1 },
      lastSubmission: new Date(),
    },
    create: {
      userId,
      contestId,
      totalScore: scoreToAdd,
      penalty: penaltyToAdd,
      problemsSolved: 1,
      lastSubmission: new Date(),
    },
  });
