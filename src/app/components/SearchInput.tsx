import type { ReactNode } from "react";
import { cn } from "../../lib/utils";
import { Input } from "./ui/input";

export function SearchInput({
  placeholder,
  value,
  onChange,
  className,
  icon,
}: {
  placeholder?: string;
  value: string;
  onChange: (v: string) => void;
  className?: string;
  icon?: ReactNode;
}) {
  return (
    <div className={cn("relative flex items-center", className)}>
      {icon && (
        <span className="absolute left-3 text-muted-foreground pointer-events-none">{icon}</span>
      )}
      <Input
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn("font-mono", icon && "pl-9")}
      />
    </div>
  );
}
