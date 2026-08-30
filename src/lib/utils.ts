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
