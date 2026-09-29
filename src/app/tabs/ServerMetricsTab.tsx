import type {ReactNode} from "react";
import {Link} from "react-router";
import {Activity, ChevronRight, Gauge, Globe, Landmark, Pickaxe, RefreshCw, Server, Sword, Timer, Users} from "lucide-react";
import {gamemodeStyle, tint} from "../../lib/gamemodes";
import {Card} from "../components/ui/card";
import {Button} from "../components/ui/button";
import {Timestamp} from "../components/Timestamp";
import {StatCard} from "../components/StatBlocks";
import {useServerMetrics} from "../hooks/useServerMetrics";
import type {ServerGroupMetrics, ServerMetricsResponse} from "../api/types";
import {
  formatNumber,
  groupHealth,
  HealthBadge,
  HealthChart,
  ChartTitle,
  MetricTile,
  meanMspt,
  MSPT_CRITICAL,
  MSPT_DEGRADED,
  thresholdClass,
  tintedCardStyle,
  TPS_CRITICAL,
  TPS_DEGRADED,
} from "./serverMetrics/parts";
import {SparkReportsCard} from "./serverMetrics/SparkReports";

const GROUP_ICONS: Record<string, ReactNode> = {
  skyblock: <Sword size={16} />,
  prison: <Pickaxe size={16} />,
  hub: <Landmark size={16} />,
};

export function groupIcon(group: string, size = 16): ReactNode {
  return GROUP_ICONS[group] ?? <Server size={size} />;
}

/** Network-wide figures over every live backend's latest sample. */
function networkTotals(data: ServerMetricsResponse | null) {
  const latest = (data?.groups ?? []).flatMap((g) => g.servers).flatMap((s) => (s.latest ? [s.latest] : []));
  const servers = (data?.groups ?? []).reduce((n, g) => n + g.activeServers, 0);
  const average = (values: number[]) => (values.length ? values.reduce((a, b) => a + b, 0) / values.length : null);
  return {
    players: latest.reduce((n, s) => n + s.connectedPlayers, 0),
    averageTps: average(latest.map((s) => s.tps1m)),
    averageMspt: average(latest.map(meanMspt)),
    servers,
  };
}

export function MetricsHeader({
  title,
  subtitle,
  lastRefresh,
  error,
  live,
  onRefresh,
  leading,
  trailing,
}: {
  title: ReactNode;
  subtitle: ReactNode;
  lastRefresh: Date | null;
  error: boolean;
  /** True while pushes arrive over the WebSocket; false while the hook falls back to polling. */
  live: boolean;
  onRefresh: () => void;
  leading?: ReactNode;
  trailing?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div className="flex items-center gap-3 min-w-0">
        {leading}
        <div className="min-w-0">
          <h1 className="text-xl font-bold font-display tracking-tight text-foreground">{title}</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{subtitle}</p>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        {trailing}
        <span className="flex items-center gap-1.5 text-[10px] font-mono text-muted-foreground">
          <span className={live ? "w-1.5 h-1.5 rounded-full bg-primary animate-pulse" : "w-1.5 h-1.5 rounded-full bg-amber-400"} />
          {live ? "Live" : "Polling"}
        </span>
        <span className="text-[10px] font-mono text-muted-foreground">
          {error ? (
            <span className="text-amber-400">Refresh failed, showing last data · </span>
          ) : null}
          Last refresh: <Timestamp value={lastRefresh} className="text-[10px]" />
        </span>
        <Button variant="outline" size="sm" onClick={onRefresh}>
          <RefreshCw size={13} />
          Refresh
        </Button>
      </div>
    </div>
  );
}

