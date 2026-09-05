import type {ReactNode} from "react";
import {ArrowDownToLine, Gift, Inbox, Send, Settings2} from "lucide-react";
import {Badge} from "./ui/badge";
import type {GiftCardHistoryType} from "../api/types";
import {cn} from "../../lib/utils";

const BADGE_COLOR: Record<GiftCardHistoryType, string> = {
  CREATED: "bg-red-500/10 text-red-400 border-red-500/20",
  REDEEMED: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  PAYMENT_SENT: "bg-red-500/10 text-red-400 border-red-500/20",
  PAYMENT_RECEIVED: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  MODIFIED: "bg-violet-500/10 text-violet-400 border-violet-500/20",
};
const BADGE_ICON: Record<GiftCardHistoryType, ReactNode> = {
  CREATED: <Gift size={10} />,
  REDEEMED: <ArrowDownToLine size={10} />,
  PAYMENT_SENT: <Send size={10} />,
  PAYMENT_RECEIVED: <Inbox size={10} />,
  MODIFIED: <Settings2 size={10} />,
};
const BADGE_LABEL: Record<GiftCardHistoryType, string> = {
  CREATED: "Created",
  REDEEMED: "Redeemed",
  PAYMENT_SENT: "Sent",
  PAYMENT_RECEIVED: "Received",
  MODIFIED: "Modified",
};

export function GiftCardTypeBadge({ type }: { type: GiftCardHistoryType }) {
  return (
    <Badge variant="outline" className={cn("text-[10px]", BADGE_COLOR[type])}>
      {BADGE_ICON[type]}
      {BADGE_LABEL[type] ?? type}
    </Badge>
  );
}
