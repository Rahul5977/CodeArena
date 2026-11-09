// Small in-process read-through cache. Concurrent misses for a key share one
// load, so a burst of identical reads costs a single query. This is per-process:
// move it to Redis once the API runs as more than one process.
export const createCache = ({ ttlMs, load, maxEntries = 200 }) => {
  const entries = new Map();
  const inFlight = new Map();

  // Always loads. A slow load that finishes after a newer one never overwrites it.
  const refresh = async (key) => {
    const startedAt = Date.now();
    const value = await load(key);
    const current = entries.get(key);
    if (!current || current.startedAt <= startedAt) {
      entries.delete(key); // re-insert so Map order tracks recency for eviction
      entries.set(key, { value, startedAt });
      if (entries.size > maxEntries) entries.delete(entries.keys().next().value);
    }
    return value;
  };

  const get = async (key) => {
    const hit = entries.get(key);
    if (hit && Date.now() - hit.startedAt < ttlMs) return hit.value;
    if (inFlight.has(key)) return inFlight.get(key);
    const pending = refresh(key).finally(() => inFlight.delete(key));
    inFlight.set(key, pending);
    return pending;
  };

  return { get, refresh };
};
