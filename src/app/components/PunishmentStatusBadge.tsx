import { Badge } from "./ui/badge";
import { SimpleTooltip } from "./SimpleTooltip";
import { formatTimestamp } from "./Timestamp";
import { getPunishmentStatus } from "../hooks/usePunishments";
import type { PunishmentResponse } from "../api/types";

const VARIANT = {
  Active: "default",
  Revoked: "outline",
  Expired: "secondary",
} as const;

/**
 * Whether a punishment is still in effect. Revoked is kept visually distinct from Expired — one means
 * staff lifted it, the other that it ran its term — and carries who lifted it, when that is recorded.
 */
export function PunishmentStatusBadge({ punishment }: { punishment: PunishmentResponse }) {
  const status = getPunishmentStatus(punishment);
  const badge = (
    <Badge variant={VARIANT[status]} className="text-[10px]">
      {status}
    </Badge>
  );

  if (status !== "Revoked") return badge;

  const by = punishment.revokedByName;
  const at = formatTimestamp(punishment.revokedAt);
  if (!by && !at) return badge;

  return (
    <SimpleTooltip content={`Revoked${by ? ` by ${by}` : ""}${at ? ` on ${at}` : ""}`}>
      <span className="inline-flex">{badge}</span>
    </SimpleTooltip>
  );
}
