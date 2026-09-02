// CodeArena — full problem reset. Deletes every existing Problem (cascades to
// Submission/ProblemSolved/ProblemInPlaylist/ContestSubmission/SheetProgress/
// Solution/Discussion rows tied to them, per schema.prisma) and replaces them
// with a fixed set of 5 problems. Reference solutions read stdin and print
// stdout (the stdin/stdout judge contract), matching prisma/seed.js.
// Run: `node prisma/resetProblems.js`.
import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaClient } from "../src/generated/prisma/index.js";

const db = new PrismaClient();
const adminEmail = (process.env.ADMIN_EMAIL || "admin@codearena.local").toLowerCase();

export const PROBLEMS = [
  {
    slug: "longest-substring-without-repeating-characters",
    title: "Longest Substring Without Repeating Characters",
    difficulty: "MEDIUM",
    tags: ["String", "Sliding Window", "Hash Table"],
    description:
      "Given a string **s**, find the length of the longest substring without repeating characters.",
    constraints: "0 <= |s| <= 50000; s consists of English letters, digits, symbols, and spaces",
    examples: [
      { input: "abcabcbb", output: "3", explanation: 'The answer is "abc", with the length of 3.' },
    ],
    testcases: [
      { input: "abcabcbb", output: "3" },
      { input: "bbbbb", output: "1" },
      { input: "pwwkew", output: "3" },
      { input: "", output: "0" },
      { input: "au", output: "2" },
      { input: "dvdf", output: "3" },
    ],
    codeSnippets: {
      PYTHON: "import sys\ns = sys.stdin.read()\nif s.endswith(\"\\n\"):\n    s = s[:-1]\n# print(...)\n",
      JAVASCRIPT: "const s = require('fs').readFileSync(0, 'utf8').replace(/\\r?\\n$/, '');\n// console.log(...);\n",
    },
    referenceSolutions: {
      PYTHON:
        "import sys\ns = sys.stdin.read()\nif s.endswith(\"\\n\"):\n    s = s[:-1]\nseen = {}\nstart = 0\nbest = 0\nfor i, c in enumerate(s):\n    if c in seen and seen[c] >= start:\n        start = seen[c] + 1\n    seen[c] = i\n    best = max(best, i - start + 1)\nprint(best)\n",
      JAVASCRIPT:
        "const s = require('fs').readFileSync(0, 'utf8').replace(/\\r?\\n$/, '');\nconst seen = new Map();\nlet start = 0, best = 0;\nfor (let i = 0; i < s.length; i++) {\n  const c = s[i];\n  if (seen.has(c) && seen.get(c) >= start) start = seen.get(c) + 1;\n  seen.set(c, i);\n  best = Math.max(best, i - start + 1);\n}\nconsole.log(best);\n",
    },
  },
  {
    slug: "two-sum",
    title: "Two Sum",
    difficulty: "EASY",
    tags: ["Array", "Hash Table"],
    description:
      "Given an array of integers **nums** and an integer **target**, print the indices of the two numbers such that they add up to **target**. Exactly one solution exists; print the two 0-based indices in the order they are found (earlier index first), separated by a space.",
    constraints: "2 <= n <= 100000; -1000000000 <= nums[i], target <= 1000000000",
    examples: [
      { input: "4\n2 7 11 15\n9", output: "0 1", explanation: "nums[0] + nums[1] = 2 + 7 = 9." },
    ],
    testcases: [
      { input: "4\n2 7 11 15\n9", output: "0 1" },
      { input: "3\n3 2 4\n6", output: "1 2" },
      { input: "2\n3 3\n6", output: "0 1" },
      { input: "6\n-3 4 3 90 -1 0\n0", output: "0 2" },
    ],
    codeSnippets: {
      PYTHON:
        "import sys\ndata = sys.stdin.read().split('\\n')\nn = int(data[0])\nnums = list(map(int, data[1].split()))\ntarget = int(data[2])\n# print(...)\n",
      JAVASCRIPT:
        "const lines = require('fs').readFileSync(0, 'utf8').split('\\n');\nconst n = Number(lines[0]);\nconst nums = lines[1].trim().split(/\\s+/).map(Number);\nconst target = Number(lines[2]);\n// console.log(...);\n",
    },
    referenceSolutions: {
      PYTHON:
        "import sys\ndata = sys.stdin.read().split('\\n')\nn = int(data[0])\nnums = list(map(int, data[1].split()))\ntarget = int(data[2])\nseen = {}\nfor i, v in enumerate(nums):\n    comp = target - v\n    if comp in seen:\n        print(seen[comp], i)\n        break\n    seen[v] = i\n",
      JAVASCRIPT:
        "const lines = require('fs').readFileSync(0, 'utf8').split('\\n');\nconst n = Number(lines[0]);\nconst nums = lines[1].trim().split(/\\s+/).map(Number);\nconst target = Number(lines[2]);\nconst seen = new Map();\nfor (let i = 0; i < nums.length; i++) {\n  const comp = target - nums[i];\n  if (seen.has(comp)) { console.log(seen.get(comp), i); break; }\n  seen.set(nums[i], i);\n}\n",
    },
  },
  {
    slug: "three-sum",
    title: "Three Sum",
    difficulty: "MEDIUM",
    tags: ["Array", "Two Pointers", "Sorting"],
    description:
      "Given an array of integers **nums**, print all unique triplets `[a, b, c]` such that `a + b + c = 0`. Each triplet should be printed on its own line as three space-separated integers, sorted in ascending order within the triplet, and triplets sorted lexicographically. If no triplet exists, print `None`.",
    constraints: "0 <= n <= 3000; -100000 <= nums[i] <= 100000",
    examples: [
      {
        input: "6\n-1 0 1 2 -1 -4",
        output: "-1 -1 2\n-1 0 1",
        explanation: "The two triplets that sum to 0 are (-1, -1, 2) and (-1, 0, 1).",
      },
    ],
    testcases: [
      { input: "6\n-1 0 1 2 -1 -4", output: "-1 -1 2\n-1 0 1" },
      { input: "3\n0 1 1", output: "None" },
      { input: "3\n0 0 0", output: "0 0 0" },
      { input: "5\n-2 0 1 1 2", output: "-2 0 2\n-2 1 1" },
    ],
    codeSnippets: {
      PYTHON: "import sys\ndata = sys.stdin.read().split('\\n')\nn = int(data[0])\nnums = list(map(int, data[1].split()))\n# print(...)\n",
      JAVASCRIPT:
        "const lines = require('fs').readFileSync(0, 'utf8').split('\\n');\nconst n = Number(lines[0]);\nconst nums = lines[1].trim().split(/\\s+/).map(Number);\n// console.log(...);\n",
    },
    referenceSolutions: {
      PYTHON:
        "import sys\ndata = sys.stdin.read().split('\\n')\nn = int(data[0])\nnums = sorted(map(int, data[1].split()))\nres = []\nfor i in range(len(nums)):\n    if i > 0 and nums[i] == nums[i - 1]:\n        continue\n    l, r = i + 1, len(nums) - 1\n    while l < r:\n        s = nums[i] + nums[l] + nums[r]\n        if s == 0:\n            res.append((nums[i], nums[l], nums[r]))\n            l += 1\n            r -= 1\n            while l < r and nums[l] == nums[l - 1]:\n                l += 1\n            while l < r and nums[r] == nums[r + 1]:\n                r -= 1\n        elif s < 0:\n            l += 1\n        else:\n            r -= 1\nprint('\\n'.join(f\"{a} {b} {c}\" for a, b, c in res) if res else \"None\")\n",
      JAVASCRIPT:
        "const lines = require('fs').readFileSync(0, 'utf8').split('\\n');\nconst n = Number(lines[0]);\nconst nums = lines[1].trim().split(/\\s+/).map(Number).sort((a, b) => a - b);\nconst res = [];\nfor (let i = 0; i < nums.length; i++) {\n  if (i > 0 && nums[i] === nums[i - 1]) continue;\n  let l = i + 1, r = nums.length - 1;\n  while (l < r) {\n    const s = nums[i] + nums[l] + nums[r];\n    if (s === 0) {\n      res.push(`${nums[i]} ${nums[l]} ${nums[r]}`);\n      l++; r--;\n      while (l < r && nums[l] === nums[l - 1]) l++;\n      while (l < r && nums[r] === nums[r + 1]) r--;\n    } else if (s < 0) l++;\n    else r--;\n  }\n}\nconsole.log(res.length ? res.join('\\n') : \"None\");\n",
    },
  },
  {
    slug: "kth-largest-element",
    title: "Kth Largest Element",
    difficulty: "MEDIUM",
    tags: ["Array", "Sorting", "Heap"],
    description:
      "Given an array of integers **nums** and an integer **k**, print the **k-th largest** element in the array (k = 1 means the largest element).",
    constraints: "1 <= k <= n <= 100000; -1000000000 <= nums[i] <= 1000000000",
    examples: [
      { input: "6\n3 2 1 5 6 4\n2", output: "5", explanation: "Sorted descending: 6 5 4 3 2 1 — the 2nd largest is 5." },
    ],
    testcases: [
      { input: "6\n3 2 1 5 6 4\n2", output: "5" },
      { input: "9\n3 2 3 1 2 4 5 5 6\n4", output: "4" },
      { input: "1\n1\n1", output: "1" },
      { input: "5\n7 7 7 7 7\n3", output: "7" },
      { input: "5\n-1 -2 -3 -4 -5\n1", output: "-1" },
    ],
    codeSnippets: {
      PYTHON:
        "import sys\ndata = sys.stdin.read().split('\\n')\nn = int(data[0])\nnums = list(map(int, data[1].split()))\nk = int(data[2])\n# print(...)\n",
      JAVASCRIPT:
        "const lines = require('fs').readFileSync(0, 'utf8').split('\\n');\nconst n = Number(lines[0]);\nconst nums = lines[1].trim().split(/\\s+/).map(Number);\nconst k = Number(lines[2]);\n// console.log(...);\n",
    },
    referenceSolutions: {
      PYTHON:
        "import sys\ndata = sys.stdin.read().split('\\n')\nn = int(data[0])\nnums = list(map(int, data[1].split()))\nk = int(data[2])\nnums.sort(reverse=True)\nprint(nums[k - 1])\n",
      JAVASCRIPT:
        "const lines = require('fs').readFileSync(0, 'utf8').split('\\n');\nconst n = Number(lines[0]);\nconst nums = lines[1].trim().split(/\\s+/).map(Number);\nconst k = Number(lines[2]);\nnums.sort((a, b) => b - a);\nconsole.log(nums[k - 1]);\n",
    },
  },
  {
    slug: "fibonacci-number",
    title: "Fibonacci Number",
    difficulty: "EASY",
    tags: ["Math", "Dynamic Programming"],
    description: "Given **n**, print the n-th Fibonacci number where F(0) = 0, F(1) = 1.",
    constraints: "0 <= n <= 45",
    examples: [{ input: "10", output: "55", explanation: "F(10) = 55." }],
    testcases: [
      { input: "0", output: "0" },
      { input: "1", output: "1" },
      { input: "2", output: "1" },
      { input: "10", output: "55" },
      { input: "20", output: "6765" },
      { input: "45", output: "1134903170" },
    ],
    codeSnippets: {
      PYTHON: "n = int(input())\n# print(...)\n",
      JAVASCRIPT: "const n = Number(require('fs').readFileSync(0, 'utf8').replace(/\\r?\\n$/, ''));\n// console.log(...);\n",
    },
    referenceSolutions: {
      PYTHON: "n = int(input())\na, b = 0, 1\nfor _ in range(n):\n    a, b = b, a + b\nprint(a)\n",
      JAVASCRIPT:
        "const n = Number(require('fs').readFileSync(0, 'utf8').replace(/\\r?\\n$/, ''));\nlet a = 0, b = 1;\nfor (let i = 0; i < n; i++) { [a, b] = [b, a + b]; }\nconsole.log(a);\n",
    },
  },
];

async function main() {
  const password = await bcrypt.hash("Admin@12345", 12);
  const admin = await db.user.upsert({
    where: { email: adminEmail },
    update: { role: "ADMIN" },
    create: { email: adminEmail, name: "CodeArena Admin", username: "admin", role: "ADMIN", password, emailVerified: true },
  });

  const deleted = await db.problem.deleteMany({});

  for (const p of PROBLEMS) {
    await db.problem.create({ data: { ...p, published: true, authorId: admin.id } });
  }

  const count = await db.problem.count();
  console.log(`Deleted ${deleted.count} existing problem(s). Inserted ${PROBLEMS.length} problem(s). Total problems in DB: ${count}`);
}

main()
  .then(() => db.$disconnect())
  .catch((e) => {
    console.error("Reset failed:", e);
    return db.$disconnect().finally(() => process.exit(1));
  });
