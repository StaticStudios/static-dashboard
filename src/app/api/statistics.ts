import {apiFetch} from "./client";
import type {GameplayStatistics, SessionStatistics, StatisticsOverview} from "./types";

/**
 * Network-wide audit-log aggregates. All three are gated to ADMIN and above on the API side, and are
 * cached there for ~60s because each one scans a large table.
 */

export function fetchStatisticsOverview(opts: { days?: number } = {}) {
  return apiFetch<StatisticsOverview>("/api/v1/internal/statistics/overview", { days: opts.days });
}

export function fetchSessionStatistics(opts: { days?: number } = {}) {
  return apiFetch<SessionStatistics>("/api/v1/internal/statistics/sessions", { days: opts.days });
}

export function fetchGameplayStatistics(opts: { days?: number } = {}) {
  return apiFetch<GameplayStatistics>("/api/v1/internal/statistics/gameplay", { days: opts.days });
}
