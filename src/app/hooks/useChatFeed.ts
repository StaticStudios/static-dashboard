import {useEffect, useRef, useState} from "react";
import {fetchChatCursor, fetchChatHistory} from "../api/chat";
import {connectChatSocket} from "../api/websocket";
import type {ChatLogEntry} from "../api/types";

export interface ChatFeedFilters {
  senders?: string[];
  serverGroups?: string[];
  from?: number;
  to?: number;
  limit?: number;
  includeDms?: boolean;
  /** When set, the feed seeds around this message id and supports paging in both directions. */
  anchorId?: string;
}

function matchesFilters(m: ChatLogEntry, filters: ChatFeedFilters): boolean {
  if (filters.senders?.length && !filters.senders.includes(m.senderName)) return false;
  const isDm = m.type === "private_message";
  if (filters.serverGroups?.length) {
    const inGroup = m.serverGroup != null && filters.serverGroups.includes(m.serverGroup);
    if (!inGroup && !(filters.includeDms && isDm)) return false;
  } else if (filters.includeDms && !isDm) {
    return false;
  }
  const ts = new Date(m.timestamp).getTime();
  if (filters.from != null && ts < filters.from) return false;
  if (filters.to != null && ts > filters.to) return false;
  return true;
}

export function useChatFeed(filters: ChatFeedFilters = {}) {
  const limit = filters.limit ?? 50;
  const anchored = filters.anchorId != null;
  // Key the refetch effect on the filters' content rather than their identity, so callers
  // don't need to memoize the filters object themselves.
  const filterKey = JSON.stringify(filters);

  const [messages, setMessages] = useState<ChatLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [hasNewer, setHasNewer] = useState(false);

  const seenIds = useRef(new Set<string>());
  const pageRef = useRef(0);
  const messagesRef = useRef<ChatLogEntry[]>([]);
  messagesRef.current = messages;
  const filtersRef = useRef(filters);
  filtersRef.current = filters;
  // True once an anchored feed has paged forward to the live edge (no more "newer" messages);
  // gates whether live socket messages get appended automatically. Non-anchored feeds are
  // always considered caught up, matching today's always-live behavior.
  const caughtUpRef = useRef(!anchored);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    seenIds.current = new Set();
    pageRef.current = 0;
    caughtUpRef.current = !anchored;

    if (anchored) {
      fetchChatCursor({...filters, limit}).then((page) => {
        if (cancelled) return;
        page.content.forEach((m) => seenIds.current.add(m.id));
        setMessages(page.content);
        setHasMore(page.hasBefore);
        setHasNewer(page.hasAfter);
        caughtUpRef.current = !page.hasAfter;
        setLoading(false);
      });
    } else {
      fetchChatHistory({...filters, page: 0, limit}).then((page) => {
        if (cancelled) return;
        // API returns newest-first; reverse so the feed reads oldest -> newest, top to bottom.
        const history = [...page.content].reverse();
        history.forEach((m) => seenIds.current.add(m.id));
        setMessages(history);
        setHasMore(!page.last);
        setHasNewer(false);
        setLoading(false);
      });
    }

    const disconnect = connectChatSocket((entry) => {
      if (seenIds.current.has(entry.id)) return;
      if (!matchesFilters(entry, filtersRef.current)) return;
      if (!caughtUpRef.current) return;
      seenIds.current.add(entry.id);
      setMessages((prev) => [...prev, entry]);
    });

    return () => {
      cancelled = true;
      disconnect();
    };
    // filterKey mirrors the content of `filters`; `limit`/`anchored` are derived from it too.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterKey, limit, anchored]);

  const loadOlder = async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    if (anchored) {
      const oldest = messagesRef.current[0];
      const page = await fetchChatCursor({...filtersRef.current, beforeId: oldest.id, anchorId: undefined, limit});
      const older = page.content.filter((m) => !seenIds.current.has(m.id));
      older.forEach((m) => seenIds.current.add(m.id));
      setMessages((prev) => [...older, ...prev]);
      setHasMore(page.hasBefore);
    } else {
      const nextPage = pageRef.current + 1;
      const page = await fetchChatHistory({...filtersRef.current, page: nextPage, limit});
      const older = [...page.content].reverse().filter((m) => !seenIds.current.has(m.id));
      older.forEach((m) => seenIds.current.add(m.id));
      pageRef.current = nextPage;
      setMessages((prev) => [...older, ...prev]);
      setHasMore(!page.last);
    }
    setLoadingMore(false);
  };

  const loadNewer = async () => {
    if (!anchored || loadingMore || !hasNewer) return;
    setLoadingMore(true);
    const newest = messagesRef.current[messagesRef.current.length - 1];
    const page = await fetchChatCursor({...filtersRef.current, afterId: newest.id, anchorId: undefined, limit});
    const newer = page.content.filter((m) => !seenIds.current.has(m.id));
    newer.forEach((m) => seenIds.current.add(m.id));
    setMessages((prev) => [...prev, ...newer]);
    setHasNewer(page.hasAfter);
    caughtUpRef.current = !page.hasAfter;
    setLoadingMore(false);
  };

  return {messages, loading, loadingMore, hasMore, hasNewer, loadOlder, loadNewer, anchored};
}
