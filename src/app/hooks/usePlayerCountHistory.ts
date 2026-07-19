import { useEffect, useState } from "react";
import { fetchPlayerCountHistory, type PlayerCountSample } from "../api/dashboard";

export interface PlayerPoint {
  time: string;
  network: number;
  skyblock: number;
  prison: number;
}

/** Poll interval in milliseconds. */
const SAMPLE_INTERVAL = 10_000;
/** Rolling window size — 30 points × 10s = 5 minutes, matching the server-side window. */
const MAX_POINTS = 30;

function toPoint(sample: PlayerCountSample): PlayerPoint {
  return {
    time: new Date(sample.time).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }),
    network: sample.network,
    skyblock: sample.skyblock,
    prison: sample.prison,
  };
}

/**
 * Returns the rolling player-count history maintained server-side (proxy sampler → Redis).
 * Fetches the full 5-minute window once on mount so the chart populates immediately, then polls
 * every 10s with `?since` to append only new points (oldest drops off via the fixed window).
 */
export function usePlayerCountHistory() {
  const [history, setHistory] = useState<PlayerPoint[]>([]);

  useEffect(() => {
    let cancelled = false;
    let lastTime = 0;

    async function seed() {
      try {
        const samples = await fetchPlayerCountHistory();
        if (cancelled || samples.length === 0) return;
        lastTime = samples[samples.length - 1].time;
        setHistory(samples.slice(-MAX_POINTS).map(toPoint));
      } catch {
        // Transient error — the next poll retries.
      }
    }

    async function poll() {
      try {
        const samples = await fetchPlayerCountHistory(lastTime || undefined);
        if (cancelled || samples.length === 0) return;
        lastTime = samples[samples.length - 1].time;
        setHistory((prev) => prev.concat(samples.map(toPoint)).slice(-MAX_POINTS));
      } catch {
        // Transient error — retried on the next tick.
      }
    }

    seed();
    const id = setInterval(poll, SAMPLE_INTERVAL);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  return history;
}
