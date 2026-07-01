import { apiFetch } from "./client";
import type { ServerCountType } from "./types";

export function fetchPlayerCount(type: ServerCountType) {
  return apiFetch<number>("/api/v1/public/minecraft/player_count", { type });
}
