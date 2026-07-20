import { CalendarIcon, X } from "lucide-react";
import type { DateRange } from "react-day-picker";
import { cn } from "../../lib/utils";
import { Button } from "./ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Calendar } from "./ui/calendar";

function formatRange(range: DateRange | undefined): string {
  if (!range?.from) return "All time";
  const fmt = (d: Date) => d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  if (!range.to || range.to.getTime() === range.from.getTime()) return fmt(range.from);
  return `${fmt(range.from)} – ${fmt(range.to)}`;
}

export function DateRangeFilter({
  value,
  onChange,
}: {
  value: DateRange | undefined;
  onChange: (range: DateRange | undefined) => void;
}) {
  return (
    <Popover>
      <div className="relative inline-block">
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn("min-w-[150px] justify-between font-mono text-sm", value?.from && "pr-7")}
          >
            <span className="flex items-center gap-1.5 truncate">
              <CalendarIcon size={13} className="opacity-50" />
              {formatRange(value)}
            </span>
          </Button>
        </PopoverTrigger>
        {value?.from && (
          <button
            type="button"
            aria-label="Clear date range filter"
            className="absolute right-2 top-0 h-9 w-5 flex items-center justify-center text-muted-foreground/50 hover:text-foreground"
            onClick={(e) => {
              e.stopPropagation();
              onChange(undefined);
            }}
          >
            <X size={13} />
          </button>
        )}
      </div>
      <PopoverContent className="w-auto p-0">
        <Calendar mode="range" selected={value} onSelect={onChange} numberOfMonths={2} />
      </PopoverContent>
    </Popover>
  );
}
