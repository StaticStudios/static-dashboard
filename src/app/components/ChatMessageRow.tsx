import {cn} from "../../lib/utils";
import {SimpleTooltip} from "./SimpleTooltip";
import type {ChatLogEntry} from "../api/types";

export const SERVER_COLORS: Record<string, string> = {
  hub: "text-violet-400",
  skyblock: "text-blue-400",
  prison: "text-amber-400",
};

// "public" chat is the default/unlabeled case — only these get a second [Chatroom] badge.
export const CHATROOM_LABELS: Record<string, { label: string; color: string }> = {
  staff: { label: "Staff", color: "text-red-400" },
  gang: { label: "Gang", color: "text-orange-400" },
  island: { label: "Island", color: "text-emerald-400" },
};

export function ChatMessageRow({
  message,
  highlighted,
  onClick,
}: {
  message: ChatLogEntry;
  highlighted?: boolean;
  onClick?: () => void;
}) {
  const isPrivate = message.type === "private_message";
  const chatroomInfo = message.chatroom ? CHATROOM_LABELS[message.chatroom.toLowerCase()] : undefined;
  const msgDate = new Date(message.timestamp);

  return (
    <div
      data-message-id={message.id}
      onClick={onClick}
      className={cn(
        "flex items-start gap-3 px-3 py-2 rounded-lg hover:bg-muted/30 transition-colors group",
        onClick && "cursor-pointer",
        highlighted && "bg-primary/5 border border-primary/20"
      )}
    >
      <SimpleTooltip content={msgDate.toLocaleString([], { dateStyle: "full", timeStyle: "medium" })}>
        <span className="text-[10px] font-mono text-muted-foreground/50 w-12 shrink-0 pt-0.5 tabular-nums select-none">
          {msgDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </span>
      </SimpleTooltip>
      <p className="text-xs font-mono leading-relaxed">
        {isPrivate ? (
          <span className="font-semibold mr-1.5 text-pink-400">[DM]</span>
        ) : (
          <>
            {message.serverGroup && (
              <span className={cn("font-semibold mr-1.5", SERVER_COLORS[message.serverGroup.toLowerCase()] ?? "text-muted-foreground")}>
                [{message.serverGroup}]
              </span>
            )}
            {chatroomInfo && (
              <span className={cn("font-semibold mr-1.5", chatroomInfo.color)}>
                [{chatroomInfo.label}]
              </span>
            )}
          </>
        )}
        <span className="text-foreground font-semibold mr-1">{message.senderName}</span>
        {isPrivate && message.recipientName && (
          <>
            <span className="text-muted-foreground mr-1">→</span>
            <span className="text-foreground font-semibold mr-1">{message.recipientName}</span>
          </>
        )}
        <span className="text-muted-foreground mr-1">:</span>
        <span className="text-foreground/75">{message.content}</span>
      </p>
    </div>
  );
}
