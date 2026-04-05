"use client";

import { useState } from "react";
import useSWRInfinite from "swr/infinite";
import { Star } from "lucide-react";
import { format } from "date-fns";

import { ContentLayout } from "@/components/panel/content-layout";
import { fetcher } from "@/lib/fetcher";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

type ReviewItem = {
  id: number;
  product: string | null;
  game: string | null;
  rating: number;
  review_text: string;
  reviewer_type: string;
  reviewer_display: string;
  created_at: string;
};

type ReviewsResponse = {
  success: boolean;
  data: ReviewItem[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
};

const PAGE_SIZE = 12;

export default function UlasanProdukPage() {
  const [minRating, setMinRating] = useState<string>("0");

  const getKey = (pageIndex: number, previousPageData: ReviewsResponse | null) => {
    if (previousPageData && previousPageData.meta.current_page >= previousPageData.meta.last_page) return null;
    return `/api/reviews?page=${pageIndex + 1}&per_page=${PAGE_SIZE}`;
  };

  const { data, size, setSize, isLoading } = useSWRInfinite<ReviewsResponse>(getKey, fetcher, {
    revalidateFirstPage: false,
  });

  if (isLoading && !data) {
    return (
      <ContentLayout title="Ulasan Produk">
        <div className="flex h-[60vh] items-center justify-center">
          <LoadingSpinner size={40} />
        </div>
      </ContentLayout>
    );
  }

  const pages = data ?? [];
  const lastMeta = pages.length ? pages[pages.length - 1].meta : null;
  const all = pages.flatMap((p) => p.data ?? []);

  const min = Number(minRating);
  const filtered = min > 0 ? all.filter((r) => Number(r.rating) >= min) : all;

  const isReachingEnd = lastMeta ? lastMeta.current_page >= lastMeta.last_page : true;

  return (
    <ContentLayout title="Ulasan Produk">
      <section className="pb-16">
        <div className="mx-auto mb-10 max-w-3xl text-center">
          <Badge variant="secondary" className="mb-4">
            Testimoni Pembeli
          </Badge>
          <h1 className="mb-3 text-3xl font-bold tracking-tight md:text-4xl">Ulasan Produk</h1>
          <p className="text-muted-foreground">Lihat pengalaman pembeli lain sebelum kamu top up.</p>
        </div>

        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {lastMeta && <div className="text-sm text-muted-foreground">Total {lastMeta.total} ulasan</div>}

          <div className="flex items-center gap-2">
            <div className="text-sm text-muted-foreground">Filter rating</div>
            <Select value={minRating} onValueChange={setMinRating}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Semua" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">Semua</SelectItem>
                <SelectItem value="5">5 ke atas</SelectItem>
                <SelectItem value="4">4 ke atas</SelectItem>
                <SelectItem value="3">3 ke atas</SelectItem>
                <SelectItem value="2">2 ke atas</SelectItem>
                <SelectItem value="1">1 ke atas</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="rounded-lg border p-8 text-center text-muted-foreground">Belum ada ulasan.</div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((r) => (
              <Card key={r.id} className="flex flex-col">
                <CardHeader className="space-y-2">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="line-clamp-2 font-semibold">{r.product ?? "Produk"}</div>
                      <div className="text-xs text-muted-foreground">{r.game ?? ""}</div>
                    </div>
                    <Badge variant="secondary" className="shrink-0">
                      {r.reviewer_display}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, idx) => {
                      const v = idx + 1;
                      return (
                        <Star
                          key={v}
                          className={cn(
                            "h-4 w-4",
                            v <= Number(r.rating) ? "fill-current text-my-color" : "text-muted-foreground"
                          )}
                        />
                      );
                    })}
                  </div>
                </CardHeader>

                <CardContent className="flex-1">
                  <div className="whitespace-pre-wrap text-sm">{r.review_text}</div>
                  <div className="mt-4 text-xs text-muted-foreground">
                    {r.created_at ? format(new Date(r.created_at), "dd MMM yyyy, HH:mm") : ""}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {!isReachingEnd && (
          <div className="mt-10 flex justify-center">
            <Button variant="outline" onClick={() => setSize(size + 1)} className="shadow-none">
              Muat Lebih Banyak
            </Button>
          </div>
        )}
      </section>
    </ContentLayout>
  );
}
