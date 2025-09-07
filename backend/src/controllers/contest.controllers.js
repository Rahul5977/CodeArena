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
