"use client";

import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import useSWR from "swr";
import { ContentLayout } from "@/components/panel/content-layout";
import { Slider } from "@/components/home/slider";
import { Skeleton } from "@/components/ui/skeleton";
import { PopularGames } from "@/components/home/game-populer";
import { GameCategories } from "@/components/home/game-category";
import { GameList } from "@/components/home/game-list";
import Promo from "@/components/home/promo";
import PromoPopup from "@/components/home/promo-popup";
import Artikel from "@/components/home/artikel";
import { Button } from "@/components/ui/button";
import { fetcher } from "@/lib/fetcher";

const swrOptions = {
  revalidateOnFocus: false,
  dedupingInterval: 60_000,
};

export default function HomePage() {
  const {
    data: dataSlider,
    error: errorSlider,
    mutate: mutateSlider,
  } = useSWR("/api/slider", fetcher, swrOptions);

  const {
    data: dataCategories,
    error: errorCategories,
    mutate: mutateCategories,
  } = useSWR("/api/category", fetcher, swrOptions);

  const {
    data: dataGames,
    error: errorGames,
    mutate: mutateGames,
  } = useSWR("/api/games", fetcher, swrOptions);

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const categoryRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (dataCategories?.data?.length > 0 && !selectedCategory) {
      setSelectedCategory(String(dataCategories.data[0].id));
    }
  }, [dataCategories, selectedCategory]);

  const scrollCategories = useCallback((direction: "left" | "right") => {
    if (!categoryRef.current) return;
    categoryRef.current.scrollBy({
      left: direction === "left" ? -200 : 200,
      behavior: "smooth",
    });
  }, []);

  const filteredGames = useMemo(() => {
    if (!dataGames || !selectedCategory) return [];
    const list = Array.isArray(dataGames?.games) ? dataGames.games : [];
    return list.filter((game: any) => String(game.category_id) === String(selectedCategory));
  }, [dataGames, selectedCategory]);

  const isLoadingGames = !dataGames && !errorGames;
  const isLoadingCategories = !dataCategories && !errorCategories;
  const isLoadingSlider = !dataSlider && !errorSlider;

  const hasAnyError = Boolean(errorSlider || errorCategories || errorGames);

  const retryAll = async () => {
    const tasks: Promise<any>[] = [];
    tasks.push(mutateSlider());
    tasks.push(mutateCategories());
    tasks.push(mutateGames());
    await Promise.allSettled(tasks);
  };

  return (
    <ContentLayout title="Home">
      <div className="space-y-6">
        <div className="bg-muted/50 -mx-4 lg:-mx-8 -my-8 px-4 py-6 lg:py-8 mb-8">
          {isLoadingSlider ? (
            <Skeleton className="w-full h-40 lg:h-64 rounded-lg" />
          ) : errorSlider ? (
            <div className="rounded-xl border border-border bg-muted/30 p-6">
              <div className="text-sm font-medium">Gagal memuat banner</div>
              <div className="mt-1 text-xs text-muted-foreground">
                {(errorSlider as Error)?.message ?? "Terjadi kesalahan."}
              </div>
              <div className="mt-4">
                <Button type="button" variant="outline" onClick={() => mutateSlider()}>
                  Coba Lagi
                </Button>
              </div>
            </div>
          ) : (
            <Slider slides={dataSlider?.data ?? []} />
          )}
        </div>

        {hasAnyError && (
          <div className="rounded-xl border border-border bg-muted/30 p-6">
            <div className="text-sm font-medium">Sebagian data gagal dimuat</div>
            <div className="mt-1 text-xs text-muted-foreground">
              {errorGames ? (errorGames as Error)?.message : null}
              {errorGames && (errorCategories || errorSlider) ? " • " : null}
              {errorCategories ? (errorCategories as Error)?.message : null}
              {errorCategories && errorSlider ? " • " : null}
              {errorSlider ? (errorSlider as Error)?.message : null}
            </div>
            <div className="mt-4 flex gap-2">
              <Button type="button" onClick={retryAll}>
                Coba Lagi
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  mutateGames();
                  mutateCategories();
                  mutateSlider();
                }}
              >
                Refresh Data
              </Button>
            </div>
          </div>
        )}

        <Promo />

        <PopularGames isLoading={isLoadingGames} popularGames={dataGames?.populerGames} />

        <GameCategories
          dataCategories={isLoadingCategories ? undefined : dataCategories}
          selectedCategory={selectedCategory}
          setSelectedCategory={(id) => setSelectedCategory(String(id))}
          scrollCategories={scrollCategories}
          categoryRef={categoryRef}
        />

        <GameList isLoading={isLoadingGames} filteredGames={filteredGames} />

        {!isLoadingGames && !errorGames && filteredGames.length === 0 && (
          <div className="text-center text-sm text-muted-foreground py-6">Tidak ada game pada kategori ini</div>
        )}
      </div>

      <div className="mt-16">
        <Artikel />
      </div>

      <PromoPopup />
    </ContentLayout>
  );
}