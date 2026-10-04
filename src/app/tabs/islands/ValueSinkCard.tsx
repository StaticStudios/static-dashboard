import {useMemo, useState} from "react";
import {Area, AreaChart, CartesianGrid, XAxis, YAxis} from "recharts";
import {PackageOpen} from "lucide-react";
import {cn} from "../../../lib/utils";
import type {IslandValueSink} from "../../api/types";
import {useIslandValueSink} from "../../hooks/useIslands";
import {Badge} from "../../components/ui/badge";
import {Button} from "../../components/ui/button";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "../../components/ui/card";
import {Separator} from "../../components/ui/separator";
import {Skeleton} from "../../components/ui/skeleton";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "../../components/ui/table";
import {
  type ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "../../components/ui/chart";
import {titleCase} from "../../components/GroupCards";
import {num} from "../../components/StatBlocks";
import {ChartEmpty, tooltipFormatter} from "../../components/StatCharts";
import {formatClockTime, formatTimestamp} from "../../components/Timestamp";
import {resolveTimeRange, type TimeRange, TimeRangeFilter} from "../../components/TimeRangeFilter";

/** One per charted item, in the API's order; items past the last one are charted together as "Other". */
const SERIES_COLORS = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)"];
const OTHER_COLOR = "var(--muted-foreground)";
const OTHER_KEY = "other";

const COMPACT = new Intl.NumberFormat(undefined, { notation: "compact", maximumFractionDigits: 1 });
const DAY = new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric" });

type ValueScale = "log" | "linear";

/**
 * Y-axis ticks for the log scale: zero, then powers of ten up to the first one that covers `max`.
 * Every other power once there are more than six, so the labels don't crowd.
 */
function logTicks(max: number): number[] {
  const top = Math.max(1, Math.ceil(Math.log10(Math.max(max, 1))));
  const step = top > 6 ? 2 : 1;
  const ticks = [0];
  for (let power = top % step || step; power <= top; power += step) ticks.push(10 ** power);
  return ticks;
}

/** `minecraft:iron_ingot` → "Iron Ingot". */
function itemLabel(itemId: string): string {
  return titleCase(itemId.slice(itemId.lastIndexOf(":") + 1)) || itemId;
}

function percent(share: number): string {
  if (share > 0 && share < 0.001) return "<0.1%";
  return `${(share * 100).toFixed(1)}%`;
}

