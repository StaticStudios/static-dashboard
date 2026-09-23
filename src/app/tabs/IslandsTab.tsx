import { useState } from "react";
import { useNavigate } from "react-router";
import { Home, Search } from "lucide-react";
import { Card } from "../components/ui/card";
import { Separator } from "../components/ui/separator";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../components/ui/table";
import { SearchInput } from "../components/SearchInput";
import { PlayerAvatar } from "../components/PlayerAvatar";
import { PlayerLink } from "../components/PlayerLink";
import { num } from "../components/StatBlocks";
import { useIslands } from "../hooks/useIslands";
import { initials } from "../../lib/utils";

export function IslandsTab() {
  const [search, setSearch] = useState("");
  const navigate = useNavigate();
  const { islands, loading } = useIslands(search);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold font-display tracking-tight text-foreground">Islands</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Search Skyblock islands and open one for its value, level, members, and settings
        </p>
      </div>

      {/* Search */}
      <Card className="p-4">
        <SearchInput
          placeholder="Search by island or owner name..."
          value={search}
          onChange={setSearch}
          icon={<Search size={14} />}
        />
      </Card>

      {/* Results */}
      <Card className="overflow-hidden">
        <div className="px-5 py-3.5 flex items-center gap-2">
          <Home size={13} className="text-primary" />
          <span className="text-xs font-mono text-muted-foreground">
            <span className="text-foreground font-semibold">{islands.length}</span>{" "}
            {search.trim() ? "islands" : "top islands by value"}
          </span>
        </div>
        <Separator />
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Island</TableHead>
              <TableHead>Owner</TableHead>
              <TableHead className="text-right">Value</TableHead>
              <TableHead className="text-right">Level</TableHead>
              <TableHead className="hidden md:table-cell text-right">Members</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {islands.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="px-5 py-14 text-center text-sm font-mono text-muted-foreground">
                  {loading ? "Loading islands…" : "No islands found."}
                </TableCell>
              </TableRow>
            ) : (
              islands.map((island, i) => (
                <TableRow
                  key={island.id}
                  className="cursor-pointer"
                  onClick={() => navigate(`/islands/${island.id}`, { state: { name: island.name } })}
                >
                  <TableCell>
                    <span className="text-xs font-mono text-foreground font-semibold whitespace-nowrap">{island.name}</span>
                  </TableCell>
                  <TableCell>
                    {island.ownerId && island.ownerName ? (
                      <PlayerLink id={island.ownerId} name={island.ownerName} className="gap-2.5">
                        <PlayerAvatar
                          initials={initials(island.ownerName)}
                          seed={i}
                          skinTextureValue={island.ownerSkinTextureValue}
                        />
                        <span className="text-xs font-mono text-foreground whitespace-nowrap">{island.ownerName}</span>
                      </PlayerLink>
                    ) : (
                      <span className="text-xs font-mono text-muted-foreground">Unknown</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <span className="text-xs font-mono text-foreground">{num(island.value)}</span>
                  </TableCell>
                  <TableCell className="text-right">
                    <span className="text-xs font-mono text-foreground">{island.level}</span>
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-right">
                    <span className="text-xs font-mono text-muted-foreground">{island.memberCount}</span>
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
