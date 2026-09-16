import {apiFetch} from "./client";
import type {
    ActionSource,
    AuditAction,
    ConversationBlock,
    Page,
    PlayerAlt,
    PlayerChatTag,
    PlayerProfile,
    PlayerSummary
} from "./types";

export function fetchPlayers(query?: string, limit = 50) {
  return apiFetch<PlayerSummary[]>("/api/v1/internal/players", { query, limit });
}

export function fetchPlayerProfile(id: string) {
  return apiFetch<PlayerProfile>(`/api/v1/internal/players/${id}`);
}

/** `search` matches the JSON payload only; empty `applicationGroup`/`applicationId` means no filter. */
export function fetchPlayerActions(
  id: string,
  opts: {
    actionId?: string;
    search?: string;
    applicationGroup?: string[];
    applicationId?: string[];
    from?: number;
    to?: number;
    page?: number;
    limit?: number;
  } = {}
) {
  return apiFetch<Page<AuditAction>>(`/api/v1/internal/players/${id}/actions`, {
    actionId: opts.actionId,
    search: opts.search,
    applicationGroup: opts.applicationGroup,
    applicationId: opts.applicationId,
    from: opts.from,
    to: opts.to,
    page: opts.page,
    limit: opts.limit,
  });
}

export function fetchPlayerActionIds(id: string) {
  return apiFetch<string[]>(`/api/v1/internal/players/${id}/action-ids`);
}

export function fetchPlayerActionSources(id: string) {
  return apiFetch<ActionSource[]>(`/api/v1/internal/players/${id}/action-sources`);
}

export function fetchPlayerAlts(id: string, days = 30) {
  return apiFetch<PlayerAlt[]>(`/api/v1/internal/players/${id}/alts`, { days });
}

export function fetchPlayerChatTags(id: string) {
  return apiFetch<PlayerChatTag[]>(`/api/v1/internal/players/${id}/chat-tags`);
}

export function fetchPlayerConversations(
  id: string,
  opts: { contextSize?: number; page?: number; limit?: number } = {}
) {
  return apiFetch<Page<ConversationBlock>>(`/api/v1/internal/players/${id}/conversations`, {
    contextSize: opts.contextSize,
    page: opts.page,
    limit: opts.limit,
  });
}
