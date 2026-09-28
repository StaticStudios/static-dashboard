import {useState} from "react";
import {useNavigate, useParams} from "react-router";
import {Activity, ArrowLeft, Box, Cpu, Gauge, Globe, Layers, MemoryStick, Recycle, Server, Timer, Users} from "lucide-react";
import {cn} from "../../../lib/utils";
import {gamemodeStyle, tint} from "../../../lib/gamemodes";
import {Card} from "../../components/ui/card";
import {Button} from "../../components/ui/button";
import {Timestamp} from "../../components/Timestamp";
import {num} from "../../components/StatBlocks";
import {METRIC_WINDOWS, type MetricWindow} from "../../api/serverMetrics";
import {useServerMetrics} from "../../hooks/useServerMetrics";
import type {BackendServerMetrics, ServerGroupMetrics} from "../../api/types";
import {groupIcon, MetricsHeader} from "../ServerMetricsTab";
import {
  formatBytes,
  formatNumber,
  formatUptime,
  groupHealth,
  HealthBadge,
  HealthChart,
  meanMspt,
  MetricTile,
  MSPT_CRITICAL,
  MSPT_DEGRADED,
  ResourceBar,
  serverHealth,
  thresholdClass,
  tintedCardStyle,
  TPS_CRITICAL,
  TPS_DEGRADED,
} from "./parts";
import {CaptureProfileButton, SparkReportsView} from "./SparkReports";
import {useSparkReports} from "../../hooks/useSparkReports";
import type {SparkReportSummary} from "../../api/types";

export function ServerGroupDetail() {
  const { group: groupId = "" } = useParams();
  const navigate = useNavigate();
  const [minutes, setMinutes] = useState<MetricWindow>(5);
  const { data, error, lastRefresh, refresh, live } = useServerMetrics(minutes);
  // Loaded here rather than in the reports card so each server's capture button can see its report arrive.
  const { reports, error: reportsError } = useSparkReports(groupId, 20);
  const { label, color } = gamemodeStyle(groupId);
  const group = data?.groups.find((g) => g.group === groupId) ?? null;
  const now = Date.now();

  return (
    <div className="space-y-6">
      <MetricsHeader
        title={label}
        subtitle={group ? `${group.activeServers} ${group.activeServers === 1 ? "server" : "servers"} online` : "Server metrics"}
        lastRefresh={lastRefresh}
        error={error}
        live={live}
        onRefresh={refresh}
        leading={
          <>
            <Button variant="outline" size="icon" onClick={() => navigate("/server-metrics")}>
              <ArrowLeft size={15} />
            </Button>
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
              style={{ color, background: tint(color, 15), boxShadow: `inset 0 0 0 1px ${tint(color, 35)}` }}
            >
              {groupIcon(groupId)}
            </div>
          </>
        }
        trailing={
          <div className="flex items-center rounded-md border border-border overflow-hidden">
            {METRIC_WINDOWS.map((w) => (
              <button
                key={w}
                onClick={() => setMinutes(w)}
                className={cn(
                  "px-2.5 py-1 text-[11px] font-mono transition-colors",
                  w === minutes ? "bg-white/10 text-foreground" : "text-muted-foreground hover:text-foreground"
                )}
              >
                {w}m
              </button>
            ))}
          </div>
        }
      />

      {!data ? (
        <p className="text-xs font-mono text-muted-foreground">{error ? "Could not load server metrics." : "Loading…"}</p>
      ) : !group ? (
        <p className="text-xs font-mono text-muted-foreground">No server group named “{groupId}”.</p>
      ) : (
        <>
          <GroupSummary group={group} minutes={minutes} color={color} now={now} />
          {group.servers.length > 0 && (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
              {group.servers.map((server) => (
                <ServerCard key={server.sessionId} server={server} minutes={minutes} color={color} now={now} reports={reports} />
              ))}
            </div>
          )}
          <SparkReportsView group={group.group} reports={reports} error={reportsError} />
        </>
      )}
    </div>
  );
}

