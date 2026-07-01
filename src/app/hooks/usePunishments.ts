import { useEffect, useState } from "react";
import { fetchPunishments } from "../api/punishments";
import type { PunishmentResponse } from "../api/types";

export function getPunishmentStatus(p: PunishmentResponse): "Active" | "Expired" {
  if (p.revoked) return "Expired";
  if (p.expiresAt && new Date(p.expiresAt) <= new Date()) return "Expired";
  return "Active";
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
