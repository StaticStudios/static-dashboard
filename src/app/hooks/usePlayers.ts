import {useEffect, useState} from "react";
import {
    fetchPlayerActionIds,
    fetchPlayerActions,
    fetchPlayerAlts,
    fetchPlayerProfile,
    fetchPlayers,
} from "../api/players";
import type {AuditAction, PlayerAlt, PlayerProfile, PlayerSummary} from "../api/types";

/** Debounced, server-side player search. Blank query returns the most-recently-seen players. */
export function usePlayers(query: string) {
  const [players, setPlayers] = useState<PlayerSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    const handle = setTimeout(() => {
      fetchPlayers(query)
        .then((list) => {
          if (!cancelled) setPlayers(list);
        })
        .catch(() => {
          if (!cancelled) setPlayers([]);
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

  return { players, loading };
}

export function usePlayerProfile(id: string | null) {
  const [profile, setProfile] = useState<PlayerProfile | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!id) {
      setProfile(null);
      return;
    }
    let cancelled = false;
    setLoading(true);
    fetchPlayerProfile(id)
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

export function usePlayerActions(
  id: string | null,
  filters: { actionId?: string; from?: number; to?: number; page?: number; limit?: number }
) {
  const [actions, setActions] = useState<AuditAction[]>([]);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const { actionId, from, to, page = 1, limit } = filters;

  useEffect(() => {
    if (!id) {
      setActions([]);
      setTotalElements(0);
      setTotalPages(1);
      return;
    }
    let cancelled = false;
    setLoading(true);
    fetchPlayerActions(id, { actionId, from, to, page: page - 1, limit })
      .then((result) => {
        if (cancelled) return;
        setActions(result.content);
        setTotalElements(result.totalElements);
        setTotalPages(Math.max(1, result.totalPages));
      })
      .catch(() => {
        if (!cancelled) {
          setActions([]);
          setTotalElements(0);
          setTotalPages(1);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id, actionId, from, to, page, limit]);

  return { actions, totalElements, totalPages, loading };
}

/** Possible alts: other accounts sharing an IP with this player in the last 7 days. */
export function usePlayerAlts(id: string | null) {
  const [alts, setAlts] = useState<PlayerAlt[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!id) {
      setAlts([]);
      return;
    }
    let cancelled = false;
    setLoading(true);
    fetchPlayerAlts(id)
      .then((list) => {
        if (!cancelled) setAlts(list);
      })
      .catch(() => {
        if (!cancelled) setAlts([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  return { alts, loading };
}

/** Distinct action-ids recorded for a player — used to populate the filter dropdown. */
export function usePlayerActionIds(id: string | null) {
  const [actionIds, setActionIds] = useState<string[]>([]);

  useEffect(() => {
    if (!id) {
      setActionIds([]);
      return;
    }
    let cancelled = false;
    fetchPlayerActionIds(id)
      .then((ids) => {
        if (!cancelled) setActionIds(ids);
      })
      .catch(() => {
        if (!cancelled) setActionIds([]);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  return actionIds;
}
