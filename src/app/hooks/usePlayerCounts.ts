import { useEffect, useState } from "react";
import { fetchPlayerCount } from "../api/dashboard";

export interface PlayerCounts {
  proxy: number;
  skyblock: number;
  prison: number;
}

export function usePlayerCounts() {
  const [counts, setCounts] = useState<PlayerCounts | null>(null);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      fetchPlayerCount("PROXY"),
      fetchPlayerCount("SKYBLOCK"),
      fetchPlayerCount("PRISON"),
    ]).then(([proxy, skyblock, prison]) => {
      if (!cancelled) setCounts({ proxy, skyblock, prison });
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return counts;
}
