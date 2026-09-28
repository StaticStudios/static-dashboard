import type {ReactNode} from "react";
import {CartesianGrid, Line, LineChart, ReferenceLine, XAxis, YAxis} from "recharts";
import {cn} from "../../../lib/utils";
import {tint} from "../../../lib/gamemodes";
import {type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent} from "../../components/ui/chart";
import {formatClockTime, formatTimestamp} from "../../components/Timestamp";
import type {BackendHealthPoint, BackendServerMetrics, ServerGroupMetrics} from "../../api/types";

/*
 * Health thresholds. A tick has a 50ms budget; past it the server can no longer hold 20 TPS.
 * A sample older than STALE_MS means a live server (still in Redis presence) that stopped sampling.
 */
export const TPS_DEGRADED = 18;
export const TPS_CRITICAL = 15;
export const MSPT_DEGRADED = 40;
export const MSPT_CRITICAL = 50;
const STALE_MS = 30_000;

export type Health = "healthy" | "degraded" | "critical" | "stale" | "starting" | "offline";

const HEALTH_RANK: Record<Health, number> = { healthy: 0, starting: 1, degraded: 2, stale: 3, critical: 4, offline: 5 };

/** Spark's 10s mean when available, otherwise Paper's rolling average. */
export function meanMspt(sample: { msptMean10s: number | null; mspt: number }): number {
  return sample.msptMean10s ?? sample.mspt;
}

export function serverHealth(server: BackendServerMetrics, now: number): Health {
  const latest = server.latest;
  if (!latest) return "starting";
  if (now - new Date(latest.timestamp).getTime() > STALE_MS) return "stale";
  const mspt = meanMspt(latest);
  if (latest.tps1m < TPS_CRITICAL || mspt >= MSPT_CRITICAL) return "critical";
  if (latest.tps1m < TPS_DEGRADED || mspt >= MSPT_DEGRADED) return "degraded";
  return "healthy";
}

/** The worst of the group's servers; a group with no live server is offline. */
export function groupHealth(group: ServerGroupMetrics, now: number): Health {
  if (group.servers.length === 0) return "offline";
  return group.servers
    .map((s) => serverHealth(s, now))
    .reduce((worst, h) => (HEALTH_RANK[h] > HEALTH_RANK[worst] ? h : worst), "healthy" as Health);
}

const HEALTH_STYLE: Record<Health, { label: string; className: string }> = {
  healthy: { label: "Healthy", className: "text-green-400 bg-green-500/10 ring-green-500/30" },
  starting: { label: "Starting", className: "text-sky-400 bg-sky-500/10 ring-sky-500/30" },
  degraded: { label: "Degraded", className: "text-amber-400 bg-amber-500/10 ring-amber-500/30" },
  stale: { label: "No recent data", className: "text-amber-400 bg-amber-500/10 ring-amber-500/30" },
  critical: { label: "Critical", className: "text-red-400 bg-red-500/10 ring-red-500/30" },
  offline: { label: "Offline", className: "text-muted-foreground bg-white/5 ring-white/10" },
};

export function HealthBadge({ health }: { health: Health }) {
  const style = HEALTH_STYLE[health];
  return (
    <span className={cn("inline-flex h-6 items-center gap-1.5 rounded-md px-2 text-[10px] font-mono font-semibold ring-1", style.className)}>
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {style.label}
    </span>
  );
}

/** Colour for a value against its thresholds; `higherIsBetter` for TPS, not for MSPT. */
export function thresholdClass(value: number | null | undefined, degraded: number, critical: number, higherIsBetter: boolean) {
  if (value === null || value === undefined) return "text-muted-foreground";
  const bad = higherIsBetter ? value < critical : value >= critical;
  const warn = higherIsBetter ? value < degraded : value >= degraded;
  return bad ? "text-red-400" : warn ? "text-amber-400" : "text-green-400";
}

