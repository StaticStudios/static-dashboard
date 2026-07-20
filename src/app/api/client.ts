const BASE_URL: string = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080";

export const WS_URL = BASE_URL.replace(/^http/, "ws") + "/ws";

type QueryValue = string | number | boolean | readonly string[] | undefined;

let tokenGetter: (() => Promise<string | null>) | null = null;

/**
 * Registers how to obtain the current auth token. Set once at bootstrap by the Clerk integration;
 * when unset (e.g. local dev without Clerk) requests go out without an Authorization header.
 */
export function setAuthTokenGetter(getter: (() => Promise<string | null>) | null): void {
  tokenGetter = getter;
}

export async function apiFetch<T>(path: string, params?: Record<string, QueryValue>): Promise<T> {
  const url = new URL(path, BASE_URL);
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value === undefined) continue;
      if (Array.isArray(value)) {
        for (const v of value) url.searchParams.append(key, v);
      } else {
        url.searchParams.append(key, String(value));
      }
    }
  }

  const token = tokenGetter ? await tokenGetter() : null;
  const res = await fetch(url, token ? { headers: { Authorization: `Bearer ${token}` } } : undefined);
  if (!res.ok) {
    throw new Error(`API request to ${path} failed: ${res.status} ${res.statusText}`);
  }
  return res.json() as Promise<T>;
}
