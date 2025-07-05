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
        console.log("result-----", result[i]);

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
    const problems = await db.problems.findMany();
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
export const getAllProblemById = async (req, res) => {};
export const updateProblem = async (req, res) => {};
export const deleteProblem = async (req, res) => {};
