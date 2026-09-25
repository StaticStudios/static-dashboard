import { useEffect, useState } from "react";
import { fetchPlayerCount } from "../api/dashboard";

export interface PlayerCounts {
  proxy: number;
  skyblock: number;
  prison: number;
}

/** Poll interval in milliseconds, matching the player-count history chart. */
const POLL_INTERVAL = 10_000;

/** Fetches the live online counts on mount, then re-polls every 10s. */
export function usePlayerCounts() {
  const [counts, setCounts] = useState<PlayerCounts | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function poll() {
      try {
        const [proxy, skyblock, prison] = await Promise.all([
          fetchPlayerCount("PROXY"),
          fetchPlayerCount("SKYBLOCK"),
          fetchPlayerCount("PRISON"),
        ]);
        if (!cancelled) setCounts({ proxy, skyblock, prison });
      } catch {
        // Transient error — keep the last counts and retry on the next tick.
      }
    }

    poll();
    const id = setInterval(poll, POLL_INTERVAL);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  return counts;
}
