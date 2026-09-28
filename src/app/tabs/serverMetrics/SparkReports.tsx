import {useEffect, useState} from "react";
import {Download, ExternalLink, FileSearch, Flame, Loader2} from "lucide-react";
import {cn} from "../../../lib/utils";
import {gamemodeStyle, tint} from "../../../lib/gamemodes";
import {Card} from "../../components/ui/card";
import {Button} from "../../components/ui/button";
import {Timestamp} from "../../components/Timestamp";
import {captureProfile, downloadSparkReport, openSparkReport} from "../../api/serverMetrics";
import {useSparkReports} from "../../hooks/useSparkReports";
import type {SparkReportSummary} from "../../api/types";
import {formatBytes, formatNumber, MSPT_CRITICAL, MSPT_DEGRADED, thresholdClass, TPS_CRITICAL, TPS_DEGRADED} from "./parts";

/** The HTTP status in an `apiFetch`/`apiSend` error message, if any. */
function statusOf(error: unknown): number | null {
  const match = error instanceof Error ? /failed: (\d{3})/.exec(error.message) : null;
  return match ? Number(match[1]) : null;
}

const STATUS_STYLE: Record<SparkReportSummary["status"], { label: string; className: string }> = {
  PENDING: { label: "Downloading", className: "text-sky-400 bg-sky-500/10 ring-sky-500/30" },
  STORED: { label: "Stored", className: "text-green-400 bg-green-500/10 ring-green-500/30" },
  FAILED: { label: "Not stored", className: "text-red-400 bg-red-500/10 ring-red-500/30" },
};

/**
 * Recent spark profiler reports, network-wide or for one server group (`group`, tinted in its colour).
 * "Open" asks the API for a working viewer link, which re-uploads our stored copy if spark's expired.
 */
export function SparkReportsCard({ group, limit = 10 }: { group?: string; limit?: number }) {
  const { reports, error } = useSparkReports(group, limit);
  return <SparkReportsView group={group} reports={reports} error={error} />;
}

