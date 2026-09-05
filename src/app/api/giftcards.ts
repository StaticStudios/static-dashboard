import {apiFetch} from "./client";
import type {GiftCardBalanceResponse, GiftCardHistoryEntry, Page} from "./types";

export function fetchPlayerGiftCardBalance(id: string) {
  return apiFetch<GiftCardBalanceResponse>(`/api/v1/internal/players/${id}/giftcards/balance`);
}

export function fetchPlayerGiftCardHistory(id: string, opts: { page?: number; limit?: number } = {}) {
  return apiFetch<Page<GiftCardHistoryEntry>>(`/api/v1/internal/players/${id}/giftcards/history`, {
    page: opts.page,
    limit: opts.limit,
  });
}
