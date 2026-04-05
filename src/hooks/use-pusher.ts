import { useEffect, useRef, useState } from "react";
import Pusher from "pusher-js";
import { Transaction } from "@/types";

const usePusher = () => {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const pusherRef = useRef<Pusher | null>(null);

    useEffect(() => {
        if (pusherRef.current && pusherRef.current.connection.state !== "disconnected") {
            return;
        }

        const pusherKey = process.env.NEXT_PUBLIC_PUSHER_APP_KEY;
        const pusherCluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER;

        if (!pusherKey || !pusherCluster) {
            return;
        }

        const pusher = new Pusher(pusherKey, { cluster: pusherCluster });
        pusherRef.current = pusher;

        const paymentChannel = pusher.subscribe("payments");
        const buyStatusChannel = pusher.subscribe("buystatus");

        const handlePaymentUpdate = (data: any) => {
            if (!data || typeof data !== "object" || !data.order_id) return;

            setTransactions((prev: Transaction[]) => {
                const existingIndex = prev.findIndex((t) => t.order_id === data.order_id);
                if (existingIndex !== -1) {
                    return prev.map((transaction, index) =>
                        index === existingIndex
                            ? {
                                ...transaction,
                                payment_status: data.payment_status ?? transaction.payment_status,
                                buy_status: data.buy_status ?? transaction.buy_status,
                              }
                            : transaction
                    );
                } else {
                    return [...prev, {
                        order_id: data.order_id,
                        games: data.games ?? "",
                        product: data.product ?? "",
                        id_games: data.id_games ?? "",
                        server_games: data.server_games ?? null,
                        nickname: data.nickname ?? null,
                        price: data.price ?? 0,
                        fee: data.fee ?? 0,
                        promo_price: data.promo_price ?? 0,
                        total_price: data.total_price ?? 0,
                        payment_name: data.payment_name ?? "",
                        payment_method: data.payment_method ?? "",
                        payment_code: data.payment_code ?? "",
                        payment_status: data.payment_status ?? "",
                        payment_instructions: data.payment_instructions ?? [],
                        buy_status: data.buy_status ?? "",
                        serial_number: data.serial_number ?? "",
                        expired_time: data.expired_time ?? 0,
                        created_at: data.created_at ?? ""
                    }];
                }
            });
        };

        const handleBuyStatusUpdate = (data: any) => {
            if (!data || typeof data !== "object" || !data.order_id || !data.buy_status) return;

            setTransactions((prev: Transaction[]) =>
                prev.map((t) =>
                    t.order_id === data.order_id ? { ...t, buy_status: data.buy_status } : t
                )
            );
        };
        

        paymentChannel.bind("payment.updated", handlePaymentUpdate);
        buyStatusChannel.bind("buystatus.updated", handleBuyStatusUpdate);

        const cleanup = () => {
            paymentChannel.unbind("payment.updated", handlePaymentUpdate);
            buyStatusChannel.unbind("buystatus.updated", handleBuyStatusUpdate);
            paymentChannel.unsubscribe();
            buyStatusChannel.unsubscribe();

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
    }, []);

    return transactions;
};

export default usePusher;