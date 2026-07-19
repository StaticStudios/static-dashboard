import { useEffect, useState } from "react";
import { fetchPunishment, fetchPunishments } from "../api/punishments";
import type { PunishmentResponse } from "../api/types";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isUuid(value: string): boolean {
  return UUID_RE.test(value.trim());
}

export function getPunishmentStatus(p: PunishmentResponse): "Active" | "Expired" {
  if (p.revoked) return "Expired";
  if (p.expiresAt && new Date(p.expiresAt) <= new Date()) return "Expired";
  return "Active";
}

export type LookupStatus = "idle" | "invalid" | "loading" | "found" | "notFound";

/**
 * Looks up a single punishment by its UUID via the dedicated endpoint.
 * Returns "idle" for empty input and "invalid" until a full UUID is entered.
 */
export function usePunishmentLookup(id: string) {
  const [result, setResult] = useState<PunishmentResponse | null>(null);
  const [status, setStatus] = useState<LookupStatus>("idle");

  useEffect(() => {
    const trimmed = id.trim();
    if (trimmed === "") {
      setResult(null);
      setStatus("idle");
      return;
    }
    if (!isUuid(trimmed)) {
      setResult(null);
      setStatus("invalid");
      return;
    }

    let cancelled = false;
    setStatus("loading");
    fetchPunishment(trimmed)
      .then((p) => {
        if (cancelled) return;
        setResult(p);
        setStatus("found");
      })
      .catch(() => {
        if (cancelled) return;
        setResult(null);
        setStatus("notFound");
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  return { result, status };
}

export function usePunishments(limit = 100) {
  const [punishments, setPunishments] = useState<PunishmentResponse[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetchPunishments({ limit })
      .then((page) => {
        if (cancelled) return;
        setPunishments(page.content);
        setTotal(page.totalElements);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [limit]);

  return { punishments, total, loading };
}
