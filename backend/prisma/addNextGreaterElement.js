// CodeArena — add a single problem: Next Greater Element. Unlike
// resetProblems.js this does NOT touch any existing problem; it validates the
// reference solutions against every testcase through the real executor
// (Codebox) — the same check createProblem's publish path runs — and only
// upserts into the DB if every testcase passes for every language.
// Run: `node prisma/addNextGreaterElement.js`.
import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/index.js";
import { getJudge0LanguageId, submitBatch, pollBatchResults } from "../src/libs/executor.lib.js";

const db = new PrismaClient();
const adminEmail = (process.env.ADMIN_EMAIL || "admin@codearena.local").toLowerCase();

const PROBLEM = {
  slug: "next-greater-element",
  title: "Next Greater Element",
  difficulty: "MEDIUM",
  tags: ["Array", "Stack", "Monotonic Stack"],
  description:
    "Given an array of integers **nums**, for each element find the *next greater element* to its right — the first element that is strictly greater than it. If no such element exists, use **-1**. Print the results for all elements, space-separated, in the original order.",
  constraints: "1 <= n <= 100000; -1000000000 <= nums[i] <= 1000000000",
  examples: [
    { input: "4\n4 5 2 25", output: "5 25 25 -1", explanation: "For 4 -> 5, for 5 -> 25, for 2 -> 25, for 25 -> none so -1." },
  ],
  testcases: [
    { input: "4\n4 5 2 25", output: "5 25 25 -1" },
    { input: "4\n13 7 6 12", output: "-1 12 12 -1" },
    { input: "1\n5", output: "-1" },
    { input: "5\n1 2 3 4 5", output: "2 3 4 5 -1" },
    { input: "5\n5 4 3 2 1", output: "-1 -1 -1 -1 -1" },
    { input: "6\n2 7 3 5 4 6", output: "7 -1 5 6 6 -1" },
  ],
  codeSnippets: {
    PYTHON:
      "import sys\ndata = sys.stdin.read().split('\\n')\nn = int(data[0])\nnums = list(map(int, data[1].split()))\n# print(...)\n",
    JAVASCRIPT:
      "const lines = require('fs').readFileSync(0, 'utf8').split('\\n');\nconst n = Number(lines[0]);\nconst nums = lines[1].trim().split(/\\s+/).map(Number);\n// console.log(...);\n",
  },
  referenceSolutions: {
    PYTHON:
      "import sys\ndata = sys.stdin.read().split('\\n')\nn = int(data[0])\nnums = list(map(int, data[1].split()))\nres = [-1] * n\nstack = []\nfor i in range(n):\n    while stack and nums[stack[-1]] < nums[i]:\n        res[stack.pop()] = nums[i]\n    stack.append(i)\nprint(' '.join(map(str, res)))\n",
    JAVASCRIPT:
      "const lines = require('fs').readFileSync(0, 'utf8').split('\\n');\nconst n = Number(lines[0]);\nconst nums = lines[1].trim().split(/\\s+/).map(Number);\nconst res = new Array(n).fill(-1);\nconst stack = [];\nfor (let i = 0; i < n; i++) {\n  while (stack.length && nums[stack[stack.length - 1]] < nums[i]) {\n    res[stack.pop()] = nums[i];\n  }\n  stack.push(i);\n}\nconsole.log(res.join(' '));\n",
  },
};

// Mirrors problem.controllers.js's validateReferenceSolutions — runs every
// reference solution against every testcase through the real executor.
async function validateAgainstExecutor(referenceSolutions, testcases) {
  for (const [language, solutionCode] of Object.entries(referenceSolutions)) {
    const languageId = getJudge0LanguageId(language);
    if (!languageId) throw new Error(`Language ${language} is not supported`);

    const submissions = testcases.map(({ input, output }) => ({
      source_code: solutionCode,
      language_id: languageId,
      stdin: input,
      expected_output: output,
    }));

    console.log(`Submitting ${submissions.length} testcase(s) for ${language} to the executor...`);
    const submitResults = await submitBatch(submissions);
    const tokens = submitResults.map((r) => r.token);
    const results = await pollBatchResults(tokens);

    for (let i = 0; i < results.length; i++) {
      const r = results[i];
      const ok = r.status.id === 3;
      console.log(
        `  [${language}] tc#${i + 1}: ${ok ? "PASS" : "FAIL"} (${r.status.description})` +
          (ok ? "" : ` — stdout=${JSON.stringify(r.stdout)} expected=${JSON.stringify(testcases[i].output)} stderr=${JSON.stringify(r.stderr)}`)
      );
      if (!ok) throw new Error(`Testcase ${i + 1} failed for ${language}: ${r.status.description}`);
    }
  }
}

async function main() {
  await validateAgainstExecutor(PROBLEM.referenceSolutions, PROBLEM.testcases);
  console.log("All testcases passed against the real executor.");

  const admin = await db.user.findUnique({ where: { email: adminEmail } });
  if (!admin) throw new Error(`Admin user ${adminEmail} not found — run prisma/seed.js or resetProblems.js first`);

  const problem = await db.problem.upsert({
    where: { slug: PROBLEM.slug },
    update: { ...PROBLEM, published: true, authorId: admin.id },
    create: { ...PROBLEM, published: true, authorId: admin.id },
  });

  const count = await db.problem.count();
  console.log(`Upserted "${problem.title}" (${problem.slug}). Total problems in DB: ${count}`);
}

main()
  .then(() => db.$disconnect())
  .catch((e) => {
    console.error("Add problem failed:", e.message);
    return db.$disconnect().finally(() => process.exit(1));
  });
