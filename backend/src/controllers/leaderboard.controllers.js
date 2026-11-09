import { db } from "../libs/db.js";
import { createCache } from "../libs/cache.js";

const loadGlobalLeaderboard = async () => {
  const users = await db.user.findMany({
    where: { isActive: true, problemSolved: { some: {} } },
    select: {
      id: true,
      name: true,
      username: true,
      image: true,
      points: true,
      _count: { select: { problemSolved: true } },
    },
    orderBy: [{ problemSolved: { _count: "desc" } }, { points: "desc" }, { id: "asc" }],
    take: 100,
  });

  return users.map((u, i) => ({
    rank: i + 1,
    id: u.id,
    name: u.name,
    username: u.username,
    image: u.image,
    points: u.points,
    solved: u._count.problemSolved,
  }));
};

const globalBoardCache = createCache({ ttlMs: 60 * 1000, load: loadGlobalLeaderboard });

// Global leaderboard — ranks users who have solved at least one problem, by
// solved count (then points as a tiebreaker).
export const getGlobalLeaderboard = async (req, res) => {
  try {
    const leaderboard = await globalBoardCache.get("global");
    return res.status(200).json({ success: true, leaderboard });
  } catch (error) {
    console.error("Leaderboard error:", error);
    return res.status(500).json({ success: false, message: "Error loading leaderboard" });
  }
};
