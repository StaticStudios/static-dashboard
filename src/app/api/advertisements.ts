import {apiFetch} from "./client";
import type {AdvertisementStatistics} from "./types";

export function fetchAdvertisementStatistics(days: number, gamemode: string) {
  return apiFetch<AdvertisementStatistics>("/api/v1/internal/statistics/advertisements", { days, gamemode });
}
