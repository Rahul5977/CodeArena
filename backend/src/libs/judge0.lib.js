import axios from "axios";
export const getJudge0LanguageId = (Language) => {
  const languageMap = {
    PYTHON: 71,
    JAVA: 62,
    JAVASCRIPT: 63,
    CPP: 54,
  };
  return languageMap[Language.toUpperCase()];
};
export const submitBatch = async (submissions) => {
  const { data } = await axios.post(
    `${process.env.JUDGE0_API_URL}submissions/batch?base64_encoded=false`,
    { submissions },
    {
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${process.env.SULU_API_KEY}`,
      }
    }
  );
  console.log("Submission result: ", data);
  return data; //[{token},{token},{token}]
};
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const pollBatchResults = async (tokens) => {
  while (true) {
    const { data } = await axios.get(`${process.env.JUDGE0_API_URL}/submissions/batch`, {
      params: {
        tokens: tokens.join(","),
        base64_encoded: false,
      },
    });
    const results = data.submissions;
    const isAllDone = results.every((r) => r.status.id !== 1 && r.status !== 2);
    if (isAllDone) return results;
    await sleep(1000);
  }
};
