import {apiFetch, apiSend} from "./client";
import type {
  Page,
  PlayerPurchase,
  PlayerStoreSummary,
  StoreInfo,
  StorePayment,
  StoreSummary,
} from "./types";

/**
 * The Tebex store, proxied by static-api so the store secret never reaches the browser. Every
 * endpoint here is gated to DEVELOPER and above on the API side.
 */

export function fetchStoreInfo() {
  return apiFetch<StoreInfo>("/api/v1/internal/store/info");
}

export function fetchStorePayments(opts: { page?: number; limit?: number } = {}) {
  return apiFetch<Page<StorePayment>>("/api/v1/internal/store/payments", {
    page: opts.page,
    limit: opts.limit,
  });
}

export function fetchStoreSummary(opts: { days?: number } = {}) {
  return apiFetch<StoreSummary>("/api/v1/internal/store/summary", { days: opts.days });
}

/** Drops the API's cached Tebex reads so the next fetch goes upstream. Backs the Refresh button. */
export function refreshStore() {
  return apiSend<void>("/api/v1/internal/store/refresh", "POST");
}

export function fetchPlayerStoreSummary(id: string) {
  return apiFetch<PlayerStoreSummary>(`/api/v1/internal/players/${id}/store/summary`);
}

export function fetchPlayerStorePurchases(id: string, opts: { page?: number; limit?: number } = {}) {
  return apiFetch<Page<PlayerPurchase>>(`/api/v1/internal/players/${id}/store/purchases`, {
    page: opts.page,
    limit: opts.limit,
  });
}
