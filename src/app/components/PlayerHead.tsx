import { cn } from "../../lib/utils";

/**
 * Renders a Minecraft player head from a full skin PNG url, using pure CSS: two layered copies of
 * the skin — the base face (8x8 at 8,8) with the hat overlay (8x8 at 40,8) on top — scaled up with
 * nearest-neighbour so the pixels stay crisp. No canvas, so no cross-origin tainting.
 */
export function PlayerHead({
  url,
  size = 28,
  className,
}: {
  url: string;
  size?: number;
  className?: string;
}) {
  const scale = size / 8;
  return (
    <div
      className={cn("rounded-md shrink-0", className)}
      style={{
        width: size,
        height: size,
        imageRendering: "pixelated",
        backgroundImage: `url(${url}), url(${url})`,
        backgroundRepeat: "no-repeat, no-repeat",
        backgroundSize: `${64 * scale}px ${64 * scale}px, ${64 * scale}px ${64 * scale}px`,
        backgroundPosition: `${-40 * scale}px ${-8 * scale}px, ${-8 * scale}px ${-8 * scale}px`,
      }}
    />
  );
}
