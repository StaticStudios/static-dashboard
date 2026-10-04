import {useEffect, useState} from "react";
import {fetchIslandProfile, fetchIslands, fetchIslandValueSink} from "../api/islands";
import type {IslandProfile, IslandSummary, IslandValueSink} from "../api/types";

/** Debounced, server-side island search by island or owner name. Blank query returns the top islands by value. */
export function useIslands(query: string) {
  const [islands, setIslands] = useState<IslandSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    const handle = setTimeout(() => {
      fetchIslands(query)
        .then((list) => {
          if (!cancelled) setIslands(list);
        })
        .catch(() => {
          if (!cancelled) setIslands([]);
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
    }, 250);
    return () => {
      cancelled = true;
      clearTimeout(handle);
    };
  }, [query]);

  return { islands, loading };
}

export function useIslandProfile(id: string | null) {
  const [profile, setProfile] = useState<IslandProfile | null>(null);
  // Starts true when there is an id, so the first render reads as loading rather than "not found".
  const [loading, setLoading] = useState(Boolean(id));

  useEffect(() => {
    if (!id) {
      setProfile(null);
      return;
    }
    let cancelled = false;
    setLoading(true);
    fetchIslandProfile(id)
      .then((p) => {
        if (!cancelled) setProfile(p);
      })
      .catch(() => {
        if (!cancelled) setProfile(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  return { profile, loading };
}

/** Value-sink consumption for an island between two epoch-milli bounds; either may be undefined. */
export function useIslandValueSink(id: string, from: number | undefined, to: number | undefined) {
  const [data, setData] = useState<IslandValueSink | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    // The previous range's data stays up while the next one loads, so the card doesn't collapse.
    setLoading(true);
    fetchIslandValueSink(id, from, to)
      .then((result) => {
        if (cancelled) return;
        setData(result);
        setError(false);
      })
      .catch(() => {
        if (cancelled) return;
        setData(null);
        setError(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id, from, to]);

  return { data, loading, error };
}
