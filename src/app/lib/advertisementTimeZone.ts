export const browserTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
export const advertisementTimeZoneKey = "advertisements.timeZone";

export function isValidTimeZone(value: string | null): value is string {
  if (!value) return false;
  try {
    new Intl.DateTimeFormat(undefined, { timeZone: value });
    return true;
  } catch {
    return false;
  }
}

export function preferredAdvertisementTimeZone(): string {
  try {
    const saved = localStorage.getItem(advertisementTimeZoneKey);
    if (isValidTimeZone(saved)) return saved;
  } catch {
    // Storage can be unavailable in a private or restricted browser session.
  }
  return browserTimeZone;
}

/** An instant's calendar date in the selected zone, used to position the upload marker. */
export function advertisementDate(value: string, timeZone: string): string {
  const parts = new Intl.DateTimeFormat("en", {
    timeZone, year: "numeric", month: "2-digit", day: "2-digit",
  }).formatToParts(new Date(value));
  const part = (type: string) => parts.find((item) => item.type === type)?.value ?? "";
  return `${part("year")}-${part("month")}-${part("day")}`;
}
