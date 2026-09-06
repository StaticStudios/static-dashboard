import {useEffect, useState} from "react";
import {fetchMotd} from "../api/motd";
import type {MotdResponse} from "../api/types";

/** The motd currently served by the proxy, fetched once on mount. */
export function useMotd() {
  const [motd, setMotd] = useState<MotdResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchMotd()
      .then((data) => {
        if (!cancelled) setMotd(data);
      })
      .catch(() => {
        if (!cancelled) setError("Could not load the current MOTD.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return { motd, loading, error };
}
