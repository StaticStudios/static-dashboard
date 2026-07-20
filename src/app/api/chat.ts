import { apiFetch } from "./client";
import type { ChatLogEntry, Page } from "./types";

export function fetchChatHistory(opts: {
  page?: number;
  limit?: number;
  serverGroups?: string[];
  senders?: string[];
  from?: number;
  to?: number;
} = {}) {
  return apiFetch<Page<ChatLogEntry>>("/api/v1/internal/chatlogs/chat", {
    page: opts.page,
    limit: opts.limit,
    serverGroups: opts.serverGroups,
    users: opts.senders,
    from: opts.from,
    to: opts.to,
  });
}

export async function fetchServerGroups(): Promise<string[]> {
  const groups = await apiFetch<(string | null)[]>("/api/v1/internal/chatlogs/server-groups");
  return groups.filter((g): g is string => g != null);
}

export function fetchChatUsers(query?: string, limit?: number): Promise<string[]> {
  return apiFetch<string[]>("/api/v1/internal/chatlogs/users", { query, limit });
}
