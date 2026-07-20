import { apiFetch } from "./client";
import type { MeResponse } from "./types";

/** The currently-authenticated user (Discord identity + linked Minecraft player/skin, if any). */
export function fetchMe() {
  return apiFetch<MeResponse>("/api/v1/internal/me");
}
