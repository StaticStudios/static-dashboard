import {useEffect, useState} from "react";
import {fetchGameplayStatistics, fetchSessionStatistics, fetchStatisticsOverview} from "../api/statistics";
import type {GameplayStatistics, SessionStatistics, StatisticsOverview} from "../api/types";

/**
 * The three Statistics sections, each fetched independently so a slow or failing section does not
 * hold up the rest of the page. The API caches its aggregates, so none of these poll.
 */

export function useStatisticsOverview(days: number) {
  return useSection(fetchStatisticsOverview, days, "Could not load the activity overview.");
}

/** `enabled = false` skips the request, for pages that show this to ADMIN+ only (the API refuses the rest). */
export function useSessionStatistics(days: number, enabled = true) {
  return useSection(fetchSessionStatistics, days, "Could not load session statistics.", enabled);
}

export function useGameplayStatistics(days: number) {
  return useSection(fetchGameplayStatistics, days, "Could not load gameplay statistics.");
}

function useSection<T>(
  fetcher: (opts: { days?: number }) => Promise<T>,
  days: number,
  errorMessage: string,
  enabled = true,
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled) {
      setData(null);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    fetcher({ days })
      .then((result) => {
        if (cancelled) return;
        setData(result);
        setError(null);
      })
      .catch(() => {
        if (cancelled) return;
        setData(null);
        setError(errorMessage);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
    // `fetcher` and `errorMessage` are module-level constants supplied by the wrappers above, so the
    // window and the enabled flag are the only things that can actually change here.
  }, [days, enabled]);

  return { data, loading, error };
}
