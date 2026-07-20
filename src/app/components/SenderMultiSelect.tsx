import { useState } from "react";
import { Check, ChevronsUpDown, X } from "lucide-react";
import { cn } from "../../lib/utils";
import { Button } from "./ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "./ui/command";
import { useChatUsers } from "../hooks/useChatUsers";

export function SenderMultiSelect({
  selected,
  onChange,
}: {
  selected: string[];
  onChange: (senders: string[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const users = useChatUsers(query);

  const toggle = (name: string) => {
    onChange(selected.includes(name) ? selected.filter((n) => n !== name) : [...selected, name]);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <div className="relative flex-1 min-w-[150px]">
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-full justify-between font-mono text-sm",
              selected.length > 0 && "pr-7",
            )}
          >
            <span className="truncate">
              {selected.length === 0 ? "All senders" : selected.join(", ")}
            </span>
            <ChevronsUpDown size={13} className="opacity-50 shrink-0" />
          </Button>
        </PopoverTrigger>
        {selected.length > 0 && (
          <button
            type="button"
            aria-label="Clear sender filter"
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
        <Command shouldFilter={false}>
          <CommandInput placeholder="Search players..." value={query} onValueChange={setQuery} />
          <CommandList>
            <CommandEmpty className="text-xs font-mono text-muted-foreground">No players found.</CommandEmpty>
            <CommandGroup>
              {users.map((name) => (
                <CommandItem key={name} onSelect={() => toggle(name)} className="font-mono text-xs">
                  <Check size={14} className={cn(selected.includes(name) ? "opacity-100" : "opacity-0")} />
                  {name}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
