import { db } from "../libs/db.js";

// Community backend (Phase 6): solutions, discussions, comments, votes,
// follows, public profiles and moderation reports.

// Author shape reused across list/detail responses.
const authorSelect = { id: true, name: true, username: true, image: true };

// The three votable/commentable content types and their Prisma accessors.
const targetModels = {
  solution: db.solution,
  discussion: db.discussion,
  comment: db.comment,
};

// ── Solutions ────────────────────────────────────────────────────────────────

// GET /problems/:problemId/solutions — public list for a problem.
// ?sort=votes → most upvoted; default → newest first.
export const getProblemSolutions = async (req, res) => {
  try {
    const { problemId } = req.params;
    const orderBy =
      req.query.sort === "votes"
        ? [{ votes: "desc" }, { createdAt: "desc" }]
        : [{ createdAt: "desc" }];

    const solutions = await db.solution.findMany({
      where: { problemId },
      orderBy,
      include: {
        user: { select: authorSelect },
        _count: { select: { comments: true } },
      },
    });

    return res.status(200).json({
      success: true,
      solutions: solutions.map((s) => ({
        id: s.id,
        title: s.title,
        body: s.body,
        language: s.language,
        code: s.code,
        votes: s.votes,
        createdAt: s.createdAt,
        author: s.user,
        commentCount: s._count.comments,
      })),
    });
  } catch (error) {
    console.error("getProblemSolutions error:", error);
    return res.status(500).json({ success: false, message: "Error loading solutions" });
  }
};

// POST /problems/:problemId/solutions — auth. Create a solution writeup.
export const createSolution = async (req, res) => {
  try {
    const { problemId } = req.params;
    const { title, body, language, code } = req.body || {};

    if (!title || !title.trim() || !body || !body.trim()) {
      return res.status(400).json({ success: false, message: "Title and body are required" });
    }

    const problem = await db.problem.findUnique({ where: { id: problemId }, select: { id: true } });
    if (!problem) {
      return res.status(404).json({ success: false, message: "Problem not found" });
    }

    const solution = await db.solution.create({
      data: {
        userId: req.user.id,
        problemId,
        title: title.trim(),
        body,
        language: language || null,
        code: code || null,
      },
      include: {
        user: { select: authorSelect },
        _count: { select: { comments: true } },
      },
    });

    return res.status(201).json({
      success: true,
      solution: {
        id: solution.id,
        title: solution.title,
        body: solution.body,
        language: solution.language,
        code: solution.code,
        votes: solution.votes,
        createdAt: solution.createdAt,
        author: solution.user,
        commentCount: solution._count.comments,
      },
    });
  } catch (error) {
    console.error("createSolution error:", error);
    return res.status(500).json({ success: false, message: "Error creating solution" });
  }
};

// ── Discussions ──────────────────────────────────────────────────────────────

// GET /discussions — public list, paginated, optional ?problemId filter.
export const getDiscussions = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 20));
    const skip = (page - 1) * limit;

    const where = {};
    if (req.query.problemId) where.problemId = req.query.problemId;

    const [total, discussions] = await Promise.all([
      db.discussion.count({ where }),
      db.discussion.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        include: {
          user: { select: authorSelect },
          problem: { select: { title: true, slug: true } },
          _count: { select: { comments: true } },
        },
      }),
    ]);

    return res.status(200).json({
      success: true,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      discussions: discussions.map((d) => ({
        id: d.id,
        title: d.title,
        body: d.body,
        votes: d.votes,
        createdAt: d.createdAt,
        problemId: d.problemId,
        problem: d.problem,
        author: d.user,
        commentCount: d._count.comments,
      })),
    });
  } catch (error) {
    console.error("getDiscussions error:", error);
    return res.status(500).json({ success: false, message: "Error loading discussions" });
  }
};

