import type {ReactNode} from "react";
import {Fragment} from "react";
import {Navigate, useNavigate, useParams} from "react-router";
import {ArrowLeft, CornerUpLeft, Link2, Paperclip, Ticket, Users} from "lucide-react";
import {initials, rankAtLeast} from "../../../lib/utils";
import {Badge} from "../../components/ui/badge";
import {Button} from "../../components/ui/button";
import {Card, CardContent, CardHeader, CardTitle} from "../../components/ui/card";
import {Separator} from "../../components/ui/separator";
import {Skeleton} from "../../components/ui/skeleton";
import {PlayerAvatar} from "../../components/PlayerAvatar";
import {SimpleTooltip} from "../../components/SimpleTooltip";
import {Timestamp, formatTimestamp} from "../../components/Timestamp";
import {TicketPersonLabel} from "../../components/TicketPersonLabel";
import {useMe} from "../../hooks/useMe";
import {useTicket} from "../../hooks/useTickets";
import type {TicketMessage, TicketPerson} from "../../api/types";

/** Messages this far apart get a labelled break, the same as a player's conversation blocks. */
const GAP_THRESHOLD_MS = 10 * 60 * 1000;

export function TicketDetail() {
  const { me, loading } = useMe();

  // Wait for the rank before deciding — redirecting on a not-yet-loaded `me` would bounce an admin
  // who is allowed in.
  if (loading) {
    return <Skeleton className="h-64 w-full" />;
  }
  if (!rankAtLeast(me?.rank, "ADMIN")) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Transcript />;
}

