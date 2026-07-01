import { useEffect, useState } from "react";
import { fetchChatHistory } from "../api/chat";

export function useChatMessageCount() {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchChatHistory({ limit: 1 }).then((page) => {
      if (!cancelled) setCount(page.totalElements);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return count;
}
