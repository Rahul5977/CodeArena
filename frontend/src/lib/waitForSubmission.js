import { api } from "./api.js";
import { createSocket } from "./socket.js";

const DISCONNECTED_POLL_MS = 5000;
const GIVE_UP_MS = 20 * 60_000;
const FAILED_MESSAGE = "We couldn't judge this submission. Please try again.";

// Resolves with the verdict of a queued submission: pushed over a socket, or
// read from the API while the socket is down. Rejects with an AbortError if
// `signal` fires.
export function waitForSubmission(id, signal) {
  return new Promise((resolve, reject) => {
    const socket = createSocket();
    let done = false;
    let poll;
    let deadline;

    const onAbort = () => settle(reject, new DOMException("Stopped waiting", "AbortError"));

    function settle(finish, value) {
      if (done) return;
      done = true;
      clearInterval(poll);
      clearTimeout(deadline);
      signal?.removeEventListener("abort", onAbort);
      socket.disconnect();
      finish(value);
    }

    const accept = (job) => {
      if (job.id !== id) return;
      if (job.status === "DONE") settle(resolve, job.result);
      else if (job.status === "FAILED") settle(reject, new Error(FAILED_MESSAGE));
    };

    const check = () =>
      api
        .get(`/submission/jobs/${id}`)
        .then(({ data }) => accept(data.job))
        .catch((e) => {
          if (e.response?.status === 404) settle(reject, new Error(FAILED_MESSAGE));
        });

    signal?.addEventListener("abort", onAbort);
    // The verdict may have landed before the socket was listening, so read it
    // once on every connect. The server joins the user's room before "connect".
    socket.on("connect", check);
    socket.on("submissionResult", accept);
    socket.connect();

    poll = setInterval(() => {
      if (socket.connected) return;
      check().finally(() => {
        // socket.active is false after an auth rejection: Socket.IO won't retry
        // that on its own, and the request above has refreshed the cookie by now.
        if (!done && !socket.connected && !socket.active) socket.connect();
      });
    }, DISCONNECTED_POLL_MS);
    deadline = setTimeout(() => settle(reject, new Error(FAILED_MESSAGE)), GIVE_UP_MS);
  });
}
