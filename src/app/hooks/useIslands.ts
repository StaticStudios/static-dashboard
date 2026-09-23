import {useEffect, useState} from "react";
import {fetchIslandProfile, fetchIslands} from "../api/islands";
import type {IslandProfile, IslandSummary} from "../api/types";

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
