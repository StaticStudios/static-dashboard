import type { ReactNode } from "react";
import { SimpleTooltip } from "./SimpleTooltip";
import { cn } from "../../lib/utils";

/**
 * The single date/time format used across the dashboard: absolute, in the viewer's own timezone,
 * with the full value — including seconds and the zone name — revealed on hover.
 *
 * Every timestamp the API returns is an ISO-8601 instant with an offset, so `new Date()` resolves it
 * unambiguously. A value without an offset would be read as browser-local and silently shift, which is
 * why the API sends `Instant` rather than `LocalDateTime` on the wire.
 */
const SHORT = new Intl.DateTimeFormat(undefined, {
  year: "numeric",
  month: "short",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
});

const FULL = new Intl.DateTimeFormat(undefined, {
  dateStyle: "full",
  timeStyle: "long",
});

/** Formats an instant the same way everywhere; returns null when the value is absent or unparseable. */
export function formatTimestamp(value: string | number | Date | null | undefined): string | null {
  if (value === null || value === undefined || value === "") return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return SHORT.format(date);
}

export function Timestamp({
  value,
  fallback = "—",
  className,
}: {
  value: string | number | Date | null | undefined;
  /** Rendered in place of the date when there is nothing to show, e.g. "Still open" or "Never". */
  fallback?: ReactNode;
  className?: string;
}) {
  const base = "font-mono text-muted-foreground whitespace-nowrap tabular-nums";

  if (value === null || value === undefined || value === "") {
    return <span className={cn(base, className)}>{fallback}</span>;
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return <span className={cn(base, className)}>{fallback}</span>;
  }

  return (
    <SimpleTooltip content={FULL.format(date)}>
      <time dateTime={date.toISOString()} className={cn(base, "cursor-default", className)}>
        {SHORT.format(date)}
      </time>
    </SimpleTooltip>
  );
}
