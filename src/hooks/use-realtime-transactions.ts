import { useEffect, useRef } from "react";
import Pusher from "pusher-js";
import useSWR from "swr";
import { Transaction } from "@/types";

const fetcher = async (url: string) => {
  const res = await fetch(url, { cache: "no-store" });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = typeof json?.message === "string" ? json.message : "Request failed";
    throw new Error(msg);
  }
  return json;
};

const useRealtimeTransactions = () => {
  const pusherRef = useRef<Pusher | null>(null);

  const { data, mutate, error, isLoading } = useSWR<{ data: Transaction[] }>(
    "/api/realtime-transaction",
    fetcher,
    {
      refreshInterval: 0,
      revalidateOnFocus: false,
    }
  );

  useEffect(() => {
    const pusherKey = process.env.NEXT_PUBLIC_PUSHER_APP_KEY;
    const pusherCluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER;

    if (!pusherKey || !pusherCluster) return;

    const pusher = new Pusher(pusherKey, { cluster: pusherCluster });
    pusherRef.current = pusher;

    const channel = pusher.subscribe("realtimetransaction");

    const handleRealtimeTransaction = (incoming: any) => {
      if (!incoming || typeof incoming !== "object" || !incoming.order_id) {
        return;
      }

      mutate((prev) => {
        const transactions = Array.isArray(prev?.data) ? prev.data : [];
        const exists = transactions.find((t) => t.order_id === incoming.order_id);

        if (exists) {
          return {
            ...(prev ?? { data: [] }),
            data: transactions.map((t) =>
              t.order_id === incoming.order_id ? { ...t, ...incoming } : t
            ),
          };
        }

        return {
          ...(prev ?? { data: [] }),
          data: [incoming, ...transactions].slice(0, 10),
        };
      }, false);
    };

    channel.bind("realtimetransaction.updated", handleRealtimeTransaction);

    const cleanup = () => {
      channel.unbind("realtimetransaction.updated", handleRealtimeTransaction);
      pusher.unsubscribe("realtimetransaction");

      if (pusherRef.current) {
        pusherRef.current.disconnect();
        pusherRef.current = null;
      }
    };

    window.addEventListener("beforeunload", cleanup);

    return () => {
      cleanup();
      window.removeEventListener("beforeunload", cleanup);
    };
  }, [mutate]);

  return {
    data,
    error,
    isLoading,
    mutate,
  };
};

export default useRealtimeTransactions;
