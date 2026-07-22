import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { useLocation, useNavigate, useParams } from "react-router";
import {
  ArrowLeft,
  Clock,
  Calendar,
  Home,
  Users as UsersIcon,
  Shield,
  Activity,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Gamepad2,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Separator } from "../../components/ui/separator";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../../components/ui/table";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "../../components/ui/collapsible";
import { FilterSelect } from "../../components/FilterSelect";
import { SimpleTooltip } from "../../components/SimpleTooltip";
import { PlayerAvatar } from "../../components/PlayerAvatar";
import { PunishmentBadge } from "../../components/PunishmentBadge";
import { usePlayerProfile, usePlayerActions, usePlayerActionIds } from "../../hooks/usePlayers";
import { getPunishmentStatus } from "../../hooks/usePunishments";
import { fetchPunishments } from "../../api/punishments";
import type { PunishmentResponse } from "../../api/types";
import { cn, initials } from "../../../lib/utils";

function formatPlaytime(seconds: number): string {
  if (!seconds || seconds <= 0) return "0m";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h === 0) return `${m}m`;
  return `${h}h ${m}m`;
}

/** Shows the date only, with the full date + time revealed on hover. */
function DateValue({ iso }: { iso: string | null }) {
  if (!iso) return <>—</>;
  const d = new Date(iso);
  return (
    <SimpleTooltip content={d.toLocaleString()}>
      <span className="cursor-default">{d.toLocaleDateString()}</span>
    </SimpleTooltip>
  );
}

function num(n: number): string {
  return n.toLocaleString();
}

const ACTIONS_PAGE_SIZE = 15;
const ACTIONS_FETCH_LIMIT = 300;

function prettyJson(raw: string | null): string {
  if (!raw) return "—";
  try {
    return JSON.stringify(JSON.parse(raw), null, 2);
  } catch {
    return raw;
  }
}

