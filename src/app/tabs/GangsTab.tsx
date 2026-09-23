import { useState } from "react";
import { useNavigate } from "react-router";
import { Search, Swords } from "lucide-react";
import { Card } from "../components/ui/card";
import { Separator } from "../components/ui/separator";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../components/ui/table";
import { SearchInput } from "../components/SearchInput";
import { PlayerAvatar } from "../components/PlayerAvatar";
import { PlayerLink } from "../components/PlayerLink";
import { num } from "../components/StatBlocks";
import { useGangs } from "../hooks/useGangs";
import { initials } from "../../lib/utils";

export function GangsTab() {
  const [search, setSearch] = useState("");
  const navigate = useNavigate();
  const { gangs, loading } = useGangs(search);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold font-display tracking-tight text-foreground">Gangs</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Search Prison gangs and open one for its points, level, members, and cell
        </p>
      </div>

      {/* Search */}
      <Card className="p-4">
        <SearchInput
          placeholder="Search by gang or owner name..."
          value={search}
          onChange={setSearch}
          icon={<Search size={14} />}
        />
      </Card>

      {/* Results */}
      <Card className="overflow-hidden">
        <div className="px-5 py-3.5 flex items-center gap-2">
          <Swords size={13} className="text-primary" />
          <span className="text-xs font-mono text-muted-foreground">
            <span className="text-foreground font-semibold">{gangs.length}</span>{" "}
            {search.trim() ? "gangs" : "top gangs by points"}
          </span>
        </div>
        <Separator />
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Gang</TableHead>
              <TableHead>Owner</TableHead>
              <TableHead className="text-right">Points</TableHead>
              <TableHead className="text-right">Level</TableHead>
              <TableHead className="hidden md:table-cell text-right">Members</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {gangs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="px-5 py-14 text-center text-sm font-mono text-muted-foreground">
                  {loading ? "Loading gangs…" : "No gangs found."}
                </TableCell>
              </TableRow>
            ) : (
              gangs.map((gang, i) => (
                <TableRow
                  key={gang.id}
                  className="cursor-pointer"
                  onClick={() => navigate(`/gangs/${gang.id}`, { state: { name: gang.name } })}
                >
                  <TableCell>
                    <span className="text-xs font-mono text-foreground font-semibold whitespace-nowrap">{gang.name}</span>
                  </TableCell>
                  <TableCell>
                    {gang.ownerId && gang.ownerName ? (
                      <PlayerLink id={gang.ownerId} name={gang.ownerName} className="gap-2.5">
                        <PlayerAvatar
                          initials={initials(gang.ownerName)}
                          seed={i}
                          skinTextureValue={gang.ownerSkinTextureValue}
                        />
                        <span className="text-xs font-mono text-foreground whitespace-nowrap">{gang.ownerName}</span>
                      </PlayerLink>
                    ) : (
                      <span className="text-xs font-mono text-muted-foreground">Unknown</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <span className="text-xs font-mono text-foreground">{num(gang.points)}</span>
                  </TableCell>
                  <TableCell className="text-right">
                    <span className="text-xs font-mono text-foreground">{gang.level}</span>
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-right">
                    <span className="text-xs font-mono text-muted-foreground">{gang.memberCount}</span>
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
