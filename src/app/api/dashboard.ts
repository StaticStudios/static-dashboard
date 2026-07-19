import { apiFetch } from "./client";
import type { ServerCountType } from "./types";

export function fetchPlayerCount(type: ServerCountType) {
  return apiFetch<number>("/api/v1/public/minecraft/player_count", { type });
}

/** A single point in the server-side rolling player-count history. `network` = proxy-wide total. */
export interface PlayerCountSample {
  time: number;
  network: number;
  skyblock: number;
  prison: number;
}

/**
 * Fetches the rolling player-count history. Pass `since` (epoch millis of the newest point you
 * already have) to get only newer points for delta polling; omit it for the full window.
 */
export function fetchPlayerCountHistory(since?: number) {
  return apiFetch<PlayerCountSample[]>(
    "/api/v1/public/minecraft/player_count/history",
    since !== undefined ? { since } : undefined
  );
}
