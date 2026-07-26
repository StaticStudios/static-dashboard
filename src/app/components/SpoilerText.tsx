import {useState} from "react";
import {cn} from "../../lib/utils";

/** Click-to-reveal mask for sensitive inline values (IPs, etc.) so they aren't visible by default. */
export function SpoilerText({ value, className }: { value: string; className?: string }) {
  const [revealed, setRevealed] = useState(false);

  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        setRevealed((r) => !r);
      }}
      className={cn(
        "inline-block border-0 bg-transparent align-baseline text-[10px] leading-none",
        "rounded px-1 py-px -mx-1 transition-colors",
        revealed ? "bg-transparent" : "bg-muted-foreground/25 hover:bg-muted-foreground/40 cursor-pointer",
        className
      )}
      title={revealed ? "Click to hide" : "Click to reveal"}
    >
      <span className={cn(!revealed && "invisible select-none")}>{value}</span>
    </button>
  );
}
