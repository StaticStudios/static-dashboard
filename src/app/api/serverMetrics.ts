import {apiDownload, apiFetch, apiSend} from "./client";
import type {ProfilerActionResponse, ServerMetricsResponse, SparkReportSummary, SparkViewerLink} from "./types";

/** Windows the API accepts, in minutes. */
export const METRIC_WINDOWS = [5, 15, 30, 60] as const;
export type MetricWindow = (typeof METRIC_WINDOWS)[number];

/** Live backend health for every server group. DEVELOPER and above. */
export function fetchServerMetrics(minutes: MetricWindow = 5) {
  return apiFetch<ServerMetricsResponse>("/api/v1/internal/server-metrics", { minutes });
}

/** Stored spark reports, newest first; omit `group` for every server group. */
export function fetchSparkReports(group?: string, limit = 20) {
  return apiFetch<SparkReportSummary[]>("/api/v1/internal/server-metrics/reports", { group, limit });
}

/** A working viewer link; the API re-uploads its stored copy when spark's has expired. */
export function openSparkReport(code: string) {
  return apiSend<SparkViewerLink>(`/api/v1/internal/server-metrics/reports/${encodeURIComponent(code)}/view`, "POST");
}

/** Saves the stored report (spark's raw protobuf) as a .sparkprofile file. */
export function downloadSparkReport(report: Pick<SparkReportSummary, "code" | "serverId">) {
  return apiDownload(
    `/api/v1/internal/server-metrics/reports/${encodeURIComponent(report.code)}/raw`,
    `${report.serverId}-${report.code}.sparkprofile`
  );
}

const profilerPath = (serverId: string, action: string) =>
  `/api/v1/internal/server-metrics/servers/${encodeURIComponent(serverId)}/profiler/${action}`;

/**
 * A live viewer link for the profiler running on one backend. spark drops it if no browser connects
 * within about 30s, so open it right away. Rejects with 404 (not live) or 502 (no answer), as do the others.
 */
export function openLiveProfiler(serverId: string) {
  return apiSend<ProfilerActionResponse>(profilerPath(serverId, "live"), "POST");
}

/** Uploads the profiler running on one backend; the report then appears in the reports list. */
export function saveRunningProfiler(serverId: string) {
  return apiSend<ProfilerActionResponse>(profilerPath(serverId, "save"), "POST");
}

/** Trusts the spark viewer showing `clientId`, so that backend streams live data to it. */
export function trustProfilerViewer(serverId: string, clientId: string) {
  return apiSend<ProfilerActionResponse>(profilerPath(serverId, "trust"), "POST", { clientId });
}