export function ServerMetricsTab() {
  const { data, error, lastRefresh, refresh, live } = useServerMetrics(5);
  const totals = networkTotals(data);
  const now = Date.now();

  return (
    <div className="space-y-6">
      <MetricsHeader
        title="Server Metrics"
        subtitle="Live backend performance, updated every 5 seconds"
        lastRefresh={lastRefresh}
        error={error}
        live={live}
        onRefresh={refresh}
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard icon={<Users size={15} />} label="Players on backends" value={data ? totals.players : "…"} />
        <StatCard
          icon={<Activity size={15} />}
          label="Average TPS"
          value={<span className={thresholdClass(totals.averageTps, TPS_DEGRADED, TPS_CRITICAL, true)}>{formatNumber(totals.averageTps)}</span>}
        />
        <StatCard
          icon={<Timer size={15} />}
          label="Average MSPT"
          value={
            <span className={thresholdClass(totals.averageMspt, MSPT_DEGRADED, MSPT_CRITICAL, false)}>
              {totals.averageMspt === null ? "—" : `${formatNumber(totals.averageMspt)}ms`}
            </span>
          }
        />
        <StatCard icon={<Server size={15} />} label="Servers online" value={data ? totals.servers : "…"} />
      </div>

      {!data ? (
        <p className="text-xs font-mono text-muted-foreground">{error ? "Could not load server metrics." : "Loading…"}</p>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          {data.groups.map((group) => (
            <GroupCard key={group.group} group={group} now={now} />
          ))}
        </div>
      )}

      <SparkReportsCard limit={10} />
    </div>
  );
}

function GroupCard({ group, now }: { group: ServerGroupMetrics; now: number }) {
  const { label, color } = gamemodeStyle(group.group);

  return (
    <Link to={`/server-metrics/${encodeURIComponent(group.group)}`} className="block group/card">
      <Card className="gap-0 overflow-hidden transition-all hover:brightness-110" style={tintedCardStyle(color)}>
        <div className="flex items-center justify-between gap-3 px-5 py-4 border-b" style={{ borderColor: tint(color, 20) }}>
          <div className="flex items-center gap-3 min-w-0">
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ring-1"
              style={{ color, background: tint(color, 15), boxShadow: `inset 0 0 0 1px ${tint(color, 35)}` }}
            >
              {groupIcon(group.group)}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold font-display text-foreground">{label}</p>
              <p className="text-[11px] font-mono" style={{ color }}>
                {group.activeServers} {group.activeServers === 1 ? "server" : "servers"} online
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <HealthBadge health={groupHealth(group, now)} />
            <ChevronRight size={15} className="text-muted-foreground transition-transform group-hover/card:translate-x-0.5" />
          </div>
        </div>

        <div className="px-5 py-4 space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <MetricTile
              icon={<Activity size={11} />}
              label="Min TPS"
              value={formatNumber(group.minTps)}
              sub={`avg ${formatNumber(group.averageTps)}`}
              valueClassName={thresholdClass(group.minTps, TPS_DEGRADED, TPS_CRITICAL, true)}
            />
            <MetricTile
              icon={<Gauge size={11} />}
              label="Max MSPT"
              value={group.maxMspt === null ? "—" : `${formatNumber(group.maxMspt)}ms`}
              sub={group.averageMspt === null ? undefined : `avg ${formatNumber(group.averageMspt)}ms`}
              valueClassName={thresholdClass(group.maxMspt, MSPT_DEGRADED, MSPT_CRITICAL, false)}
            />
            <MetricTile icon={<Users size={11} />} label="Players" value={group.connectedPlayers} sub="connected" />
            <MetricTile icon={<Globe size={11} />} label="Worlds" value={group.loadedWorlds} sub="loaded" />
          </div>

          {group.servers.length === 0 ? (
            <div className="h-[140px] flex items-center justify-center rounded-lg border border-dashed border-border">
              <p className="text-xs font-mono text-muted-foreground">No live servers</p>
            </div>
          ) : (
            <div>
              <ChartTitle title="TPS · last 5 minutes" metric="tps" />
              <HealthChart servers={group.servers} metric="tps" color={color} height={140} />
            </div>
          )}
        </div>
      </Card>
    </Link>
  );
}
