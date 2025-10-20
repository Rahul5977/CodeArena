import axios from "axios";
import dotenv from "dotenv";

// Test comment - secret issue should be fixed now
dotenv.config();
export const getJudge0LanguageId = (Language) => {
  const languageMap = {
    PYTHON: 71,
    JAVA: 62,
    JAVASCRIPT: 63,
  };
  return languageMap[Language.toUpperCase()];
};
export const submitBatch = async (submissions) => {
  const options = {
    method: "POST",
    url: "https://judge0-ce.p.sulu.sh/submissions/batch",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${process.env.SULU_API_KEY}`,
    },
    data: { submissions },
  };
  // const { data } = await axios.post(

  //   `${process.env.JUDGE0_API_URL}submissions/batch?base64_encoded=false`,
  //   { submissions },
  //   {
  //     headers: {
  //       "Content-Type": "application/json",
  //       Accept: "application/json",
  //       Authorization: `Bearer ${process.env.SULU_API_KEY}`,
  //     },
  //   }
  // );
  //demo
  try {
    const { data } = await axios.request(options);
    console.log("Judge0 batch submission response:", data);
    return data;
  } catch (error) {
    console.error("Error in submitBatch:", error.response?.data || error.message);
    throw new Error(`Judge0 API error: ${error.response?.data?.message || error.message}`);
  }
  // console.log("Submission result: ", data);

  //return data; //[{token},{token},{token}]
};
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const pollBatchResults = async (tokens) => {
  const maxAttempts = 30; // 30 seconds max
  let attempts = 0;

  while (attempts < maxAttempts) {
    try {
      const { data } = await axios.get(`${process.env.JUDGE0_API_URL}/submissions/batch`, {
        params: {
          tokens: tokens.join(","),
          base64_encoded: false,
        },
        headers: {
          Authorization: `Bearer ${process.env.SULU_API_KEY}`,
          Accept: "application/json",
        },
      });

      const results = data.submissions;
      const isAllDone = results.every((r) => r.status.id !== 1 && r.status.id !== 2);

      if (isAllDone) {
        console.log("All submissions completed");
        return results;
      }

      await sleep(1000);
      attempts++;
    } catch (error) {
      console.error("Error polling batch results:", error.response?.data || error.message);
      throw new Error(`Failed to get results: ${error.response?.data?.message || error.message}`);
    }
  }

  throw new Error("Execution timeout - results not available");
};
export function getLanguageName(languageId) {
  const LANGUAGE_NAMES = {
    74: "TypeScript",
    63: "JavaScript",
    71: "Python",
    62: "Java",
  };

  return LANGUAGE_NAMES[languageId] || "Unknown";
}
