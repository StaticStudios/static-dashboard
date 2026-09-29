import type {ReactNode} from "react";
import {Check, CircleHelp, Clock, RotateCcw, Undo2} from "lucide-react";
import {Badge} from "./ui/badge";
import {cn} from "../../lib/utils";

/**
 * Tebex reports payment status as free text (`"Complete"`, `"Refund"`, …) on the store feed and as
 * an int the API labels on the per-player feed, so anything unrecognised falls through to a neutral
 * badge showing the raw value rather than being dropped.
 */
const BADGE_COLOR: Record<string, string> = {
  complete: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  refund: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  chargeback: "bg-red-500/10 text-red-400 border-red-500/20",
  pending: "bg-blue-500/10 text-blue-400 border-blue-500/20",
};
const BADGE_ICON: Record<string, ReactNode> = {
  complete: <Check size={10} />,
  refund: <Undo2 size={10} />,
  chargeback: <RotateCcw size={10} />,
  pending: <Clock size={10} />,
};

export function StorePaymentStatusBadge({ status }: { status: string | null }) {
  const key = (status ?? "").trim().toLowerCase();

  return (
    <Badge variant="outline" className={cn("text-[10px]", BADGE_COLOR[key])}>
      {BADGE_ICON[key] ?? <CircleHelp size={10} />}
      {status || "Unknown"}
    </Badge>
  );
}
