import {type FormEvent, useEffect, useState} from "react";
import {toast} from "sonner";
import {Download, ExternalLink, FileSearch, Flame, Loader2, Radio, Save, ShieldCheck} from "lucide-react";
import {cn} from "../../../lib/utils";
import {gamemodeStyle, tint} from "../../../lib/gamemodes";
import {Card} from "../../components/ui/card";
import {Button} from "../../components/ui/button";
import {Input} from "../../components/ui/input";
import {Popover, PopoverAnchor, PopoverContent, PopoverTrigger} from "../../components/ui/popover";
import {Timestamp} from "../../components/Timestamp";
import {
  downloadSparkReport,
  openLiveProfiler,
  openSparkReport,
  saveRunningProfiler,
  trustProfilerViewer,
} from "../../api/serverMetrics";
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
            : "Captured automatically when a server lags, or saved from a server card"}
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
                      {r.durationSeconds > 0 && <span className="text-muted-foreground"> · {r.durationSeconds}s</span>}
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

type Notice = { kind: "success" | "info" | "error"; message: string };

const LIVE_NOTICES: Record<string, Notice> = {
  OPENED: { kind: "success", message: "Live viewer opened in a new tab." },
  NOT_RUNNING: { kind: "error", message: "No profiler is running on this server." },
  FAILED: { kind: "error", message: "spark could not open the live viewer." },
  UNKNOWN: { kind: "error", message: "spark did not answer." },
};

const SAVE_NOTICES: Record<string, Notice> = {
  NOT_RUNNING: { kind: "error", message: "No profiler is running on this server." },
  UNKNOWN: { kind: "info", message: "spark did not confirm the upload; a report may still arrive." },
};

const TRUST_NOTICES: Record<string, Notice> = {
  TRUSTED: { kind: "success", message: "Viewer trusted. The spark tab should connect now." },
  NOT_FOUND: { kind: "error", message: "No viewer with that ID is waiting on this server. Open the live view first." },
  INVALID: { kind: "error", message: "That does not look like a spark viewer ID." },
  UNKNOWN: { kind: "error", message: "spark did not answer." },
};

/** How long "Save report" keeps waiting for its report before giving up on showing it. */
const SAVE_WAIT_MS = 180_000;

/** Reports outcomes as toasts, so the card never changes size. */
function notify(serverId: string, notice: Notice) {
  toast[notice.kind](notice.message, { description: serverId });
}

function failure(serverId: string, e: unknown) {
  notify(serverId, {
    kind: "error",
    message: statusOf(e) === 404 ? "This server is no longer online." : "The server did not respond.",
  });
}

/**
 * spark controls for one backend, acting on the profiler already running there (spark always runs one in
 * the background): "Live view" opens spark's live viewer on it, "Save report" uploads it into the reports
 * list and stays in progress until that report appears in `reports`. The shield opens a popover to trust a
 * viewer, which spark asks for once per browser and server; it opens by itself after a live view.
 * Outcomes are toasts and the trust field floats, so nothing here changes the card's layout.
 */
