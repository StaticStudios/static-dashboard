import {useEffect, useRef, useState} from "react";
import {fetchChatHistory} from "../api/chat";
import {connectChatSocket} from "../api/websocket";
import type {ChatLogEntry} from "../api/types";

export interface ChatFeedFilters {
  senders?: string[];
  serverGroups?: string[];
  from?: number;
  to?: number;
  limit?: number;
}

function matchesFilters(m: ChatLogEntry, filters: ChatFeedFilters): boolean {
  if (filters.senders?.length && !filters.senders.includes(m.senderName)) return false;
  if (filters.serverGroups?.length && (!m.serverGroup || !filters.serverGroups.includes(m.serverGroup))) return false;
  const ts = new Date(m.timestamp).getTime();
  if (filters.from != null && ts < filters.from) return false;
  if (filters.to != null && ts > filters.to) return false;
  return true;
}

export function useChatFeed(filters: ChatFeedFilters = {}) {
  const limit = filters.limit ?? 50;
  // Key the refetch effect on the filters' content rather than their identity, so callers
  // don't need to memoize the filters object themselves.
  const filterKey = JSON.stringify(filters);

  const [messages, setMessages] = useState<ChatLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);

  const seenIds = useRef(new Set<string>());
  const pageRef = useRef(0);
  const filtersRef = useRef(filters);
  filtersRef.current = filters;

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    seenIds.current = new Set();
    pageRef.current = 0;

    fetchChatHistory({ ...filters, page: 0, limit }).then((page) => {
      if (cancelled) return;
      // API returns newest-first; reverse so the feed reads oldest -> newest, top to bottom.
      const history = [...page.content].reverse();
      history.forEach((m) => seenIds.current.add(m.id));
      setMessages(history);
      setHasMore(!page.last);
      setLoading(false);
    });

    const disconnect = connectChatSocket((entry) => {
      if (seenIds.current.has(entry.id)) return;
      if (!matchesFilters(entry, filtersRef.current)) return;
      seenIds.current.add(entry.id);
      setMessages((prev) => [...prev, entry]);
    });

    return () => {
      cancelled = true;
      disconnect();
    };
    // filterKey mirrors the content of `filters`; `limit` is derived from it too.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterKey, limit]);

  const loadOlder = async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    const nextPage = pageRef.current + 1;
    const page = await fetchChatHistory({ ...filtersRef.current, page: nextPage, limit });
    const older = [...page.content]
      .reverse()
      .filter((m) => !seenIds.current.has(m.id));
    older.forEach((m) => seenIds.current.add(m.id));
    pageRef.current = nextPage;
    setMessages((prev) => [...older, ...prev]);
    setHasMore(!page.last);
    setLoadingMore(false);
  };

  return { messages, loading, loadingMore, hasMore, loadOlder };
}
