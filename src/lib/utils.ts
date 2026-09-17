import {type ClassValue, clsx} from "clsx";
import {twMerge} from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function initials(name: string) {
  return name.slice(0, 2).toUpperCase();
}

/**
 * Decodes a Mojang skin-texture blob (the base64 `skin_texture_value` stored on a player) and
 * returns the skin PNG URL (on textures.minecraft.net), or null if the value is empty/malformed.
 */
export function skinFaceUrl(textureValue?: string | null): string | null {
  if (!textureValue) return null;
  try {
    const decoded = JSON.parse(atob(textureValue));
    const url = decoded?.textures?.SKIN?.url;
    return typeof url === "string" ? url : null;
  } catch {
    return null;
  }
}

/**
 * Turns an API staff rank tier (`StaffPosition`, e.g. "DEVELOPER") into a display label ("Developer").
 * Falls back to "Staff" when the rank is missing (unsynced member, or the dev principal).
 */
export function formatRank(rank?: string | null): string {
  if (!rank) return "Staff";
  return rank.charAt(0).toUpperCase() + rank.slice(1).toLowerCase();
}

/** Staff tiers in ascending order — mirrors the `StaffPosition` enum on the API. */
export const STAFF_POSITIONS = ["STAFF", "MOD", "ADMIN", "MANAGER", "DEVELOPER", "OWNER"] as const;

export type StaffPosition = (typeof STAFF_POSITIONS)[number];

/**
 * Whether `rank` is at least `minimum` in the staff hierarchy. An unknown or missing rank never
 * qualifies. This only decides what the UI offers — the API enforces access with `@PreAuthorize`.
 */
export function rankAtLeast(rank: string | null | undefined, minimum: StaffPosition): boolean {
  if (!rank) return false;
  const held = STAFF_POSITIONS.indexOf(rank.toUpperCase() as StaffPosition);
  return held >= 0 && held >= STAFF_POSITIONS.indexOf(minimum);
}

/**
 * Formats a money amount with a leading symbol, e.g. `-$4.99`. The symbol is supplied by the caller
 * — store figures carry Tebex's own currency symbol, so nothing here assumes dollars.
 */
export function formatMoney(amount: number, symbol: string | null = "$"): string {
  const sign = amount < 0 ? "-" : "";
  return `${sign}${symbol ?? ""}${Math.abs(amount).toFixed(2)}`;
}