// POST /discussions — auth. Create a discussion thread (problemId optional).
export const createDiscussion = async (req, res) => {
  try {
    const { title, body, problemId } = req.body || {};

    if (!title || !title.trim() || !body || !body.trim()) {
      return res.status(400).json({ success: false, message: "Title and body are required" });
    }

    if (problemId) {
      const problem = await db.problem.findUnique({ where: { id: problemId }, select: { id: true } });
      if (!problem) {
        return res.status(404).json({ success: false, message: "Problem not found" });
      }
    }

    const discussion = await db.discussion.create({
      data: {
        userId: req.user.id,
        problemId: problemId || null,
        title: title.trim(),
        body,
      },
      include: {
        user: { select: authorSelect },
        problem: { select: { title: true, slug: true } },
        _count: { select: { comments: true } },
      },
    });

    return res.status(201).json({
      success: true,
      discussion: {
        id: discussion.id,
        title: discussion.title,
        body: discussion.body,
        votes: discussion.votes,
        createdAt: discussion.createdAt,
        problemId: discussion.problemId,
        problem: discussion.problem,
        author: discussion.user,
        commentCount: discussion._count.comments,
      },
    });
  } catch (error) {
    console.error("createDiscussion error:", error);
    return res.status(500).json({ success: false, message: "Error creating discussion" });
  }
};

// GET /discussions/:id — public detail with comments + their authors.
export const getDiscussionById = async (req, res) => {
  try {
    const { id } = req.params;

    const discussion = await db.discussion.findUnique({
      where: { id },
      include: {
        user: { select: authorSelect },
        problem: { select: { title: true, slug: true } },
        comments: {
          orderBy: { createdAt: "asc" },
          include: { user: { select: authorSelect } },
        },
      },
    });

    if (!discussion) {
      return res.status(404).json({ success: false, message: "Discussion not found" });
    }

    return res.status(200).json({
      success: true,
      discussion: {
        id: discussion.id,
        title: discussion.title,
        body: discussion.body,
        votes: discussion.votes,
        createdAt: discussion.createdAt,
        problemId: discussion.problemId,
        problem: discussion.problem,
        author: discussion.user,
        comments: discussion.comments.map((c) => ({
          id: c.id,
          body: c.body,
          votes: c.votes,
          parentId: c.parentId,
          createdAt: c.createdAt,
          author: c.user,
        })),
      },
    });
  } catch (error) {
    console.error("getDiscussionById error:", error);
    return res.status(500).json({ success: false, message: "Error loading discussion" });
  }
};

// ── Comments ─────────────────────────────────────────────────────────────────

// POST /comments — auth. Attach a comment to a solution or discussion
// (optionally threaded under a parent comment).
export const createComment = async (req, res) => {
  try {
    const { body, discussionId, solutionId, parentId } = req.body || {};

    if (!body || !body.trim()) {
      return res.status(400).json({ success: false, message: "Comment body is required" });
    }
    if (!discussionId && !solutionId) {
      return res
        .status(400)
        .json({ success: false, message: "A discussionId or solutionId is required" });
    }

    // Validate targets exist so we don't create orphaned comments.
    if (discussionId) {
      const d = await db.discussion.findUnique({ where: { id: discussionId }, select: { id: true } });
      if (!d) return res.status(404).json({ success: false, message: "Discussion not found" });
    }
    if (solutionId) {
      const s = await db.solution.findUnique({ where: { id: solutionId }, select: { id: true } });
      if (!s) return res.status(404).json({ success: false, message: "Solution not found" });
    }
    if (parentId) {
      const p = await db.comment.findUnique({ where: { id: parentId }, select: { id: true } });
      if (!p) return res.status(404).json({ success: false, message: "Parent comment not found" });
    }

    const comment = await db.comment.create({
      data: {
        userId: req.user.id,
        body,
        discussionId: discussionId || null,
        solutionId: solutionId || null,
        parentId: parentId || null,
      },
      include: { user: { select: authorSelect } },
    });

    return res.status(201).json({
      success: true,
      comment: {
        id: comment.id,
        body: comment.body,
        votes: comment.votes,
        parentId: comment.parentId,
        solutionId: comment.solutionId,
        discussionId: comment.discussionId,
        createdAt: comment.createdAt,
        author: comment.user,
      },
    });
  } catch (error) {
    console.error("createComment error:", error);
    return res.status(500).json({ success: false, message: "Error creating comment" });
  }
};

