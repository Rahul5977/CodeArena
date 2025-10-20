import dotenv from "dotenv";
import { getLanguageName, pollBatchResults, submitBatch } from "../libs/judge0.lib.js";
import { db } from "../libs/db.js";
// import { all } from "axios";
export const executeCode = async (req, res) => {
  //user se language input
  //fir code, input, output array
  //fir execute
  try {
    const { source_code, language_id, stdin, expected_outputs, problemId } = req.body;
    const userId = req.user.id;

    console.log("Execute code request:", {
      userId,
      problemId,
      language_id,
      stdinLength: stdin?.length,
      expectedOutputsLength: expected_outputs?.length,
    });

    //validate test cases
    if (
      !Array.isArray(stdin) ||
      stdin.length === 0 ||
      !Array.isArray(expected_outputs) ||
      expected_outputs.length !== stdin.length
    ) {
      console.error("Validation failed:", { stdin, expected_outputs });
      return res.status(400).json({
        success: false,
        error: "Invalid or Missing test cases",
        message: "Invalid or Missing test cases",
      });
    }
    //prepare each test cases for judge0 batch submission
    const submissions = stdin.map((input) => ({
      source_code,
      language_id,
      stdin: input,
    }));
    //send this batch pf submission to judge0
    const submitResponse = await submitBatch(submissions);
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
    const submission = await db.submission.create({
      data: {
        userId,
        problemId,
        sourceCode: { code: source_code, language_id }, // Store as JSON
        language: getLanguageName(language_id),
        stdin: stdin.join("\n"),
        stdout: JSON.stringify(detailedresults.map((r) => r.stdout)),
        stderr: detailedresults.some((r) => r.stderr)
          ? JSON.stringify(detailedresults.map((r) => r.stderr))
          : null,
        compileOutput: detailedresults.some((r) => r.compile_output)
          ? JSON.stringify(detailedresults.map((r) => r.compile_output))
          : null,
        status: allPassed ? "Accepted" : "Wrong Answer", // Fixed typo
        memory: detailedresults.some((r) => r.memory)
          ? JSON.stringify(detailedresults.map((r) => r.memory))
          : null,
        time: detailedresults.some((r) => r.time)
          ? JSON.stringify(detailedresults.map((r) => r.time))
          : null,
      },
    });
    //if all passed -> mark problem as solved for current user
    if (allPassed) {
      await db.problemSolved.upsert({
        where: {
          userId_problemId: {
            userId,
            problemId,
          },
        },
        update: {},
        create: {
          userId,
          problemId,
        },
      });
    }

    //save individual test case results
    const testCaseResults = detailedresults.map((result) => ({
      submissionId: submission.id,
      testCase: result.testCase,
      passed: result.passed,
      stdout: result.stdout,
      expected: result.expected,
      stderr: result.stderr,
      compileOutput: result.compile_output,
      status: result.status,
      memory: result.memory,
      time: result.time,
    }));
    await db.testCaseResult.createMany({
      data: testCaseResults,
    });

    const submissionWithTestCase = await db.submission.findUnique({
      where: {
        id: submission.id,
      },
      include: {
        testCases: true,
      },
    });
    res.status(200).json({
      success: true,
      message: "Code Executed! Successfully!",
      submission: submissionWithTestCase,
    });
  } catch (error) {
    console.error("Code execution error:", error);
    res.status(500).json({
      success: false,
      message: "Error in code execution",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};