export function MetricTile({
  icon,
  label,
  value,
  sub,
  valueClassName,
}: {
  icon: ReactNode;
  label: string;
  value: ReactNode;
  sub?: ReactNode;
  valueClassName?: string;
}) {
  return (
    <div className="rounded-lg border border-border bg-black/20 px-3.5 py-3 min-w-0">
      <p className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
        {icon}
        {label}
      </p>
      <p className={cn("mt-1.5 text-xl font-bold font-mono leading-none truncate text-foreground", valueClassName)}>{value}</p>
      {sub && <p className="mt-1.5 text-[10px] font-mono text-muted-foreground truncate">{sub}</p>}
    </div>
  );
}

/** A labelled horizontal bar; `percent` is 0–100 or null when unknown. */
export function ResourceBar({
  icon,
  label,
  percent,
  value,
  sub,
  color,
}: {
  icon: ReactNode;
  label: string;
  percent: number | null;
  value: ReactNode;
  sub?: ReactNode;
  color: string;
}) {
  return (
    <div className="min-w-0">
      <div className="flex items-center justify-between gap-2">
        <span className="flex items-center gap-1.5 text-xs font-mono text-muted-foreground">
          {icon}
          {label}
        </span>
        <span className="text-xs font-mono font-semibold" style={{ color: percent === null ? undefined : color }}>
          {value}
        </span>
      </div>
      <div className="mt-2 h-1.5 rounded-full bg-white/5 overflow-hidden">
        <div className="h-full rounded-full transition-all" style={{ width: `${Math.min(100, Math.max(0, percent ?? 0))}%`, background: color }} />
      </div>
      {sub && <p className="mt-1.5 text-[10px] font-mono text-muted-foreground truncate">{sub}</p>}
    </div>
  );
}

export function formatNumber(value: number | null | undefined, digits = 1): string {
  return value === null || value === undefined ? "—" : value.toFixed(digits);
}

export function formatBytes(bytes: number): string {
  const gib = bytes / 1024 ** 3;
  return gib >= 1 ? `${gib.toFixed(1)} GB` : `${Math.round(bytes / 1024 ** 2)} MB`;
}

