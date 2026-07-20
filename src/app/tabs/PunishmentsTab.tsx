import { useEffect, useState } from "react";
import { Search, Hash, Filter, ChevronLeft, ChevronRight, ExternalLink } from "lucide-react";
import { Card } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Separator } from "../components/ui/separator";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../components/ui/table";
import { SearchInput } from "../components/SearchInput";
import { FilterSelect } from "../components/FilterSelect";
import { SimpleTooltip } from "../components/SimpleTooltip";
import { PlayerAvatar } from "../components/PlayerAvatar";
import { PunishmentBadge } from "../components/PunishmentBadge";
import { usePunishments, usePunishmentLookup, getPunishmentStatus } from "../hooks/usePunishments";
import { cn, initials } from "../../lib/utils";

const PAGE_SIZE = 6;

export function PunishmentsTab() {
  const { punishments, loading } = usePunishments();
  const [idSearch, setIdSearch] = useState("");
  const [playerSearch, setPlayerSearch] = useState("");
  const [staffSearch, setStaffSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);

  // When an ID is entered, look up that single punishment directly and ignore the other filters.
  const idActive = idSearch.trim() !== "";
  const { result: idResult, status: idStatus } = usePunishmentLookup(idSearch);

  const filtered = idActive
    ? idResult
      ? [idResult]
      : []
    : punishments.filter((p) => {
        const matchPlayer = p.targetName.toLowerCase().includes(playerSearch.toLowerCase());
        const matchStaff = p.issuerName.toLowerCase().includes(staffSearch.toLowerCase());
        const matchType = typeFilter === "all" || p.type.toLowerCase() === typeFilter;
        const matchStatus = statusFilter === "all" || getPunishmentStatus(p).toLowerCase() === statusFilter;
        return matchPlayer && matchStaff && matchType && matchStatus;
      });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const emptyMessage = idActive
    ? idStatus === "invalid"
      ? "Enter a full punishment UUID."
      : idStatus === "loading"
        ? "Looking up punishment…"
        : "No punishment found with that ID."
    : loading
      ? "Loading punishments…"
      : "No records match your current filters.";

  useEffect(() => { setPage(1); }, [idSearch, playerSearch, staffSearch, typeFilter, statusFilter]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold font-display tracking-tight text-foreground">Punishments</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Full history of bans, mutes, kicks, and warnings</p>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col gap-3">
          {/* Punishment ID lookup + type filter */}
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
            <SearchInput
              className="flex-1"
              placeholder="Search by punishment ID (UUID)..."
              value={idSearch}
              onChange={setIdSearch}
              icon={<Hash size={14} />}
            />
            <div className={cn(idActive && "opacity-50 pointer-events-none")}>
              <FilterSelect
                value={typeFilter}
                onValueChange={setTypeFilter}
                placeholder="Type"
                options={[
                  { value: "all", label: "All Types" },
                  { value: "ban", label: "Ban" },
                  { value: "ip_ban", label: "IP Ban" },
                  { value: "mute", label: "Mute" },
                  { value: "kick", label: "Kick" },
                  { value: "warn", label: "Warn" },
                ]}
              />
            </div>
          </div>
          {/* Player + staff search + status filter */}
          <div
            className={cn(
              "flex flex-col sm:flex-row gap-3 items-start sm:items-center",
              idActive && "opacity-50 pointer-events-none"
            )}
          >
            <SearchInput
              className="flex-1"
              placeholder="Search player..."
              value={playerSearch}
              onChange={setPlayerSearch}
              icon={<Search size={14} />}
            />
            <SearchInput
              className="flex-1"
              placeholder="Search staff..."
              value={staffSearch}
              onChange={setStaffSearch}
              icon={<Search size={14} />}
            />
            <div>
              <FilterSelect
                value={statusFilter}
                onValueChange={setStatusFilter}
                placeholder="Status"
                options={[
                  { value: "all", label: "All Status" },
                  { value: "active", label: "Active" },
                  { value: "expired", label: "Expired" },
                ]}
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Table */}
      <Card className="overflow-hidden">
        <div className="px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter size={13} className="text-primary" />
            <span className="text-xs font-mono text-muted-foreground">
              <span className="text-foreground font-semibold">{filtered.length}</span> records found
            </span>
          </div>
          <Badge variant="outline" className="text-[10px] font-mono">
            Page {page} / {totalPages}
          </Badge>
        </div>
        <Separator />
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Player</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Reason</TableHead>
              <TableHead className="hidden lg:table-cell">Staff</TableHead>
              <TableHead className="hidden md:table-cell">Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paged.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="px-5 py-14 text-center text-sm font-mono text-muted-foreground whitespace-normal">
                  {emptyMessage}
                </TableCell>
              </TableRow>
            ) : (
              paged.map((p, i) => {
                const status = getPunishmentStatus(p);
                return (
                  <TableRow key={p.id}>
                    <TableCell>
                      <div className="flex items-center gap-2.5">
                        <PlayerAvatar initials={initials(p.targetName)} seed={(page - 1) * PAGE_SIZE + i} skinTextureValue={p.targetSkinTextureValue} />
                        <span className="text-xs font-mono text-foreground whitespace-nowrap">{p.targetName}</span>
                      </div>
                    </TableCell>
                    <TableCell><PunishmentBadge type={p.type} /></TableCell>
                    <TableCell>
                      <span className="text-xs text-muted-foreground block min-w-[120px] max-w-[180px] whitespace-normal">{p.reason}</span>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <span className="text-xs font-mono text-muted-foreground whitespace-nowrap">{p.issuerName}</span>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <span className="text-xs font-mono text-muted-foreground whitespace-nowrap">{new Date(p.issuedAt).toLocaleString()}</span>
                    </TableCell>
                    <TableCell>
                      <Badge variant={status === "Active" ? "default" : "secondary"} className="text-[10px]">
                        {status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        {status === "Active" && (p.type === "BAN" || p.type === "IP_BAN" || p.type === "MUTE") && (
                          <SimpleTooltip content="Not supported by the API yet">
                            <span className="inline-flex">
                              <Button variant="destructive-outline" size="sm" disabled>
                                {p.type === "MUTE" ? "Unmute" : "Unban"}
                              </Button>
                            </span>
                          </SimpleTooltip>
                        )}
                        <Button variant="outline" size="sm">
                          <ExternalLink size={10} /> View
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>

        {/* Pagination */}
        {totalPages > 1 && (
          <>
            <Separator />
            <div className="px-5 py-3.5 flex items-center justify-between">
              <span className="text-xs font-mono text-muted-foreground">
                Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}
              </span>
              <div className="flex items-center gap-1.5">
                <Button variant="outline" size="icon" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>
                  <ChevronLeft size={13} />
                </Button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                  <Button
                    key={n}
                    size="sm"
                    variant={page === n ? "default" : "ghost"}
                    onClick={() => setPage(n)}
                    className="w-7 h-7 p-0 text-xs font-mono"
                  >
                    {n}
                  </Button>
                ))}
                <Button variant="outline" size="icon" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
                  <ChevronRight size={13} />
                </Button>
              </div>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}
