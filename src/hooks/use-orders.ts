import useSWR from "swr";
import Pusher from "pusher-js";
import { useEffect } from "react";

const fetcher = (url: string) => fetch(url).then(res => res.json());

export function useOrders() {
  const { data, mutate } = useSWR("/api/latest-orders", fetcher);

  useEffect(() => {
    const pusherKey = process.env.NEXT_PUBLIC_PUSHER_APP_KEY;
    const pusherCluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER;

    if (!pusherKey || !pusherCluster) return;

    const pusher = new Pusher(pusherKey, {
      cluster: pusherCluster,
    });

    const channel = pusher.subscribe("orders");

    channel.bind("new-order", () => {
      mutate();
    });

    return () => {
      channel.unbind_all();
      pusher.unsubscribe("orders");
    };
  }, [mutate]);

  return data;
}