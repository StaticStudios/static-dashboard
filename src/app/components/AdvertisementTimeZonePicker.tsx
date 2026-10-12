import {useState} from "react";
import {Check, ChevronsUpDown} from "lucide-react";
import {cn} from "../../lib/utils";
import {browserTimeZone} from "../lib/advertisementTimeZone";
import {Button} from "./ui/button";
import {Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList} from "./ui/command";
import {Popover, PopoverContent, PopoverTrigger} from "./ui/popover";

const timeZones = ["UTC", ...(Intl.supportedValuesOf?.("timeZone") ?? [browserTimeZone])];

export function AdvertisementTimeZonePicker({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const [open, setOpen] = useState(false);
  const options = [
    { value: browserTimeZone, label: `Local · ${browserTimeZone.replaceAll("_", " ")}` },
    ...[...new Set([value, ...timeZones])].filter((zone) => zone !== browserTimeZone)
      .map((zone) => ({ value: zone, label: zone.replaceAll("_", " ") })),
  ];
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline" role="combobox" aria-label="Time zone" aria-expanded={open}
          className="h-9 w-[270px] max-w-full justify-between font-mono font-normal"
        >
          <span className="truncate">Time zone: {value.replaceAll("_", " ")}</span>
          <ChevronsUpDown size={13} className="shrink-0 text-muted-foreground" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[310px] max-w-[calc(100vw-32px)] p-0" align="end">
        <Command>
          <CommandInput placeholder="Search city or time zone…" aria-label="Search time zones" />
          <CommandList>
            <CommandEmpty>No time zones found.</CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem key={option.value} value={option.label} onSelect={() => { onChange(option.value); setOpen(false); }}>
                  <Check size={13} className={cn(value !== option.value && "opacity-0")} />
                  {option.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
