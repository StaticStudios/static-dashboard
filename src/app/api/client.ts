const BASE_URL: string = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080";

export const WS_URL = BASE_URL.replace(/^http/, "ws") + "/ws";

type QueryValue = string | number | boolean | readonly string[] | undefined;

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

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`API request to ${path} failed: ${res.status} ${res.statusText}`);
  }
  return res.json() as Promise<T>;
}
