import {apiFetch} from "./client";
import type {Page, PunishmentResponse, PunishmentType} from "./types";

export function fetchPunishments(
  opts: {
    page?: number;
    limit?: number;
    type?: PunishmentType[];
    target?: string[];
    targetName?: string;
    issuerName?: string;
    status?: "active" | "expired";
  } = {}
) {
  return apiFetch<Page<PunishmentResponse>>("/api/v1/internal/punishments", {
    page: opts.page,
    limit: opts.limit,
    type: opts.type,
    target: opts.target,
    targetName: opts.targetName,
    issuerName: opts.issuerName,
    status: opts.status,
  });
}

export function fetchPunishment(id: string) {
  return apiFetch<PunishmentResponse>(`/api/v1/internal/punishments/${id}`);
}
