import {useEffect, useState} from "react";
import {fetchPlayerTickets, fetchTicket, fetchTickets} from "../api/tickets";
import type {TicketTranscriptDetail, TicketTranscriptSummary} from "../api/types";

/**
 * The Tickets list. `search` is matched server-side against the ticket's channel name, and is
 * expected to arrive already debounced — the caller owns that, since the date and page filters here
 * have nothing to debounce.
 */
export function useTickets(filters: {
  search?: string;
  from?: number;
  to?: number;
  page?: number;
  limit?: number;
}) {
  const [tickets, setTickets] = useState<TicketTranscriptSummary[]>([]);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const { search, from, to, page = 1, limit } = filters;

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchTickets({ search, from, to, page: page - 1, limit })
      .then((result) => {
        if (cancelled) return;
        setTickets(result.content);
        setTotalElements(result.totalElements);
        setTotalPages(Math.max(1, result.totalPages));
      })
      .catch(() => {
        if (cancelled) return;
        setTickets([]);
        setTotalElements(0);
        setTotalPages(1);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [search, from, to, page, limit]);

  return { tickets, totalElements, totalPages, loading };
}

export function useTicket(channelSnowflake: string | null) {
  const [ticket, setTicket] = useState<TicketTranscriptDetail | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!channelSnowflake) {
      setTicket(null);
      return;
    }
    let cancelled = false;
    setLoading(true);
    fetchTicket(channelSnowflake)
      .then((t) => {
        if (!cancelled) setTicket(t);
      })
      .catch(() => {
        if (!cancelled) setTicket(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [channelSnowflake]);

  return { ticket, loading };
}

/**
 * One player's tickets, for the card on their profile. `enabled` is false for staff below ADMIN so
 * the request is never made — the API would refuse it anyway.
 */
export function usePlayerTickets(id: string | null, page = 1, limit = 10, enabled = true) {
  const [tickets, setTickets] = useState<TicketTranscriptSummary[]>([]);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!id || !enabled) {
      setTickets([]);
      setTotalElements(0);
      setTotalPages(1);
      return;
    }
    let cancelled = false;
    setLoading(true);
    fetchPlayerTickets(id, { page: page - 1, limit })
      .then((result) => {
        if (cancelled) return;
        setTickets(result.content);
        setTotalElements(result.totalElements);
        setTotalPages(Math.max(1, result.totalPages));
      })
      .catch(() => {
        if (cancelled) return;
        setTickets([]);
        setTotalElements(0);
        setTotalPages(1);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id, page, limit, enabled]);

  return { tickets, totalElements, totalPages, loading };
}
