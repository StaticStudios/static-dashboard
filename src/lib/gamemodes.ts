/**
 * Display name and primary colour of each gamemode (server group), shared by every view that tints
 * or charts by gamemode. Unknown groups fall back to the neutral chart colour.
 */
export interface GamemodeStyle {
  label: string;
  color: string;
}

export const GAMEMODES = {
  skyblock: { label: "Skyblock", color: "var(--chart-2)" },
  prison: { label: "Prison", color: "var(--chart-3)" },
  hub: { label: "Hub", color: "var(--chart-4)" },
} satisfies Record<string, GamemodeStyle>;

export function gamemodeStyle(group: string): GamemodeStyle {
  return (
    (GAMEMODES as Record<string, GamemodeStyle>)[group] ?? {
      label: group.charAt(0).toUpperCase() + group.slice(1),
      color: "var(--chart-1)",
    }
  );
}

/** The gamemode colour at a given strength, for tinted backgrounds and borders. */
export function tint(color: string, percent: number): string {
  return `color-mix(in oklab, ${color} ${percent}%, transparent)`;
}
