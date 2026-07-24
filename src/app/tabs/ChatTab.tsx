import {Fragment, useEffect, useRef, useState} from "react";
import {MessageSquare, Search} from "lucide-react";
import type {DateRange} from "react-day-picker";
import {Card} from "../components/ui/card";
import {Badge} from "../components/ui/badge";
import {Separator} from "../components/ui/separator";
import {ScrollArea} from "../components/ui/scroll-area";
import {SearchInput} from "../components/SearchInput";
import {GamemodeFilter} from "../components/GamemodeFilter";
import {SenderMultiSelect} from "../components/SenderMultiSelect";
import {DateRangeFilter} from "../components/DateRangeFilter";
import {ChatMessageRow} from "../components/ChatMessageRow";
import {useChatFeed} from "../hooks/useChatFeed";
import {useServerGroups} from "../hooks/useServerGroups";

export function ChatTab() {
  const [search, setSearch] = useState("");
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [selectedSenders, setSelectedSenders] = useState<string[]>([]);
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const scrollRef = useRef<HTMLDivElement>(null);

  const serverGroups = useServerGroups();

  const gamemodes = selectedFilters.filter((f) => f !== "dm");
  const includeDms = selectedFilters.includes("dm");

  const { messages, loading, loadingMore, hasMore, loadOlder } = useChatFeed({
    senders: selectedSenders.length ? selectedSenders : undefined,
    serverGroups: gamemodes.length ? gamemodes : undefined,
    includeDms,
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
  }, [selectedSenders, selectedFilters, dateRange]);

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
      <Card className="p-4 space-y-3">
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center flex-wrap">
          <SearchInput
            className="flex-1"
            placeholder="Filter by message content..."
            value={search}
            onChange={setSearch}
            icon={<Search size={14} />}
          />
          <DateRangeFilter value={dateRange} onChange={setDateRange} />
        </div>
        <div className="flex gap-3 flex-wrap items-center">
          <SenderMultiSelect selected={selectedSenders} onChange={setSelectedSenders} />
          <GamemodeFilter groups={serverGroups} selected={selectedFilters} onChange={setSelectedFilters} />
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
              {selectedFilters.length > 0 && (
                <span className="text-primary ml-1">
                  · {selectedFilters.map((f) => (f === "dm" ? "DM" : f.charAt(0).toUpperCase() + f.slice(1))).join(", ")}
                </span>
              )}
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
              filtered.map((msg, i) => {
                const msgDate = new Date(msg.timestamp);
                const showDivider = i === 0 || !isSameDay(msgDate, new Date(filtered[i - 1].timestamp));
                return (
                  <Fragment key={msg.id}>
                    {showDivider && (
                      <div className="flex items-center gap-3 py-2 px-1">
                        <Separator className="flex-1" />
                        <span className="text-[10px] font-mono text-muted-foreground/60 shrink-0">
                          {formatDayLabel(msgDate)}
                        </span>
                        <Separator className="flex-1" />
                      </div>
                    )}
                    <ChatMessageRow message={msg} />
                  </Fragment>
                );
              })
            )}
          </div>
        </ScrollArea>
      </Card>
    </div>
  );
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
