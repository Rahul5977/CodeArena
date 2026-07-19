import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

// Code execution via self-hosted Codebox (Judge0-CE-compatible).
// Same numeric language IDs and submit->poll-by-token model as Judge0; the only
// differences vs the old Sulu/Judge0 lib are the base URL, the X-Auth-Token
// header (Codebox does not read `Authorization: Bearer`), and ≤20 batch chunking.
const BASE = process.env.CODEBOX_API_URL || "http://localhost:3000";
const AUTH = process.env.CODEBOX_AUTH_TOKEN || "";
const authHeaders = AUTH ? { "X-Auth-Token": AUTH } : {};
const BATCH_MAX = 20;

export const getJudge0LanguageId = (language) => {
  const map = { PYTHON: 71, JAVA: 62, JAVASCRIPT: 63, CPP: 54, C: 50 };
  return map[language?.toUpperCase()];
};

export function getLanguageName(languageId) {
  const names = { 71: "Python", 62: "Java", 63: "JavaScript", 54: "C++", 50: "C", 74: "TypeScript" };
  return names[languageId] || "Unknown";
}

const chunk = (arr, n) => Array.from({ length: Math.ceil(arr.length / n) }, (_, i) => arr.slice(i * n, i * n + n));
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Submit a batch of { source_code, language_id, stdin } and return [{ token }, …]
// in the same order. Chunks to Codebox's 20-per-request cap.
export const submitBatch = async (submissions) => {
  const tokens = [];
  for (const group of chunk(submissions, BATCH_MAX)) {
    try {
      const { data } = await axios.post(
        `${BASE}/submissions/batch?base64_encoded=false`,
        { submissions: group },
        { headers: { "Content-Type": "application/json", Accept: "application/json", ...authHeaders } }
      );
      tokens.push(...data); // Codebox returns a bare array of { token }
    } catch (error) {
      console.error("Executor submitBatch error:", error.response?.data || error.message);
      throw new Error(`Executor error: ${error.response?.data?.message || error.message}`);
    }
  }
  return tokens;
};

// Poll until every submission leaves the queued/processing states (status.id 1/2),
// then return the full result objects in order.
//
// Budget: compiled languages (C++/Java) compile ONCE PER TESTCASE and Codebox
// runs them serially, so a MEDIUM/HARD problem with 40–75 testcases can take
// well over a minute end-to-end. We poll for up to ~3 min at a 2s cadence — the
// slower cadence also keeps us under Codebox's request-rate limiter. A transient
// 429 (rate-limit) during a poll is retried, not treated as a hard failure.
export const pollBatchResults = async (tokens) => {
  const maxAttempts = 90; // 90 × 2s ≈ 180s ceiling
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const merged = [];
    try {
      for (const group of chunk(tokens, BATCH_MAX)) {
        const { data } = await axios.get(`${BASE}/submissions/batch`, {
          params: { tokens: group.join(","), base64_encoded: false },
          headers: { Accept: "application/json", ...authHeaders },
        });
        merged.push(...data.submissions);
      }
    } catch (error) {
      // Rate-limited by Codebox — back off and re-poll rather than failing the run.
      if (error.response?.status === 429) {
        await sleep(2000);
        continue;
      }
      console.error("Executor poll error:", error.response?.data || error.message);
      throw new Error(`Failed to get results: ${error.response?.data?.message || error.message}`);
    }

    const done = merged.every((r) => r.status && r.status.id !== 1 && r.status.id !== 2);
    if (done) return merged;
    await sleep(2000);
  }
  throw new Error("Execution timeout - results not available");
};
