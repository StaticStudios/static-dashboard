import {apiFetch} from "./client";
import type {IslandProfile, IslandSummary, IslandValueSink} from "./types";

/** Matches island name or owner name; a blank query returns the most valuable islands. */
export function fetchIslands(query?: string, limit = 50) {
  return apiFetch<IslandSummary[]>("/api/v1/internal/islands", { query, limit });
}

export function fetchIslandProfile(id: string) {
  return apiFetch<IslandProfile>(`/api/v1/internal/islands/${id}`);
}

/** `from`/`to` are epoch millis; leaving one out leaves that end of the range open. */
export function fetchIslandValueSink(id: string, from?: number, to?: number) {
  return apiFetch<IslandValueSink>(`/api/v1/internal/islands/${id}/value-sink`, { from, to });
}
