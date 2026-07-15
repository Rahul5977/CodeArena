import { db } from "../libs/db.js";
import { getJudge0LanguageId, pollBatchResults, submitBatch } from "../libs/executor.lib.js";

// slugify a title into a URL-safe, stable key (Problem.slug @unique).
const slugify = (s = "") =>
  s
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);

// Answer-free field set for anything a normal user can read.
// Excludes `testcases` and `referenceSolutions` (the answers). `codeSnippets`
// (starter boilerplate) and `examples` are safe to expose.
const PUBLIC_DETAIL_SELECT = {
  id: true,
  slug: true,
  title: true,
  description: true,
  difficulty: true,
  tags: true,
  companies: true,
  published: true,
  examples: true,
  constraints: true,
  hints: true,
  editorial: true,
  codeSnippets: true,
  createdAt: true,
  updatedAt: true,
  author: { select: { id: true, name: true, username: true, image: true } },
};

const PUBLIC_LIST_SELECT = {
  id: true,
  slug: true,
  title: true,
  difficulty: true,
  tags: true,
  companies: true,
  published: true,
  createdAt: true,
};

const isAdmin = (req) => req.user?.role === "ADMIN";

// Validate every reference solution against every test case through the
// executor; returns null on success or an error payload on the first failure.
const validateReferenceSolutions = async (referenceSolutions, testcases) => {
  for (const [language, solutionCode] of Object.entries(referenceSolutions || {})) {
    const languageId = getJudge0LanguageId(language);
    if (!languageId) return { status: 400, body: { error: `Language ${language} is not supported` } };

    const submissions = testcases.map(({ input, output }) => ({
      source_code: solutionCode,
      language_id: languageId,
      stdin: input,
      expected_output: output,
    }));

    const submitResults = await submitBatch(submissions);
    const tokens = submitResults.map((r) => r.token);
    const results = await pollBatchResults(tokens);

    for (let i = 0; i < results.length; i++) {
      if (results[i].status.id !== 3) {
        return {
          status: 400,
          body: {
            error: `Testcase ${i + 1} failed for language ${language}`,
            message: results[i].status.description,
          },
        };
      }
    }
  }
  return null;
};

export const createProblem = async (req, res) => {
  // Authorization is enforced by checkAdmin on the route.
  const {
    title,
    slug,
    description,
    difficulty,
    tags = [],
    companies = [],
    published = false,
    examples,
    constraints,
    hints,
    editorial,
    testcases,
    codeSnippets,
    referenceSolutions,
  } = req.body;

  try {
    // Validate ALL reference solutions before writing anything (fix: previously
    // the create + return happened inside the loop, so only the first language
    // was validated).
    const failure = await validateReferenceSolutions(referenceSolutions, testcases);
    if (failure) return res.status(failure.status).json(failure.body);

    const newProblem = await db.problem.create({
      data: {
        title,
        slug: slugify(slug || title),
        description,
        difficulty,
        tags,
        companies,
        published,
        examples,
        constraints,
        hints,
        editorial,
        testcases,
        codeSnippets,
        referenceSolutions,
        authorId: req.user.id,
      },
    });

    return res.status(201).json({
      success: true,
      message: "Problem created successfully",
      problem: newProblem,
    });
  } catch (error) {
    if (error.code === "P2002") {
      return res.status(409).json({ success: false, error: "A problem with this slug already exists" });
    }
    console.error("Error creating problem", error);
    return res.status(500).json({ success: false, error: "Error creating problem" });
  }
};

// Public, paginated, filterable list — answer-free. Non-admins only see
// published problems; admins can pass ?status=all|draft to see everything.
export const getAllProblem = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
    const { difficulty, tag, search, status } = req.query;

    const where = {};
    if (!isAdmin(req) || !status || status === "published") where.published = true;
    else if (status === "draft") where.published = false;
    // status === "all" (admin only) → no published filter

    if (difficulty) where.difficulty = difficulty;
    if (tag) where.tags = { has: tag };
    if (search) where.title = { contains: search, mode: "insensitive" };

    const [problems, total] = await Promise.all([
      db.problem.findMany({
        where,
        select: PUBLIC_LIST_SELECT,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.problem.count({ where }),
    ]);

    return res.status(200).json({
      success: true,
      message: "Problems fetched successfully",
      problems,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error("Error fetching problems", error);
    return res.status(500).json({ success: false, error: "Error fetching problems" });
  }
};

// Detail by id or slug. Answers (testcases/referenceSolutions) are only
// returned to admins; normal users get the answer-free projection.
export const getAllProblemById = async (req, res) => {
  const { id } = req.params;
  try {
    const where = id.includes("-") && id.length === 36 ? { id } : { slug: id };
    const problem = await db.problem.findUnique({
      where,
      ...(isAdmin(req) ? {} : { select: PUBLIC_DETAIL_SELECT }),
    });

    if (!problem) return res.status(404).json({ success: false, error: "No problem found" });
    if (!isAdmin(req) && !problem.published) {
      return res.status(404).json({ success: false, error: "No problem found" });
    }

    return res.status(200).json({ success: true, message: "Problem fetched successfully", problem });
  } catch (error) {
    console.error("Error fetching problem by id", error);
    return res.status(500).json({ success: false, error: "Error fetching problem" });
  }
};

export const updateProblem = async (req, res) => {
  const { id } = req.params;

  const existingProblem = await db.problem.findUnique({ where: { id } });
  if (!existingProblem) return res.status(404).json({ error: "Problem not found" });

  const {
    title,
    slug,
    description,
    difficulty,
    tags,
    companies,
    published,
    examples,
    constraints,
    hints,
    editorial,
    testcases,
    codeSnippets,
    referenceSolutions,
  } = req.body;

  try {
    if (referenceSolutions && testcases) {
      const failure = await validateReferenceSolutions(referenceSolutions, testcases);
      if (failure) return res.status(failure.status).json(failure.body);
    }

    const updatedProblem = await db.problem.update({
      where: { id },
      data: {
        title,
        ...(slug ? { slug: slugify(slug) } : {}),
        description,
        difficulty,
        tags,
        companies,
        published,
        examples,
        constraints,
        hints,
        editorial,
        testcases,
        codeSnippets,
        referenceSolutions,
      },
    });

    return res.status(200).json({ success: true, message: "Problem updated", problem: updatedProblem });
  } catch (error) {
    if (error.code === "P2002") {
      return res.status(409).json({ success: false, error: "A problem with this slug already exists" });
    }
    console.error("Error updating problem:", error);
    return res.status(500).json({ success: false, error: "Failed to update the problem" });
  }
};

export const deleteProblem = async (req, res) => {
  const { id } = req.params;
  try {
    const problem = await db.problem.findUnique({ where: { id } });
    if (!problem) return res.status(404).json({ error: "No problem found" });

    await db.problem.delete({ where: { id } });
    return res.status(200).json({ success: true, message: "Problem deleted successfully" });
  } catch (error) {
    console.error("Error deleting problem by id", error);
    return res.status(500).json({ success: false, error: "Error deleting problem" });
  }
};

export const getAllProblemSolvedByuser = async (req, res) => {
  try {
    const problems = await db.problem.findMany({
      where: { solvedBy: { some: { userId: req.user.id } } },
      select: { ...PUBLIC_LIST_SELECT, solvedBy: { where: { userId: req.user.id }, select: { createdAt: true } } },
    });
    return res.status(200).json({ success: true, message: "Problems fetched successfully", problems });
  } catch (error) {
    console.error("Error fetching problems:", error);
    return res.status(500).json({ error: "Failed to fetch problems" });
  }
};
