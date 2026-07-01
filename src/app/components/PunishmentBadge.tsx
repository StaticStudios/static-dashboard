import type { ReactNode } from "react";
import { Ban, VolumeX, LogOut, AlertTriangle } from "lucide-react";
import { Badge } from "./ui/badge";
import type { PunishmentType } from "../api/types";

const BADGE_VARIANT: Record<PunishmentType, "ban" | "mute" | "kick" | "warn"> = {
  BAN: "ban", IP_BAN: "ban", MUTE: "mute", KICK: "kick", WARN: "warn",
};
const BADGE_ICON: Record<PunishmentType, ReactNode> = {
  BAN:    <Ban size={10} />,
  IP_BAN: <Ban size={10} />,
  MUTE:   <VolumeX size={10} />,
  KICK:   <LogOut size={10} />,
  WARN:   <AlertTriangle size={10} />,
};
const BADGE_LABEL: Record<PunishmentType, string> = {
  BAN: "Ban", IP_BAN: "IP Ban", MUTE: "Mute", KICK: "Kick", WARN: "Warn",
};

export function PunishmentBadge({ type }: { type: PunishmentType }) {
  return (
    <Badge variant={BADGE_VARIANT[type] ?? "outline"}>
      {BADGE_ICON[type]}
      {BADGE_LABEL[type] ?? type}
    </Badge>
  );
}
