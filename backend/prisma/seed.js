// CodeArena seed — an admin user + a handful of starter problems so the
// platform isn't empty for v0.1. Reference solutions read stdin and print
// stdout (the stdin/stdout judge contract). Run: `node prisma/seed.js`.
import "dotenv/config";
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
  {
    slug: "even-or-odd",
    title: "Even or Odd",
    difficulty: "EASY",
    tags: ["Math"],
    description: "Given an integer **n**, print `Even` if it is divisible by 2, otherwise print `Odd`.",
    constraints: "-1000000000 <= n <= 1000000000",
    examples: [{ input: "4", output: "Even", explanation: "4 is divisible by 2." }],
    testcases: [
      { input: "4", output: "Even" },
      { input: "7", output: "Odd" },
      { input: "0", output: "Even" },
      { input: "-3", output: "Odd" },
    ],
    codeSnippets: {
      PYTHON: "n = int(input())\n# print(...)\n",
      JAVASCRIPT: "const n = Number(require('fs').readFileSync(0, 'utf8').trim());\n// console.log(...);\n",
    },
    referenceSolutions: {
      PYTHON: "n = int(input())\nprint(\"Even\" if n % 2 == 0 else \"Odd\")\n",
      JAVASCRIPT: "const n = Number(require('fs').readFileSync(0, 'utf8').trim());\nconsole.log(n % 2 === 0 ? \"Even\" : \"Odd\");\n",
    },
  },
  {
    slug: "sum-1-to-n",
    title: "Sum 1..N",
    difficulty: "EASY",
    tags: ["Math"],
    description: "Given a positive integer **n**, print the sum 1 + 2 + ... + n.",
    constraints: "1 <= n <= 100000",
    examples: [{ input: "5", output: "15", explanation: "1 + 2 + 3 + 4 + 5 = 15." }],
    testcases: [
      { input: "1", output: "1" },
      { input: "5", output: "15" },
      { input: "10", output: "55" },
      { input: "100", output: "5050" },
    ],
    codeSnippets: {
      PYTHON: "n = int(input())\n# print(...)\n",
      JAVASCRIPT: "const n = Number(require('fs').readFileSync(0, 'utf8').trim());\n// console.log(...);\n",
    },
    referenceSolutions: {
      PYTHON: "n = int(input())\nprint(n * (n + 1) // 2)\n",
      JAVASCRIPT: "const n = Number(require('fs').readFileSync(0, 'utf8').trim());\nconsole.log(n * (n + 1) / 2);\n",
    },
  },
  {
    slug: "count-digits",
    title: "Count Digits",
    difficulty: "EASY",
    tags: ["Math"],
    description: "Given a non-negative integer **n**, print how many digits it has.",
    constraints: "0 <= n <= 1000000000",
    examples: [{ input: "12345", output: "5", explanation: "12345 has 5 digits." }],
    testcases: [
      { input: "5", output: "1" },
      { input: "100", output: "3" },
      { input: "12345", output: "5" },
      { input: "0", output: "1" },
    ],
    codeSnippets: {
      PYTHON: "n = int(input())\n# print(...)\n",
      JAVASCRIPT: "const s = require('fs').readFileSync(0, 'utf8').trim();\n// console.log(...);\n",
    },
    referenceSolutions: {
      PYTHON: "n = int(input())\nprint(len(str(n)))\n",
      JAVASCRIPT: "const s = require('fs').readFileSync(0, 'utf8').trim();\nconsole.log(String(Number(s)).length);\n",
    },
  },
  {
    slug: "celsius-to-fahrenheit",
    title: "Celsius to Fahrenheit",
    difficulty: "EASY",
    tags: ["Math"],
    description: "Given a temperature **C** in Celsius (a multiple of 5), print it in Fahrenheit using F = C * 9 / 5 + 32.",
    constraints: "-1000 <= C <= 1000, and C is a multiple of 5 so the answer is a whole number",
    examples: [{ input: "100", output: "212", explanation: "100 * 9 / 5 + 32 = 212." }],
    testcases: [
      { input: "0", output: "32" },
      { input: "100", output: "212" },
      { input: "25", output: "77" },
      { input: "-40", output: "-40" },
    ],
    codeSnippets: {
      PYTHON: "c = int(input())\n# print(...)\n",
      JAVASCRIPT: "const c = Number(require('fs').readFileSync(0, 'utf8').trim());\n// console.log(...);\n",
    },
    referenceSolutions: {
      PYTHON: "c = int(input())\nprint(c * 9 // 5 + 32)\n",
      JAVASCRIPT: "const c = Number(require('fs').readFileSync(0, 'utf8').trim());\nconsole.log(c * 9 / 5 + 32);\n",
    },
  },
  {
    slug: "largest-of-three",
    title: "Largest of Three",
    difficulty: "EASY",
    tags: ["Math"],
    description: "Given three space-separated integers **a**, **b**, and **c** on one line, print the largest.",
    constraints: "-1000000000 <= a, b, c <= 1000000000",
    examples: [{ input: "3 7 5", output: "7", explanation: "7 is the largest of 3, 7, and 5." }],
    testcases: [
      { input: "3 7 5", output: "7" },
      { input: "10 10 2", output: "10" },
      { input: "-1 -5 -3", output: "-1" },
      { input: "100 200 150", output: "200" },
    ],
    codeSnippets: {
      PYTHON: "a, b, c = map(int, input().split())\n# print(...)\n",
      JAVASCRIPT: "const [a, b, c] = require('fs').readFileSync(0, 'utf8').trim().split(/\\s+/).map(Number);\n// console.log(...);\n",
    },
    referenceSolutions: {
      PYTHON: "a, b, c = map(int, input().split())\nprint(max(a, b, c))\n",
      JAVASCRIPT: "const [a, b, c] = require('fs').readFileSync(0, 'utf8').trim().split(/\\s+/).map(Number);\nconsole.log(Math.max(a, b, c));\n",
    },
  },
  {
    slug: "string-length",
    title: "String Length",
    difficulty: "EASY",
    tags: ["String"],
    description: "Given a single word **s** (no spaces), print the number of characters in it.",
    constraints: "1 <= |s| <= 1000",
    examples: [{ input: "hello", output: "5", explanation: "\"hello\" has 5 characters." }],
    testcases: [
      { input: "hello", output: "5" },
      { input: "CodeArena", output: "9" },
      { input: "a", output: "1" },
      { input: "abcdef", output: "6" },
    ],
    codeSnippets: {
      PYTHON: "s = input().strip()\n# print(...)\n",
      JAVASCRIPT: "const s = require('fs').readFileSync(0, 'utf8').trim();\n// console.log(...);\n",
    },
    referenceSolutions: {
      PYTHON: "s = input().strip()\nprint(len(s))\n",
      JAVASCRIPT: "const s = require('fs').readFileSync(0, 'utf8').trim();\nconsole.log(s.length);\n",
    },
  },
  {
    slug: "power-of-two",
    title: "Power of Two",
    difficulty: "EASY",
    tags: ["Math"],
    description: "Given a positive integer **n**, print `true` if it is a power of two (1, 2, 4, 8, ...), otherwise print `false`.",
    constraints: "1 <= n <= 1000000000",
    examples: [{ input: "8", output: "true", explanation: "8 = 2^3, so it is a power of two." }],
    testcases: [
      { input: "1", output: "true" },
      { input: "16", output: "true" },
      { input: "6", output: "false" },
      { input: "1024", output: "true" },
    ],
    codeSnippets: {
      PYTHON: "n = int(input())\n# print(...)\n",
      JAVASCRIPT: "const n = Number(require('fs').readFileSync(0, 'utf8').trim());\n// console.log(...);\n",
    },
    referenceSolutions: {
      PYTHON: "n = int(input())\nprint(\"true\" if n > 0 and (n & (n - 1)) == 0 else \"false\")\n",
      JAVASCRIPT: "const n = Number(require('fs').readFileSync(0, 'utf8').trim());\nconsole.log(n > 0 && (n & (n - 1)) === 0 ? \"true\" : \"false\");\n",
    },
  },
  {
    slug: "average-of-n-numbers",
    title: "Average of N Numbers",
    difficulty: "EASY",
    tags: ["Array", "Math"],
    description: "The first line has an integer **n**, the second line has **n** space-separated integers. Print their average (the sum is guaranteed to be divisible by n).",
    constraints: "1 <= n <= 1000; the sum of the numbers is divisible by n",
    examples: [{ input: "4\n2 4 6 8", output: "5", explanation: "(2 + 4 + 6 + 8) / 4 = 20 / 4 = 5." }],
    testcases: [
      { input: "4\n2 4 6 8", output: "5" },
      { input: "3\n10 20 30", output: "20" },
      { input: "1\n42", output: "42" },
      { input: "5\n1 2 3 4 5", output: "3" },
    ],
    codeSnippets: {
      PYTHON: "import sys\ndata = sys.stdin.read().split()\nn = int(data[0])\narr = list(map(int, data[1:1+n]))\n# print(...)\n",
      JAVASCRIPT: "const d = require('fs').readFileSync(0, 'utf8').trim().split(/\\s+/).map(Number);\nconst n = d[0];\nconst arr = d.slice(1, 1 + n);\n// console.log(...);\n",
    },
    referenceSolutions: {
      PYTHON: "import sys\nd = sys.stdin.read().split()\nn = int(d[0])\narr = list(map(int, d[1:1+n]))\nprint(sum(arr) // n)\n",
      JAVASCRIPT: "const d = require('fs').readFileSync(0, 'utf8').trim().split(/\\s+/).map(Number);\nconst n = d[0];\nconst arr = d.slice(1, 1 + n);\nconsole.log(arr.reduce((a, b) => a + b, 0) / n);\n",
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
