"use client";

import { useMemo } from "react";

interface QuantitySelectionProps {
  quantity: number;
  setQuantity: (quantity: number) => void;
  min?: number;
  max?: number;
}

export default function QuantitySelection({
  quantity,
  setQuantity,
  min = 1,
  max = 50,
}: QuantitySelectionProps) {
  const clamped = useMemo(() => {
    const n = Number.isFinite(quantity) ? Math.floor(quantity) : min;
    return Math.max(min, Math.min(max, n));
  }, [quantity, min, max]);

  const canDecrement = clamped > min;
  const canIncrement = clamped < max;

  const apply = (next: number) => {
    const n = Number.isFinite(next) ? Math.floor(next) : min;
    setQuantity(Math.max(min, Math.min(max, n)));
  };

  return (
    <section
      id="3"
      className="relative scroll-mt-20 rounded-xl bg-background shadow-sm ring-1 ring-border md:scroll-mt-[7.5rem]"
    >
      <div className="flex items-center rounded-t-xl bg-muted px-4 py-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-my-color font-semibold text-white">
          3
        </div>
        <h2 className="ml-3 text-sm font-semibold text-card-foreground">Masukkan Jumlah Pembelian</h2>
      </div>

      <div className="p-4">
        <div className="flex w-full items-center justify-between gap-3 rounded-xl border border-border bg-muted/40 p-3">
          <button
            type="button"
            onClick={() => apply(clamped - 1)}
            disabled={!canDecrement}
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-background text-sm font-semibold text-foreground transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Kurangi jumlah"
          >
            -
          </button>

          <input
            type="number"
            inputMode="numeric"
            min={min}
            max={max}
            value={clamped}
            onChange={(e) => {
              const raw = e.target.value;
              if (raw === "") {
                apply(min);
                return;
              }

              const next = parseInt(raw, 10);
              apply(Number.isFinite(next) ? next : min);
            }}
            className="h-10 w-full max-w-[140px] rounded-lg border border-border bg-background px-3 text-center text-sm font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-my-color"
          />

          <button
            type="button"
            onClick={() => apply(clamped + 1)}
            disabled={!canIncrement}
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-background text-sm font-semibold text-foreground transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Tambah jumlah"
          >
            +
          </button>
        </div>
      </div>
    </section>
  );
}
