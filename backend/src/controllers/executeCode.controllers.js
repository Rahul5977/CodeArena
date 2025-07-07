import dotenv from "dotenv";
import { pollBatchResults, submitBatch } from "../libs/judge0.lib.js";
export const executeCode = async (req, res) => {
  //user se language input
  //fir code, input, output array
  //fir execute
  try {
    const { source_code, language_id, stdin, expected_outputs, problemId } = req.body;
    const userId = req.user.id;
    //validate test cases
    if (
      !Array.isArray(stdin) ||
      stdin.length === 0 ||
      !Array.isArray(expected_outputs) ||
      expected_outputs.length !== stdin.length
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
    //Analyze test case result
    //   {
    //   stdout: '0\n',
    //   time: '0.026',
    //   memory: 7480,
    //   stderr: null,
    //   token: '990e3028-99d1-435b-9a11-503199ceab8b',
    //   compile_output: null,
    //   message: null,
    //   status: { id: 3, description: 'Accepted' }
    // }
    let allPassed = true;
    const detailedresults = results.map((result, i) => {
      const stdout = result.stdout?.trim();
      const expected_output = expected_outputs[i]?.trim();
      const passed = stdout === expected_output;
      if (!passed) allPassed = false;
      // console.log(`Testcase ${i + 1}`);
      // console.log(`Input ${stdin[i]}`);
      // console.log(`Expected Output  ${expected_output}`);
      // console.log(`Actual Output ${stdout}`);
      // console.log(`Mached :${passed}`);
      return {
        testCase: i + 1,
        passed,
        stdout,
        expected: expected_output,
        stderr: result.stderr || null,
        compile_output: result.compile_output || null,
        status: result.status.description,
        memory: result.memory ? `${result.memory} KB` : undefined,
        time: result.time ? `${result.time} s` : undefined,
      };
    });
    // Testcase 1
    // Input 100 200
    // Expected Output  300
    // Actual Output 300
    // Mached :true

    console.log(detailedresults);
    
    res.status(200).json({
      message: "Code executed !",
    });
  } catch (error) {
    res.status(403).json({
      error: "Error in code execution",
    });
  }
};
