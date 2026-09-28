import {useCallback, useEffect, useState} from "react";
import {fetchSparkReports} from "../api/serverMetrics";
import type {SparkReportSummary} from "../api/types";

/** Reports are rare and take a minute or more to arrive, so this refreshes slower than the metrics. */
const REFRESH_INTERVAL = 30_000;

/**
 * Stored spark reports for one server group, or all when `group` is omitted. Loads on mount, refreshes
 * every 30s, and `reload` refreshes now. A failed refresh keeps the last list and sets `error`.
 */
export function useSparkReports(group?: string, limit = 20) {
  const [reports, setReports] = useState<SparkReportSummary[] | null>(null);
  const [error, setError] = useState(false);
  const [tick, setTick] = useState(0);

  const reload = useCallback(() => setTick((t) => t + 1), []);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const next = await fetchSparkReports(group, limit);
        if (cancelled) return;
        setReports(next);
        setError(false);
      } catch {
        if (!cancelled) setError(true);
      }
    }

    load();
    const id = setInterval(load, REFRESH_INTERVAL);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [group, limit, tick]);

  return { reports, error, reload };
}