/** Elapsed time since `from`, as "2d 3h", "3h 12m" or "12m". */
export function formatUptime(from: string | null, now: number): string {
  if (!from) return "—";
  const minutes = Math.max(0, Math.floor((now - new Date(from).getTime()) / 60_000));
  const days = Math.floor(minutes / 1440);
  const hours = Math.floor((minutes % 1440) / 60);
  const mins = minutes % 60;
  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${mins}m`;
  return `${mins}m`;
}

/** Line colour for the i-th server in a group: the gamemode colour, lighter for each further server. */
export function seriesColor(color: string, index: number): string {
  if (index === 0) return color;
  return `color-mix(in oklab, ${color} ${Math.max(35, 100 - index * 22)}%, white)`;
}

/** Bucket width for lining up samples from different servers on one time axis (the sample interval). */
const BUCKET_MS = 5_000;

type Row = { t: number } & Record<string, number>;

function mergeHistories(servers: BackendServerMetrics[], pick: (p: BackendHealthPoint) => number | null): Row[] {
  const rows = new Map<number, Row>();
  servers.forEach((server, i) => {
    for (const point of server.history) {
      const value = pick(point);
      if (value === null) continue;
      const t = Math.round(new Date(point.timestamp).getTime() / BUCKET_MS) * BUCKET_MS;
      const row = rows.get(t) ?? ({ t } as Row);
      row[`s${i}`] = value;
      rows.set(t, row);
    }
  });
  return [...rows.values()].sort((a, b) => a.t - b.t);
}

export type ChartMetric = "tps" | "mspt";

const METRIC: Record<ChartMetric, {
  pick: (p: BackendHealthPoint) => number | null;
  unit: string;
  domain: [number, number | ((max: number) => number)];
  lines: { y: number; critical: boolean }[];
}> = {
  tps: {
    pick: (p) => p.tps,
    unit: "TPS",
    domain: [0, 20],
    lines: [{ y: TPS_DEGRADED, critical: false }, { y: TPS_CRITICAL, critical: true }],
  },
  mspt: {
    pick: (p) => p.mspt,
    unit: "ms",
    domain: [0, (max) => Math.max(60, Math.ceil(max / 10) * 10)],
    lines: [{ y: MSPT_DEGRADED, critical: false }, { y: MSPT_CRITICAL, critical: true }],
  },
};

/**
 * TPS or MSPT over the window, one line per server in the gamemode colour. With `showP95` (meant for a
 * single server) the 95th-percentile tick time is drawn dashed alongside the mean, so spikes that the
 * mean smooths over stay visible.
 */
export function HealthChart({
  servers,
  metric,
  color,
  height = 160,
  showP95 = false,
}: {
  servers: BackendServerMetrics[];
  metric: ChartMetric;
  color: string;
  height?: number;
  showP95?: boolean;
}) {
  const spec = METRIC[metric];
  const drawP95 = showP95 && metric === "mspt";
  const data = mergeHistories(servers, spec.pick);
  const p95 = drawP95 ? mergeHistories(servers, (p) => p.msptP95) : [];
  if (drawP95) {
    const byT = new Map(data.map((row) => [row.t, row]));
    for (const row of p95) {
      const target = byT.get(row.t);
      if (target && row.s0 !== undefined) target.p95 = row.s0;
    }
  }

  const config: ChartConfig = Object.fromEntries(
    servers.map((s, i) => [`s${i}`, { label: s.serverId, color: seriesColor(color, i) }])
  );
  if (drawP95) config.p95 = { label: "p95", color };

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center" style={{ height }}>
        <p className="text-xs font-mono text-muted-foreground">Collecting data…</p>
      </div>
    );
  }

  return (
    <ChartContainer config={config} className="w-full aspect-auto" style={{ height }}>
      <LineChart data={data} margin={{ left: 0, right: 8, top: 6, bottom: 0 }}>
        <CartesianGrid vertical={false} strokeOpacity={0.5} />
        <XAxis
          dataKey="t"
          type="number"
          scale="time"
          domain={["dataMin", "dataMax"]}
          tickFormatter={(t: number) => formatClockTime(t) ?? ""}
          tickLine={false}
          axisLine={false}
          tickMargin={6}
          minTickGap={48}
          fontSize={10}
        />
        <YAxis
          width={30}
          tickLine={false}
          axisLine={false}
          fontSize={10}
          domain={spec.domain}
          allowDataOverflow={metric === "tps"}
        />
        {spec.lines.map((line) => (
          <ReferenceLine
            key={line.y}
            y={line.y}
            stroke={line.critical ? "var(--destructive)" : "#f59e0b"}
            strokeDasharray="4 4"
            strokeOpacity={0.5}
          />
        ))}
        <ChartTooltip
          content={
            <ChartTooltipContent
              labelFormatter={(_, payload) => formatTimestamp(payload?.[0]?.payload?.t) ?? ""}
              formatter={(value, name) => (
                <div className="flex w-full items-center justify-between gap-3">
                  <span className="text-muted-foreground">{config[String(name)]?.label ?? name}</span>
                  <span className="font-mono font-medium text-foreground">
                    {Number(value).toFixed(metric === "tps" ? 2 : 1)} {spec.unit}
                  </span>
                </div>
              )}
            />
          }
        />
        {servers.map((_, i) => (
          <Line
            key={i}
            dataKey={`s${i}`}
            type="monotone"
            stroke={`var(--color-s${i})`}
            strokeWidth={2}
            dot={false}
            connectNulls
            isAnimationActive={false}
          />
        ))}
        {drawP95 && (
          <Line
            dataKey="p95"
            type="monotone"
            stroke="var(--color-p95)"
            strokeWidth={1.5}
            strokeDasharray="3 3"
            strokeOpacity={0.7}
            dot={false}
            connectNulls
            isAnimationActive={false}
          />
        )}
      </LineChart>
    </ChartContainer>
  );
}

/** The card header shared by the overview and group pages: tinted in the gamemode colour. */
export function tintedCardStyle(color: string) {
  return {
    borderColor: tint(color, 30),
    background: `linear-gradient(180deg, ${tint(color, 10)} 0%, transparent 140px)`,
  };
}
