import {useEffect, useState} from "react";
import {fetchPunishment, fetchPunishments} from "../api/punishments";
import type {PunishmentResponse, PunishmentType} from "../api/types";

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

export function usePunishments(opts: {
  page: number;
  limit: number;
  type?: string;
  target?: string[];
  targetName?: string;
  issuerName?: string;
  status?: "active" | "expired";
}) {
  const { page, limit, type, target, targetName, issuerName, status } = opts;
  const [punishments, setPunishments] = useState<PunishmentResponse[]>([]);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchPunishments({
      page: page - 1,
      limit,
      type: type ? [type as PunishmentType] : undefined,
      target,
      targetName,
      issuerName,
      status,
    })
      .then((p) => {
        if (cancelled) return;
        setPunishments(p.content);
        setTotalElements(p.totalElements);
        setTotalPages(Math.max(1, p.totalPages));
      })
      .catch(() => {
        if (!cancelled) {
          setPunishments([]);
          setTotalElements(0);
          setTotalPages(1);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [page, limit, type, target, targetName, issuerName, status]);

  return { punishments, totalElements, totalPages, loading };
}
