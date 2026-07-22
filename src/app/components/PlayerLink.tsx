import type { MouseEvent, ReactNode } from "react";
import { useNavigate } from "react-router";
import { cn } from "../../lib/utils";

/** Wraps player name/avatar markup so clicking it navigates to that player's detail page. */
export function PlayerLink({
  id,
  name,
  className,
  children,
}: {
  id: string;
  name: string;
  className?: string;
  children: ReactNode;
}) {
  const navigate = useNavigate();

  const handleClick = (e: MouseEvent) => {
    e.stopPropagation();
    navigate(`/players/${id}`, { state: { name } });
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
