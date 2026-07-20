import { useEffect, useState } from "react";
import { fetchChatUsers } from "../api/chat";

export function useChatUsers(query: string) {
  const [users, setUsers] = useState<string[]>([]);

  useEffect(() => {
    let cancelled = false;
    const handle = setTimeout(() => {
      fetchChatUsers(query || undefined).then((u) => {
        if (!cancelled) setUsers(u);
      });
    }, 250);
    return () => {
      cancelled = true;
      clearTimeout(handle);
    };
  }, [query]);

  return users;
}
