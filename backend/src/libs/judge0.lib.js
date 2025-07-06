import axios from "axios";
import dotenv from "dotenv";
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
      Authorization: "Bearer REMOVED_SECRET",
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

  try {
    const { data } = await axios.request(options);
    console.log(data);
    return data;
  } catch (error) {
    console.error("Error is runnig submit batch",error);
  }
  // console.log("Submission result: ", data);

  //return data; //[{token},{token},{token}]
};
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const pollBatchResults = async (tokens) => {
  while (true) {
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
    if (isAllDone) return results;
    //await sleep(1000);
  }
};
