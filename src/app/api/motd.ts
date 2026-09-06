import {apiFetch, apiSend} from "./client";
import type {MotdResponse} from "./types";

export function fetchMotd() {
  return apiFetch<MotdResponse>("/api/v1/internal/motd");
}

/** Renders the given lines on the proxy without saving them. */
export function previewMotd(line1: string, line2: string) {
  return apiSend<MotdResponse>("/api/v1/internal/motd/preview", "POST", { line1, line2 });
}

export function saveMotd(line1: string, line2: string) {
  return apiSend<MotdResponse>("/api/v1/internal/motd", "PUT", { line1, line2 });
}
