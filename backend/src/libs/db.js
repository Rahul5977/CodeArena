import { PrismaClient } from "../generated/prisma/index.js";

// Secret-by-default: these fields are dropped from EVERY query result unless a
// query opts back in with `select: { field: true }` or `omit: { field: false }`.
// A stray `include: { problem: true }` can therefore never ship hidden testcases,
// reference solutions, or per-testcase I/O (which echoes hidden inputs) to a client.
const globalOmit = {
  problem: { testcases: true, referenceSolutions: true },
  submission: { stdin: true, stdout: true, stderr: true },
  testCaseResult: { expected: true, stdout: true, stderr: true },
};

const globalForPrisma = globalThis;
export const db = globalForPrisma.prisma || new PrismaClient({ omit: globalOmit });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
