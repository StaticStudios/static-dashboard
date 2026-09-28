import {useCallback, useEffect, useState} from "react";
import {fetchServerMetrics, type MetricWindow} from "../api/serverMetrics";
import {connectServerMetricsSocket} from "../api/websocket";
import type {ServerMetricsResponse} from "../api/types";

/** Fallback poll interval while the socket is down; matches the push and sample interval. */
const POLL_INTERVAL = 5_000;

const time = (value: string | number) => new Date(value).getTime();

/**
 * Applies a pushed 5-minute snapshot to data loaded for a longer window: everything but the history is
 * taken from the push, and each server's history gains the pushed points newer than its last one, then
 * drops points that have left the window. Servers no longer in the push are gone.
 */
function extendWindow(prev: ServerMetricsResponse | null, pushed: ServerMetricsResponse, minutes: number): ServerMetricsResponse {
  if (!prev || prev.minutes !== minutes || minutes === pushed.minutes) return pushed;
  const cutoff = time(pushed.generatedAt) - minutes * 60_000;
  const previous = new Map(prev.groups.flatMap((g) => g.servers).map((s) => [s.sessionId, s]));

  return {
    ...pushed,
    minutes,
    groups: pushed.groups.map((group) => ({
      ...group,
      servers: group.servers.map((server) => {
        const old = previous.get(server.sessionId);
        if (!old) return server;
        const last = old.history.length ? time(old.history[old.history.length - 1].timestamp) : 0;
        const fresh = server.history.filter((p) => time(p.timestamp) > last);
        return { ...server, history: old.history.concat(fresh).filter((p) => time(p.timestamp) >= cutoff) };
      }),
    })),
  };
}

/**
 * Live server metrics for the given window. Loads the window over REST, then follows the snapshots the
 * API pushes over the WebSocket every 5s. While the socket is down it polls REST instead, and a failed
 * load keeps the last data and sets `error`. `refresh` reloads over REST immediately.
 */
export function useServerMetrics(minutes: MetricWindow = 5) {
  const [data, setData] = useState<ServerMetricsResponse | null>(null);
  const [error, setError] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const [connected, setConnected] = useState(false);
  const [tick, setTick] = useState(0);

  const refresh = useCallback(() => setTick((t) => t + 1), []);

  useEffect(() => {
    let cancelled = false;
    const disconnect = connectServerMetricsSocket(
      (pushed) => {
        if (cancelled) return;
        setData((prev) => extendWindow(prev, pushed, minutes));
        setError(false);
        setLastRefresh(new Date());
      },
      (live) => {
        if (!cancelled) setConnected(live);
      }
    );
    return () => {
      cancelled = true;
      disconnect();
    };
  }, [minutes]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const next = await fetchServerMetrics(minutes);
        if (cancelled) return;
        setData(next);
        setError(false);
        setLastRefresh(new Date());
      } catch {
        if (!cancelled) setError(true);
      }
    }

    load();
    const id = connected ? undefined : setInterval(load, POLL_INTERVAL);
    return () => {
      cancelled = true;
      if (id !== undefined) clearInterval(id);
    };
  }, [minutes, tick, connected]);

  return { data, error, lastRefresh, refresh, live: connected };
}
