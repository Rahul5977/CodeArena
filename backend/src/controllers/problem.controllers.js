import { db } from "../libs/db.js";
import { getJudge0LanguageId, pollBatchResults, submitBatch } from "../libs/judge0.lib.js";
export const createProblem = async (req, res) => {
  const {
    title,
    description,
    difficulty,
    tags,
    examples,
    constraints,
    testcases,
    codeSnippets,
    referenceSolutions,
  } = req.body;
  if (req.user.role !== "ADMIN") {
    return res.status(403).json({
      success: false,
      message: "You are not allowed to create a problem",
    });
  }
  try {
    for (const [language, solutionCode] of Object.entries(referenceSolutions)) {
      //object.entries -> make key/value pair array
      //{a:1,b:2,c:3}->[[a,1],[b,2],[c,3]]
      const languageId = getJudge0LanguageId(language);
      if (!languageId) {
        return res.status(400).json({
          error: `Language ${language} is not supported`,
        });
      }
      const submissions = testcases.map(({ input, output }) => ({
        source_code: solutionCode,
        language_id: languageId,
        stdin: input,
        expected_output: output,
      }));
      //submissions -> array of objects with these entities

      const submissionsResults = await submitBatch(submissions);
      //returns a token->array of tokens
      const tokens = submissionsResults.map((res) => res.token);
      //token extraced ..
      const results = await pollBatchResults(tokens);
      for (let i = 0; i < results.length; i++) {
        const result = results[i];
        console.log("result-----", result);

        if (result.status.id !== 3) {
          return res.status(400).json({
            error: `Testcase ${i + 1} failed for language ${language}`,
          });
        }
      }
      //save the problem to db
      const newProblem = await db.problem.create({
        data: {
          title,
          description,
          difficulty,
          tags,
          examples,
          constraints,
          testcases,
          codeSnippets,
          referenceSolutions,
          userId: req.user.id,
        },
      });
      return res.status(201).json({
        success: true,
        message: "Problem Created Successfully",
        newProblem,
      });
    }
  } catch (error) {
    console.error("Error creating problem", error);
    res.status(403).json({
      success: false,
      error: "Error creating problem",
    });
  }
};
export const getAllProblem = async (req, res) => {
  try {
    const problems = await db.problem.findMany();
    if (!problems) {
      return res.status(404).json({
        error: "No problem found",
      });
    }
    return res.status(201).json({
      success: true,
      message: "Problem fetched Successfully",
      problems,
    });
  } catch (error) {
    console.error("Error fetching problem", error);
    res.status(403).json({
      success: false,
      error: "Error fetching problem",
    });
  }
};
export const getAllProblemById = async (req, res) => {
  const { id } = req.params;
  try {
    const problem = await db.problem.findUnique({
      where: {
        id: id,
      },
    });
    if (!problem) {
      return res.status(404).json({
        error: "No problem found",
      });
    }
    return res.status(200).json({
      success: true,
      message: "Problem fetched Successfully",
      problem,
    });
  } catch (error) {
    console.error("Error fetching problem by id", error);
    res.status(403).json({
      success: false,
      error: "Error fetching problem by id",
    });
  }
};
export const updateProblem = async (req, res) => {
  const { id } = req.params;
  console.log("Problem ID from params:", req.params.id);

  const existingProblem = await db.problem.findUnique({ where: { id: id } });
  if (!existingProblem) {
    return res.status(404).json({ error: "Problem not found" });
  }
  const {
    title,
    description,
    difficulty,
    tags,
    examples,
    constraints,
    testcases,
    codeSnippets,
    referenceSolutions,
  } = req.body;

  if (req.user.role !== "ADMIN") {
    return res.status(403).json({ message: "You are not allowed to update this problem" });
  }

  try {
    // Validate -> Sulu/Judge0
    for (const [language, solutionCode] of Object.entries(referenceSolutions)) {
      const languageId = getJudge0LanguageId(language);
      if (!languageId) {
        return res.status(400).json({
          error: `Language ${language} is not supported`,
        });
      }

      const submissions = testcases.map(({ input, output }) => ({
        source_code: solutionCode,
        language_id: languageId,
        stdin: input,
        expected_output: output,
      }));

      const submissionResults = await submitBatch(submissions);
      const tokens = submissionResults.map((res) => res.token);
      const results = await pollBatchResults(tokens);

      for (let i = 0; i < results.length; i++) {
        const result = results[i];

        if (result.status.id !== 3) {
          return res.status(400).json({
            error: `Testcase ${i + 1} failed for language ${language}`,
            message: result.status.description,
          });
        }
      }
    }

    // If all reference solutions pass, update problem in DB
    const updatedProblem = await db.problem.update({
      where: { id: id },
      data: {
        title,
        description,
        difficulty,
        tags,
        examples,
        constraints,
        testcases,
        codeSnippets,
        referenceSolutions,
        userId: req.user.id,
      },
    });

    res.status(200).json({
      message: "Problem Updated !",
      success: true,
      updatedProblem,
    });
  } catch (error) {
    console.error("Error updating problem:", error);
    res.status(500).json({
      error: "Failed to update the problem",
    });
  }
};
export const deleteProblem = async (req, res) => {
  const { id } = req.params;
  try {
    const problem = await db.problem.findUnique({
      where: { id },
    });

    if (!problem) {
      return res.status(404).json({
        error: "No problem found",
      });
    }

    await db.problem.delete({
      where: { id },
    });
    return res.status(200).json({
      success: true,
      message: "Problem deleted Successfully",
    });
  } catch (error) {
    console.error("Error deleting problem by id", error);
    res.status(403).json({
      success: false,
      error: "Error deleting problem by id",
    });
  }
};
export const getAllProblemSolvedByuser = async (req, res) => {
  try {
    const problems = await db.problem.findMany({
      where: {
        solvedBy: {
          some: {
            userId: req.user.id,
          },
        },
      },
      include: {
        solvedBy: {
          where: {
            userId: req.user.id,
          },
        },
      },
    });
    res.status(200).json({
      success: true,
      message: "Problems fetched successfully",
      problems,
    });
  } catch (error) {
    console.error("Error fetching problems :", error);
    res.status(500).json({ error: "Failed to fetch problems" });
  }
};
