"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

export function OrdersListClient({ whatsapp }: { whatsapp: string }) {
  const [orders, setOrders] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function fetchOrders() {
      const res = await fetch(
        `/api/invoices/search-by-whatsapp?whatsapp=${encodeURIComponent(whatsapp)}`
      );
      if (res.ok) {
        const data = await res.json();
        setOrders(data.data || []);
        setFiltered(data.data || []);
      }
      setLoading(false);
    }

    fetchOrders();
  }, [whatsapp]);

  const handleSearch = (value: string) => {
    setSearch(value);
    if (!value) {
      setFiltered(orders);
    } else {
      const lower = value.toLowerCase();
      setFiltered(
        orders.filter((o) => o.order_id.toLowerCase().includes(lower))
      );
    }
  };

  if (loading) { 
    return (
      <div className="w-full h-[80vh] flex justify-center items-center">
        <LoadingSpinner size={40} />
      </div>
    );
  }
  
  if (orders.length === 0)
    return (
      <div className="text-center py-10 text-muted-foreground">
        Tidak ada invoice ditemukan untuk nomor <strong>{whatsapp}</strong>.
      </div>
    );

  return (
    <div className="space-y-4">
      <div className="w-full max-w-6xl mx-auto lg:border lg:rounded-lg lg:p-6">
        <h2 className="text-xl font-bold mb-2">
          Transaksi Anda
        </h2>
        <p className="text-sm text-gray-400 mb-6">
          Berikut ini keseluruhan data pesanan anda pada nomor {whatsapp}.
        </p>
        
        <div className="mb-4 sm:flex sm:justify-end">
          <div>
            <label className="block text-sm font-medium mb-2">
              Cari berdasarkan Order ID
            </label>
            <Input
              placeholder="Contoh: INV-1742576637"
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full sm:w-[300px] rounded-xl border border-input bg-muted text-sm text-foreground placeholder:text-muted-foreground focus-visible:ring-0 focus-visible:ring-offset-0"
            />
          </div>
        </div>
      
        <div className="-mx-4 overflow-x-auto lg:mx-0">
          <table className="min-w-full text-sm whitespace-nowrap">
            <thead>
              <tr className="border-t border-b text-xs text-left">
                <th className="p-3 text-left">Order ID</th>
                <th className="p-3 text-left">Game</th>
                <th className="p-3 text-left">Produk</th>
                <th className="p-3 text-left">ID</th>
                <th className="p-3 text-left">Server</th>
                <th className="p-3 text-left">Nickname</th>
                <th className="p-3 text-left">Harga</th>
                <th className="p-3 text-left">Tanggal</th>
                <th className="p-3 text-left">Status</th>
                <th className="p-3 text-left">Detail</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((order, index) => {
                const finalPrice = order.discount_price ?? order.price;
                return (
                  <tr
                    key={order.order_id}
                    className={`transition-colors ${
                      index % 2 === 0
                        ? "bg-white dark:bg-background"
                        : "bg-gray-50 dark:bg-muted/50"
                    }`}
                  >
                    <td className="p-3">
                      {order.order_id}
                    </td>
                    <td className="p-3">{order.games}</td>
                    <td className="p-3">{order.product}</td>
                    <td className="p-3">{order.id_games}</td>
                    <td className="p-3">{order.server_games ?? "-"}</td>
                    <td className="p-3">{order.nickname ?? "-"}</td>
                    <td className="p-3">
                      Rp{finalPrice.toLocaleString("id-ID")}
                    </td>
                    <td className="p-3">
                      {format(new Date(order.created_at), "dd MMM yyyy HH:mm")}
                    </td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold
                          ${
                            order.buy_status === "Pending"
                              ? "bg-yellow-500 text-black"
                              : order.buy_status === "Proses"
                              ? "bg-blue-500 text-white"
                              : order.buy_status === "Batal" || order.buy_status === "Gagal"
                              ? "bg-red-500 text-white"
                              : order.buy_status === "Sukses"
                              ? "bg-green-500 text-white"
                              : "bg-gray-500 text-white"
                          }
                        `}
                      >
                        {order.buy_status}
                      </span>
                    </td>
                    <td className="p-3">
                      <Link
                        href={`/invoices/${order.order_id}`}
                        className="text-my-color hover:underline font-medium"
                      >
                        Detail
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}