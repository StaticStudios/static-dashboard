import {useCallback, useEffect, useState} from "react";
import {
  fetchPlayerStorePurchases,
  fetchPlayerStoreSummary,
  fetchStoreInfo,
  fetchStorePayments,
  fetchStoreSummary,
  refreshStore,
} from "../api/store";
import type {PlayerPurchase, PlayerStoreSummary, StoreInfo, StorePayment, StoreSummary} from "../api/types";

/**
 * Hooks for the Tebex store views. The API caches its upstream calls for ~60s, so none of these
 * poll; the Store tab offers an explicit refresh instead.
 */

/** Store identity and currency, fetched once on mount. */
export function useStoreInfo() {
  const [info, setInfo] = useState<StoreInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetchStoreInfo()
      .then((data) => {
        if (!cancelled) setInfo(data);
      })
      .catch(() => {
        if (!cancelled) setInfo(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return { info, loading };
}

/**
 * Store KPIs and the daily revenue series. `reloadKey` lets the tab force a refetch after evicting
 * the API's cache, without this hook needing to know about the Refresh button.
 */
export function useStoreSummary(days: number, reloadKey: number) {
  const [summary, setSummary] = useState<StoreSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchStoreSummary({ days })
      .then((data) => {
        if (cancelled) return;
        setSummary(data);
        setError(null);
      })
      .catch(() => {
        if (cancelled) return;
        setSummary(null);
        setError("Could not load the store summary.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [days, reloadKey]);

  return { summary, loading, error };
}

export function useStorePayments(page: number, limit: number, reloadKey: number) {
  const [payments, setPayments] = useState<StorePayment[]>([]);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchStorePayments({ page: page - 1, limit })
      .then((result) => {
        if (cancelled) return;
        setPayments(result.content);
        setTotalElements(result.totalElements);
        setTotalPages(Math.max(1, result.totalPages));
      })
      .catch(() => {
        if (cancelled) return;
        setPayments([]);
        setTotalElements(0);
        setTotalPages(1);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [page, limit, reloadKey]);

  return { payments, totalElements, totalPages, loading };
}

/** Bumps a counter after the API drops its Tebex caches, which the hooks above depend on. */
export function useStoreRefresh() {
  const [reloadKey, setReloadKey] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [refreshedAt, setRefreshedAt] = useState<number>(() => Date.now());

  const refresh = useCallback(() => {
    setRefreshing(true);
    refreshStore()
      .catch(() => {
        // A failed eviction just means the views stay on cached data; the refetch below still runs.
      })
      .finally(() => {
        setRefreshedAt(Date.now());
        setReloadKey((key) => key + 1);
        setRefreshing(false);
      });
  }, []);

  return { reloadKey, refreshing, refreshedAt, refresh };
}

/** What a player has spent, for the Money Spent card. */
export function usePlayerStoreSummary(id: string, enabled: boolean) {
  const [summary, setSummary] = useState<PlayerStoreSummary | null>(null);
  const [loading, setLoading] = useState(enabled);

  useEffect(() => {
    if (!enabled) {
      setSummary(null);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    fetchPlayerStoreSummary(id)
      .then((data) => {
        if (!cancelled) setSummary(data);
      })
      .catch(() => {
        if (!cancelled) setSummary(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id, enabled]);

  return { summary, loading };
}

export function usePlayerStorePurchases(id: string, page: number, limit: number, enabled: boolean) {
  const [purchases, setPurchases] = useState<PlayerPurchase[]>([]);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(enabled);

  useEffect(() => {
    if (!enabled) {
      setPurchases([]);
      setTotalElements(0);
      setTotalPages(1);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    fetchPlayerStorePurchases(id, { page: page - 1, limit })
      .then((result) => {
        if (cancelled) return;
        setPurchases(result.content);
        setTotalElements(result.totalElements);
        setTotalPages(Math.max(1, result.totalPages));
      })
      .catch(() => {
        if (cancelled) return;
        setPurchases([]);
        setTotalElements(0);
        setTotalPages(1);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id, page, limit, enabled]);

  return { purchases, totalElements, totalPages, loading };
}