function GroupSummary({ group, minutes, color, now }: { group: ServerGroupMetrics; minutes: number; color: string; now: number }) {
  return (
    <Card className="gap-0 overflow-hidden" style={tintedCardStyle(color)}>
      <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: tint(color, 20) }}>
        <p className="text-sm font-bold font-display text-foreground">Group overview</p>
        <HealthBadge health={groupHealth(group, now)} />
      </div>
      <div className="px-5 py-4 space-y-5">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
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
          <MetricTile icon={<Server size={11} />} label="Servers" value={group.activeServers} sub="online" />
          <MetricTile icon={<Globe size={11} />} label="Worlds" value={group.loadedWorlds} sub="loaded" />
        </div>

        {group.servers.length === 0 ? (
          <div className="h-[120px] flex items-center justify-center rounded-lg border border-dashed border-border">
            <p className="text-xs font-mono text-muted-foreground">No live servers in this group</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <div>
              <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-2">TPS · last {minutes} minutes</p>
              <HealthChart servers={group.servers} metric="tps" color={color} height={200} />
            </div>
            <div>
              <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-2">MSPT · last {minutes} minutes</p>
              <HealthChart servers={group.servers} metric="mspt" color={color} height={200} />
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}

function ServerCard({
  server,
  minutes,
  color,
  now,
  reports,
}: {
  server: BackendServerMetrics;
  minutes: number;
  color: string;
  now: number;
  reports: SparkReportSummary[] | null;
}) {
  const latest = server.latest;
  const mspt = latest ? meanMspt(latest) : null;
  const heapPercent = latest && latest.heapMaxBytes > 0 ? (latest.heapUsedBytes / latest.heapMaxBytes) * 100 : null;
  const cpuPercent = latest?.cpuProcess != null ? latest.cpuProcess * 100 : null;
  const systemCpuPercent = latest?.cpuSystem != null ? latest.cpuSystem * 100 : null;

  return (
    <Card className="gap-0 overflow-hidden" style={tintedCardStyle(color)}>
      <div className="flex items-center justify-between gap-3 px-5 py-4 border-b" style={{ borderColor: tint(color, 20) }}>
        <div className="min-w-0">
          <p className="text-sm font-bold font-mono text-foreground truncate">{server.serverId}</p>
          <p className="text-[10px] font-mono text-muted-foreground truncate">session {server.sessionId}</p>
        </div>
        <div className="flex items-start gap-2">
          <CaptureProfileButton serverId={server.serverId} reports={reports} />
          <HealthBadge health={serverHealth(server, now)} />
        </div>
      </div>

      <div className="px-5 py-4 space-y-5">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <MetricTile
            icon={<Activity size={11} />}
            label="TPS"
            value={formatNumber(latest?.tps1m, 2)}
            sub={latest ? `5m ${formatNumber(latest.tps5m)} · 15m ${formatNumber(latest.tps15m)}` : undefined}
            valueClassName={thresholdClass(latest?.tps1m, TPS_DEGRADED, TPS_CRITICAL, true)}
          />
          <MetricTile
            icon={<Gauge size={11} />}
            label="MSPT"
            value={mspt === null ? "—" : `${formatNumber(mspt)}ms`}
            sub={latest?.msptP95 != null ? `p95 ${formatNumber(latest.msptP95)} · max ${formatNumber(latest.msptMax)}` : "per tick"}
            valueClassName={thresholdClass(mspt, MSPT_DEGRADED, MSPT_CRITICAL, false)}
          />
          <MetricTile icon={<Users size={11} />} label="Players" value={latest ? latest.connectedPlayers : "—"} sub="connected" />
          <MetricTile
            icon={<Timer size={11} />}
            label="Uptime"
            value={formatUptime(server.startedAt, now)}
            sub={server.startedAt ? <>since <Timestamp value={server.startedAt} className="text-[10px]" /></> : "start not recorded"}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-2">TPS · last {minutes} minutes</p>
            <HealthChart servers={[server]} metric="tps" color={color} height={150} />
          </div>
          <div>
            <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-2">MSPT (mean, p95 dashed)</p>
            <HealthChart servers={[server]} metric="mspt" color={color} height={150} showP95 />
          </div>
        </div>

        <div className="border-t border-border pt-4">
          <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-3">System resources</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
            <ResourceBar
              icon={<Cpu size={12} />}
              label="CPU (process)"
              percent={cpuPercent}
              value={cpuPercent === null ? "—" : `${cpuPercent.toFixed(0)}%`}
              sub={
                systemCpuPercent === null
                  ? "Waiting for spark"
                  : `Machine ${systemCpuPercent.toFixed(0)}% (last minute)`
              }
              color={color}
            />
            <ResourceBar
              icon={<MemoryStick size={12} />}
              label="Heap"
              percent={heapPercent}
              value={heapPercent === null ? "—" : `${heapPercent.toFixed(0)}%`}
              sub={
                latest
                  ? `${formatBytes(latest.heapUsedBytes)} / ${formatBytes(latest.heapMaxBytes)}${latest.heapSampleAfterGc ? " after last GC" : ""}`
                  : undefined
              }
              color={color}
            />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-4">
            <MetricTile icon={<Globe size={11} />} label="Worlds" value={latest ? num(latest.loadedWorlds) : "—"} />
            <MetricTile icon={<Layers size={11} />} label="Chunks" value={latest ? num(latest.loadedChunks) : "—"} />
            <MetricTile icon={<Box size={11} />} label="Entities" value={latest ? num(latest.entities) : "—"} />
            <MetricTile
              icon={<Recycle size={11} />}
              label="GC pause"
              value={latest ? `${num(latest.gcPauseMillis)}ms` : "—"}
              sub={latest ? `${latest.gcCollections} collections, last sample` : undefined}
            />
          </div>
        </div>
      </div>
    </Card>
  );
}