// ── Votes ────────────────────────────────────────────────────────────────────

// POST /vote — auth. Upsert the caller's vote on a target, then recompute the
// target's denormalised `votes` count as the sum of all vote values.
export const castVote = async (req, res) => {
  try {
    const { targetType, targetId, value } = req.body || {};

    if (!targetType || !targetId) {
      return res.status(400).json({ success: false, message: "targetType and targetId are required" });
    }
    if (!targetModels[targetType]) {
      return res.status(400).json({
        success: false,
        message: "targetType must be one of: solution, discussion, comment",
      });
    }
    if (value !== 1 && value !== -1) {
      return res.status(400).json({ success: false, message: "value must be 1 or -1" });
    }

    const model = targetModels[targetType];
    const target = await model.findUnique({ where: { id: targetId }, select: { id: true } });
    if (!target) {
      return res.status(404).json({ success: false, message: `${targetType} not found` });
    }

    await db.vote.upsert({
      where: { userId_targetType_targetId: { userId: req.user.id, targetType, targetId } },
      update: { value },
      create: { userId: req.user.id, targetType, targetId, value },
    });

    const agg = await db.vote.aggregate({
      where: { targetType, targetId },
      _sum: { value: true },
    });
    const votes = agg._sum.value || 0;

    await model.update({ where: { id: targetId }, data: { votes } });

    return res.status(200).json({ success: true, votes, value });
  } catch (error) {
    console.error("castVote error:", error);
    return res.status(500).json({ success: false, message: "Error recording vote" });
  }
};

// ── Follow ───────────────────────────────────────────────────────────────────

// POST /follow/:userId — auth. Toggle follow/unfollow the target user.
export const toggleFollow = async (req, res) => {
  try {
    const followerId = req.user.id;
    const followeeId = req.params.userId;

    if (followerId === followeeId) {
      return res.status(400).json({ success: false, message: "You cannot follow yourself" });
    }

    const target = await db.user.findUnique({ where: { id: followeeId }, select: { id: true } });
    if (!target) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const existing = await db.follow.findUnique({
      where: { followerId_followeeId: { followerId, followeeId } },
    });

    let following;
    if (existing) {
      await db.follow.delete({ where: { followerId_followeeId: { followerId, followeeId } } });
      following = false;
    } else {
      await db.follow.create({ data: { followerId, followeeId } });
      following = true;
    }

    const [followers, followingCount] = await Promise.all([
      db.follow.count({ where: { followeeId } }),
      db.follow.count({ where: { followerId: followeeId } }),
    ]);

    return res.status(200).json({
      success: true,
      following,
      followers,
      followingCount,
    });
  } catch (error) {
    console.error("toggleFollow error:", error);
    return res.status(500).json({ success: false, message: "Error updating follow" });
  }
};

// GET /follow/:userId/status — auth. Whether the caller follows the target,
// plus the target's follower/following counts.
export const getFollowStatus = async (req, res) => {
  try {
    const followeeId = req.params.userId;

    const target = await db.user.findUnique({ where: { id: followeeId }, select: { id: true } });
    if (!target) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const [existing, followers, followingCount] = await Promise.all([
      db.follow.findUnique({
        where: { followerId_followeeId: { followerId: req.user.id, followeeId } },
      }),
      db.follow.count({ where: { followeeId } }),
      db.follow.count({ where: { followerId: followeeId } }),
    ]);

    return res.status(200).json({
      success: true,
      following: Boolean(existing),
      followers,
      followingCount,
    });
  } catch (error) {
    console.error("getFollowStatus error:", error);
    return res.status(500).json({ success: false, message: "Error loading follow status" });
  }
};

