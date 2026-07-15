// CodeArena seed — an admin user + a handful of starter problems so the
// platform isn't empty for v0.1. Reference solutions read stdin and print
// stdout (the stdin/stdout judge contract). Run: `node prisma/seed.js`.
import bcrypt from "bcryptjs";
import { PrismaClient } from "../src/generated/prisma/index.js";

const db = new PrismaClient();
const adminEmail = (process.env.ADMIN_EMAIL || "admin@codearena.local").toLowerCase();

const PROBLEMS = [
  {
    slug: "sum-of-two-numbers",
    title: "Sum of Two Numbers",
    difficulty: "EASY",
    tags: ["Math"],
    description: "You are given two integers **a** and **b**. Print their sum.",
    constraints: "-1000000000 <= a, b <= 1000000000",
    examples: [{ input: "2\n3", output: "5", explanation: "2 + 3 = 5" }],
    testcases: [
      { input: "2\n3", output: "5" },
      { input: "100\n250", output: "350" },
      { input: "-5\n5", output: "0" },
      { input: "0\n0", output: "0" },
    ],
    codeSnippets: {
      PYTHON: "import sys\ndata = sys.stdin.read().split()\n# a, b = int(data[0]), int(data[1])\n# print(...)\n",
      JAVASCRIPT: "const data = require('fs').readFileSync(0, 'utf8').trim().split(/\\s+/).map(Number);\n// const [a, b] = data;\n// console.log(...);\n",
    },
    referenceSolutions: {
      PYTHON: "import sys\na, b = map(int, sys.stdin.read().split())\nprint(a + b)\n",
      JAVASCRIPT: "const [a, b] = require('fs').readFileSync(0, 'utf8').trim().split(/\\s+/).map(Number);\nconsole.log(a + b);\n",
    },
  },
  {
    slug: "maximum-of-array",
    title: "Maximum of an Array",
    difficulty: "EASY",
    tags: ["Array"],
    description: "The first line has an integer **n**, the second line has **n** space-separated integers. Print the maximum.",
    constraints: "1 <= n <= 100000",
    examples: [{ input: "5\n3 1 4 1 5", output: "5", explanation: "The largest value is 5." }],
    testcases: [
      { input: "5\n3 1 4 1 5", output: "5" },
      { input: "3\n-1 -2 -3", output: "-1" },
      { input: "1\n42", output: "42" },
      { input: "4\n7 7 7 7", output: "7" },
    ],
    codeSnippets: {
      PYTHON: "import sys\ndata = sys.stdin.read().split()\nn = int(data[0])\narr = list(map(int, data[1:1+n]))\n# print(...)\n",
      JAVASCRIPT: "const d = require('fs').readFileSync(0, 'utf8').trim().split(/\\s+/).map(Number);\nconst n = d[0];\nconst arr = d.slice(1, 1 + n);\n// console.log(...);\n",
    },
    referenceSolutions: {
      PYTHON: "import sys\nd = sys.stdin.read().split()\nn = int(d[0])\nprint(max(map(int, d[1:1+n])))\n",
      JAVASCRIPT: "const d = require('fs').readFileSync(0, 'utf8').trim().split(/\\s+/).map(Number);\nconst n = d[0];\nconsole.log(Math.max(...d.slice(1, 1 + n)));\n",
    },
  },
  {
    slug: "reverse-a-string",
    title: "Reverse a String",
    difficulty: "EASY",
    tags: ["String"],
    description: "Given a single word **s** (no spaces), print it reversed.",
    constraints: "1 <= |s| <= 1000",
    examples: [{ input: "hello", output: "olleh", explanation: "hello reversed is olleh." }],
    testcases: [
      { input: "hello", output: "olleh" },
      { input: "CodeArena", output: "anerAedoC" },
      { input: "a", output: "a" },
      { input: "racecar", output: "racecar" },
    ],
    codeSnippets: {
      PYTHON: "s = input().strip()\n# print(...)\n",
      JAVASCRIPT: "const s = require('fs').readFileSync(0, 'utf8').trim();\n// console.log(...);\n",
    },
    referenceSolutions: {
      PYTHON: "s = input().strip()\nprint(s[::-1])\n",
      JAVASCRIPT: "const s = require('fs').readFileSync(0, 'utf8').trim();\nconsole.log(s.split('').reverse().join(''));\n",
    },
  },
  {
    slug: "factorial",
    title: "Factorial",
    difficulty: "EASY",
    tags: ["Math"],
    description: "Given a non-negative integer **n**, print **n!** (n factorial).",
    constraints: "0 <= n <= 12",
    examples: [{ input: "5", output: "120", explanation: "5! = 120." }],
    testcases: [
      { input: "5", output: "120" },
      { input: "0", output: "1" },
      { input: "1", output: "1" },
      { input: "10", output: "3628800" },
    ],
    codeSnippets: {
      PYTHON: "n = int(input())\n# print(...)\n",
      JAVASCRIPT: "const n = Number(require('fs').readFileSync(0, 'utf8').trim());\n// console.log(...);\n",
    },
    referenceSolutions: {
      PYTHON: "import math\nprint(math.factorial(int(input())))\n",
      JAVASCRIPT: "let n = Number(require('fs').readFileSync(0, 'utf8').trim());\nlet f = 1;\nfor (let i = 2; i <= n; i++) f *= i;\nconsole.log(f);\n",
    },
  },
  {
    slug: "gcd-of-two-numbers",
    title: "GCD of Two Numbers",
    difficulty: "EASY",
    tags: ["Math"],
    description: "Given two positive integers **a** and **b** on one line, print their greatest common divisor.",
    constraints: "1 <= a, b <= 1000000000",
    examples: [{ input: "12 18", output: "6", explanation: "gcd(12, 18) = 6." }],
    testcases: [
      { input: "12 18", output: "6" },
      { input: "17 5", output: "1" },
      { input: "100 100", output: "100" },
      { input: "1071 462", output: "21" },
    ],
    codeSnippets: {
      PYTHON: "a, b = map(int, input().split())\n# print(...)\n",
      JAVASCRIPT: "const [a, b] = require('fs').readFileSync(0, 'utf8').trim().split(/\\s+/).map(Number);\n// console.log(...);\n",
    },
    referenceSolutions: {
      PYTHON: "import math\na, b = map(int, input().split())\nprint(math.gcd(a, b))\n",
      JAVASCRIPT: "const [a, b] = require('fs').readFileSync(0, 'utf8').trim().split(/\\s+/).map(Number);\nconst g = (x, y) => (y ? g(y, x % y) : x);\nconsole.log(g(a, b));\n",
    },
  },
  {
    slug: "nth-fibonacci",
    title: "Nth Fibonacci Number",
    difficulty: "MEDIUM",
    tags: ["Dynamic Programming", "Math"],
    description: "Given **n**, print the n-th Fibonacci number where F(0) = 0, F(1) = 1.",
    constraints: "0 <= n <= 45",
    examples: [{ input: "10", output: "55", explanation: "F(10) = 55." }],
    testcases: [
      { input: "0", output: "0" },
      { input: "1", output: "1" },
      { input: "10", output: "55" },
      { input: "15", output: "610" },
      { input: "20", output: "6765" },
    ],
    codeSnippets: {
      PYTHON: "n = int(input())\n# print(...)\n",
      JAVASCRIPT: "const n = Number(require('fs').readFileSync(0, 'utf8').trim());\n// console.log(...);\n",
    },
    referenceSolutions: {
      PYTHON: "n = int(input())\na, b = 0, 1\nfor _ in range(n):\n    a, b = b, a + b\nprint(a)\n",
      JAVASCRIPT: "const n = Number(require('fs').readFileSync(0, 'utf8').trim());\nlet a = 0, b = 1;\nfor (let i = 0; i < n; i++) { [a, b] = [b, a + b]; }\nconsole.log(a);\n",
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

  for (const p of PROBLEMS) {
    await db.problem.upsert({
      where: { slug: p.slug },
      update: { ...p, published: true, authorId: admin.id },
      create: { ...p, published: true, authorId: admin.id },
    });
  }

  const count = await db.problem.count();
  console.log(`Seeded admin <${adminEmail}> (password: Admin@12345) + ${PROBLEMS.length} problems. Total problems in DB: ${count}`);
}

main()
  .then(() => db.$disconnect())
  .catch((e) => {
    console.error("Seed failed:", e);
    return db.$disconnect().finally(() => process.exit(1));
  });
