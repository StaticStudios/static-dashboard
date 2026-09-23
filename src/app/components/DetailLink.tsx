import type { MouseEvent, ReactNode } from "react";
import { useNavigate } from "react-router";
import { cn } from "../../lib/utils";

/**
 * Wraps markup so clicking it opens a detail page (an island, a gang), carrying `name` in router
 * state so the page header is filled before its data loads. For players, use `PlayerLink`.
 */
export function DetailLink({
  to,
  name,
  className,
  children,
}: {
  to: string;
  name: string;
  className?: string;
  children: ReactNode;
}) {
  const navigate = useNavigate();

  const handleClick = (e: MouseEvent) => {
    e.stopPropagation();
    navigate(to, { state: { name } });
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={cn("flex items-center text-left hover:underline underline-offset-2 cursor-pointer", className)}
    >
      {children}
    </button>
  );
}
