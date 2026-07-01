import { useEffect, useRef, useState } from "react";
import { fetchChatHistory } from "../api/chat";
import { connectChatSocket } from "../api/websocket";
import type { ChatLogEntry } from "../api/types";

const isPublicMessage = (m: ChatLogEntry) => m.type !== "private_message";

export function useChatFeed(limit = 50) {
  const [messages, setMessages] = useState<ChatLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const seenIds = useRef(new Set<string>());

  useEffect(() => {
    let cancelled = false;

    fetchChatHistory({ limit }).then((page) => {
      if (cancelled) return;
      // API returns newest-first; reverse so the feed reads oldest -> newest, top to bottom.
      const history = [...page.content].reverse().filter(isPublicMessage);
      history.forEach((m) => seenIds.current.add(m.id));
      setMessages(history);
      setLoading(false);
    });

    const disconnect = connectChatSocket((entry) => {
      if (!isPublicMessage(entry) || seenIds.current.has(entry.id)) return;
      seenIds.current.add(entry.id);
      setMessages((prev) => [...prev, entry]);
    });

    return () => {
      cancelled = true;
      disconnect();
    };
  }, [limit]);

  return { messages, loading };
}