function Transcript() {
  const { channelSnowflake = "" } = useParams();
  const navigate = useNavigate();
  const { ticket, loading } = useTicket(channelSnowflake);

  const name = ticket ? `#${ticket.channelName}` : "…";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="outline" size="icon" onClick={() => navigate("/tickets")}>
          <ArrowLeft size={15} />
        </Button>
        <div className="w-7 h-7 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
          <Ticket size={15} className="text-primary" />
        </div>
        <div className="min-w-0">
          <h1 className="text-xl font-bold font-display tracking-tight text-foreground leading-none">{name}</h1>
          <p className="text-[11px] font-mono text-muted-foreground mt-1 truncate">{channelSnowflake}</p>
        </div>
      </div>

      {loading && !ticket ? (
        <Card className="px-5 py-14 text-center text-sm font-mono text-muted-foreground">
          Loading transcript…
        </Card>
      ) : !ticket ? (
        <Card className="px-5 py-14 text-center text-sm font-mono text-muted-foreground">
          That transcript could not be loaded.
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_300px] gap-6 items-start">
          {/* Conversation */}
          <Card className="overflow-hidden">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Ticket size={14} className="text-primary" />
                  <CardTitle>Transcript</CardTitle>
                </div>
                <Badge variant="secondary" className="text-[10px]">
                  {ticket.messageCount} messages
                </Badge>
              </div>
            </CardHeader>
            <Separator />
            <CardContent className="p-2">
              {ticket.messages.length === 0 ? (
                <div className="px-5 py-14 text-center text-sm font-mono text-muted-foreground">
                  This ticket has no conversation — only Ticket Tool's own messages.
                </div>
              ) : (
                ticket.messages.map((message, i) => {
                  const sent = new Date(message.sentAt);
                  const previous = i === 0 ? null : ticket.messages[i - 1];
                  const previousSent = previous ? new Date(previous.sentAt) : null;
                  const showDay = !previousSent || !isSameDay(sent, previousSent);
                  const gap =
                    !showDay && previousSent ? sent.getTime() - previousSent.getTime() : 0;

                  return (
                    <Fragment key={message.id}>
                      {showDay && <Divider label={formatDayLabel(sent)} />}
                      {gap >= GAP_THRESHOLD_MS && <Divider label={formatGapLabel(gap)} />}
                      <MessageRow
                        message={message}
                        seed={i}
                        repliedTo={findReplyTarget(ticket.messages, message.replyToMessageId)}
                      />
                    </Fragment>
                  );
                })
              )}
            </CardContent>
          </Card>

          {/* Right rail */}
          <div className="space-y-6">
            <Card className="overflow-hidden">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Link2 size={14} className="text-primary" />
                  <CardTitle>Ticket</CardTitle>
                </div>
              </CardHeader>
              <Separator />
              <CardContent className="p-5 space-y-4">
                <Field label="Opened by">
                  <TicketPersonLabel person={ticket.openedBy} />
                </Field>
                <Field label="Opened">
                  <Timestamp value={ticket.openedAt} className="text-xs text-foreground" />
                </Field>
                <Field label="Closed by">
                  <TicketPersonLabel person={ticket.closedBy} seed={1} />
                </Field>
                <Field label="Closed">
                  <Timestamp value={ticket.closedAt} fallback="Still open" className="text-xs text-foreground" />
                </Field>
                <Field label="Archived">
                  <Timestamp value={ticket.savedAt} className="text-xs text-foreground" />
                </Field>
              </CardContent>
            </Card>

            <Card className="overflow-hidden">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users size={14} className="text-primary" />
                    <CardTitle>Participants</CardTitle>
                  </div>
                  <Badge variant="secondary" className="text-[10px]">
                    {ticket.participants.length}
                  </Badge>
                </div>
              </CardHeader>
              <Separator />
              <CardContent className="p-5 space-y-3">
                {ticket.participants.length === 0 ? (
                  <p className="text-sm font-mono text-muted-foreground">No participants recorded.</p>
                ) : (
                  ticket.participants.map((participant, i) => (
                    <div
                      key={participant.user?.snowflake ?? `participant-${i}`}
                      className="flex items-center justify-between gap-2"
                    >
                      <TicketPersonLabel person={participant.user} seed={i} />
                      <span className="text-[11px] font-mono text-muted-foreground tabular-nums shrink-0">
                        {participant.messageCount}
                      </span>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}

function MessageRow({
  message,
  seed,
  repliedTo,
}: {
  message: TicketMessage;
  seed: number;
  repliedTo: TicketMessage | null | undefined;
}) {
  const sent = new Date(message.sentAt);
  const name = displayName(message.author);

  return (
    <div className="flex items-start gap-3 px-3 py-2 rounded-lg hover:bg-muted/30 transition-colors">
      <SimpleTooltip content={sent.toLocaleString([], { dateStyle: "full", timeStyle: "medium" })}>
        <span className="text-[10px] font-mono text-muted-foreground/50 w-12 shrink-0 pt-0.5 tabular-nums select-none">
          {sent.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </span>
      </SimpleTooltip>

      <PlayerAvatar
        initials={initials(name)}
        seed={seed}
        skinTextureValue={message.author?.skinTextureValue}
      />

      <div className="min-w-0 flex-1">
        {message.replyToMessageId && (
          <p className="flex items-center gap-1 text-[10px] font-mono text-muted-foreground/60 truncate">
            <CornerUpLeft size={10} className="shrink-0" />
            {repliedTo ? (
              <>
                <span className="font-semibold">{displayName(repliedTo.author)}</span>
                <span className="truncate">{repliedTo.content ?? ""}</span>
              </>
            ) : (
              // The referenced message can be missing: Ticket Tool bookkeeping is lifted out of the
              // conversation, and a reply can point at something that predates the transcript.
              <span>replying to an earlier message</span>
            )}
          </p>
        )}
        <p className="text-xs font-mono leading-relaxed">
          <span className="text-foreground font-semibold mr-1">{name}</span>
          {message.bot && <span className="text-indigo-400 font-semibold mr-1">[BOT]</span>}
          <span className="text-muted-foreground mr-1">:</span>
          <span className="text-foreground/75 whitespace-pre-wrap break-words">{message.content ?? ""}</span>
          {message.editedAt && (
            <SimpleTooltip content={`Edited ${formatTimestamp(message.editedAt) ?? "at an unknown time"}`}>
              <span className="text-[10px] text-muted-foreground/50 ml-1.5 cursor-default">(edited)</span>
            </SimpleTooltip>
          )}
        </p>

        {message.embeds.map((embed, i) => (
          <div key={`embed-${i}`} className="mt-1 border-l-2 border-border pl-2 py-0.5">
            {embed.title && (
              <p className="text-[11px] font-mono font-semibold text-foreground">{embed.title}</p>
            )}
            {embed.description && (
              <p className="text-[11px] font-mono text-muted-foreground whitespace-pre-wrap break-words">
                {embed.description}
              </p>
            )}
            {embed.url && (
              <p className="text-[11px] font-mono text-primary truncate">{embed.url}</p>
            )}
          </div>
        ))}

        {message.attachments.map((attachment, i) => (
          <p
            key={`attachment-${i}`}
            className="mt-1 flex items-center gap-1 text-[11px] font-mono text-muted-foreground"
          >
            <Paperclip size={10} className="shrink-0" />
            {/* Discord CDN links are signed and expire, so an archived one may no longer resolve. */}
            <span className="truncate">{attachment.filename ?? attachment.url ?? "attachment"}</span>
          </p>
        ))}
      </div>
    </div>
  );
}

function Divider({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 py-2 px-1">
      <Separator className="flex-1" />
      <span className="text-[10px] font-mono text-muted-foreground/60 shrink-0">{label}</span>
      <Separator className="flex-1" />
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="space-y-1">
      <p className="text-[10px] font-semibold font-mono uppercase tracking-widest text-muted-foreground">
        {label}
      </p>
      {children}
    </div>
  );
}

function displayName(person: TicketPerson | null | undefined): string {
  return person?.playerName ?? person?.username ?? person?.snowflake ?? "Unknown";
}

function findReplyTarget(messages: TicketMessage[], id: string | null): TicketMessage | null {
  if (!id) {
    return null;
  }
  return messages.find((message) => message.id === id) ?? null;
}

function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function formatDayLabel(d: Date): string {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  if (isSameDay(d, today)) return "Today";
  if (isSameDay(d, yesterday)) return "Yesterday";
  return d.toLocaleDateString([], { weekday: "long", month: "long", day: "numeric", year: "numeric" });
}

function formatGapLabel(ms: number): string {
  const minutes = Math.round(ms / 60000);
  if (minutes < 60) return `${minutes}m gap`;
  const hours = Math.floor(minutes / 60);
  const remMinutes = minutes % 60;
  if (hours < 24) return remMinutes ? `${hours}h ${remMinutes}m gap` : `${hours}h gap`;
  const days = Math.floor(hours / 24);
  return `${days}d gap`;
}