/** What an island's value sinks consumed over an adjustable time frame: value over time, then per item. */
export function ValueSinkCard({ islandId }: { islandId: string }) {
  const [range, setRange] = useState<TimeRange>({ preset: "7d" });
  const [scale, setScale] = useState<ValueScale>("log");
  // Resolved once per selection: a preset's "now" must not move on every render, or it would refetch.
  const { from, to } = useMemo(() => resolveTimeRange(range), [range]);
  const { data, loading, error } = useIslandValueSink(islandId, from, to);

  const items = data?.items ?? [];
  const totalValue = items.reduce((sum, item) => sum + item.contributedValue, 0);
  const colorByItem = new Map((data?.seriesItemIds ?? []).map((id, i) => [id, SERIES_COLORS[i]]));

  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
          <div className="flex items-center gap-2">
            <PackageOpen size={14} className="text-primary" />
            <CardTitle>Value Sink</CardTitle>
            <Badge variant="secondary" className="text-[10px]">{items.length}</Badge>
          </div>
          <TimeRangeFilter value={range} onChange={setRange} />
        </div>
        <CardDescription>
          {data
            ? `${num(data.totalCreditedValue)} island value credited across ${num(data.batchCount)} sink ticks`
            : "Items consumed by this island's value sinks"}
        </CardDescription>
      </CardHeader>
      <CardContent className={cn("transition-opacity", loading && data && "opacity-60")}>
        <div className="flex items-center justify-end gap-1 mb-2">
          <span className="text-[10px] font-mono text-muted-foreground mr-1">Value axis</span>
          {(["log", "linear"] as const).map((option) => (
            <Button
              key={option}
              size="xs"
              variant={scale === option ? "secondary" : "ghost"}
              aria-pressed={scale === option}
              onClick={() => setScale(option)}
            >
              {option === "log" ? "Log" : "Linear"}
            </Button>
          ))}
        </div>
        {loading && !data ? <Skeleton className="h-[240px] w-full" /> : <ValueChart data={data} scale={scale} />}
      </CardContent>
      <Separator />
      <div className={cn("max-h-[360px] overflow-y-auto transition-opacity", loading && data && "opacity-60")}>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Item</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead className="text-right">Value</TableHead>
              <TableHead className="text-right">Share</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="px-5 py-8 text-center text-xs font-mono text-muted-foreground">
                  {loading
                    ? "Loading…"
                    : error
                      ? "Could not load value sink data."
                      : "No items consumed in this time frame."}
                </TableCell>
              </TableRow>
            ) : (
              items.map((item) => (
                <TableRow key={item.itemId}>
                  <TableCell>
                    <span className="flex items-center gap-2">
                      {/* Matches the item's chart series; items charted as "Other" share its colour. */}
                      <span
                        className="size-2 shrink-0 rounded-[2px]"
                        style={{ backgroundColor: colorByItem.get(item.itemId) ?? OTHER_COLOR }}
                      />
                      <span className="min-w-0">
                        <span className="block text-xs font-mono text-foreground">{itemLabel(item.itemId)}</span>
                        <span className="block text-[10px] font-mono text-muted-foreground truncate">{item.itemId}</span>
                      </span>
                    </span>
                  </TableCell>
                  <TableCell className="text-right text-xs font-mono text-foreground tabular-nums">
                    {num(item.amount)}
                  </TableCell>
                  <TableCell className="text-right text-xs font-mono text-foreground tabular-nums">
                    {num(Math.round(item.contributedValue))}
                  </TableCell>
                  <TableCell className="text-right text-xs font-mono text-muted-foreground tabular-nums">
                    {totalValue > 0 ? percent(item.contributedValue / totalValue) : "—"}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
}

/**
 * Contributed value per time bucket, one overlaid series per item. Not stacked, and on a log axis by
 * default: items routinely differ by orders of magnitude, and on a stacked linear chart the smaller
 * ones vanish under the largest whenever they spike together.
 */
function ValueChart({ data, scale }: { data: IslandValueSink | null; scale: ValueScale }) {
  if (!data || data.series.length === 0) {
    return <ChartEmpty />;
  }

  // Item ids contain ":" and double as CSS variable names in the chart, so series get positional keys.
  const series = data.seriesItemIds.map((id, i) => ({ key: `item${i}`, id, label: itemLabel(id), color: SERIES_COLORS[i] }));
  const hasOther = data.series.some((point) => point.other > 0);
  const keys = [...series.map((s) => s.key), ...(hasOther ? [OTHER_KEY] : [])];

  const config: ChartConfig = Object.fromEntries(series.map((s) => [s.key, { label: s.label, color: s.color }]));
  if (hasOther) config[OTHER_KEY] = { label: "Other", color: OTHER_COLOR };
  const labels: Record<string, string> = Object.fromEntries(series.map((s) => [s.key, s.label]));
  labels[OTHER_KEY] = "Other";

  const points = data.series.map((point) => {
    const row: Record<string, number> = { time: new Date(point.time).getTime(), [OTHER_KEY]: Math.round(point.other) };
    for (const s of series) row[s.key] = Math.round(point.byItem[s.id] ?? 0);
    return row;
  });

  const max = Math.max(...points.flatMap((point) => keys.map((key) => point[key])));
  const ticks = logTicks(max);

  const daily = data.bucketSeconds >= 86_400;
  const spansDays = points[points.length - 1].time - points[0].time > 86_400_000;
  const formatTick = (time: number) =>
    daily || spansDays ? DAY.format(new Date(time)) : (formatClockTime(time, { seconds: false }) ?? "");
  const formatLabel = (time: number | undefined) =>
    time === undefined ? null : daily ? DAY.format(new Date(time)) : formatTimestamp(time);

  return (
    <ChartContainer config={config} className="h-[240px] w-full">
      <AreaChart data={points} margin={{ left: 4, right: 12, top: 8 }}>
        <defs>
          {keys.map((key) => (
            <linearGradient key={key} id={`fill-sink-${key}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={`var(--color-${key})`} stopOpacity={0.25} />
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
          tickFormatter={formatTick}
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          minTickGap={32}
        />
        {scale === "log" ? (
          <YAxis
            width={44}
            tickLine={false}
            axisLine={false}
            // Symmetric log: a plain log scale has no place for the zero-filled buckets. recharts
            // resolves the name against d3-scale at runtime; its ScaleType union just doesn't list it.
            scale={"symlog" as "log"}
            domain={[0, ticks[ticks.length - 1]]}
            ticks={ticks}
            tickFormatter={(value: number) => COMPACT.format(value)}
          />
        ) : (
          <YAxis
            width={44}
            tickLine={false}
            axisLine={false}
            allowDecimals={false}
            tickFormatter={(value: number) => COMPACT.format(value)}
          />
        )}
        <ChartTooltip
          content={
            <ChartTooltipContent
              labelFormatter={(_, payload) => formatLabel((payload?.[0]?.payload as { time?: number } | undefined)?.time)}
              // A custom formatter replaces the default row, colour marker included, so it is put back
              // here: several items share a hover, and the name alone doesn't say which line is which.
              formatter={(value, name) => (
                <span className="flex w-full items-center gap-2">
                  <span
                    className="size-2 shrink-0 rounded-[2px]"
                    style={{ backgroundColor: config[String(name)]?.color ?? OTHER_COLOR }}
                  />
                  {tooltipFormatter(value, labels[String(name)] ?? String(name))}
                </span>
              )}
            />
          }
        />
        {keys.map((key) => (
          <Area
            key={key}
            dataKey={key}
            type="monotone"
            stroke={`var(--color-${key})`}
            fill={`url(#fill-sink-${key})`}
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
