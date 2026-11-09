import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { api } from "./api.js";

const DISCONNECTED_POLL_MS = 30000;
const OWN_RANK_POLL_MS = 30000;

// A contest's leaderboard: fetched once when finished, and pushed over
// Socket.IO while live. Falls back to slow polling if the socket is down.
export function useContestBoard(id, live) {
  const [board, setBoard] = useState({ rows: null, truncated: false });
  const [loadFailed, setLoadFailed] = useState(false);

  useEffect(() => {
    let active = true;
    let newest = 0;

    const apply = ({ leaderboard, truncated, generatedAt }) => {
      // A REST response can land after a newer push; never go backwards.
      if (!active || generatedAt < newest) return;
      newest = generatedAt;
      setBoard({ rows: leaderboard || [], truncated: !!truncated });
      setLoadFailed(false);
    };

    // On failure keep whatever is on screen rather than blanking the board.
    const fetchBoard = () =>
      api
        .get(`/contests/${id}/leaderboard`)
        .then(({ data }) => apply(data))
        .catch(() => active && setLoadFailed(true));

    if (!live) {
      fetchBoard();
      return () => {
        active = false;
      };
    }

    const socket = io(import.meta.env.VITE_WS_URL || undefined, { withCredentials: true, autoConnect: false });
    // Rooms don't survive a reconnect, so re-join every time. Read the board only
    // after the join is acknowledged, so no update can fall between the two.
    socket.on("connect", () => socket.emit("joinContest", id, () => fetchBoard()));
    socket.on("leaderboardUpdate", apply);

    // Fetching first lets the API client refresh an expired access cookie, which
    // the socket handshake can't do for itself.
    fetchBoard().finally(() => active && socket.connect());

    const fallback = setInterval(() => {
      if (socket.connected) return;
      fetchBoard().finally(() => {
        // socket.active is false after an auth rejection: Socket.IO won't retry
        // that on its own, and the fetch above has refreshed the cookie by now.
        if (active && !socket.connected && !socket.active) socket.connect();
      });
    }, DISCONNECTED_POLL_MS);

    return () => {
      active = false;
      clearInterval(fallback);
      socket.disconnect();
    };
  }, [id, live]);

  return { ...board, loadFailed };
}

// The viewer's own row, needed only when the capped board doesn't include them.
export function useOwnContestRank(id, live, needed) {
  const [entry, setEntry] = useState(null);

  useEffect(() => {
    if (!needed) {
      setEntry(null);
      return undefined;
    }
    let active = true;
    const load = () =>
      api
        .get(`/contests/${id}/leaderboard/me`)
        .then(({ data }) => active && setEntry(data.entry))
        .catch(() => {});
    load();
    const timer = live ? setInterval(load, OWN_RANK_POLL_MS) : null;
    return () => {
      active = false;
      if (timer) clearInterval(timer);
    };
  }, [id, live, needed]);

  return entry;
}
