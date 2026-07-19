import { apiFetch } from "./client";
import type { AuditAction, PlayerProfile, PlayerSummary } from "./types";

export function fetchPlayers(query?: string, limit = 50) {
  return apiFetch<PlayerSummary[]>("/api/v1/internal/players", { query, limit });
}

export function fetchPlayerProfile(id: string) {
  return apiFetch<PlayerProfile>(`/api/v1/internal/players/${id}`);
}

export function fetchPlayerActions(
  id: string,
  opts: { actionId?: string; from?: number; to?: number; limit?: number } = {}
) {
  return apiFetch<AuditAction[]>(`/api/v1/internal/players/${id}/actions`, {
    actionId: opts.actionId,
    from: opts.from,
    to: opts.to,
    limit: opts.limit,
  });
}

export function fetchPlayerActionIds(id: string) {
  return apiFetch<string[]>(`/api/v1/internal/players/${id}/action-ids`);
}
