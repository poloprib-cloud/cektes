"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { ExternalLink, CheckCircle2, XCircle } from "lucide-react";

import { ContentLayout } from "@/components/panel/content-layout";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

const num = (v: any) => {
  const n = Number(v ?? 0);
  return Number.isFinite(n) ? n : 0;
};

const fmtRupiah = (v: any) => {
  const n = Math.max(0, Math.floor(num(v)));
  if (!n) return "-";
  return `Rp ${n.toLocaleString("id-ID")}`;
};

export default function PriceListPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const [selectedGameId, setSelectedGameId] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  useEffect(() => {
    let alive = true;

    setLoading(true);
    setErr(null);

    fetch("/api/price-list", {
      method: "GET",
      headers: { Accept: "application/json" },
    })
      .then(async (res) => {
        const ct = (res.headers.get("content-type") || "").toLowerCase();
        const isJson = ct.includes("application/json");
        const json = isJson ? await res.json().catch(() => ({})) : null;

        if (!res.ok) {
          const msg = json?.message || `Gagal mengambil data. Status: ${res.status}`;
          throw new Error(msg);
        }
        if (!isJson) throw new Error("Response tidak valid (bukan JSON).");

        return json;
      })
      .then((json) => {
        if (!alive) return;
        setData(json);
      })
      .catch((e: any) => {
        if (!alive) return;
        setErr(String(e?.message || e));
        setData(null);
      })
      .finally(() => {
        if (!alive) return;
        setLoading(false);
      });

    return () => {
      alive = false;
    };
  }, []);

  const gameList = useMemo(() => {
    if (!data?.success) return [];
    return Array.isArray(data.data) ? data.data : [];
  }, [data]);

  useEffect(() => {
    if (gameList.length && !selectedGameId) {
      setSelectedGameId(String(gameList[0].id));
    }
  }, [gameList, selectedGameId]);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedGameId]);

  const selectedGame = useMemo(() => {
    return gameList.find((g: any) => String(g.id) === String(selectedGameId)) || null;
  }, [selectedGameId, gameList]);

  const totalPages = useMemo(() => {
    const total = selectedGame?.products?.length ?? 0;
    return Math.max(1, Math.ceil(total / itemsPerPage));
  }, [selectedGame, itemsPerPage]);

  const paginatedProducts = useMemo(() => {
    const products = Array.isArray(selectedGame?.products) ? selectedGame.products : [];
    const start = (currentPage - 1) * itemsPerPage;
    return products.slice(start, start + itemsPerPage);
  }, [selectedGame, currentPage, itemsPerPage]);

  return (
    <ContentLayout title="Daftar Produk">
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-semibold">Daftar Harga Produk</h2>
          <p className="text-sm text-muted-foreground">Pilih game, lalu order produk yang kamu inginkan.</p>
        </div>

        {err ? (
          <div className="w-full max-w-4xl mx-auto rounded-md border bg-background p-4 text-sm">
            <div className="font-semibold text-red-600">Gagal memuat daftar harga</div>
            <div className="mt-1 text-muted-foreground">{err}</div>
            <div className="mt-3">
              <button
                className="rounded-lg bg-my-color px-3 py-2 text-xs font-semibold text-white"
                onClick={() => location.reload()}
              >
                Coba Lagi
              </button>
            </div>
          </div>
        ) : null}

        <div className="w-full max-w-md mx-auto">
          {loading ? (
            <Skeleton className="h-10 w-full" />
          ) : (
            <Select value={selectedGameId} onValueChange={setSelectedGameId}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Pilih Game" />
              </SelectTrigger>
              <SelectContent>
                {gameList.map((game: any) => (
                  <SelectItem key={game.id} value={String(game.id)}>
                    {game.game_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        {loading ? (
          <div className="w-full max-w-4xl mx-auto rounded-md border bg-background p-4">
            <Skeleton className="h-10 w-full" />
            <div className="mt-3 space-y-2">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          </div>
        ) : selectedGame ? (
          <div className="space-y-4">
            <div className="w-full max-w-4xl mx-auto rounded-md border bg-background">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="min-w-[260px]">Produk</TableHead>
                      <TableHead className="text-left whitespace-nowrap">Basic</TableHead>
                      <TableHead className="text-left whitespace-nowrap">Gold</TableHead>
                      <TableHead className="text-left whitespace-nowrap">Platinum</TableHead>
                      <TableHead className="text-left whitespace-nowrap">Status</TableHead>
                      <TableHead className="text-center whitespace-nowrap">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {paginatedProducts.map((product: any) => {
                      const isActive = product.status === 1;

                      const href = selectedGame?.slug
                        ? `/order/${selectedGame.slug}?product_id=${encodeURIComponent(String(product.id))}`
                        : "#";

                      const imageUrl = product.logo || product.images || null;

                      return (
                        <TableRow key={product.id}>
                          <TableCell className="min-w-[260px]">
                            <div className="flex items-center gap-3">
                              <div className="relative h-10 w-10 overflow-hidden rounded-md border bg-muted">
                                {imageUrl ? (
                                  <Image
                                    src={imageUrl}
                                    alt={product.title}
                                    fill
                                    className="object-cover"
                                    sizes="40px"
                                  />
                                ) : null}
                              </div>

                              <div className="min-w-0">
                                <div className="font-medium leading-tight line-clamp-2">{product.title}</div>
                                <div className="text-xs text-muted-foreground">{product.brand}</div>
                              </div>
                            </div>
                          </TableCell>

                          <TableCell className="whitespace-nowrap">{fmtRupiah(product.selling_price)}</TableCell>
                          <TableCell className="whitespace-nowrap">{fmtRupiah(product.selling_price_gold)}</TableCell>
                          <TableCell className="whitespace-nowrap">{fmtRupiah(product.selling_price_platinum)}</TableCell>

                          <TableCell className="whitespace-nowrap">
                            <div className="inline-flex items-center gap-2">
                              {isActive ? (
                                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                              ) : (
                                <XCircle className="h-4 w-4 text-red-600" />
                              )}
                              <span className={isActive ? "text-emerald-600" : "text-red-600"}>
                                {isActive ? "Tersedia" : "Gangguan"}
                              </span>
                            </div>
                          </TableCell>

                          <TableCell className="text-center whitespace-nowrap">
                            <Button asChild size="sm" disabled={!selectedGame?.slug || !isActive}>
                              <Link href={href} className="inline-flex items-center gap-2">
                                Order <ExternalLink className="h-4 w-4" />
                              </Link>
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </div>

            {totalPages > 1 ? (
              <div className="flex items-center justify-center gap-2">
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  Sebelumnya
                </Button>

                <div className="text-sm text-muted-foreground">
                  Halaman {currentPage} / {totalPages}
                </div>

                <Button
                  variant="outline"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  Berikutnya
                </Button>
              </div>
            ) : null}
          </div>
        ) : (
          <div className="w-full max-w-4xl mx-auto rounded-md border bg-background p-4 text-sm text-muted-foreground">
            Tidak ada produk.
          </div>
        )}
      </div>
    </ContentLayout>
  );
}