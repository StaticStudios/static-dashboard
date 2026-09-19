import {apiFetch} from "./client";
import type {Page, TicketTranscriptDetail, TicketTranscriptSummary} from "./types";

/** `from`/`to` are epoch millis and bound `closedAt`; `search` matches the ticket's channel name. */
export function fetchTickets(opts: { search?: string; from?: number; to?: number; page?: number; limit?: number } = {}) {
  return apiFetch<Page<TicketTranscriptSummary>>("/api/v1/internal/tickets", {
    search: opts.search,
    from: opts.from,
    to: opts.to,
    page: opts.page,
    limit: opts.limit,
  });
}

/** Addressed by the ticket's Discord channel, not the row id — static-discord regenerates that. */
export function fetchTicket(channelSnowflake: string) {
  return apiFetch<TicketTranscriptDetail>(`/api/v1/internal/tickets/${channelSnowflake}`);
}

/** Tickets a player opened, closed, or posted in, via their linked Discord account. */
export function fetchPlayerTickets(playerId: string, opts: { page?: number; limit?: number } = {}) {
  return apiFetch<Page<TicketTranscriptSummary>>(`/api/v1/internal/tickets/player/${playerId}`, {
    page: opts.page,
    limit: opts.limit,
  });
}