/** {@link SparkReportsCard} for a caller that already loads the reports, e.g. to share them. */
export function SparkReportsView({
  group,
  reports,
  error,
}: {
  group?: string;
  reports: SparkReportSummary[] | null;
  error: boolean;
}) {
  const color = group ? gamemodeStyle(group).color : null;
  const [busyCode, setBusyCode] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  async function open(report: SparkReportSummary) {
    // Opened synchronously with the click so the popup is not blocked, then pointed at the link.
    const tab = window.open("about:blank", "_blank");
    setBusyCode(report.code);
    setActionError(null);
    try {
      const link = await openSparkReport(report.code);
      if (tab) {
        tab.opener = null;
        tab.location.href = link.url;
      }
    } catch (e) {
      tab?.close();
      setActionError(statusOf(e) === 404 ? "That report is no longer stored." : "Could not open the report in spark.");
    } finally {
      setBusyCode(null);
    }
  }

  async function download(report: SparkReportSummary) {
    setActionError(null);
    try {
      await downloadSparkReport(report);
    } catch {
      setActionError("Download failed.");
    }
  }

  return (
    <Card className="gap-0 overflow-hidden" style={color ? { borderColor: tint(color, 30) } : undefined}>
      <div className="flex flex-wrap items-center justify-between gap-2 px-5 py-4 border-b border-border">
        <div className="flex items-center gap-2">
          <Flame size={14} style={color ? { color } : undefined} className={color ? undefined : "text-primary"} />
          <p className="text-sm font-bold font-display text-foreground">
            {group ? `${gamemodeStyle(group).label} performance reports` : "Recent performance reports"}
          </p>
        </div>
        <p className="text-[10px] font-mono text-muted-foreground">
          {actionError ? <span className="text-red-400">{actionError}</span>
            : error ? <span className="text-amber-400">Refresh failed</span>
            : "Captured automatically when a server lags, or on request"}
        </p>
      </div>

      {!reports ? (
        <p className="px-5 py-4 text-xs font-mono text-muted-foreground">{error ? "Could not load reports." : "Loading…"}</p>
      ) : reports.length === 0 ? (
        <div className="px-5 py-8 flex flex-col items-center gap-2 text-center">
          <FileSearch size={18} className="text-muted-foreground" />
          <p className="text-xs font-mono text-muted-foreground">No reports yet. One is captured when a server stays over the lag thresholds.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-xs font-mono">
            <thead className="text-[10px] uppercase tracking-widest text-muted-foreground">
              <tr className="border-b border-border">
                <th className="text-left font-normal px-5 py-2">Captured</th>
                <th className="text-left font-normal px-2 py-2">Server</th>
                <th className="text-left font-normal px-2 py-2">Trigger</th>
                <th className="text-right font-normal px-2 py-2 hidden md:table-cell">TPS</th>
                <th className="text-right font-normal px-2 py-2 hidden md:table-cell">MSPT p95</th>
                <th className="text-left font-normal px-2 py-2 hidden lg:table-cell">Status</th>
                <th className="px-5 py-2" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {reports.map((r) => {
                const style = STATUS_STYLE[r.status];
                return (
                  <tr key={r.code} className="hover:bg-white/[0.03]">
                    <td className="px-5 py-2"><Timestamp value={r.triggeredAt} className="text-xs" /></td>
                    <td className="px-2 py-2 text-foreground whitespace-nowrap">
                      {!group && (
                        <span className="inline-block w-1.5 h-1.5 rounded-full mr-1.5 align-middle" style={{ background: gamemodeStyle(r.serverGroup).color }} />
                      )}
                      {r.serverId}
                    </td>
                    <td className="px-2 py-2 text-foreground whitespace-nowrap">
                      {r.trigger}
                      <span className="text-muted-foreground"> · {r.durationSeconds}s</span>
                    </td>
                    <td className={cn("px-2 py-2 text-right hidden md:table-cell", thresholdClass(r.tpsAtTrigger, TPS_DEGRADED, TPS_CRITICAL, true))}>
                      {formatNumber(r.tpsAtTrigger, 2)}
                    </td>
                    <td className={cn("px-2 py-2 text-right hidden md:table-cell", thresholdClass(r.msptP95AtTrigger, MSPT_DEGRADED, MSPT_CRITICAL, false))}>
                      {r.msptP95AtTrigger === null ? "—" : `${formatNumber(r.msptP95AtTrigger)}ms`}
                    </td>
                    <td className="px-2 py-2 hidden lg:table-cell">
                      <span
                        className={cn("inline-flex rounded px-1.5 py-0.5 text-[10px] ring-1", style.className)}
                        title={r.fetchError ?? undefined}
                      >
                        {style.label}
                        {r.rawSize !== null && <span className="text-muted-foreground ml-1">{formatBytes(r.rawSize)}</span>}
                      </span>
                    </td>
                    <td className="px-5 py-2">
                      <div className="flex justify-end gap-1.5">
                        <Button variant="outline" size="sm" onClick={() => open(r)} disabled={busyCode === r.code}>
                          {busyCode === r.code ? <Loader2 size={12} className="animate-spin" /> : <ExternalLink size={12} />}
                          Open
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => download(r)} disabled={r.status !== "STORED"} title="Download .sparkprofile">
                          <Download size={12} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}

const CAPTURE_MESSAGES: Record<string, { ok: boolean; message: string }> = {
  STARTED: { ok: true, message: "Profiling for 60s; the report appears below shortly after." },
  BUSY: { ok: false, message: "A profiler is already running on this server." },
  UNKNOWN: { ok: true, message: "Sent, but spark did not confirm; a report may still arrive." },
};

/**
 * Starts a 60s spark profiler on one backend, reporting the outcome inline. The "started" message stays
 * until a manual report for this server appears in `reports`, then clears.
 */
export function CaptureProfileButton({ serverId, reports }: { serverId: string; reports: SparkReportSummary[] | null }) {
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState<{ ok: boolean; message: string } | null>(null);
  // Earliest trigger time a report may have to count as the one we asked for; null when not waiting.
  // Backdated a little because triggeredAt comes from the backend's clock, not the browser's.
  const [awaitingSince, setAwaitingSince] = useState<number | null>(null);

  useEffect(() => {
    if (awaitingSince === null || !reports) return;
    const arrived = reports.some(
      (r) => r.serverId === serverId && r.trigger.startsWith("Manual") && new Date(r.triggeredAt).getTime() >= awaitingSince
    );
    if (arrived) {
      setStatus(null);
      setAwaitingSince(null);
    }
  }, [reports, awaitingSince, serverId]);

  async function capture() {
    setSending(true);
    setStatus(null);
    setAwaitingSince(null);
    const requestedAt = Date.now() - 30_000;
    try {
      const { result } = await captureProfile(serverId);
      setStatus(CAPTURE_MESSAGES[result] ?? CAPTURE_MESSAGES.UNKNOWN);
      if (result !== "BUSY") setAwaitingSince(requestedAt);
    } catch (e) {
      setStatus({
        ok: false,
        message: statusOf(e) === 404 ? "This server is no longer online." : "The server did not respond.",
      });
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <Button variant="outline" size="xs" onClick={capture} disabled={sending}>
        {sending ? <Loader2 className="animate-spin" /> : <Flame />}
        Capture profile
      </Button>
      {status && (
        <p className={cn("text-[10px] font-mono max-w-[220px] text-right", status.ok ? "text-muted-foreground" : "text-amber-400")}>
          {status.message}
        </p>
      )}
    </div>
  );
}