// ── Public profile ───────────────────────────────────────────────────────────

// GET /profiles/:username — public profile by username. 404 if unknown.
export const getPublicProfile = async (req, res) => {
  try {
    const { username } = req.params;

    const user = await db.user.findUnique({
      where: { username },
      select: {
        id: true,
        name: true,
        username: true,
        image: true,
        bio: true,
        githubUrl: true,
        websiteUrl: true,
        points: true,
        createdAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const [solvedCount, submissionCount, followers, followingCount, recent] = await Promise.all([
      db.problemSolved.count({ where: { userId: user.id } }),
      db.submission.count({ where: { userId: user.id } }),
      db.follow.count({ where: { followeeId: user.id } }),
      db.follow.count({ where: { followerId: user.id } }),
      db.submission.findMany({
        where: { userId: user.id, status: "Accepted" },
        orderBy: { createdAt: "desc" },
        take: 10,
        select: {
          id: true,
          createdAt: true,
          problem: { select: { title: true, slug: true, difficulty: true } },
        },
      }),
    ]);

    // Whether the signed-in viewer follows this profile (if authenticated).
    let isFollowing = false;
    if (req.user && req.user.id !== user.id) {
      const f = await db.follow.findUnique({
        where: { followerId_followeeId: { followerId: req.user.id, followeeId: user.id } },
      });
      isFollowing = Boolean(f);
    }

    return res.status(200).json({
      success: true,
      profile: {
        user,
        solvedCount,
        submissionCount,
        followers,
        followingCount,
        isFollowing,
        isSelf: Boolean(req.user && req.user.id === user.id),
        recentAccepted: recent
          .filter((s) => s.problem)
          .map((s) => ({
            id: s.id,
            title: s.problem.title,
            slug: s.problem.slug,
            difficulty: s.problem.difficulty,
            when: s.createdAt,
          })),
      },
    });
  } catch (error) {
    console.error("getPublicProfile error:", error);
    return res.status(500).json({ success: false, message: "Error loading profile" });
  }
};

// ── Reports (moderation) ─────────────────────────────────────────────────────

// POST /report — auth. File a report against a piece of content or a user.
export const createReport = async (req, res) => {
  try {
    const { targetType, targetId, reason } = req.body || {};

    if (!targetType || !targetId || !reason || !reason.trim()) {
      return res.status(400).json({
        success: false,
        message: "targetType, targetId and reason are required",
      });
    }

    const report = await db.report.create({
      data: {
        reporterId: req.user.id,
        targetType,
        targetId,
        reason: reason.trim(),
      },
    });

    return res.status(201).json({ success: true, report });
  } catch (error) {
    console.error("createReport error:", error);
    return res.status(500).json({ success: false, message: "Error filing report" });
  }
};

// GET /reports — admin. Open reports, newest first.
export const getReports = async (req, res) => {
  try {
    const status = req.query.status || "open";

    const reports = await db.report.findMany({
      where: { status },
      orderBy: { createdAt: "desc" },
      include: { reporter: { select: authorSelect } },
    });

    return res.status(200).json({ success: true, reports });
  } catch (error) {
    console.error("getReports error:", error);
    return res.status(500).json({ success: false, message: "Error loading reports" });
  }
};

// PATCH /reports/:id — admin. Update a report's status.
export const updateReportStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body || {};

    const allowed = ["open", "actioned", "dismissed"];
    if (!status || !allowed.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `status must be one of: ${allowed.join(", ")}`,
      });
    }

    const existing = await db.report.findUnique({ where: { id }, select: { id: true } });
    if (!existing) {
      return res.status(404).json({ success: false, message: "Report not found" });
    }

    const report = await db.report.update({ where: { id }, data: { status } });

    return res.status(200).json({ success: true, report });
  } catch (error) {
    console.error("updateReportStatus error:", error);
    return res.status(500).json({ success: false, message: "Error updating report" });
  }
};
