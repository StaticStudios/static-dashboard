import { useState } from "react";
import { Search, Users } from "lucide-react";
import { Card } from "../components/ui/card";
import { Separator } from "../components/ui/separator";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../components/ui/table";
import { SearchInput } from "../components/SearchInput";
import { PlayerAvatar } from "../components/PlayerAvatar";
import { usePlayers } from "../hooks/usePlayers";
import { PlayerDetail } from "./players/PlayerDetail";
import { initials } from "../../lib/utils";

export function PlayersTab() {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<{ id: string; name: string } | null>(null);
  const { players, loading } = usePlayers(search);

  if (selected) {
    return <PlayerDetail id={selected.id} name={selected.name} onBack={() => setSelected(null)} />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold font-display tracking-tight text-foreground">Players</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Search all players and open a profile for stats, punishments, and recent activity
        </p>
      </div>

      {/* Search */}
      <Card className="p-4">
        <SearchInput
          placeholder="Search players by name..."
          value={search}
          onChange={setSearch}
          icon={<Search size={14} />}
        />
      </Card>

      {/* Results */}
      <Card className="overflow-hidden">
        <div className="px-5 py-3.5 flex items-center gap-2">
          <Users size={13} className="text-primary" />
          <span className="text-xs font-mono text-muted-foreground">
            <span className="text-foreground font-semibold">{players.length}</span> players
          </span>
        </div>
        <Separator />
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Player</TableHead>
              <TableHead className="hidden md:table-cell">UUID</TableHead>
              <TableHead>Last Seen</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {players.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="px-5 py-14 text-center text-sm font-mono text-muted-foreground">
                  {loading ? "Loading players…" : "No players found."}
                </TableCell>
              </TableRow>
            ) : (
              players.map((p, i) => (
                <TableRow
                  key={p.id}
                  className="cursor-pointer"
                  onClick={() => setSelected({ id: p.id, name: p.name })}
                >
                  <TableCell>
                    <div className="flex items-center gap-2.5">
                      <PlayerAvatar initials={initials(p.name)} seed={i} skinTextureValue={p.skinTextureValue} />
                      <span className="text-xs font-mono text-foreground whitespace-nowrap">{p.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <span className="text-[11px] font-mono text-muted-foreground">{p.id}</span>
                  </TableCell>
                  <TableCell>
                    <span className="text-xs font-mono text-muted-foreground whitespace-nowrap">
                      {p.lastSeen ? new Date(p.lastSeen).toLocaleString() : "—"}
                    </span>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
