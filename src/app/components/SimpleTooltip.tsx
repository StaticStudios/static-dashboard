import type { ReactNode } from "react";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";

export function SimpleTooltip({ children, content }: { children: ReactNode; content: string }) {
  return (
    <Tooltip delayDuration={300}>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent sideOffset={6}>{content}</TooltipContent>
    </Tooltip>
  );
}
