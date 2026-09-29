import { useEffect, useState } from "react";
import { fetchPlayerCountHistory, type PlayerCountSample } from "../api/dashboard";

export interface PlayerPoint {
  /** Epoch millis of the sample (or of the newest sample in an averaged bucket). */
  time: number;
  network: number;
  skyblock: number;
  prison: number;
}

/** The proxy samples every 10s, so short windows poll at the same cadence for new points. */
const SAMPLE_INTERVAL = 10_000;
/**
 * Windows over an hour come back averaged into buckets, so appending raw 10s points would leave a
 * dense tail on a coarse line. Those windows are refetched whole on this slower cadence instead.
 */
const LONG_WINDOW_REFRESH = 60_000;
const LONG_WINDOW_MINUTES = 60;

function toPoint(sample: PlayerCountSample): PlayerPoint {
  return {
    time: sample.time,
    network: sample.network,
    skyblock: sample.skyblock,
    prison: sample.prison,
  };
}

/**
 * Returns the player-count history the proxy samples into Redis, over the last `minutes` (the proxy
 * keeps 24 hours). Fetches the whole window on mount or when `minutes` changes. Windows up to an
 * hour then poll every 10s with `?since` and drop points that age out of the window; longer ones
 * refetch the whole window every minute.
 */
export function usePlayerCountHistory(minutes = 5) {
  const [history, setHistory] = useState<PlayerPoint[]>([]);

  useEffect(() => {
    let cancelled = false;
    let lastTime = 0;
    const windowMillis = minutes * 60_000;
    const longWindow = minutes > LONG_WINDOW_MINUTES;

    setHistory([]);

    async function load() {
      try {
        const samples = await fetchPlayerCountHistory({ minutes });
        if (cancelled) return;
        lastTime = samples.length > 0 ? samples[samples.length - 1].time : 0;
        setHistory(samples.map(toPoint));
      } catch {
        // Transient error — the next tick retries.
      }
    }

    async function poll() {
      if (!lastTime) {
        await load();
        return;
      }
      try {
        const samples = await fetchPlayerCountHistory({ since: lastTime, minutes });
        if (cancelled) return;
        if (samples.length > 0) {
          lastTime = samples[samples.length - 1].time;
        }
        const cutoff = Date.now() - windowMillis;
        setHistory((prev) => prev.concat(samples.map(toPoint)).filter((point) => point.time >= cutoff));
      } catch {
        // Transient error — retried on the next tick.
      }
    }

    load();
    const id = setInterval(longWindow ? load : poll, longWindow ? LONG_WINDOW_REFRESH : SAMPLE_INTERVAL);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [minutes]);

  return history;
}
