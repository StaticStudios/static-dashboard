import {useState} from "react";
import {CalendarClock} from "lucide-react";
import {cn} from "../../lib/utils";
import {Button} from "./ui/button";
import {Input} from "./ui/input";
import {Label} from "./ui/label";
import {Popover, PopoverContent, PopoverTrigger} from "./ui/popover";
import {formatTimestamp} from "./Timestamp";

const HOUR = 60 * 60 * 1000;

const PRESETS = [
  { key: "1h", label: "1h", span: HOUR },
  { key: "24h", label: "24h", span: 24 * HOUR },
  { key: "7d", label: "7d", span: 7 * 24 * HOUR },
  { key: "30d", label: "30d", span: 30 * 24 * HOUR },
  { key: "all", label: "All", span: null },
] as const;

export type TimeRangePreset = (typeof PRESETS)[number]["key"];

/** Either a preset that trails the current time, or explicit epoch-milli bounds (each optional). */
export type TimeRange = { preset: TimeRangePreset } | { preset: "custom"; from?: number; to?: number };

/** The epoch-milli bounds a range stands for right now. A preset has no upper bound. */
export function resolveTimeRange(range: TimeRange): { from?: number; to?: number } {
  if (range.preset === "custom") return { from: range.from, to: range.to };
  const span = PRESETS.find((preset) => preset.key === range.preset)?.span;
  return span ? { from: Date.now() - span } : {};
}

/** Epoch millis → the `YYYY-MM-DDTHH:mm` a `datetime-local` input takes, in the viewer's timezone. */
function toInputValue(ms: number | undefined): string {
  if (ms === undefined) return "";
  const date = new Date(ms);
  return new Date(ms - date.getTimezoneOffset() * 60_000).toISOString().slice(0, 16);
}

function fromInputValue(value: string): number | undefined {
  const ms = new Date(value).getTime();
  return value && !Number.isNaN(ms) ? ms : undefined;
}

function customLabel(range: TimeRange): string {
  if (range.preset !== "custom") return "Custom";
  const from = formatTimestamp(range.from);
  const to = formatTimestamp(range.to);
  if (from && to) return `${from} – ${to}`;
  if (from) return `Since ${from}`;
  if (to) return `Until ${to}`;
  return "Custom";
}

/**
 * Time-frame picker for a single card: quick presets plus a custom range down to the minute. Use
 * `DateRangeFilter` instead where whole days are enough.
 */
export function TimeRangeFilter({ value, onChange }: { value: TimeRange; onChange: (range: TimeRange) => void }) {
  const [open, setOpen] = useState(false);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const fromMs = fromInputValue(from);
  const toMs = fromInputValue(to);
  const invalid = fromMs !== undefined && toMs !== undefined && fromMs > toMs;

  return (
    <div className="flex flex-wrap items-center gap-1">
      {PRESETS.map((preset) => (
        <Button
          key={preset.key}
          size="xs"
          variant={value.preset === preset.key ? "secondary" : "ghost"}
          aria-pressed={value.preset === preset.key}
          onClick={() => onChange({ preset: preset.key })}
        >
          {preset.label}
        </Button>
      ))}
      <Popover
        open={open}
        onOpenChange={(next) => {
          // Start from whatever is showing now, so a preset can be nudged rather than retyped.
          if (next) {
            const current = resolveTimeRange(value);
            setFrom(toInputValue(current.from));
            setTo(toInputValue(current.to));
          }
          setOpen(next);
        }}
      >
        <PopoverTrigger asChild>
          <Button
            size="xs"
            variant={value.preset === "custom" ? "secondary" : "ghost"}
            aria-pressed={value.preset === "custom"}
          >
            <CalendarClock />
            {customLabel(value)}
          </Button>
        </PopoverTrigger>
        <PopoverContent align="end" className="w-64 space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="time-range-from" className="text-xs font-mono text-muted-foreground">From</Label>
            <Input
              id="time-range-from"
              type="datetime-local"
              value={from}
              max={to || undefined}
              onChange={(e) => setFrom(e.target.value)}
              className="font-mono text-xs"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="time-range-to" className="text-xs font-mono text-muted-foreground">To</Label>
            <Input
              id="time-range-to"
              type="datetime-local"
              value={to}
              min={from || undefined}
              onChange={(e) => setTo(e.target.value)}
              aria-invalid={invalid}
              className="font-mono text-xs"
            />
          </div>
          <p className={cn("text-[10px] font-mono", invalid ? "text-destructive" : "text-muted-foreground")}>
            {invalid ? "From must be before To." : "Leave a field empty to keep that end open."}
          </p>
          <Button
            size="sm"
            className="w-full"
            disabled={invalid}
            onClick={() => {
              onChange({ preset: "custom", from: fromMs, to: toMs });
              setOpen(false);
            }}
          >
            Apply
          </Button>
        </PopoverContent>
      </Popover>
    </div>
  );
}
