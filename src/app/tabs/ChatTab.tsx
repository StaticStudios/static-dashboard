import { useEffect, useRef, useState } from "react";
import { Search, MessageSquare } from "lucide-react";
import { cn } from "../../lib/utils";
import { Card } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Separator } from "../components/ui/separator";
import { ScrollArea } from "../components/ui/scroll-area";
import { SearchInput } from "../components/SearchInput";
import { FilterSelect } from "../components/FilterSelect";
import { CHAT_MESSAGES } from "../data/chat";

const SERVER_COLORS: Record<string, string> = {
  Global: "text-violet-400",
  Skyblock: "text-blue-400",
  Prison: "text-amber-400",
};

const RANK_LEGEND = [
  { rank: "Admin",  color: "#ef4444" },
  { rank: "Mod",    color: "#60a5fa" },
  { rank: "Helper", color: "#a78bfa" },
  { rank: "VIP+",   color: "#f59e0b" },
  { rank: "VIP",    color: "#4ade80" },
  { rank: "Player", color: "#71717a" },
];

export function ChatTab() {
  const [search, setSearch] = useState("");
  const [serverFilter, setServerFilter] = useState("all");
  const scrollRef = useRef<HTMLDivElement>(null);

  const filtered = CHAT_MESSAGES.filter((m) => {
    const q = search.toLowerCase();
    const matchSearch = m.message.toLowerCase().includes(q) || m.username.toLowerCase().includes(q);
    const matchServer = serverFilter === "all" || m.server.toLowerCase() === serverFilter;
    return matchSearch && matchServer;
  });

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
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
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
          <SearchInput
            className="flex-1"
            placeholder="Filter by keyword or username..."
            value={search}
            onChange={setSearch}
            icon={<Search size={14} />}
          />
          <FilterSelect
            value={serverFilter}
            onValueChange={setServerFilter}
            placeholder="Server"
            options={[
              { value: "all", label: "All Servers" },
              { value: "global", label: "Global" },
              { value: "skyblock", label: "Skyblock" },
              { value: "prison", label: "Prison" },
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
            {filtered.length === 0 ? (
              <div className="flex items-center justify-center h-[456px] text-sm font-mono text-muted-foreground">
                No messages match your filter.
              </div>
            ) : (
              filtered.map((msg) => (
                <div
                  key={msg.id}
                  className="flex items-start gap-3 px-3 py-2 rounded-lg hover:bg-muted/30 transition-colors group"
                >
                  <span className="text-[10px] font-mono text-muted-foreground/50 w-10 shrink-0 pt-0.5 tabular-nums select-none">
                    {msg.time}
                  </span>
                  <p className="text-xs font-mono leading-relaxed">
                    <span className={cn("font-semibold mr-1.5", SERVER_COLORS[msg.server] ?? "text-muted-foreground")}>
                      [{msg.server}]
                    </span>
                    <span className="font-bold mr-1" style={{ color: msg.rankColor }}>
                      [{msg.rank}]
                    </span>
                    <span className="text-foreground font-semibold mr-1">{msg.username}</span>
                    <span className="text-muted-foreground mr-1">:</span>
                    <span className="text-foreground/75">{msg.message}</span>
                  </p>
                </div>
              ))
            )}
          </div>
        </ScrollArea>

        {/* Rank legend */}
        <Separator />
        <div className="px-5 py-3 flex flex-wrap gap-x-5 gap-y-1.5">
          {RANK_LEGEND.map(({ rank, color }) => (
            <div key={rank} className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: color }} />
              <span className="text-[10px] font-mono font-semibold" style={{ color }}>{rank}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
