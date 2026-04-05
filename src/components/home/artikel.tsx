"use client";

import Link from "next/link";
import Image from "next/image";
import useSWR from "swr";
import { ImageOff, ArrowRight } from "lucide-react";

import { fetcher } from "@/lib/fetcher";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

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

export default function Artikel() {
  const { data, error, isLoading, mutate } = useSWR<BlogLiteResponse>(
    "/api/blog-lite?page=1&per_page=6",
    fetcher
  );

  const blogs: BlogLite[] = Array.isArray(data?.data) ? data!.data! : [];

  return (
    <section className="pb-10">
      <div className="flex items-end justify-between gap-4 mb-5">
        <div>
          <h2 className="text-lg sm:text-2xl font-bold tracking-tight">Artikel Terbaru</h2>
          <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
            Dapatkan info terbaru seputar dunia game, promo, update top-up, dan tips komunitas.
          </p>
        </div>

        <Button asChild variant="outline" size="sm" className="hidden sm:inline-flex rounded-full">
          <Link href="/artikel">Lihat Semua</Link>
        </Button>
      </div>

      {isLoading ? (
        <div className="flex gap-4 overflow-x-auto pb-4 hide-scrollbar sm:grid sm:grid-cols-2 lg:grid-cols-3 sm:overflow-visible">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="min-w-[85%] sm:min-w-0 overflow-hidden rounded-xl border-none shadow-sm">
              <Skeleton className="w-full aspect-[16/9]" />
              <CardContent className="p-4 space-y-3 bg-card">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-8 w-32 rounded-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : error ? (
        <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-6 text-center">
          <p className="text-sm font-medium text-destructive">Gagal memuat artikel</p>
          <Button type="button" size="sm" variant="outline" className="mt-4" onClick={() => mutate()}>
            Coba Lagi
          </Button>
        </div>
      ) : (
        <>
          {blogs.length === 0 ? (
            <div className="rounded-xl border border-dashed p-10 text-center">
              <p className="text-sm text-muted-foreground">Belum ada artikel terbaru.</p>
            </div>
          ) : (
            <div className="flex gap-4 overflow-x-auto pb-4 hide-scrollbar sm:grid sm:grid-cols-2 lg:grid-cols-3 sm:overflow-visible">
              {blogs.map((post) => {
                const label = post.category?.title?.trim() ? post.category.title : "Berita";
                return (
                  <Card
                    key={post.id}
                    className={cn(
                      "min-w-[85%] sm:min-w-0 overflow-hidden transition-all hover:ring-2 hover:ring-primary/20 rounded-xl border-none shadow-sm group"
                    )}
                  >
                    <Link href={`/artikel/${post.slug}`} className="block">
                      <div className="relative aspect-[16/9] w-full bg-muted overflow-hidden">
                        {post.image ? (
                          <Image
                            src={post.image}
                            alt={post.title}
                            fill
                            className="object-cover transition-transform duration-500 group-hover:scale-110"
                            sizes="(max-width: 640px) 85vw, (max-width: 1024px) 50vw, 33vw"
                          />
                        ) : (
                          <div className="flex flex-col items-center justify-center h-full text-muted-foreground/40">
                            <ImageOff className="h-8 w-8 mb-1" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60" />
                        <div className="absolute left-3 bottom-3">
                          <Badge className="bg-primary/90 hover:bg-primary border-none text-[10px] uppercase font-bold tracking-wider">
                            {label}
                          </Badge>
                        </div>
                      </div>
                    </Link>

                    <CardContent className="p-4 space-y-3 bg-card">
                      <Link href={`/artikel/${post.slug}`} className="block">
                        <h3 className="font-bold leading-tight line-clamp-2 group-hover:text-primary transition-colors">
                          {post.title}
                        </h3>
                      </Link>

                      <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                        {post.excerpt || "Klik untuk membaca detail artikel selengkapnya."}
                      </p>

                      <div className="pt-1">
                        <Link
                          href={`/artikel/${post.slug}`}
                          className="text-xs font-bold text-primary inline-flex items-center gap-1.5 hover:gap-3 transition-all"
                        >
                          Baca Selengkapnya <ArrowRight className="h-3.5 w-3.5" />
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

          <div className="mt-4 sm:hidden">
            <Button asChild variant="outline" className="w-full rounded-full border-primary/20 text-primary">
              <Link href="/artikel">Lihat Semua Artikel</Link>
            </Button>
          </div>
        </>
      )}
    </section>
  );
}