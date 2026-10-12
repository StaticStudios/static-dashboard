import {useEffect, useState} from "react";
import {advertisementTimeZoneKey, preferredAdvertisementTimeZone} from "../lib/advertisementTimeZone";

export function useAdvertisementTimeZone() {
  const [timeZone, setTimeZone] = useState(preferredAdvertisementTimeZone);

  useEffect(() => {
    const sync = (event: StorageEvent) => {
      if (event.key === advertisementTimeZoneKey) setTimeZone(preferredAdvertisementTimeZone());
    };
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, []);

  function selectTimeZone(value: string) {
    setTimeZone(value);
    try {
      localStorage.setItem(advertisementTimeZoneKey, value);
    } catch {
      // Keep the selection for this page even when it cannot be persisted.
    }
  }

  return { timeZone, selectTimeZone };
}
