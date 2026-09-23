import type {ReactNode} from "react";
import {Card} from "./ui/card";
import {cn} from "../../lib/utils";

/** Locale-grouped integer, e.g. 1,234,567. */
export function num(n: number): string {
  return n.toLocaleString();
}

/** A headline number tile for the stat row at the top of a detail page. */
export function StatCard({
  icon,
  label,
  value,
  className,
}: {
  icon: ReactNode;
  label: string;
  value: ReactNode;
  className?: string;
}) {
  return (
    <Card className={cn("px-4 py-3.5 flex-row items-center gap-3", className)}>
      <span className="text-primary">{icon}</span>
      <div className="min-w-0">
        <p className="text-lg font-bold font-mono text-foreground leading-none truncate">{value}</p>
        <p className="text-[10px] font-mono text-muted-foreground mt-0.5">{label}</p>
      </div>
    </Card>
  );
}

/** One label/value line inside a detail card; stack them in a `divide-y divide-border` list. */
export function StatRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex items-center justify-between py-1.5">
      <span className="text-xs font-mono text-muted-foreground">{label}</span>
      <span className="text-xs font-mono text-foreground font-semibold">{value}</span>
    </div>
  );
}
