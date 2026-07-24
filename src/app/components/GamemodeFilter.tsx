import {ToggleGroup, ToggleGroupItem} from "./ui/toggle-group";

export function GamemodeFilter({
  groups,
  selected,
  onChange,
}: {
  groups: string[];
  selected: string[];
  onChange: (selected: string[]) => void;
}) {
  return (
    <ToggleGroup
      type="multiple"
      variant="outline"
      value={selected}
      onValueChange={onChange}
      className="flex-wrap"
    >
      {groups.map((g) => (
        <ToggleGroupItem key={g} value={g} className="font-mono text-xs px-3">
          {g.charAt(0).toUpperCase() + g.slice(1)}
        </ToggleGroupItem>
      ))}
      <ToggleGroupItem
        value="dm"
        className="font-mono text-xs px-3 text-pink-400 data-[state=on]:text-pink-400"
      >
        DM
      </ToggleGroupItem>
    </ToggleGroup>
  );
}
