import type {ReactNode} from "react";
import {CartesianGrid, Line, LineChart, ReferenceLine, XAxis, YAxis} from "recharts";
import {Info} from "lucide-react";
import {cn} from "../../../lib/utils";
import {tint} from "../../../lib/gamemodes";
import {type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent} from "../../components/ui/chart";
import {Popover, PopoverContent, PopoverTrigger} from "../../components/ui/popover";
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

/** Colours of the threshold lines, reused for their numbers on the axis and in the chart explanations. */
const DEGRADED_COLOR = "#f59e0b";
const CRITICAL_COLOR = "var(--destructive)";

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
  /** Top of the Y axis for the largest value drawn. */
  top: (max: number) => number;
  /** Plain axis ticks; the threshold values are always added on top of these. */
  ticks: (top: number) => number[];
  lines: { y: number; critical: boolean }[];
}> = {
  tps: {
    pick: (p) => p.tps,
    unit: "TPS",
    top: () => 20,
    // No 20: it would sit too close to the 18 threshold to read on the small charts.
    ticks: () => [0, 5, 10],
    lines: [{ y: TPS_DEGRADED, critical: false }, { y: TPS_CRITICAL, critical: true }],
  },
  mspt: {
    pick: (p) => p.mspt,
    unit: "ms",
    top: (max) => Math.max(60, Math.ceil(max / 10) * 10),
    ticks: (top) => [0, 20, top],
    lines: [{ y: MSPT_DEGRADED, critical: false }, { y: MSPT_CRITICAL, critical: true }],
  },
};

/** What a chart shows and what its threshold lines mean, for the info popover beside its title. */
function chartExplanation(metric: ChartMetric, showP95: boolean): ReactNode {
  const degraded = <span style={{ color: DEGRADED_COLOR }}>amber</span>;
  const critical = <span style={{ color: CRITICAL_COLOR }}>red</span>;
  if (metric === "tps") {
    return (
      <>
        <p>
          Ticks per second, averaged over the last minute. 20 is the maximum: the server keeps up with every
          game tick. One line per server.
        </p>
        <p>
          Below the {degraded} line ({TPS_DEGRADED}) the server counts as degraded. Below the {critical} line
          ({TPS_CRITICAL}) it is critical and players notice lag.
        </p>
      </>
    );
  }
  return (
    <>
      <p>
        Milliseconds per tick: how long the server takes to run one game tick, as a 10-second mean (Paper's own
        average before spark starts).
      </p>
      <p>
        Each tick has a {MSPT_CRITICAL}ms budget. Above the {critical} line ({MSPT_CRITICAL}ms) the server can no
        longer hold 20 TPS; the {degraded} line ({MSPT_DEGRADED}ms) warns that it is getting close.
      </p>
      {showP95 && (
        <p>
          The dashed line is the 95th percentile: the slowest ticks, which show short lag spikes that the mean
          smooths over.
        </p>
      )}
    </>
  );
}

/**
 * A chart's title with an info button on the right explaining the chart. The explanation opens on click
 * rather than hover, so it also works on touch screens.
 */
export function ChartTitle({ title, metric, showP95 = false }: { title: ReactNode; metric: ChartMetric; showP95?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-2 mb-2">
      <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">{title}</p>
      <Popover>
        <PopoverTrigger asChild>
          <button
            type="button"
            aria-label="What this chart shows"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <Info size={12} />
          </button>
        </PopoverTrigger>
        <PopoverContent align="end" className="w-72 p-3 space-y-2 text-[11px] leading-snug text-muted-foreground">
          {chartExplanation(metric, showP95)}
        </PopoverContent>
      </Popover>
    </div>
  );
}

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

  let max = 0;
  for (const row of data) {
    for (const [key, value] of Object.entries(row)) {
      if (key !== "t" && value > max) max = value;
    }
  }
  const top = spec.top(max);
  const thresholdColor = new Map(spec.lines.map((line) => [line.y, line.critical ? CRITICAL_COLOR : DEGRADED_COLOR]));
  const ticks = [...new Set([...spec.ticks(top), ...thresholdColor.keys()])].sort((a, b) => a - b);

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
          domain={[0, top]}
          ticks={ticks}
          interval={0}
          allowDataOverflow={metric === "tps"}
          tick={({ x, y, payload }: { x: number; y: number; payload: { value: number } }) => (
            <text
              x={x}
              y={y}
              dy={3}
              textAnchor="end"
              fontSize={10}
              fill={thresholdColor.get(payload.value) ?? "var(--muted-foreground)"}
              fontWeight={thresholdColor.has(payload.value) ? 600 : undefined}
            >
              {payload.value}
            </text>
          )}
        />
        {spec.lines.map((line) => (
          <ReferenceLine
            key={line.y}
            y={line.y}
            stroke={line.critical ? CRITICAL_COLOR : DEGRADED_COLOR}
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
