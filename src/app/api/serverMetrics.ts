import {apiDownload, apiFetch, apiSend} from "./client";
import type {ProfileCaptureResponse, ServerMetricsResponse, SparkReportSummary, SparkViewerLink} from "./types";

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

/** Starts a 60s spark profiler on one live backend. Rejects with 404 (not live) or 502 (no answer). */
export function captureProfile(serverId: string) {
  return apiSend<ProfileCaptureResponse>(`/api/v1/internal/server-metrics/servers/${encodeURIComponent(serverId)}/profile`, "POST");
}
