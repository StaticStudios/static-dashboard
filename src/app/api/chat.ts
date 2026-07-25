import {apiFetch} from "./client";
import type {ChatLogEntry, CursorPage, Page} from "./types";

export function fetchChatHistory(opts: {
  page?: number;
  limit?: number;
  serverGroups?: string[];
  senders?: string[];
  from?: number;
  to?: number;
  includeDms?: boolean;
} = {}) {
  return apiFetch<Page<ChatLogEntry>>("/api/v1/internal/chatlogs/chat", {
    page: opts.page,
    limit: opts.limit,
    serverGroups: opts.serverGroups,
    users: opts.senders,
    from: opts.from,
    to: opts.to,
    includeDms: opts.includeDms,
  });
}

export function fetchChatCursor(opts: {
  anchorId?: string;
  beforeId?: string;
  afterId?: string;
  limit?: number;
  serverGroups?: string[];
  senders?: string[];
  from?: number;
  to?: number;
  includeDms?: boolean;
}) {
  return apiFetch<CursorPage<ChatLogEntry>>("/api/v1/internal/chatlogs/chat/cursor", {
    anchorId: opts.anchorId,
    beforeId: opts.beforeId,
    afterId: opts.afterId,
    limit: opts.limit,
    serverGroups: opts.serverGroups,
    users: opts.senders,
    from: opts.from,
    to: opts.to,
    includeDms: opts.includeDms,
  });
}

export async function fetchServerGroups(): Promise<string[]> {
  const groups = await apiFetch<(string | null)[]>("/api/v1/internal/chatlogs/server-groups");
  return groups.filter((g): g is string => g != null);
}

export function fetchChatUsers(query?: string, limit?: number): Promise<string[]> {
  return apiFetch<string[]>("/api/v1/internal/chatlogs/users", { query, limit });
}
