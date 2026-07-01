import { useEffect, useState } from "react";
import { fetchServerGroups } from "../api/chat";

export function useServerGroups() {
  const [groups, setGroups] = useState<string[]>([]);

  useEffect(() => {
    let cancelled = false;
    fetchServerGroups().then((g) => {
      if (!cancelled) setGroups(g);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return groups;
}
