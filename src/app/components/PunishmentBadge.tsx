import type { ReactNode } from "react";
import { Ban, VolumeX, LogOut, AlertTriangle } from "lucide-react";
import { Badge } from "./ui/badge";
import type { PunishmentType } from "../data/punishments";

const BADGE_VARIANT: Record<PunishmentType, "ban" | "mute" | "kick" | "warn"> = {
  Ban: "ban", Mute: "mute", Kick: "kick", Warn: "warn",
};
const BADGE_ICON: Record<PunishmentType, ReactNode> = {
  Ban:  <Ban size={10} />,
  Mute: <VolumeX size={10} />,
  Kick: <LogOut size={10} />,
  Warn: <AlertTriangle size={10} />,
};

export function PunishmentBadge({ type }: { type: PunishmentType }) {
  return (
    <Badge variant={BADGE_VARIANT[type] ?? "outline"}>
      {BADGE_ICON[type]}
      {type}
    </Badge>
  );
}
