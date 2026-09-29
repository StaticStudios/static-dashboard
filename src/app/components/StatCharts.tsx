import type {ReactNode} from "react";
import {Area, AreaChart, CartesianGrid, XAxis, YAxis} from "recharts";
import {Activity, Zap} from "lucide-react";
import type {SessionStatistics, StatPoint} from "../api/types";
import type {PlayerPoint} from "../hooks/usePlayerCountHistory";
import {GAMEMODES} from "../../lib/gamemodes";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "./ui/card";
import {Skeleton} from "./ui/skeleton";
import {
  type ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "./ui/chart";
import {formatClockTime, formatTimestamp} from "./Timestamp";

/**
 * Charts shown on more than one page: the daily logins chart (Statistics and Overview) and the
 * player-count chart (Overview and Statistics), plus the small helpers the Statistics charts share.
 */

const LOGIN_SERIES = [
  { key: "logins", label: "Logins", color: "var(--chart-1)" },
  { key: "unique", label: "Unique player logins", color: "var(--chart-4)" },
  { key: "new", label: "New player logins", color: "var(--chart-5)" },
] as const;

/** The "Logins per day" card. `sessions` comes from `useSessionStatistics`, which is ADMIN-only. */
export function LoginsPerDayCard({
  sessions,
  loading,
  days,
}: {
  sessions: SessionStatistics | null;
  loading: boolean;
  /** Shown in the description when the page has no window picker of its own. */
  days?: number;
}) {
  const points: Record<(typeof LOGIN_SERIES)[number]["key"], StatPoint[]> = {
    logins: sessions?.loginSeries ?? [],
    unique: sessions?.uniquePlayerSeries ?? [],
    new: sessions?.newPlayerSeries ?? [],
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Zap size={14} className="text-primary" />
          <CardTitle>Logins per day</CardTitle>
          {days !== undefined && <CardDescription>last {days} days</CardDescription>}
        </div>
        <CardDescription>
          Counted on the proxy, which sees each login exactly once. New players are first ever joins.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <MultiSeries series={LOGIN_SERIES.map((s) => ({ ...s, points: points[s.key] }))} loading={loading} />
      </CardContent>
    </Card>
  );
}

const PLAYER_COUNT_CONFIG = {
  network: { label: "Network", color: "var(--chart-1)" },
  skyblock: GAMEMODES.skyblock,
  prison: GAMEMODES.prison,
} satisfies ChartConfig;

const PLAYER_COUNT_KEYS = ["network", "skyblock", "prison"] as const;

/** Network, Skyblock and Prison player counts over time, from `usePlayerCountHistory`. */
export function PlayerCountChart({ history, minutes }: { history: PlayerPoint[]; minutes: number }) {
  if (history.length === 0) {
    return (
      <div className="h-[240px] flex items-center justify-center">
        <p className="text-xs font-mono text-muted-foreground">Collecting data…</p>
      </div>
    );
  }

  // Seconds only matter while the axis spans minutes; past an hour they are noise.
  const seconds = minutes <= 60;

  return (
    <ChartContainer config={PLAYER_COUNT_CONFIG} className="h-[240px] w-full">
      <AreaChart data={history} margin={{ left: 4, right: 12, top: 8 }}>
        <defs>
          {PLAYER_COUNT_KEYS.map((key) => (
            <linearGradient key={key} id={`fill-count-${key}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={`var(--color-${key})`} stopOpacity={0.35} />
              <stop offset="95%" stopColor={`var(--color-${key})`} stopOpacity={0.02} />
            </linearGradient>
          ))}
        </defs>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="time"
          type="number"
          scale="time"
          domain={["dataMin", "dataMax"]}
          tickFormatter={(t: number) => formatClockTime(t, { seconds }) ?? ""}
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          minTickGap={32}
        />
        <YAxis width={32} tickLine={false} axisLine={false} allowDecimals={false} />
        <ChartTooltip
          content={
            <ChartTooltipContent
              labelFormatter={(_, payload) => {
                const time = (payload?.[0]?.payload as PlayerPoint | undefined)?.time;
                return seconds ? formatClockTime(time) : formatTimestamp(time);
              }}
            />
          }
        />
        {PLAYER_COUNT_KEYS.map((key) => (
          <Area
            key={key}
            dataKey={key}
            type="monotone"
            stroke={`var(--color-${key})`}
            fill={`url(#fill-count-${key})`}
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

/** The Activity icon + title row both player-count cards use. */
export function PlayerCountTitle({ children }: { children?: ReactNode }) {
  return (
    <div className="flex items-center gap-2">
      <Activity size={14} className="text-primary" />
      <CardTitle>Player Count</CardTitle>
      {children}
    </div>
  );
}

export interface Series {
  key: string;
  label: string;
  color: string;
  points: StatPoint[];
}

/**
 * Several daily counts overlaid, not stacked: each is a subset of the one before it (new players are
 * unique players, which are logins), so stacking would double count.
 */
export function MultiSeries({ series, loading }: { series: Series[]; loading: boolean }) {
  if (loading) {
    return <Skeleton className="h-[240px] w-full" />;
  }

  // The API zero-fills every series over the same window, but join on the date rather than the index
  // so a series that comes back empty or shorter can't shift the others.
  const byDate = new Map<string, Record<string, string | number>>();
  for (const s of series) {
    for (const point of s.points) {
      const row = byDate.get(point.date) ?? { date: point.date };
      row[s.key] = point.count;
      byDate.set(point.date, row);
    }
  }
  const data = [...byDate.values()]
    .sort((a, b) => String(a.date).localeCompare(String(b.date)))
    .map((row) => ({ ...row, date: shortDate(String(row.date)) }));

  if (data.length === 0) {
    return <ChartEmpty />;
  }

  const config: ChartConfig = Object.fromEntries(series.map((s) => [s.key, { label: s.label, color: s.color }]));
  // Keys double as CSS variable names, so they can't be the human-readable labels the tooltip shows.
  const labels = Object.fromEntries(series.map((s) => [s.key, s.label]));
  const formatter = (value: unknown, name: string) => tooltipFormatter(value, labels[name] ?? name);

  return (
    <ChartContainer config={config} className="h-[240px] w-full">
      <AreaChart data={data} margin={{ left: 4, right: 12, top: 8 }}>
        <defs>
          {series.map((s) => (
            <linearGradient key={s.key} id={`fill-series-${s.key}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={`var(--color-${s.key})`} stopOpacity={0.25} />
              <stop offset="95%" stopColor={`var(--color-${s.key})`} stopOpacity={0.02} />
            </linearGradient>
          ))}
        </defs>
        <CartesianGrid vertical={false} />
        <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} minTickGap={32} />
        <YAxis width={44} tickLine={false} axisLine={false} allowDecimals={false} />
        <ChartTooltip content={<ChartTooltipContent formatter={formatter} />} />
        {series.map((s) => (
          <Area
            key={s.key}
            dataKey={s.key}
            type="monotone"
            stroke={`var(--color-${s.key})`}
            fill={`url(#fill-series-${s.key})`}
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

export function tooltipFormatter(value: unknown, name: string) {
  return (
    <span className="flex w-full items-center justify-between gap-3">
      <span className="text-muted-foreground">{name}</span>
      <span className="font-mono font-medium text-foreground tabular-nums">{Number(value).toLocaleString()}</span>
    </span>
  );
}

export function ChartEmpty() {
  return (
    <div className="h-[240px] flex items-center justify-center">
      <p className="text-xs font-mono text-muted-foreground">No activity in this window.</p>
    </div>
  );
}

/**
 * A `YYYY-MM-DD` day from the API. These are calendar days bucketed in UTC, not instants, so they are
 * formatted in UTC: formatting in the viewer's zone would show the day before anywhere west of UTC.
 */
export function shortDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric", timeZone: "UTC" });
}
