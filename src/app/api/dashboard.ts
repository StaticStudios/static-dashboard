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
 * Fetches the player-count history over the last `minutes` (default 5, up to 1440). Pass `since`
 * (epoch millis of the newest point you already have) to get only newer points for delta polling;
 * omit it for the full window. Windows over an hour come back averaged down to 360 points.
 */
export function fetchPlayerCountHistory(opts: { since?: number; minutes?: number } = {}) {
  return apiFetch<PlayerCountSample[]>("/api/v1/public/minecraft/player_count/history", opts);
}
