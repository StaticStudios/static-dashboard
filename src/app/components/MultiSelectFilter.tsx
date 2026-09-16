import { useState } from "react";
import { Check, ChevronsUpDown, X } from "lucide-react";
import { cn } from "../../lib/utils";
import { Button } from "./ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "./ui/command";

/**
 * Multi-select dropdown over a fixed list of options. Selecting nothing means "no filter", so the
 * trigger falls back to `placeholder` when the selection is empty.
 *
 * Unlike {@link SenderMultiSelect}, the options are a small local list, so cmdk's own client-side
 * filtering is left enabled rather than round-tripping each keystroke to the API.
 */
export function MultiSelectFilter({
  options,
  selected,
  onChange,
  placeholder,
  searchPlaceholder,
  emptyLabel = "No matches.",
  className,
}: {
  options: string[];
  selected: string[];
  onChange: (selected: string[]) => void;
  /** Shown on the trigger when nothing is selected, e.g. "All gamemodes". */
  placeholder: string;
  searchPlaceholder?: string;
  emptyLabel?: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);

  const toggle = (option: string) => {
    onChange(selected.includes(option) ? selected.filter((o) => o !== option) : [...selected, option]);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <div className={cn("relative min-w-[150px]", className)}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            // Matched to SelectTrigger (see FilterSelect) so this sits in a filter row without
            // standing out: outline buttons use bg-background/--border/px-4, the select uses
            // bg-input-background/--input/px-3 and doesn't recolor on hover.
            className={cn(
              "w-full justify-between px-3 font-mono text-sm",
              "bg-input-background border-input hover:bg-input-background hover:text-foreground",
              selected.length > 0 && "pr-7",
            )}
          >
            <span className="truncate">
              {selected.length === 0 ? placeholder : selected.join(", ")}
            </span>
            <ChevronsUpDown size={13} className="opacity-50 shrink-0" />
          </Button>
        </PopoverTrigger>
        {selected.length > 0 && (
          <button
            type="button"
            aria-label={`Clear ${placeholder} filter`}
            className="absolute right-7 top-0 h-9 w-5 flex items-center justify-center text-muted-foreground/50 hover:text-foreground"
            onClick={(e) => {
              e.stopPropagation();
              onChange([]);
            }}
          >
            <X size={13} />
          </button>
        )}
      </div>
      <PopoverContent className="w-[220px] p-0">
        <Command>
          <CommandInput placeholder={searchPlaceholder ?? "Search..."} />
          <CommandList>
            <CommandEmpty className="text-xs font-mono text-muted-foreground">{emptyLabel}</CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem key={option} onSelect={() => toggle(option)} className="font-mono text-xs">
                  <Check size={14} className={cn(selected.includes(option) ? "opacity-100" : "opacity-0")} />
                  {option}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