function usePlayerPunishments(id: string) {
  const [punishments, setPunishments] = useState<PunishmentResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchPunishments({ target: [id], limit: 100 })
      .then((page) => {
        if (!cancelled) setPunishments(page.content);
      })
      .catch(() => {
        if (!cancelled) setPunishments([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  return { punishments, loading };
}

function StatCard({ icon, label, value }: { icon: ReactNode; label: string; value: ReactNode }) {
  return (
    <Card className="px-4 py-3.5 flex-row items-center gap-3">
      <span className="text-primary">{icon}</span>
      <div className="min-w-0">
        <p className="text-lg font-bold font-mono text-foreground leading-none truncate">{value}</p>
        <p className="text-[10px] font-mono text-muted-foreground mt-0.5">{label}</p>
      </div>
    </Card>
  );
}

function StatRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex items-center justify-between py-1.5">
      <span className="text-xs font-mono text-muted-foreground">{label}</span>
      <span className="text-xs font-mono text-foreground font-semibold">{value}</span>
    </div>
  );
}

export function PlayerDetail() {
  const { playerId = "" } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const id = playerId;

  const { profile, loading } = usePlayerProfile(id);
  // Name comes from the profile fetch; seed it from router state (when navigating
  // from the list) so the header isn't blank before the profile loads.
  const seedName = (location.state as { name?: string } | null)?.name;
  const name = profile?.name ?? seedName ?? "…";
  const { punishments, loading: punishmentsLoading } = usePlayerPunishments(id);

  // Recent actions + filters
  const actionIds = usePlayerActionIds(id);
  const [actionFilter, setActionFilter] = useState("all");
  const [fromInput, setFromInput] = useState("");
  const [toInput, setToInput] = useState("");
  const [actionsPage, setActionsPage] = useState(1);
  const { actions, loading: actionsLoading } = usePlayerActions(id, {
    actionId: actionFilter === "all" ? undefined : actionFilter,
    from: fromInput ? new Date(fromInput).getTime() : undefined,
    to: toInput ? new Date(toInput).getTime() : undefined,
    limit: ACTIONS_FETCH_LIMIT,
  });

  useEffect(() => {
    setActionsPage(1);
  }, [actionFilter, fromInput, toInput]);

  const actionsTotalPages = Math.max(1, Math.ceil(actions.length / ACTIONS_PAGE_SIZE));
  const pagedActions = actions.slice(
    (actionsPage - 1) * ACTIONS_PAGE_SIZE,
    actionsPage * ACTIONS_PAGE_SIZE
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="outline" size="icon" onClick={() => navigate("/players")}>
          <ArrowLeft size={15} />
        </Button>
        <PlayerAvatar initials={initials(name)} seed={0} skinTextureValue={profile?.skinTextureValue} />
        <div className="min-w-0">
          <h1 className="text-xl font-bold font-display tracking-tight text-foreground leading-none">{name}</h1>
          <p className="text-[11px] font-mono text-muted-foreground mt-1 truncate">{id}</p>
        </div>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard icon={<Clock size={16} />} label="Total Playtime" value={profile ? formatPlaytime(profile.playtime.total) : "…"} />
        <StatCard icon={<Calendar size={16} />} label="First Joined" value={profile ? <DateValue iso={profile.firstEverJoined} /> : "…"} />
        <StatCard icon={<Activity size={16} />} label="Last Seen" value={profile ? <DateValue iso={profile.lastSeen} /> : "…"} />
        <StatCard icon={<Shield size={16} />} label="Punishments" value={punishmentsLoading ? "…" : punishments.length} />
      </div>

      {loading && !profile ? (
        <Card className="px-5 py-14 text-center text-sm font-mono text-muted-foreground">Loading profile…</Card>
      ) : (
        <>
          {/* Gamemode cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Skyblock */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Gamepad2 size={14} className="text-blue-400" />
                  <CardTitle>Skyblock</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                {profile?.skyblock ? (
                  <div className="divide-y divide-border">
                    <StatRow label="Playtime" value={formatPlaytime(profile.playtime.skyblock)} />
                    <StatRow label="Money" value={num(profile.skyblock.money)} />
                    <StatRow label="Prestige Points" value={num(profile.skyblock.prestigePoints)} />
                    <StatRow label="Dungeon Shards" value={num(profile.skyblock.dungeonShards)} />
                    <StatRow
                      label="Island"
                      value={
                        profile.skyblock.island ? (
                          <span className="flex items-center gap-1.5">
                            <Home size={12} className="text-blue-400" />
                            {profile.skyblock.island.name}
                            {profile.skyblock.island.owner && (
                              <Badge variant="secondary" className="text-[10px]">Owner</Badge>
                            )}
                          </span>
                        ) : (
                          "None"
                        )
                      }
                    />
                  </div>
                ) : (
                  <p className="text-xs font-mono text-muted-foreground py-2">No Skyblock data.</p>
                )}
              </CardContent>
            </Card>

            {/* Prison */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Gamepad2 size={14} className="text-amber-400" />
                  <CardTitle>Prison</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                {profile?.prison ? (
                  <div className="divide-y divide-border">
                    <StatRow label="Playtime" value={formatPlaytime(profile.playtime.prison)} />
                    <StatRow label="Money" value={num(profile.prison.money)} />
                    <StatRow label="Tokens" value={num(profile.prison.tokens)} />
                    <StatRow label="Prestige Points" value={num(profile.prison.prestigePoints)} />
                    <StatRow label="Prestige / Rank" value={`${profile.prison.prestige} / ${profile.prison.mineRank}`} />
                    <StatRow
                      label="Gang"
                      value={
                        profile.prison.gang ? (
                          <span className="flex items-center gap-1.5">
                            <UsersIcon size={12} className="text-amber-400" />
                            {profile.prison.gang.name}
                            {profile.prison.gang.owner && (
                              <Badge variant="secondary" className="text-[10px]">Owner</Badge>
                            )}
                          </span>
                        ) : (
                          "None"
                        )
                      }
                    />
                  </div>
                ) : (
                  <p className="text-xs font-mono text-muted-foreground py-2">No Prison data.</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Punishments */}
          <Card className="overflow-hidden">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Shield size={14} className="text-primary" />
                <CardTitle>Punishments</CardTitle>
                <Badge variant="secondary" className="text-[10px]">{punishments.length}</Badge>
              </div>
            </CardHeader>
            <Separator />
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead className="hidden lg:table-cell">Staff</TableHead>
                  <TableHead className="hidden md:table-cell">Date</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {punishments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="px-5 py-10 text-center text-sm font-mono text-muted-foreground">
                      {punishmentsLoading ? "Loading punishments…" : "No punishments on record."}
                    </TableCell>
                  </TableRow>
                ) : (
                  punishments.map((p) => {
                    const status = getPunishmentStatus(p);
                    return (
                      <TableRow key={p.id}>
                        <TableCell><PunishmentBadge type={p.type} /></TableCell>
                        <TableCell>
                          <span className="text-xs text-muted-foreground block max-w-[220px] whitespace-normal">{p.reason}</span>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          <span className="text-xs font-mono text-muted-foreground whitespace-nowrap">{p.issuerName}</span>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <span className="text-xs font-mono text-muted-foreground whitespace-nowrap">{new Date(p.issuedAt).toLocaleString()}</span>
                        </TableCell>
                        <TableCell>
                          <Badge variant={status === "Active" ? "default" : "secondary"} className="text-[10px]">{status}</Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </Card>

          {/* Recent actions */}
          <Card className="overflow-hidden">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Activity size={14} className="text-primary" />
                <CardTitle>Recent Actions</CardTitle>
                <Badge variant="secondary" className="text-[10px]">{actions.length}</Badge>
              </div>
              <CardDescription>Audit log — click a row to expand its payload</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Filters */}
              <div className="flex flex-col sm:flex-row gap-3 sm:items-center mb-4">
                <FilterSelect
                  value={actionFilter}
                  onValueChange={setActionFilter}
                  placeholder="Action"
                  options={[
                    { value: "all", label: "All actions" },
                    ...actionIds.map((a) => ({ value: a, label: a })),
                  ]}
                />
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-mono text-muted-foreground">From</span>
                  <Input
                    type="datetime-local"
                    value={fromInput}
                    onChange={(e) => setFromInput(e.target.value)}
                    className="font-mono text-xs w-[200px] [&::-webkit-calendar-picker-indicator]:invert [&::-webkit-calendar-picker-indicator]:cursor-pointer"
                  />
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-mono text-muted-foreground">To</span>
                  <Input
                    type="datetime-local"
                    value={toInput}
                    onChange={(e) => setToInput(e.target.value)}
                    className="font-mono text-xs w-[200px] [&::-webkit-calendar-picker-indicator]:invert [&::-webkit-calendar-picker-indicator]:cursor-pointer"
                  />
                </div>
              </div>

              {/* Action list — always renders ACTIONS_PAGE_SIZE row-slots (real or invisible filler)
                  so the card height doesn't jump between pages, filters, or the empty state. */}
              <div className="space-y-1.5">
                {actions.length === 0 ? (
                  <div className="rounded-lg border border-dashed border-border/60 px-3 py-2.5 flex items-center justify-center">
                    <span className="text-xs font-mono text-muted-foreground">
                      {actionsLoading ? "Loading actions…" : "No actions match these filters."}
                    </span>
                  </div>
                ) : (
                  pagedActions.map((a) => (
                    <Collapsible key={a.logId} className="rounded-lg border border-border bg-card/40">
                      <CollapsibleTrigger className="group w-full flex items-center gap-3 px-3 py-2.5 text-left">
                        <ChevronDown
                          size={13}
                          className="text-muted-foreground transition-transform group-data-[state=open]:rotate-180 shrink-0"
                        />
                        <Badge variant="outline" className="text-[10px] font-mono shrink-0">{a.actionId}</Badge>
                        <span className="text-xs font-mono text-muted-foreground truncate flex-1">{a.applicationGroup}/{a.applicationId}</span>
                        <span className="text-[11px] font-mono text-muted-foreground whitespace-nowrap">{new Date(a.timestamp).toLocaleString()}</span>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <div className="px-3 pb-3 pt-0">
                          <pre className={cn(
                            "text-[11px] font-mono text-muted-foreground bg-muted/40 rounded-md p-3 overflow-x-auto whitespace-pre-wrap break-all"
                          )}>
                            {prettyJson(a.actionData)}
                          </pre>
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                  ))
                )}
                {Array.from(
                  { length: ACTIONS_PAGE_SIZE - (actions.length === 0 ? 1 : pagedActions.length) },
                  (_, i) => (
                    <div
                      key={`filler-${i}`}
                      aria-hidden
                      className="rounded-lg border border-transparent px-3 py-2.5 invisible"
                    >
                      <div className="flex items-center gap-3">
                        <ChevronDown size={13} />
                        <Badge variant="outline" className="text-[10px] font-mono shrink-0">filler</Badge>
                        <span className="text-xs font-mono flex-1">filler</span>
                        <span className="text-[11px] font-mono whitespace-nowrap">filler</span>
                      </div>
                    </div>
                  )
                )}
              </div>

              {/* Pagination */}
              {actionsTotalPages > 1 && (
                <div className="flex items-center justify-between mt-4 pt-3 border-t border-border">
                  <span className="text-xs font-mono text-muted-foreground">
                    Showing {(actionsPage - 1) * ACTIONS_PAGE_SIZE + 1}
                    –{Math.min(actionsPage * ACTIONS_PAGE_SIZE, actions.length)} of {actions.length}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setActionsPage((p) => Math.max(1, p - 1))}
                      disabled={actionsPage === 1}
                    >
                      <ChevronLeft size={13} />
                    </Button>
                    {Array.from({ length: actionsTotalPages }, (_, i) => i + 1).map((n) => (
                      <Button
                        key={n}
                        size="sm"
                        variant={actionsPage === n ? "default" : "ghost"}
                        onClick={() => setActionsPage(n)}
                        className="w-7 h-7 p-0 text-xs font-mono"
                      >
                        {n}
                      </Button>
                    ))}
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setActionsPage((p) => Math.min(actionsTotalPages, p + 1))}
                      disabled={actionsPage === actionsTotalPages}
                    >
                      <ChevronRight size={13} />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
