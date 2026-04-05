"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Skeleton } from "@/components/ui/skeleton";
import LogoInstan from "@/components/logo/instan";

interface PromoProduct {
  id: number;
  title: string;
  selling_price: number;
  selling_price_gold: number;
  selling_price_platinum: number;
  promo_price: number;
  game_image?: string;
  game_slug: string;
  game_title?: string;
  end_at: string;
}

function toTitleCaseFromSlug(slug: string) {
  return slug
    .split("-")
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export default function Promo() {
  const { data: session } = useSession();
  const role = session?.user?.role ?? "user";

  const { data, error, isLoading, mutate } = useSWR<{ success: boolean; products: PromoProduct[] }>(
    "/api/promo",
    fetcher
  );

  const scrollRef = useRef<HTMLDivElement>(null);
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  const promoEndAt = data?.products?.[0]?.end_at;

  const getPriceByRole = (item: PromoProduct, r: string) => {
    if (r === "platinum") return Number(item.selling_price_platinum ?? item.selling_price);
    if (r === "gold") return Number(item.selling_price_gold ?? item.selling_price);
    return Number(item.selling_price ?? 0);
  };

  const items = useMemo(() => {
    const products = Array.isArray(data?.products) ? data.products : [];

    return products
      .map((p) => {
        const base = getPriceByRole(p, role);
        const promo = Number(p.promo_price ?? 0);
        const diff = Math.max(0, base - promo);
        const gameName = p.game_title?.trim() ? p.game_title.trim() : toTitleCaseFromSlug(p.game_slug);

        return {
          ...p,
          base_price: base,
          promo_price_num: promo,
          diff,
          gameName,
        };
      })
      .filter((p) => p.promo_price_num > 0 && p.base_price > 0 && p.promo_price_num < p.base_price);
  }, [data, role]);

  const isPromoExpired = (endTime: string) => new Date(endTime).getTime() <= Date.now();

  useEffect(() => {
    if (!promoEndAt) return;

    const end = new Date(promoEndAt).getTime();

    const interval = setInterval(() => {
      const now = Date.now();
      const distance = end - now;

      if (distance <= 0) {
        setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        clearInterval(interval);
        return;
      }

      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((distance / (1000 * 60)) % 60);
      const seconds = Math.floor((distance / 1000) % 60);

      setCountdown({ days, hours, minutes, seconds });
    }, 1000);

    return () => clearInterval(interval);
  }, [promoEndAt]);

  useEffect(() => {
    if (!scrollRef.current || !items.length) return;

    const container = scrollRef.current;
    const cardWidth = 240 + 16;
    let index = 0;

    const scrollNext = () => {
      if (!container) return;

      index += 1;

      if (index >= items.length) {
        setTimeout(() => {
          container.scrollTo({ left: 0, behavior: "smooth" });
          index = 0;
        }, 700);
      } else {
        container.scrollTo({ left: index * cardWidth, behavior: "smooth" });
      }
    };

    const interval = setInterval(scrollNext, 3000);
    return () => clearInterval(interval);
  }, [items]);

  if (isLoading) {
    return (
      <div className="w-full bg-muted pb-4 rounded-2xl">
        <div className="p-4">
          <Skeleton className="h-5 w-28 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>
        <div className="flex overflow-x-auto gap-4 px-4 py-1 hide-scrollbar">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex flex-shrink-0 w-[240px] bg-background rounded-2xl p-3 shadow-sm">
              <Skeleton className="w-12 h-12 rounded-xl" />
              <div className="ml-3 flex-1 space-y-2">
                <Skeleton className="h-4 w-36" />
                <Skeleton className="h-3 w-28" />
                <Skeleton className="h-5 w-32" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full bg-muted pb-4 rounded-2xl">
        <div className="p-4">
          <div className="rounded-xl border border-border bg-background p-4">
            <div className="text-sm font-semibold">Promo gagal dimuat</div>
            <div className="mt-1 text-xs text-muted-foreground">
              {(error as Error)?.message ?? "Terjadi kesalahan."}
            </div>
            <div className="mt-3">
              <button
                type="button"
                onClick={() => mutate()}
                className="inline-flex h-9 items-center rounded-lg border border-border bg-background px-3 text-xs font-medium"
              >
                Coba Lagi
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!items.length || (promoEndAt && isPromoExpired(promoEndAt))) {
    return null;
  }

  return (
    <div className="w-full bg-muted pb-4 rounded-2xl">
      <div className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <Image src="/voltage.gif" alt="Flash Sale" width={20} height={20} className="w-5 h-5" />
          <h2 className="text-lg font-bold tracking-wide">Flash Sale!</h2>
          <div className="flex gap-1 ml-auto text-sm font-mono">
            {(["days", "hours", "minutes", "seconds"] as const).map((unit) => (
              <span key={unit} className="bg-background px-2 py-1 rounded">
                {countdown[unit].toString().padStart(2, "0")}
              </span>
            ))}
          </div>
        </div>
        <p className="text-sm mb-2">Jangan sampai kehabisan, order sekarang!</p>
      </div>

      <div className="scroll-container flex overflow-x-auto gap-4 px-4 py-1 hide-scrollbar" ref={scrollRef}>
        {items.map((item) => (
          <Link
            href={{ pathname: `/order/${item.game_slug}`, query: { product_id: item.id } }}
            key={item.id}
            className="flex flex-shrink-0 w-[240px] rounded-2xl bg-background p-3 shadow-sm hover:scale-[1.01] transition-transform"
          >
            <div className="flex w-full flex-col divide-y">
              <div className="space-y-1 pb-3">
                <div className="text-xs font-semibold line-clamp-2">{item.title}</div>
                <div className="text-[11px] text-muted-foreground line-clamp-1">{item.gameName}</div>

                <div className="mt-2 flex items-center gap-3">
                  <div className="h-12 w-12 flex-shrink-0 relative overflow-hidden rounded-xl bg-muted">
                    {item.game_image ? (
                      <Image src={item.game_image} alt={item.title} fill className="object-cover" />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-[10px] text-muted-foreground">
                        No Image
                      </div>
                    )}
                  </div>

                  <div className="min-w-0">
                    <div className="text-[12px] font-semibold text-my-color">
                      Rp {item.promo_price_num.toLocaleString("id-ID")}
                    </div>
                    <div className="text-[11px] text-my-hoverColor line-through">
                      Rp {item.base_price.toLocaleString("id-ID")}
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between gap-2">
                <span className="rounded bg-my-color px-2 py-0.5 text-[10px] font-semibold text-white">
                  - Rp {item.diff.toLocaleString("id-ID")}
                </span>
                <span className="inline-flex items-center gap-2 rounded bg-white px-2 py-1">
                  <LogoInstan className="h-3 w-12" />
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}