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
      <PopoverTrigger asChild>
        <Button variant="outline" className="min-w-[150px] justify-between font-mono text-sm">
          <span className="truncate">
            {selected.length === 0 ? "All senders" : `${selected.length} sender${selected.length > 1 ? "s" : ""}`}
          </span>
          <span className="flex items-center gap-1">
            {selected.length > 0 && (
              <X
                size={13}
                className="opacity-50 hover:opacity-100"
                onClick={(e) => {
                  e.stopPropagation();
                  onChange([]);
                }}
              />
            )}
            <ChevronsUpDown size={13} className="opacity-50" />
          </span>
        </Button>
      </PopoverTrigger>
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