export function ProfilerControls({ serverId, reports }: { serverId: string; reports: SparkReportSummary[] | null }) {
  const [busy, setBusy] = useState<"live" | "save" | "trust" | null>(null);
  const [trustOpen, setTrustOpen] = useState(false);
  const [clientId, setClientId] = useState("");
  // Earliest trigger time a report may have to count as the saved one; null when not waiting.
  // Backdated a little because triggeredAt comes from the backend's clock, not the browser's.
  const [awaitingSince, setAwaitingSince] = useState<number | null>(null);

  useEffect(() => {
    if (awaitingSince === null || !reports) return;
    const arrived = reports.some(
      (r) => r.serverId === serverId && r.trigger.startsWith("Saved") && new Date(r.triggeredAt).getTime() >= awaitingSince
    );
    if (arrived) {
      setAwaitingSince(null);
      notify(serverId, { kind: "success", message: "Report saved. It is in the reports list below." });
    }
  }, [reports, awaitingSince, serverId]);

  useEffect(() => {
    if (awaitingSince === null) return;
    const id = setTimeout(() => {
      setAwaitingSince(null);
      notify(serverId, { kind: "info", message: "The report has not shown up yet; it will appear in the list once stored." });
    }, SAVE_WAIT_MS);
    return () => clearTimeout(id);
  }, [awaitingSince, serverId]);

  async function live() {
    // Opened synchronously with the click so the popup is not blocked; spark drops the link within ~30s.
    const tab = window.open("about:blank", "_blank");
    setBusy("live");
    try {
      const { result, url } = await openLiveProfiler(serverId);
      if (result === "OPENED" && url && tab) {
        tab.opener = null;
        tab.location.href = url;
        setTrustOpen(true);
      } else {
        tab?.close();
      }
      notify(serverId, LIVE_NOTICES[result] ?? LIVE_NOTICES.UNKNOWN);
    } catch (e) {
      tab?.close();
      failure(serverId, e);
    } finally {
      setBusy(null);
    }
  }

  async function save() {
    setBusy("save");
    const requestedAt = Date.now() - 30_000;
    try {
      const { result } = await saveRunningProfiler(serverId);
      if (result === "NOT_RUNNING") {
        notify(serverId, SAVE_NOTICES.NOT_RUNNING);
      } else {
        if (result !== "STARTED") notify(serverId, SAVE_NOTICES.UNKNOWN);
        setAwaitingSince(requestedAt);
      }
    } catch (e) {
      failure(serverId, e);
    } finally {
      setBusy(null);
    }
  }

  async function trust(event: FormEvent) {
    event.preventDefault();
    const id = clientId.trim();
    if (!id) return;
    setBusy("trust");
    try {
      const { result } = await trustProfilerViewer(serverId, id);
      notify(serverId, TRUST_NOTICES[result] ?? TRUST_NOTICES.UNKNOWN);
      if (result === "TRUSTED") {
        setTrustOpen(false);
        setClientId("");
      }
    } catch (e) {
      failure(serverId, e);
    } finally {
      setBusy(null);
    }
  }

  const saving = busy === "save" || awaitingSince !== null;

  return (
    <Popover open={trustOpen} onOpenChange={setTrustOpen}>
      <PopoverAnchor asChild>
        <div className="flex items-center gap-1.5">
          <Button variant="outline" size="xs" onClick={live} disabled={busy !== null}>
            {busy === "live" ? <Loader2 className="animate-spin" /> : <Radio />}
            Live view
          </Button>
          <Button variant="outline" size="xs" onClick={save} disabled={busy !== null || saving}>
            {saving ? <Loader2 className="animate-spin" /> : <Save />}
            {saving ? "Uploading…" : "Save report"}
          </Button>
          <PopoverTrigger asChild>
            <Button variant="outline" size="xs" title="Trust a spark viewer" aria-label="Trust a spark viewer">
              <ShieldCheck />
            </Button>
          </PopoverTrigger>
        </div>
      </PopoverAnchor>
      <PopoverContent align="end" className="w-72 p-3">
        <form onSubmit={trust} className="space-y-2">
          <p className="text-[11px] font-mono text-muted-foreground leading-snug">
            If the spark tab says the viewer is not trusted, paste the ID it shows. Needed once per browser for
            this server.
          </p>
          <div className="flex items-center gap-1.5">
            <Input
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              placeholder="Viewer ID"
              aria-label="spark viewer ID"
              className="h-6 flex-1 px-2 text-[10px] font-mono"
              autoFocus
            />
            <Button type="submit" variant="outline" size="xs" disabled={busy !== null || !clientId.trim()}>
              {busy === "trust" ? <Loader2 className="animate-spin" /> : <ShieldCheck />}
              Trust
            </Button>
          </div>
        </form>
      </PopoverContent>
    </Popover>
  );
}
