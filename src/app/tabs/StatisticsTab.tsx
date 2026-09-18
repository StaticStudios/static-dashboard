import type {ReactNode} from "react";
import {useState} from "react";
import {Navigate} from "react-router";
import {Area, AreaChart, CartesianGrid, XAxis, YAxis} from "recharts";
import {
  Activity,
  AlertTriangle,
  Box,
  Clock,
  Command,
  Repeat,
  Server,
  Terminal,
  Users,
  Zap,
} from "lucide-react";
import {cn, initials, rankAtLeast} from "../../lib/utils";
import {actionIdColor, actionLabel} from "../lib/auditActions";
import {useMe} from "../hooks/useMe";
import {useGameplayStatistics, useSessionStatistics, useStatisticsOverview} from "../hooks/useStatistics";
import type {CrateReward, StatCount, StatPoint} from "../api/types";
import {Badge} from "../components/ui/badge";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "../components/ui/card";
import {Progress} from "../components/ui/progress";
import {Separator} from "../components/ui/separator";
import {Skeleton} from "../components/ui/skeleton";
import {
  type ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "../components/ui/chart";
import {FilterSelect} from "../components/FilterSelect";
import {PlayerAvatar} from "../components/PlayerAvatar";
import {PlayerLink} from "../components/PlayerLink";

const WINDOW_OPTIONS = [
  { value: "7", label: "Last 7 days" },
  { value: "30", label: "Last 30 days" },
  { value: "90", label: "Last 90 days" },
];

/** Gamemodes get a fixed colour so a series keeps its identity between the tab's charts. */
const GROUP_COLORS: Record<string, string> = {
  proxy: "var(--chart-1)",
  skyblock: "var(--chart-2)",
  prison: "var(--chart-3)",
  hub: "var(--chart-4)",
};
const FALLBACK_GROUP_COLOR = "var(--chart-5)";

export function StatisticsTab() {
  const { me, loading } = useMe();

  // Wait for the rank before deciding — redirecting on a not-yet-loaded `me` would bounce an admin
  // who is allowed in.
  if (loading) {
    return <Skeleton className="h-64 w-full" />;
  }
  if (!rankAtLeast(me?.rank, "ADMIN")) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Statistics />;
}

function Statistics() {
  const [window, setWindow] = useState("30");
  const days = Number(window);

  const { data: overview, loading: overviewLoading, error: overviewError } = useStatisticsOverview(days);
  const { data: sessions, loading: sessionsLoading, error: sessionsError } = useSessionStatistics(days);
  const { data: gameplay, loading: gameplayLoading, error: gameplayError } = useGameplayStatistics(days);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold font-display tracking-tight text-foreground">Statistics</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Network activity from the audit log</p>
        </div>
        <FilterSelect
          value={window}
          onValueChange={setWindow}
          options={WINDOW_OPTIONS}
          className="w-[160px] shrink-0"
        />
      </div>

      {/* Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Events", value: overview?.totalEvents, icon: <Zap size={13} />, color: "text-primary" },
          { label: "Active Players", value: overview?.activePlayers, icon: <Users size={13} />, color: "text-blue-400" },
          { label: "Action Types", value: overview?.actionTypes, icon: <Activity size={13} />, color: "text-violet-400" },
          { label: "Servers", value: overview?.servers, icon: <Server size={13} />, color: "text-amber-400" },
        ].map((s) => (
          <Card key={s.label} className="px-4 py-3.5 flex-row items-center gap-3">
            <span className={s.color}>{s.icon}</span>
            <div className="min-w-0">
              <p className="text-lg font-bold font-mono text-foreground leading-none truncate">
                {overviewLoading ? "…" : num(s.value)}
              </p>
              <p className="text-[10px] font-mono text-muted-foreground mt-0.5">{s.label}</p>
            </div>
          </Card>
        ))}
      </div>

      <SectionError message={overviewError} />

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Activity size={14} className="text-primary" />
            <CardTitle>Events per day</CardTitle>
          </div>
          <CardDescription>Audit entries recorded, stacked by gamemode</CardDescription>
        </CardHeader>
        <CardContent>
          <StackedSeries
            points={(overview?.series ?? []).map((point) => ({ date: point.date, ...point.byGroup }))}
            groups={overview?.groups ?? []}
            loading={overviewLoading}
          />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Activity size={14} className="text-primary" />
              <CardTitle>Top actions</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <BarList
              rows={overview?.topActions ?? []}
              loading={overviewLoading}
              emptyLabel="No activity in this window."
              renderLabel={(row) => (
                <span className="flex items-center gap-2 min-w-0">
                  <Badge variant="outline" className={cn("text-[10px] font-mono shrink-0", actionIdColor(row.key))}>
                    {row.key}
                  </Badge>
                  <span className="text-xs text-muted-foreground truncate">{actionLabel(row.key)}</span>
                </span>
              )}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Users size={14} className="text-primary" />
              <CardTitle>Most active players</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {overviewLoading ? (
              <Skeleton className="h-40 w-full" />
            ) : (overview?.topPlayers ?? []).length === 0 ? (
              <EmptyRow label="No player activity in this window." />
            ) : (
              <div className="space-y-2.5">
                {overview!.topPlayers.map((player, i) => {
                  const name = player.name ?? "Unknown";
                  return (
                    <div key={player.id} className="flex items-center gap-3">
                      <span className="text-[10px] font-mono text-muted-foreground w-4 shrink-0">{i + 1}</span>
                      <PlayerLink id={player.id} name={name} className="min-w-0 flex-1">
                        <span className="flex items-center gap-2.5 min-w-0">
                          <PlayerAvatar
                            initials={initials(name)}
                            seed={i}
                            skinTextureValue={player.skinTextureValue}
                          />
                          <span className="text-sm text-foreground truncate">{name}</span>
                        </span>
                      </PlayerLink>
                      <span className="text-xs font-mono text-muted-foreground shrink-0">{num(player.count)}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Sessions */}
      <SectionHeading icon={<Clock size={14} />} title="Sessions" />
      <SectionError message={sessionsError} />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Logins", value: sessions?.logins, icon: <Zap size={13} />, color: "text-primary" },
          { label: "Unique Players", value: sessions?.uniquePlayers, icon: <Users size={13} />, color: "text-blue-400" },
          { label: "Completed Sessions", value: sessions?.completedSessions, icon: <Repeat size={13} />, color: "text-violet-400" },
        ].map((s) => (
          <Card key={s.label} className="px-4 py-3.5 flex-row items-center gap-3">
            <span className={s.color}>{s.icon}</span>
            <div className="min-w-0">
              <p className="text-lg font-bold font-mono text-foreground leading-none truncate">
                {sessionsLoading ? "…" : num(s.value)}
              </p>
              <p className="text-[10px] font-mono text-muted-foreground mt-0.5">{s.label}</p>
            </div>
          </Card>
        ))}
        <Card className="px-4 py-3.5 flex-row items-center gap-3">
          <span className="text-amber-400"><Clock size={13} /></span>
          <div className="min-w-0">
            <p className="text-lg font-bold font-mono text-foreground leading-none truncate">
              {sessionsLoading ? "…" : formatDuration(sessions?.medianSeconds ?? 0)}
            </p>
            <p className="text-[10px] font-mono text-muted-foreground mt-0.5">Median Session</p>
          </div>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Zap size={14} className="text-primary" />
            <CardTitle>Logins per day</CardTitle>
          </div>
          <CardDescription>Counted on the proxy, which sees each login exactly once</CardDescription>
        </CardHeader>
        <CardContent>
          <SingleSeries
            points={sessions?.loginSeries ?? []}
            label="Logins"
            loading={sessionsLoading}
          />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Clock size={14} className="text-primary" />
              <CardTitle>Session length</CardTitle>
            </div>
            <CardDescription>Sessions that recorded both a start and an end</CardDescription>
          </CardHeader>
          <CardContent>
            <BarList rows={sessions?.lengthBuckets ?? []} loading={sessionsLoading} emptyLabel="No completed sessions." />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Server size={14} className="text-primary" />
              <CardTitle>Sessions by gamemode</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <BarList rows={sessions?.byGamemode ?? []} loading={sessionsLoading} emptyLabel="No sessions in this window." />
          </CardContent>
        </Card>
      </div>

      {/* Gameplay */}
      <SectionHeading icon={<Command size={14} />} title="Gameplay" />
      <SectionError message={gameplayError} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Terminal size={14} className="text-primary" />
              <CardTitle>Top commands</CardTitle>
            </div>
            <CardDescription>Grouped by the command itself, arguments excluded</CardDescription>
          </CardHeader>
          <CardContent>
            <BarList rows={gameplay?.topCommands ?? []} loading={gameplayLoading} emptyLabel="No commands in this window." mono />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Box size={14} className="text-primary" />
              <CardTitle>Crates &amp; lootboxes opened</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <BarList rows={gameplay?.crateOpens ?? []} loading={gameplayLoading} emptyLabel="Nothing opened in this window." mono />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Box size={14} className="text-primary" />
            <CardTitle>Reward distribution</CardTitle>
          </div>
          <CardDescription>Share of opens per reward — compare against the configured drop rates</CardDescription>
        </CardHeader>
        <CardContent>
          <RewardDistribution rewards={gameplay?.crateRewards ?? []} loading={gameplayLoading} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Repeat size={14} className="text-primary" />
            <CardTitle>Trades</CardTitle>
          </div>
          <CardDescription>Counted once per trade, from the initiating player</CardDescription>
        </CardHeader>
        <CardContent>
          {gameplayLoading ? (
            <Skeleton className="h-20 w-full" />
          ) : (
            <>
              <div className="flex items-baseline gap-6 mb-4">
                <Figure label="Started" value={num(gameplay?.tradesStarted)} />
                <Figure label="Completed" value={num(gameplay?.tradesCompleted)} />
                <Figure label="Completion" value={completionRate(gameplay?.tradesStarted, gameplay?.tradesCompleted)} />
              </div>
              <BarList rows={gameplay?.tradeResults ?? []} loading={false} emptyLabel="No completed trades in this window." />
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function SectionHeading({ icon, title }: { icon: ReactNode; title: string }) {
  return (
    <div className="flex items-center gap-2 pt-2">
      <span className="text-primary">{icon}</span>
      <h2 className="text-sm font-semibold font-display tracking-tight text-foreground">{title}</h2>
      <Separator className="flex-1" />
    </div>
  );
}

function SectionError({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <Card className="px-5 py-4 flex-row items-center gap-2.5 border-red-500/20 bg-red-500/5">
      <AlertTriangle size={15} className="text-red-400 shrink-0" />
      <span className="text-sm font-mono text-red-400">{message}</span>
    </Card>
  );
}

function Figure({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-lg font-bold font-mono text-foreground leading-none">{value}</p>
      <p className="text-[10px] font-mono text-muted-foreground mt-0.5">{label}</p>
    </div>
  );
}

function EmptyRow({ label }: { label: string }) {
  return <p className="py-8 text-center text-sm font-mono text-muted-foreground">{label}</p>;
}

/**
 * A ranked breakdown as labelled bars. Preferred over a pie or a multi-series chart because the theme
 * defines only five chart colours, and these lists routinely run to fifteen entries.
 */
function BarList({
  rows,
  loading,
  emptyLabel,
  mono,
  renderLabel,
}: {
  rows: StatCount[];
  loading: boolean;
  emptyLabel: string;
  mono?: boolean;
  renderLabel?: (row: StatCount) => ReactNode;
}) {
  if (loading) {
    return <Skeleton className="h-40 w-full" />;
  }
  if (rows.length === 0) {
    return <EmptyRow label={emptyLabel} />;
  }

  // Scaled against the largest row rather than the total, so the smaller entries stay legible.
  const max = Math.max(...rows.map((row) => row.count), 1);

  return (
    <div className="space-y-2.5">
      {rows.map((row) => (
        <div key={row.key}>
          <div className="flex items-center justify-between gap-3 mb-1">
            {renderLabel ? (
              renderLabel(row)
            ) : (
              <span className={cn("text-xs text-foreground truncate", mono && "font-mono")}>{row.label}</span>
            )}
            <span className="text-xs font-mono text-muted-foreground shrink-0">{num(row.count)}</span>
          </div>
          <Progress value={(row.count / max) * 100} className="h-1.5" />
        </div>
      ))}
    </div>
  );
}

/** Rewards grouped by the crate they came from, so each group's shares add up to 100%. */
function RewardDistribution({ rewards, loading }: { rewards: CrateReward[]; loading: boolean }) {
  if (loading) {
    return <Skeleton className="h-40 w-full" />;
  }
  if (rewards.length === 0) {
    return <EmptyRow label="No rewards recorded in this window." />;
  }

  const byCrate = new Map<string, CrateReward[]>();
  for (const reward of rewards) {
    const group = byCrate.get(reward.crateId) ?? [];
    group.push(reward);
    byCrate.set(reward.crateId, group);
  }

  return (
    <div className="space-y-5">
      {[...byCrate.entries()].map(([crateId, group]) => (
        <div key={crateId}>
          <p className="text-xs font-mono text-foreground mb-2">{crateId}</p>
          <div className="space-y-2">
            {group.map((reward) => (
              <div key={reward.rewardName}>
                <div className="flex items-center justify-between gap-3 mb-1">
                  <span className="text-xs text-muted-foreground truncate">{reward.rewardName}</span>
                  <span className="text-xs font-mono text-muted-foreground shrink-0">
                    {(reward.share * 100).toFixed(1)}% · {num(reward.count)}
                  </span>
                </div>
                <Progress value={reward.share * 100} className="h-1.5" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function SingleSeries({ points, label, loading }: { points: StatPoint[]; label: string; loading: boolean }) {
  const data = points.map((point) => ({ date: shortDate(point.date), count: point.count }));
  const config: ChartConfig = { count: { label, color: "var(--chart-1)" } };

  if (loading) {
    return <Skeleton className="h-[240px] w-full" />;
  }
  if (data.length === 0) {
    return <ChartEmpty />;
  }

  return (
    <ChartContainer config={config} className="h-[240px] w-full">
      <AreaChart data={data} margin={{ left: 4, right: 12, top: 8 }}>
        <defs>
          <linearGradient id="fillCount" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="var(--color-count)" stopOpacity={0.35} />
            <stop offset="95%" stopColor="var(--color-count)" stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} />
        <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} minTickGap={32} />
        <YAxis width={44} tickLine={false} axisLine={false} allowDecimals={false} />
        <ChartTooltip content={<ChartTooltipContent formatter={tooltipFormatter} />} />
        <Area
          dataKey="count"
          type="monotone"
          stroke="var(--color-count)"
          fill="url(#fillCount)"
          strokeWidth={2}
          isAnimationActive={false}
          dot={false}
        />
      </AreaChart>
    </ChartContainer>
  );
}

function StackedSeries({
  points,
  groups,
  loading,
}: {
  points: Record<string, string | number>[];
  groups: string[];
  loading: boolean;
}) {
  if (loading) {
    return <Skeleton className="h-[240px] w-full" />;
  }
  if (points.length === 0 || groups.length === 0) {
    return <ChartEmpty />;
  }

  const config: ChartConfig = Object.fromEntries(
    groups.map((group) => [group, { label: group, color: GROUP_COLORS[group] ?? FALLBACK_GROUP_COLOR }]),
  );
  const data = points.map((point) => ({ ...point, date: shortDate(String(point.date)) }));

  return (
    <ChartContainer config={config} className="h-[240px] w-full">
      <AreaChart data={data} margin={{ left: 4, right: 12, top: 8 }}>
        <defs>
          {groups.map((group) => (
            <linearGradient key={group} id={`fill-${group}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={`var(--color-${group})`} stopOpacity={0.35} />
              <stop offset="95%" stopColor={`var(--color-${group})`} stopOpacity={0.02} />
            </linearGradient>
          ))}
        </defs>
        <CartesianGrid vertical={false} />
        <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} minTickGap={32} />
        <YAxis width={44} tickLine={false} axisLine={false} allowDecimals={false} />
        <ChartTooltip content={<ChartTooltipContent formatter={tooltipFormatter} />} />
        {groups.map((group) => (
          <Area
            key={group}
            dataKey={group}
            type="monotone"
            stackId="events"
            stroke={`var(--color-${group})`}
            fill={`url(#fill-${group})`}
            strokeWidth={2}
            isAnimationActive={false}
            dot={false}
          />
        ))}
        <ChartLegend content={<ChartLegendContent />} />
      </AreaChart>
    </ChartContainer>
  );
}

function tooltipFormatter(value: unknown, name: string) {
  return (
    <span className="flex w-full items-center justify-between gap-3">
      <span className="text-muted-foreground">{name}</span>
      <span className="font-mono font-medium text-foreground tabular-nums">{Number(value).toLocaleString()}</span>
    </span>
  );
}

function ChartEmpty() {
  return (
    <div className="h-[240px] flex items-center justify-center">
      <p className="text-xs font-mono text-muted-foreground">No activity in this window.</p>
    </div>
  );
}

function num(value: number | undefined): string {
  return (value ?? 0).toLocaleString();
}

function completionRate(started: number | undefined, completed: number | undefined): string {
  if (!started) return "—";
  return `${Math.round(((completed ?? 0) / started) * 100)}%`;
}

function formatDuration(seconds: number): string {
  if (seconds <= 0) return "—";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m`;
  return `${Math.floor(seconds)}s`;
}

function shortDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}
