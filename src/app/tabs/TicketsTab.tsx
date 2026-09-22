import {useEffect, useState} from "react";
import {Navigate, useNavigate} from "react-router";
import type {DateRange} from "react-day-picker";
import {Search, Ticket} from "lucide-react";
import {rankAtLeast} from "../../lib/utils";
import {Card} from "../components/ui/card";
import {Separator} from "../components/ui/separator";
import {Skeleton} from "../components/ui/skeleton";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "../components/ui/table";
import {SearchInput} from "../components/SearchInput";
import {DateRangeFilter} from "../components/DateRangeFilter";
import {TablePager} from "../components/TablePager";
import {Timestamp} from "../components/Timestamp";
import {TicketPersonLabel} from "../components/TicketPersonLabel";
import {useDebounced} from "../hooks/useDebounced";
import {useMe} from "../hooks/useMe";
import {useTickets} from "../hooks/useTickets";

const PAGE_SIZE = 20;

export function TicketsTab() {
  const { me, loading } = useMe();

  // Wait for the rank before deciding — redirecting on a not-yet-loaded `me` would bounce an admin
  // who is allowed in.
  if (loading) {
    return <Skeleton className="h-64 w-full" />;
  }
  if (!rankAtLeast(me?.rank, "ADMIN")) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Tickets />;
}

function Tickets() {
  const [search, setSearch] = useState("");
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [page, setPage] = useState(1);
  const navigate = useNavigate();
  const debouncedSearch = useDebounced(search, 250);

  const { tickets, totalElements, totalPages, loading } = useTickets({
    search: debouncedSearch || undefined,
    from: dateRange?.from ? startOfDay(dateRange.from).getTime() : undefined,
    to: dateRange?.to ? endOfDay(dateRange.to).getTime() : undefined,
    page,
    limit: PAGE_SIZE,
  });

  // A narrower filter can leave the current page past the end of the new result.
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, dateRange]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold font-display tracking-tight text-foreground">Tickets</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Archived support ticket transcripts, matched to players who have linked their Discord account
        </p>
      </div>

      {/* Search + closed-date filter */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
          <SearchInput
            className="flex-1"
            placeholder="Search tickets by channel name..."
            value={search}
            onChange={setSearch}
            icon={<Search size={14} />}
          />
          <DateRangeFilter value={dateRange} onChange={setDateRange} />
        </div>
      </Card>

      {/* Results */}
      <Card className="overflow-hidden">
        <div className="px-5 py-3.5 flex items-center gap-2">
          <Ticket size={13} className="text-primary" />
          <span className="text-xs font-mono text-muted-foreground">
            <span className="text-foreground font-semibold">{totalElements}</span> tickets
          </span>
        </div>
        <Separator />
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Ticket</TableHead>
              <TableHead>Opened By</TableHead>
              <TableHead className="hidden md:table-cell">Closed By</TableHead>
              <TableHead className="hidden lg:table-cell">Messages</TableHead>
              <TableHead className="hidden lg:table-cell">People</TableHead>
              <TableHead>Closed</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tickets.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="px-5 py-14 text-center text-sm font-mono text-muted-foreground">
                  {loading ? "Loading tickets…" : "No tickets found."}
                </TableCell>
              </TableRow>
            ) : (
              tickets.map((ticket, i) => (
                <TableRow
                  key={ticket.channelSnowflake}
                  className="cursor-pointer"
                  onClick={() => navigate(`/tickets/${ticket.channelSnowflake}`)}
                >
                  <TableCell>
                    <span className="text-xs font-mono text-foreground whitespace-nowrap">
                      #{ticket.channelName}
                    </span>
                  </TableCell>
                  <TableCell>
                    <TicketPersonLabel person={ticket.openedBy} seed={i} />
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <TicketPersonLabel person={ticket.closedBy} seed={i + 1} />
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    <span className="text-xs font-mono text-muted-foreground tabular-nums">
                      {ticket.messageCount}
                    </span>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    <span className="text-xs font-mono text-muted-foreground tabular-nums">
                      {ticket.participantCount}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Timestamp value={ticket.closedAt} fallback="Still open" className="text-xs" />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        {totalPages > 1 && (
          <>
            <Separator />
            <div className="px-5 py-3.5 flex items-center justify-between">
              <span className="text-xs font-mono text-muted-foreground">
                Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, totalElements)} of {totalElements}
              </span>
              <TablePager page={page} totalPages={totalPages} onPageChange={setPage} />
            </div>
          </>
        )}
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
