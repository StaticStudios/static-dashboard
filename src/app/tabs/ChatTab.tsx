import { useEffect, useRef, useState } from "react";
import { Search, MessageSquare } from "lucide-react";
import type { DateRange } from "react-day-picker";
import { cn } from "../../lib/utils";
import { Card } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Separator } from "../components/ui/separator";
import { ScrollArea } from "../components/ui/scroll-area";
import { SearchInput } from "../components/SearchInput";
import { FilterSelect } from "../components/FilterSelect";
import { SenderMultiSelect } from "../components/SenderMultiSelect";
import { DateRangeFilter } from "../components/DateRangeFilter";
import { useChatFeed } from "../hooks/useChatFeed";
import { useServerGroups } from "../hooks/useServerGroups";

const SERVER_COLORS: Record<string, string> = {
  hub: "text-violet-400",
  skyblock: "text-blue-400",
  prison: "text-amber-400",
};

export function ChatTab() {
  const [search, setSearch] = useState("");
  const [serverFilter, setServerFilter] = useState("all");
  const [selectedSenders, setSelectedSenders] = useState<string[]>([]);
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const scrollRef = useRef<HTMLDivElement>(null);

  const serverGroups = useServerGroups();

  const { messages, loading, loadingMore, hasMore, loadOlder } = useChatFeed({
    senders: selectedSenders.length ? selectedSenders : undefined,
    serverGroups: serverFilter === "all" ? undefined : [serverFilter],
    from: dateRange?.from ? startOfDay(dateRange.from).getTime() : undefined,
    to: dateRange?.to ? endOfDay(dateRange.to).getTime() : undefined,
  });

  const filtered = messages.filter((m) => m.content.toLowerCase().includes(search.toLowerCase()));

  const wasAtBottomRef = useRef(true);
  const isPrependingRef = useRef(false);
  const prevScrollHeightRef = useRef(0);
  const hasMoreRef = useRef(hasMore);
  const loadingMoreRef = useRef(loadingMore);
  const loadOlderRef = useRef(loadOlder);
  hasMoreRef.current = hasMore;
  loadingMoreRef.current = loadingMore;
  loadOlderRef.current = loadOlder;

  // Reset to "follow the bottom" whenever the active filters change, since the feed resets too.
  useEffect(() => {
    wasAtBottomRef.current = true;
  }, [selectedSenders, serverFilter, dateRange]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const handleScroll = () => {
      wasAtBottomRef.current = el.scrollHeight - el.scrollTop - el.clientHeight < 40;
      if (el.scrollTop < 40 && hasMoreRef.current && !loadingMoreRef.current) {
        isPrependingRef.current = true;
        prevScrollHeightRef.current = el.scrollHeight;
        loadOlderRef.current();
      }
    };
    el.addEventListener("scroll", handleScroll);
    return () => el.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    if (isPrependingRef.current) {
      el.scrollTop = el.scrollHeight - prevScrollHeightRef.current + el.scrollTop;
      isPrependingRef.current = false;
      return;
    }
    if (wasAtBottomRef.current) {
      el.scrollTop = el.scrollHeight;
    }
  }, [filtered.length]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold font-display tracking-tight text-foreground">In-Game Chat</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Live feed across all servers and channels</p>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center flex-wrap">
          <SearchInput
            className="flex-1"
            placeholder="Filter by message content..."
            value={search}
            onChange={setSearch}
            icon={<Search size={14} />}
          />
          <SenderMultiSelect selected={selectedSenders} onChange={setSelectedSenders} />
          <DateRangeFilter value={dateRange} onChange={setDateRange} />
          <FilterSelect
            value={serverFilter}
            onValueChange={setServerFilter}
            placeholder="Server"
            options={[
              { value: "all", label: "All Servers" },
              ...serverGroups.map((g) => ({ value: g.toLowerCase(), label: g.charAt(0).toUpperCase() + g.slice(1) })),
            ]}
          />
        </div>
      </Card>

      {/* Chat window */}
      <Card className="overflow-hidden">
        {/* Header */}
        <div className="px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <MessageSquare size={13} className="text-primary" />
            <span className="text-xs font-mono text-muted-foreground">
              <span className="text-foreground font-semibold">{filtered.length}</span> messages
              {serverFilter !== "all" && <span className="text-primary ml-1">· {serverFilter.charAt(0).toUpperCase() + serverFilter.slice(1)}</span>}
            </span>
          </div>
          <Badge variant="outline" className="text-[10px] font-mono gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-primary" />
            Live
          </Badge>
        </div>
        <Separator />

        {/* Messages */}
        <ScrollArea viewportRef={scrollRef} viewportClassName="h-[480px]">
          <div className="w-full p-3 space-y-0.5">
            {loadingMore && (
              <div className="text-center text-[10px] font-mono text-muted-foreground/60 py-2">Loading older messages…</div>
            )}
            {filtered.length === 0 ? (
              <div className="flex items-center justify-center h-[456px] text-sm font-mono text-muted-foreground">
                {loading ? "Loading messages…" : "No messages match your filter."}
              </div>
            ) : (
              filtered.map((msg) => (
                <div
                  key={msg.id}
                  className="flex items-start gap-3 px-3 py-2 rounded-lg hover:bg-muted/30 transition-colors group"
                >
                  <span className="text-[10px] font-mono text-muted-foreground/50 w-12 shrink-0 pt-0.5 tabular-nums select-none">
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                  <p className="text-xs font-mono leading-relaxed">
                    {msg.serverGroup && (
                      <span className={cn("font-semibold mr-1.5", SERVER_COLORS[msg.serverGroup.toLowerCase()] ?? "text-muted-foreground")}>
                        [{msg.serverGroup}]
                      </span>
                    )}
                    <span className="text-foreground font-semibold mr-1">{msg.senderName}</span>
                    <span className="text-muted-foreground mr-1">:</span>
                    <span className="text-foreground/75">{msg.content}</span>
                  </p>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </Card>
    </div>
  );
}

function startOfDay(d: Date): Date {
  const copy = new Date(d);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function endOfDay(d: Date): Date {
  const copy = new Date(d);
  copy.setHours(23, 59, 59, 999);
  return copy;
}
