import {useEffect, useState} from "react";
import {fetchGangProfile, fetchGangs} from "../api/gangs";
import type {GangProfile, GangSummary} from "../api/types";

/** Debounced, server-side gang search by gang or owner name. Blank query returns the gangs with the most points. */
export function useGangs(query: string) {
  const [gangs, setGangs] = useState<GangSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    const handle = setTimeout(() => {
      fetchGangs(query)
        .then((list) => {
          if (!cancelled) setGangs(list);
        })
        .catch(() => {
          if (!cancelled) setGangs([]);
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

  return { gangs, loading };
}

export function useGangProfile(id: string | null) {
  const [profile, setProfile] = useState<GangProfile | null>(null);
  // Starts true when there is an id, so the first render reads as loading rather than "not found".
  const [loading, setLoading] = useState(Boolean(id));

  useEffect(() => {
    if (!id) {
      setProfile(null);
      return;
    }
    let cancelled = false;
    setLoading(true);
    fetchGangProfile(id)
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
