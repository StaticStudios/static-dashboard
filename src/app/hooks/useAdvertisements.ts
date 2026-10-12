import {useEffect, useState} from "react";
import {fetchAdvertisementStatistics} from "../api/advertisements";
import type {AdvertisementStatistics} from "../api/types";

export function useAdvertisementStatistics(days: number, gamemode: string, timeZone: string) {
  const [data, setData] = useState<AdvertisementStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [revision, setRevision] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setData(null);
    setError(null);
    fetchAdvertisementStatistics(days, gamemode, timeZone)
      .then((result) => {
        if (!cancelled) setData(result);
      })
      .catch(() => {
        if (!cancelled) setError("Could not load advertisement statistics.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [days, gamemode, timeZone, revision]);

  return { data, loading, error, reload: () => setRevision((value) => value + 1) };
}
