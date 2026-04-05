"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";
import { ContentLayout } from "@/components/panel/content-layout";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { ArrowRight, Eye, ImageOff } from "lucide-react";
import { format } from "date-fns";

type BlogCategoryLite = {
  id: number;
  title: string;
  slug: string;
};

type BlogLite = {
  id: number;
  title: string;
  slug: string;
  image?: string | null;
  published_at?: string | null;
  views?: number | null;
  excerpt?: string | null;
  category?: BlogCategoryLite | null;
};

type BlogLiteResponse = {
  success?: boolean;
  data?: BlogLite[];
  meta?: {
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
  };
};

const PER_PAGE = 9;

const safeDate = (v: any) => {
  const d = v ? new Date(v) : null;
  if (!d) return null;
  return Number.isNaN(d.getTime()) ? null : d;
};

export default function ArtikelPage() {
  const { data, error, isLoading, mutate } = useSWR<BlogLiteResponse>(
    `/api/blog-lite?page=1&per_page=${PER_PAGE}`,
    fetcher
  );

  const [items, setItems] = useState<BlogLite[]>([]);
  const [meta, setMeta] = useState<BlogLiteResponse["meta"] | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [loadMoreError, setLoadMoreError] = useState<string | null>(null);

  useEffect(() => {
    const list = Array.isArray(data?.data) ? data?.data : [];
    setItems(list);
    setMeta(data?.meta ?? null);
  }, [data]);

  const canLoadMore = useMemo(() => {
    if (!meta) return false;
    return meta.current_page < meta.last_page;
  }, [meta]);

  const loadMore = useCallback(async () => {
    if (!meta || loadingMore) return;
    if (meta.current_page >= meta.last_page) return;

    const nextPage = meta.current_page + 1;
    setLoadingMore(true);
    setLoadMoreError(null);

    try {
      const res = await fetcher(`/api/blog-lite?page=${nextPage}&per_page=${PER_PAGE}`);
      const next = res as BlogLiteResponse;
      const nextItems = Array.isArray(next?.data) ? next.data : [];
      setItems((prev) => {
        const existing = new Set(prev.map((x) => String(x.id)));
        const merged = [...prev];
        for (const it of nextItems) {
          if (!existing.has(String(it.id))) merged.push(it);
        }
        return merged;
      });
      setMeta(next?.meta ?? meta);
    } catch (e: any) {
      setLoadMoreError(String(e?.message || e));
    } finally {
      setLoadingMore(false);
    }
  }, [meta, loadingMore]);

  if (isLoading) {
    return (
      <ContentLayout title="Artikel">
        <div className="flex h-[60vh] items-center justify-center">
          <LoadingSpinner size={40} />
        </div>
      </ContentLayout>
    );
  }

  if (error) {
    return (
      <ContentLayout title="Artikel">
        <div className="rounded-xl border border-border bg-muted/30 p-6">
          <div className="text-sm font-medium">Gagal memuat artikel</div>
          <div className="mt-1 text-xs text-muted-foreground">{String((error as any)?.message || error)}</div>
          <div className="mt-4 flex gap-2">
            <Button type="button" onClick={() => mutate()}>
              Coba Lagi
            </Button>
            <Button type="button" variant="outline" onClick={() => location.reload()}>
              Refresh Halaman
            </Button>
          </div>
        </div>
      </ContentLayout>
    );
  }

  return (
    <ContentLayout title="Artikel">
      <section className="pb-16 max-w-7xl mx-auto px-4">
        <div className="mx-auto mb-12 max-w-3xl text-center">
          <Badge variant="secondary" className="mb-4">
            Artikel & Berita
          </Badge>
          <h1 className="mb-3 text-3xl font-bold tracking-tight md:text-4xl">Update Terbaru & Insight</h1>
          <p className="text-muted-foreground text-sm md:text-base">
            Berita, promo, dan panduan terbaru seputar game dan top up digital.
          </p>
        </div>

        {items.length === 0 ? (
          <div className="rounded-xl border border-dashed p-10 text-center">
            <div className="text-muted-foreground">Belum ada artikel yang dipublikasikan.</div>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((post) => {
              const d = safeDate(post.published_at);
              const label = post.category?.title?.trim() ? post.category.title : null;

              return (
                <Card key={post.id} className="flex flex-col overflow-hidden transition-all hover:ring-2 hover:ring-primary/20">
                  <Link href={`/artikel/${post.slug}`} className="relative aspect-video w-full overflow-hidden bg-muted">
                    {post.image ? (
                      <Image
                        src={post.image}
                        alt={post.title}
                        fill
                        className="object-cover transition-transform duration-500 hover:scale-110"
                      />
                    ) : (
                      <div className="absolute inset-0 flex flex-col items-center justify-center opacity-20">
                        <ImageOff className="h-10 w-10" />
                      </div>
                    )}
                  </Link>

                  <CardHeader className="space-y-2">
                    {label && (
                      <div>
                        <Badge variant="secondary" className="text-[10px] uppercase tracking-wide">
                          {label}
                        </Badge>
                      </div>
                    )}

                    <h3 className="line-clamp-2 text-lg font-bold leading-tight">
                      <Link href={`/artikel/${post.slug}`} className="hover:text-primary transition-colors">
                        {post.title}
                      </Link>
                    </h3>
                  </CardHeader>

                  <CardContent className="flex-1">
                    <p className="line-clamp-3 text-sm text-muted-foreground">
                      {post.excerpt || "Klik untuk membaca detail informasi selengkapnya mengenai berita ini."}
                    </p>
                  </CardContent>

                  <CardFooter className="flex items-center justify-between border-t pt-4 text-xs font-medium">
                    <div className="flex items-center gap-4 text-muted-foreground">
                      <span>{d ? format(d, "dd MMM yyyy") : "-"}</span>
                      <span className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        {post.views ?? 0}
                      </span>
                    </div>
                    <Link href={`/artikel/${post.slug}`} className="text-primary flex items-center gap-1">
                      Baca Selengkapnya <ArrowRight className="h-3 w-3" />
                    </Link>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        )}

        {loadMoreError && (
          <div className="mt-6 rounded-xl border border-destructive/20 bg-destructive/5 p-4 text-sm text-destructive">
            {loadMoreError}
          </div>
        )}

        {canLoadMore && (
          <div className="mt-12 flex justify-center">
            <Button variant="outline" size="lg" onClick={loadMore} disabled={loadingMore} className="rounded-full px-8">
              {loadingMore ? "Menghubungkan..." : "Tampilkan Lebih Banyak"}
            </Button>
          </div>
        )}
      </section>
    </ContentLayout>
  );
}