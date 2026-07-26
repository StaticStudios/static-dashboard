import {apiFetch} from "./client";
import type {AuditAction, ConversationBlock, Page, PlayerAlt, PlayerProfile, PlayerSummary} from "./types";

export function fetchPlayers(query?: string, limit = 50) {
  return apiFetch<PlayerSummary[]>("/api/v1/internal/players", { query, limit });
}

export function fetchPlayerProfile(id: string) {
  return apiFetch<PlayerProfile>(`/api/v1/internal/players/${id}`);
}

export function fetchPlayerActions(
  id: string,
  opts: { actionId?: string; from?: number; to?: number; page?: number; limit?: number } = {}
) {
  return apiFetch<Page<AuditAction>>(`/api/v1/internal/players/${id}/actions`, {
    actionId: opts.actionId,
    from: opts.from,
    to: opts.to,
    page: opts.page,
    limit: opts.limit,
  });
}

export function fetchPlayerActionIds(id: string) {
  return apiFetch<string[]>(`/api/v1/internal/players/${id}/action-ids`);
}

export function fetchPlayerAlts(id: string, days = 30) {
  return apiFetch<PlayerAlt[]>(`/api/v1/internal/players/${id}/alts`, { days });
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
