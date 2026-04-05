"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

type ApplyResult = {
  code: string;
  discount: number;
  finalPrice: number;
};

type PromoListItem = {
  id: number;
  name: string;
  code: string;
  status: string;
  is_eligible: boolean;
  ineligible_reasons?: string[];
  discount_type?: string;
  discount_value?: number;
  min_product_price?: number | null;
  start_at?: string | null;
  end_at?: string | null;
  usage_limit_total?: number | null;
  used_count?: number;
};

interface PromoCodeSectionProps {
  gameSlug: string | null;
  productId: string | null;
  paymentMethodId: string | null;
  whatsapp: string;
  quantity?: number;
  onApplied: (result: ApplyResult) => void;
  onCleared: () => void;
  appliedCode: string | null;
  appliedDiscount: number;
  stepNumber?: number;
  sectionId?: string;
}

const n = (v: any) => {
  const x = Number(v ?? 0);
  return Number.isFinite(x) ? x : 0;
};

const money = (v: any) => Math.max(0, Math.floor(n(v)));

export default function PromoCodeSection({
  gameSlug,
  productId,
  paymentMethodId,
  whatsapp,
  quantity = 1,
  onApplied,
  onCleared,
  appliedCode,
  appliedDiscount,
  stepNumber,
  sectionId,
}: PromoCodeSectionProps) {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

  const [openList, setOpenList] = useState(false);
  const [listLoading, setListLoading] = useState(false);
  const [promoList, setPromoList] = useState<PromoListItem[]>([]);

  useEffect(() => {
    if (!appliedCode) return;
    setCode(appliedCode);
  }, [appliedCode]);

  const canApply = useMemo(() => {
    return Boolean(gameSlug && productId && paymentMethodId && code.trim().length > 0);
  }, [gameSlug, productId, paymentMethodId, code]);

  const canFetchList = useMemo(() => {
    return Boolean(gameSlug && productId && paymentMethodId);
  }, [gameSlug, productId, paymentMethodId]);

  const step = useMemo(() => {
    const x = Number(stepNumber);
    return Number.isFinite(x) && x > 0 ? Math.floor(x) : 4;
  }, [stepNumber]);

  const resolvedSectionId = useMemo(() => (sectionId ? String(sectionId) : String(step)), [sectionId, step]);

  const fetchList = async () => {
    if (!canFetchList || listLoading) return;

    setListLoading(true);
    try {
      const q = new URLSearchParams();
      q.set("game", String(gameSlug));
      q.set("product_id", String(productId));
      q.set("payment_method_id", String(paymentMethodId));

      const res = await fetch(`/api/promo-codes?${q.toString()}`, { cache: "no-store" });
      const json = await res.json().catch(() => ({} as any));

      if (!res.ok || !json?.success) {
        setPromoList([]);
        toast.error(json?.message || "Gagal memuat daftar promo.");
        return;
      }

      const data = Array.isArray(json?.data) ? (json.data as PromoListItem[]) : [];
      setPromoList(data);
    } catch {
      setPromoList([]);
      toast.error("Gagal memuat daftar promo.");
    } finally {
      setListLoading(false);
    }
  };

  const applyPromo = async () => {
    if (!canApply || loading) return;

    setLoading(true);
    try {
      const res = await fetch("/api/promo-codes/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: code.trim(),
          game_slug: gameSlug,
          product_id: productId,
          payment_method_id: paymentMethodId,
          whatsapp: whatsapp || null,
          quantity: Math.max(1, Math.floor(Number(quantity) || 1)),
        }),
      });

      const json = await res.json().catch(() => ({} as any));

      if (!res.ok || !json?.success) {
        toast.error(json?.message || "Kode promo tidak valid.");
        return;
      }

      const pricing = json?.data?.pricing ?? {};
      const promo = json?.data?.promo ?? {};

      const discount = money(pricing?.discount ?? 0);
      const finalPrice = money(pricing?.final_price ?? 0);
      const applied = String(promo?.code ?? code).trim().toUpperCase();

      if (!applied) {
        toast.error("Kode promo tidak valid.");
        return;
      }

      onApplied({ code: applied, discount, finalPrice });
      toast.success("Kode promo berhasil digunakan.");
    } catch {
      toast.error("Gagal menerapkan kode promo.");
    } finally {
      setLoading(false);
    }
  };

  const clearPromo = async () => {
    if (loading) return;
    setLoading(true);
    try {
      setCode("");
      onCleared();
      toast.success("Kode promo dibatalkan.");
    } finally {
      setLoading(false);
    }
  };

  const openPromoList = async () => {
    setOpenList(true);
    await fetchList();
  };

  const pickPromo = (c: string) => {
    const next = String(c || "").trim().toUpperCase();
    if (!next) return;
    setCode(next);
    setOpenList(false);
  };

  return (
    <section
      id={resolvedSectionId}
      className="relative scroll-mt-20 rounded-xl bg-background shadow-sm ring-1 ring-border md:scroll-mt-[7.5rem]"
    >
      <div className="flex items-center rounded-t-xl bg-muted px-4 py-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-my-color font-semibold text-white">
          {step}
        </div>
        <h2 className="ml-3 text-sm font-semibold text-card-foreground">Gunakan Kode Promo (Jika Ada)</h2>
      </div>

      <div className="p-4 space-y-4">
        <div className="flex w-full flex-col gap-2 sm:flex-row">
          <input
            type="text"
            placeholder="Masukkan kode promo"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            className="w-full rounded-lg border border-border bg-muted px-4 py-3 text-xs text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-my-color"
          />

          {appliedCode ? (
            <button
              type="button"
              onClick={clearPromo}
              disabled={loading}
              className="rounded-lg bg-red-500 px-4 py-3 text-xs font-semibold text-white disabled:opacity-60"
            >
              Batalkan
            </button>
          ) : (
            <button
              type="button"
              onClick={applyPromo}
              disabled={!canApply || loading}
              className="rounded-lg bg-my-color px-4 py-3 text-xs font-semibold text-white disabled:opacity-60"
            >
              {loading ? "Memproses..." : "Gunakan"}
            </button>
          )}
        </div>

        <div className="flex justify-end">
          <button
            type="button"
            onClick={openPromoList}
            disabled={!canFetchList}
            className="text-xs font-semibold text-my-color hover:underline disabled:opacity-50"
          >
            Lihat kode promo
          </button>
        </div>

        {appliedCode && (
          <div className="rounded-lg border border-border bg-muted/40 px-4 py-3 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-medium text-foreground">Promo Aktif</span>
              <span className="font-semibold text-primary">{appliedCode}</span>
            </div>
            <div className="mt-1 flex items-center justify-between">
              <span className="text-muted-foreground">Diskon (per item)</span>
              <span className="font-semibold text-foreground">Rp {money(appliedDiscount).toLocaleString("id-ID")}</span>
            </div>
          </div>
        )}
      </div>

      <Dialog open={openList} onOpenChange={setOpenList}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Daftar Kode Promo</DialogTitle>
            <DialogDescription>Pilih promo yang tersedia untuk checkout ini.</DialogDescription>
          </DialogHeader>

          <div className="space-y-3 max-h-[60vh] overflow-y-auto">
            {listLoading ? (
              <div className="text-sm text-muted-foreground">Memuat promo...</div>
            ) : promoList.length === 0 ? (
              <div className="text-sm text-muted-foreground">Belum ada promo yang tersedia.</div>
            ) : (
              promoList.map((p) => {
                const disabled = !p.is_eligible || String(p.status).toUpperCase() !== "ACTIVE";

                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => pickPromo(p.code)}
                    disabled={disabled}
                    className="w-full text-left rounded-xl border border-border bg-muted/40 px-4 py-3 text-sm disabled:opacity-50"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="font-semibold text-foreground">{p.code}</div>
                      <div className="text-xs font-semibold text-muted-foreground">{p.name}</div>
                    </div>
                    <div className="mt-1 text-xs text-muted-foreground">
                      {disabled ? "Tidak memenuhi syarat" : "Bisa digunakan"}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}