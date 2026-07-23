import {useEffect, useState} from "react";
import {ExternalLink, Filter, Hash, Search} from "lucide-react";
import {Card} from "../components/ui/card";
import {Badge} from "../components/ui/badge";
import {Button} from "../components/ui/button";
import {Separator} from "../components/ui/separator";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "../components/ui/table";
import {SearchInput} from "../components/SearchInput";
import {FilterSelect} from "../components/FilterSelect";
import {SimpleTooltip} from "../components/SimpleTooltip";
import {PlayerAvatar} from "../components/PlayerAvatar";
import {PlayerLink} from "../components/PlayerLink";
import {PunishmentBadge} from "../components/PunishmentBadge";
import {TablePager} from "../components/TablePager";
import {getPunishmentStatus, usePunishmentLookup, usePunishments} from "../hooks/usePunishments";
import {cn, initials} from "../../lib/utils";

const PAGE_SIZE = 6;

/** Debounces a fast-changing value (e.g. search input) so we don't hit the API on every keystroke. */
function useDebounced<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const handle = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(handle);
  }, [value, delayMs]);
  return debounced;
}

export function PunishmentsTab() {
  const [idSearch, setIdSearch] = useState("");
  const [playerSearch, setPlayerSearch] = useState("");
  const [staffSearch, setStaffSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);

  const debouncedPlayerSearch = useDebounced(playerSearch, 250);
  const debouncedStaffSearch = useDebounced(staffSearch, 250);

  const { punishments, totalElements, totalPages, loading } = usePunishments({
    page,
    limit: PAGE_SIZE,
    type: typeFilter === "all" ? undefined : typeFilter,
    targetName: debouncedPlayerSearch || undefined,
    issuerName: debouncedStaffSearch || undefined,
    status: statusFilter === "all" ? undefined : (statusFilter as "active" | "expired"),
  });

  // When an ID is entered, look up that single punishment directly and ignore the other filters.
  const idActive = idSearch.trim() !== "";
  const { result: idResult, status: idStatus } = usePunishmentLookup(idSearch);

  const paged = idActive ? (idResult ? [idResult] : []) : punishments;
  const displayTotal = idActive ? paged.length : totalElements;
  const displayTotalPages = idActive ? 1 : totalPages;

  const emptyMessage = idActive
    ? idStatus === "invalid"
      ? "Enter a full punishment UUID."
      : idStatus === "loading"
        ? "Looking up punishment…"
        : "No punishment found with that ID."
    : loading
      ? "Loading punishments…"
      : "No records match your current filters.";

  useEffect(() => {
    setPage(1);
  }, [idSearch, debouncedPlayerSearch, debouncedStaffSearch, typeFilter, statusFilter]);

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
              <span className="text-foreground font-semibold">{displayTotal}</span> records found
            </span>
          </div>
          <Badge variant="outline" className="text-[10px] font-mono">
            Page {page} / {displayTotalPages}
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
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={7} className="text-center text-sm font-mono text-muted-foreground">
                  {emptyMessage}
                </TableCell>
              </TableRow>
            ) : (
              paged.map((p, i) => {
                const status = getPunishmentStatus(p);
                return (
                  <TableRow key={p.id}>
                    <TableCell>
                      <PlayerLink id={p.targetId} name={p.targetName} className="gap-2.5">
                        <PlayerAvatar initials={initials(p.targetName)} seed={(page - 1) * PAGE_SIZE + i} skinTextureValue={p.targetSkinTextureValue} />
                        <span className="text-xs font-mono text-foreground whitespace-nowrap">{p.targetName}</span>
                      </PlayerLink>
                    </TableCell>
                    <TableCell><PunishmentBadge type={p.type} /></TableCell>
                    <TableCell>
                      <SimpleTooltip content={p.reason}>
                        <span className="text-xs text-muted-foreground block min-w-[120px] max-w-[180px] truncate">{p.reason}</span>
                      </SimpleTooltip>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <PlayerLink id={p.issuerId} name={p.issuerName}>
                        <span className="text-xs font-mono text-muted-foreground whitespace-nowrap hover:text-foreground">{p.issuerName}</span>
                      </PlayerLink>
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
            {Array.from({ length: PAGE_SIZE - (paged.length === 0 ? 1 : paged.length) }, (_, i) => (
              <TableRow key={`filler-${i}`} className="hover:bg-transparent">
                <TableCell colSpan={7}>&nbsp;</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {/* Pagination */}
        {displayTotalPages > 1 && (
          <>
            <Separator />
            <div className="px-5 py-3.5 flex items-center justify-between">
              <span className="text-xs font-mono text-muted-foreground">
                Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, displayTotal)} of {displayTotal}
              </span>
              <TablePager page={page} totalPages={displayTotalPages} onPageChange={setPage} />
            </div>
          </>
        )}
      </Card>
    </div>
  );
}
