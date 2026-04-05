"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type Key = string | null | undefined;

type MutateFn<T> = (data?: T | ((prev?: T) => T), shouldRevalidate?: boolean) => Promise<T | undefined>;

type SWROptions = {
  refreshInterval?: number;
  revalidateOnFocus?: boolean;
  shouldRetryOnError?: boolean;
  dedupingInterval?: number;
};

export default function useSWR<T = any>(
  key: Key,
  fetcher?: (key: string) => Promise<T>,
  _options?: SWROptions
): {
  data: T | undefined;
  error: any;
  isLoading: boolean;
  mutate: MutateFn<T>;
} {
  const [data, setData] = useState<T | undefined>(undefined);
  const [error, setError] = useState<any>(undefined);
  const [isLoading, setIsLoading] = useState<boolean>(Boolean(key));

  const keyRef = useRef<Key>(key);
  keyRef.current = key;

  const doFetch = useCallback(async () => {
    if (!keyRef.current) {
      setIsLoading(false);
      return;
    }

    const k = String(keyRef.current);
    setIsLoading(true);
    setError(undefined);

    try {
      const fn =
        fetcher ||
        (async (u: string) => {
          const res = await fetch(u, { cache: "no-store" });
          return (await res.json()) as T;
        });

      const res = await fn(k);
      setData(res);
    } catch (e: any) {
      setError(e);
    } finally {
      setIsLoading(false);
    }
  }, [fetcher]);

  useEffect(() => {
    if (!key) {
      setIsLoading(false);
      return;
    }
    doFetch();
  }, [key, doFetch]);

  const mutate: MutateFn<T> = useCallback(
    async (next?: T | ((prev?: T) => T), shouldRevalidate: boolean = true) => {
      if (typeof next === "function") {
        setData((prev) => (next as any)(prev));
      } else if (next !== undefined) {
        setData(next);
      }

      if (shouldRevalidate) {
        await doFetch();
      }

      return data;
    },
    [doFetch, data]
  );

  return { data, error, isLoading, mutate };
}
