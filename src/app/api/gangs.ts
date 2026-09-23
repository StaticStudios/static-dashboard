import {apiFetch} from "./client";
import type {GangProfile, GangSummary} from "./types";

/** Matches gang name or owner name; a blank query returns the gangs with the most points. */
export function fetchGangs(query?: string, limit = 50) {
  return apiFetch<GangSummary[]>("/api/v1/internal/gangs", { query, limit });
}

export function fetchGangProfile(id: string) {
  return apiFetch<GangProfile>(`/api/v1/internal/gangs/${id}`);
}
