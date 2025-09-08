import { asyncHandler } from "../utils/asyncHandler.js";
import { db } from "../libs/db.lib.js";
import { ApiError } from "../utils/api-error.js";
import { ApiResponse } from "../utils/api-response.js";
export const createContest = asyncHandler(async (req, res) => {
  const { title, description, startTime, endTime, duration, problemIds, maxParticipants, rules } =
    req.body;

  // Check if the user is an admin
  if (req.user.role !== "ADMIN") {
    return new ApiError(403, "Only admins can create contests");
  }
  //validate time inputs
  const start = new Date(startTime);
  const end = new Date(endTime);
  const now = new Date();
  if (start < now) {
    return new ApiError(400, "Start time must be in the future");
  }
  if (start >= end) {
    return new ApiError(400, "End time must be after start time");
  }
  if (duration <= 0 || duration > (end - start) / (1000 * 60)) {
    return new ApiError(400, "Duration must be positive and less than the total contest time");
  }
  //verify all problems exist
  const problems = await db.problem.findMany({
    where: { id: { in: problemIds } },
  });
  if (problems.length !== problemIds.length) {
    return new ApiError(400, "One or more problems do not exist");
  }
  const contest = await db.contest.create({
    data: {
      title,
      description,
      startTime: start,
      endTime: end,
      duration,
      maxParticipants,
      rules: rules || {},
      problems: {
        connect: problemIds.map((id) => ({ id })),
      },
    },
    include: {
      problems: true,
    },
  });
  return new ApiResponse(201, "Contest created successfully", contest);
});
export const getAllContests = asyncHandler(async (req, res) => {
  const { status = "all", page = 1, limit = 10 } = req.query;
  const where = {};
  const now = new Date();
  if (status === "upcoming") {
    where.startTime = { gt: now };
  } else if (status === "ongoing") {
    where.startTime = { lte: now };
    where.endTime = { gte: now };
  } else if (status === "past") {
    where.endTime = { lt: now };
  }
  const skip = (page - 1) * limit;
  const [contests, total] = await Promise.all([
    db.contest.findMany({
      where,
      skip,
      take: limit,
      orderBy: { startTime: "desc" },
      include: { problems: true, _count: { select: { participants: true } } },
    }),
    db.contest.count({ where }),
  ]);
  const totalPages = Math.ceil(total / limit);
  return new ApiResponse(200, "Contests fetched successfully", contests, {
    page,
    limit,
    total,
    totalPages,
  });
});
export const getContestById = asyncHandler(async (req, res) => {
  const { contestId } = req.params;
  const userId = req.user ? req.user.id : null;
  const contest = await db.contest.findUnique({
    where: { id: contestId },
    include: {
      participants: {
        where: { userId },
        select: { registeredAt: true },
      },
      _count: {
        select: { participants: true },
      },
    },
  });
  if (!contest) {
    throw new ApiError(404, "Contest not found");
  }
  return new ApiResponse(200, "Contest fetched successfully", contest);
});
export const registerForContest = asyncHandler(async (req, res) => {});
export const submitContestProblem = asyncHandler(async (req, res) => {});
export const getContestLeaderboard = asyncHandler(async (req, res) => {});
export const getLeaderboard = asyncHandler(async (req, res) => {});
export const updateLeaderboard = asyncHandler(async (req, res) => {});
export const getMyContestSubmissions = asyncHandler(async (req, res) => {});
export const updateContestStatus = asyncHandler(async (req, res) => {});
