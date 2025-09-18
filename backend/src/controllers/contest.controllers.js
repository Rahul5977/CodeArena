import { asyncHandler } from "../utils/asyncHandler.js";
import { db } from "../libs/db.js";
import { ApiError } from "../utils/api-error.js";
import { ApiResponse } from "../utils/api-response.js";
import { submitBatch, pollBatchResults } from "../libs/judge0.lib.js";
import { initializeSocket } from "../libs/socket.js";
const io = initializeSocket();
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
  const skip = (parseInt(page) - 1) * parseInt(limit);
  const [contests, total] = await Promise.all([
    db.contest.findMany({
      where,
      skip,
      take: parseInt(limit),
      orderBy: { startTime: "desc" },
      include: {
        _count: { select: { participants: true } },
      },
    }),
    db.contest.count({ where }),
  ]);
  const totalPages = Math.ceil(total / parseInt(limit));

  res.status(200).json({
    success: true,
    message: "Contests fetched successfully",
    contests,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      totalPages,
    },
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
  const now = new Date();
  const isRegistered = contest.participants.length > 0;
  const hasStarted = now >= contest.startTime;
  const hasEnded = now > contest.endTime;
  // If the contest has started and the user is not registered, hide problem details
  if (hasStarted && !isRegistered) {
    delete contest.problems;
  }
  // If the contest has ended, hide registration info
  if (hasEnded) {
    delete contest.participants;
  }
  let problems = [];
  if (isRegistered && hasStarted && !hasEnded) {
    problems = await db.problem.findMany({
      where: { id: { in: contest.problemIds } },
      select: {
        id: true,
        title: true,
        difficulty: true,
        tags: true,
        discription: true,
        examples: true,
        constraints: true,
        codeSnippets: true,
      },
    });
  }
  return new ApiResponse(200, "Contest fetched successfully", {
    contest: {
      ...contest,
      problems,
      isRegistered,
      hasStarted,
      hasEnded,
    },
  });
});
export const registerForContest = asyncHandler(async (req, res) => {
  const { contestId } = req.params;
  const userId = req.user.id;
  const contest = await db.contest.findUnique({
    where: { id: contestId },
    include: {
      _count: { select: { participants: true } },
      participants: { where: { userId } },
    },
  });
  if (!contest) {
    throw new ApiError(404, "Contest not found");
  }
  const now = new Date();
  if (now >= contest.startTime) {
    throw new ApiError(400, "Cannot register for a contest that has already started");
  }
  if (contest.maxParticipants && contest._count.participants >= contest.maxParticipants) {
    throw new ApiError(400, "Contest is full");
  }
  //check if user is already registered
  const existingParticipant = db.contestParticipant.findUnique({
    where: { contestId_userId: { contestId, userId } },
  });
  if (existingParticipant) {
    throw new ApiError(400, "User is already registered for the contest");
  }
  await db.contestParticipant.create({
    data: {
      userId,
      contestId,
      registeredAt: new Date(),
    },
  });
  return new ApiResponse(200, "Registered for contest successfully");
});
export const submitContestProblem = asyncHandler(async (req, res) => {
  const { contestId, problemId } = req.params;
  const { source_code, language_id } = req.body;
  const userId = req.user.id;
  const contest = await db.contest.findUnique({
    where: { id: contestId },
    include: {
      _count: { select: { participants: true } },
      problems: { where: { id: problemId } },
    },
  });
  if (!contest) {
    throw new ApiError(404, "Contest not found");
  }
  if (contest.participants.length === 0) {
    throw new ApiError(403, "User is not registered for the contest");
  }
  const now = new Date();
  if (now < contest.startTime || now > contest.endTime) {
    throw new ApiError(400, "Contest has not started yet");
  }
  if (!contest.problemIds.includes(problemId)) {
    throw new ApiError(400, "Problem is not part of the contest");
  }
  // Anti-cheat: Check submission frequency
  const oneMinuteAgo = new Date(now.getTime() - 60 * 1000);
  const recentSubmissions = await db.submission.count({
    where: {
      userId,
      problemId,
      createdAt: { gte: oneMinuteAgo },
    },
  });
  if (recentSubmissions >= 3) {
    // limit to 3 submissions per minute
    throw new ApiError(
      429,
      "Too many submissions in a short period. Please wait a while before submitting again."
    );
  }
  //Get problem and test Cases
  const problem = await db.problem.findUnique({
    where: { id: problemId },
    include: { testCases: true },
  });
  if (!problem) {
    throw new ApiError(404, "Problem not found");
  }
  const testCases = problem.testCases;
  const submissions = testCases.map((testcase) => ({
    source_code,
    language_id,
    stdin: testcase.input,
  }));
  //submit to judge0
  const submitResponse = await submitBatch(submissions);
  const tokens = submitResponse.map((sub) => sub.token);
  const results = await pollBatchResults(tokens);

  //Analyze results
  let allPassed = true;
  results.forEach((result, index) => {
    const stdout = result.stdout?.trim();
    const expectedOutput = testCases[index].output?.trim();
    const passed = stdout === expectedOutput && result.status.id === 3; //3 means Accepted
    if (!passed) allPassed = false;
  });
  const score = allPassed ? 100 : 0; //simple scoring: 100 if all passed else 0
  const penalty = Math.floor((now - contest.startTime) / (1000 * 60)); //penalty in minutes from start time

  const existingAC = await db.contestSubmission.findFirst({
    where: {
      userId,
      contestId,
      problemId,
      status: "AC",
    },
  });
  const finalScore = existingAC ? 0 : score; //if already AC, no score for subsequent ACs
  //Save submission
  const submission = await db.contestSubmission.create({
    data: {
      userId,
      contestId,
      problemId,
      source_code,
      language_id,
      status: finalScore === 100 ? "AC" : "WA",
      score: finalScore,
      createdAt: new Date(),
    },
  });

  //updtate leaderboard
  if (allPassed && !existingAC) {
    await updateLeaderboard(contestId);

    //emit leaderboard update via socket.io
    const leaderboard = await getContestLeaderboard(contestId);
    io.to(`contest_${contestId}`).emit("leaderboardUpdate", leaderboard);
  }
  return new ApiResponse(
    200,
    "Submission processed",
    { score: finalScore, allPassed },
    {
      submission: {
        id: submission.id,
        status: submission.status,
        score: submission.score,
      },
    }
  );
});
export const getContestLeaderboard = asyncHandler(async (contestId) => {
  try {
    const leaderboard = await db.contestLeaderboard.findMany({
      where: { contestId },
      include: {
        user: {
          select: { id: true, name: true, image: true },
        },
      },
      orderBy: [{ totalScore: "desc" }, { penalty: "asc" }],
    });

    return leaderboard.map((entry, index) => ({
      ...entry,
      rank: index + 1,
    }));
  } catch (error) {
    console.error("Error getting leaderboard:", error);
    return [];
  }
});
export const getLeaderboard = asyncHandler(async (req, res) => {
  try {
    const { contestId } = req.params;
    const leaderboard = await getContestLeaderboard(contestId);

    res.status(200).json({
      success: true,
      leaderboard,
    });
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch leaderboard",
    });
  }
});
export const updateLeaderboard = asyncHandler(
  async (contestId, userId, scoreToAdd, penaltyToAdd = 0) => {
    try {
      await db.contestLeaderboard.upsert({
        where: {
          userId_contestId: { userId, contestId },
        },
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
    } catch (error) {
      console.error("Error updating leaderboard:", error);
    }
  }
);
export const getMyContestSubmissions = asyncHandler(async (req, res) => {
  try {
    const { contestId } = req.params;
    const userId = req.user.id;

    const submissions = await db.contestSubmission.findMany({
      where: { userId, contestId },
      include: {
        problem: {
          select: { id: true, title: true, difficulty: true },
        },
      },
      orderBy: { submittedAt: "desc" },
    });

    res.status(200).json({
      success: true,
      submissions,
    });
  } catch (error) {
    console.error("Error fetching submissions:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch submissions",
    });
  }
});
export const updateContestStatus = asyncHandler(async (req, res) => {
  try {
    const { contestId } = req.params;
    const { status } = req.body;

    if (req.user.role !== "ADMIN") {
      return res.status(403).json({
        success: false,
        message: "Only admins can update contest status",
      });
    }

    const contest = await db.contest.update({
      where: { id: contestId },
      data: { status },
    });

    res.status(200).json({
      success: true,
      message: "Contest status updated successfully",
      contest,
    });
  } catch (error) {
    console.error("Error updating contest status:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update contest status",
    });
  }
});
