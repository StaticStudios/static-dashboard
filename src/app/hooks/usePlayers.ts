import {useEffect, useState} from "react";
import {
    fetchPlayerActionIds,
    fetchPlayerActionSources,
    fetchPlayerActions,
    fetchPlayerAlts,
    fetchPlayerChatTags,
    fetchPlayerConversations,
    fetchPlayerProfile,
    fetchPlayers,
} from "../api/players";
import type {
    ActionSource,
    AuditAction,
    ConversationBlock,
    PlayerAlt,
    PlayerChatTag,
    PlayerProfile,
    PlayerSummary
} from "../api/types";

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
  filters: {
    actionId?: string;
    /** Matched against the JSON payload only, server-side. */
    search?: string;
    /** Empty means every group. */
    applicationGroups?: string[];
    /** Empty means every server. */
    applicationIds?: string[];
    from?: number;
    to?: number;
    page?: number;
    limit?: number;
  }
) {
  const [actions, setActions] = useState<AuditAction[]>([]);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const { actionId, search, applicationGroups, applicationIds, from, to, page = 1, limit } = filters;

  // The effect below depends on primitives only: the caller passes fresh array literals every
  // render, so depending on the arrays directly would refetch forever.
  const groupKey = (applicationGroups ?? []).join(",");
  const idKey = (applicationIds ?? []).join(",");

  useEffect(() => {
    if (!id) {
      setActions([]);
      setTotalElements(0);
      setTotalPages(1);
      return;
    }
    let cancelled = false;
    setLoading(true);
    fetchPlayerActions(id, {
      actionId,
      search,
      applicationGroup: applicationGroups,
      applicationId: applicationIds,
      from,
      to,
      page: page - 1,
      limit,
    })
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
    // groupKey/idKey stand in for the arrays: they change exactly when the contents do, so the
    // arrays captured above are never stale.
  }, [id, actionId, search, groupKey, idKey, from, to, page, limit]);

  return { actions, totalElements, totalPages, loading };
}

/** Possible alts: other accounts sharing an IP with this player within the given lookback window. */
export function usePlayerAlts(id: string | null, days = 30) {
  const [alts, setAlts] = useState<PlayerAlt[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!id) {
      setAlts([]);
      return;
    }
    let cancelled = false;
    setLoading(true);
    fetchPlayerAlts(id, days)
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
  }, [id, days]);

  return { alts, loading };
}

/** Every active chat tag this player owns, across all gamemodes, newest parse from the proxy. */
export function usePlayerChatTags(id: string | null) {
  const [chatTags, setChatTags] = useState<PlayerChatTag[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!id) {
      setChatTags([]);
      return;
    }
    let cancelled = false;
    setLoading(true);
    fetchPlayerChatTags(id)
      .then((list) => {
        if (!cancelled) setChatTags(list);
      })
      .catch(() => {
        if (!cancelled) setChatTags([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  return { chatTags, loading };
}

/** Recent Conversations: paginated context windows around every message this player sent/received. */
export function usePlayerConversations(
  id: string | null,
  filters: { contextSize: number; page?: number; limit?: number }
) {
  const [blocks, setBlocks] = useState<ConversationBlock[]>([]);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const { contextSize, page = 1, limit } = filters;

  useEffect(() => {
    if (!id) {
      setBlocks([]);
      setTotalElements(0);
      setTotalPages(1);
      return;
    }
    let cancelled = false;
    setLoading(true);
    fetchPlayerConversations(id, { contextSize, page: page - 1, limit })
      .then((result) => {
        if (cancelled) return;
        setBlocks(result.content);
        setTotalElements(result.totalElements);
        setTotalPages(Math.max(1, result.totalPages));
      })
      .catch(() => {
        if (!cancelled) {
          setBlocks([]);
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
  }, [id, contextSize, page, limit]);

  return { blocks, totalElements, totalPages, loading };
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

/** Every server-group / server pair this player has audit entries from, for the audit log filters. */
export function usePlayerActionSources(id: string | null) {
  const [sources, setSources] = useState<ActionSource[]>([]);

  useEffect(() => {
    if (!id) {
      setSources([]);
      return;
    }
    let cancelled = false;
    fetchPlayerActionSources(id)
      .then((list) => {
        if (!cancelled) setSources(list);
      })
      .catch(() => {
        if (!cancelled) setSources([]);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  return sources;
}
