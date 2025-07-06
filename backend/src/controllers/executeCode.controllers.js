import dotenv from "dotenv";
import { pollBatchResults, submitBatch } from "../libs/judge0.lib.js";
export const executeCode = async (req, res) => {
  //user se language input
  //fir code, input, output array
  //fir execute
  try {
    const { source_code, language_id, stdin, expected_output, problemId } = req.body;
    const userId = req.user.id;
    //validate test cases
    if (
      !Array.isArray(stdin) ||
      stdin.length === 0 ||
      !Array.isArray(expected_output) ||
      expected_output.length !== stdin.length
    ) {
      return res.status(400).json({
        error: "Invalid or Missing test casses",
      });
    }
    //prepare each test cases for judge0 batch submission
    const submission = stdin.map((input) => ({
      source_code,
      language_id,
      stdin: input,
    }));
    //send this batch pf submission to judge0
    const submitResponse = await submitBatch(submission);
    const tokens = submitResponse.map((res) => res.token);
    //poll judge0 for result of all submitted testcases
    const results = await pollBatchResults(tokens);
    console.log("Result-------");
    console.log(results);
    res.status(200).json({
      message: "Code executed !",
    });
  } catch (error) {
    res.status(403).json({
      error: "Error in code execution",
    });
  }
};
