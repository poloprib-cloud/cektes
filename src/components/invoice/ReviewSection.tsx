"use client";

import { useEffect, useMemo, useState } from "react";
import { Star } from "lucide-react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

export type InvoiceReviewPayload = {
  rating: number;
  review_text: string;
  reviewer_type: string;
  reviewer_display: string;
  created_at?: string | null;
  updated_at?: string | null;
};

type Props = {
  orderId: string;
  canReview: boolean;
  identifier?: string | null;
  initialReview?: InvoiceReviewPayload | null;
  onSaved?: (next: InvoiceReviewPayload) => void;
};

export function ReviewSection({ orderId, canReview, identifier, initialReview, onSaved }: Props) {
  const [rating, setRating] = useState<number>(0);
  const [text, setText] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);

  const mode = useMemo(() => (initialReview ? "update" : "create"), [initialReview]);

  useEffect(() => {
    if (!initialReview) {
      setRating(0);
      setText("");
      return;
    }

    setRating(Number(initialReview.rating ?? 0));
    setText(String(initialReview.review_text ?? ""));
  }, [initialReview]);

  const canSubmit = canReview && rating >= 1 && rating <= 5 && text.trim().length >= 3 && !submitting;

  const submit = async () => {
    if (!canSubmit) return;

    setSubmitting(true);

    try {
      const res = await fetch(`/api/order/${orderId}/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rating,
          review_text: text,
          identifier: identifier ?? undefined,
        }),
      });

      const json = await res.json().catch(() => ({}));

      if (!res.ok || !json?.success) {
        toast.error(json?.message ?? "Gagal mengirim ulasan.");
        return;
      }

      const review: InvoiceReviewPayload | null = json?.review ?? null;
      if (review) {
        toast.success(mode === "update" ? "Ulasan berhasil diperbarui." : "Ulasan berhasil dikirim.");
        onSaved?.(review);
      } else {
        toast.success("Ulasan berhasil disimpan.");
      }
    } catch (e: any) {
      toast.error("Terjadi kesalahan saat mengirim ulasan.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card className="mt-8">
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold">Ulasan Produk</h2>
            <p className="text-sm text-muted-foreground">
              Beri rating dan ulasan agar calon pembeli lain lebih yakin.
            </p>
          </div>
          {initialReview?.created_at && (
            <div className="text-right text-xs text-muted-foreground">
              {new Date(initialReview.created_at).toLocaleString()}
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {initialReview && (
          <div className="rounded-lg border bg-muted/30 p-3 text-sm">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, idx) => {
                  const v = idx + 1;
                  return (
                    <Star
                      key={v}
                      className={cn("h-4 w-4", v <= initialReview.rating ? "fill-current text-primary" : "text-muted-foreground")}
                    />
                  );
                })}
              </div>
              <div className="text-xs text-muted-foreground">{initialReview.reviewer_display}</div>
            </div>
            <div className="mt-2 whitespace-pre-wrap">{initialReview.review_text}</div>
          </div>
        )}

        <div className="space-y-2">
          <div className="text-sm font-medium">Rating</div>
          <div className="flex items-center gap-1">
            {Array.from({ length: 5 }).map((_, idx) => {
              const v = idx + 1;
              const active = v <= rating;
              return (
                <button
                  key={v}
                  type="button"
                  onClick={() => setRating(v)}
                  className={cn(
                    "rounded-md p-1 transition",
                    canReview ? "hover:bg-muted" : "cursor-not-allowed opacity-50"
                  )}
                  disabled={!canReview}
                  aria-label={`Rating ${v}`}
                >
                  <Star className={cn("h-6 w-6", active ? "fill-current text-primary" : "text-muted-foreground")} />
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-2">
          <div className="text-sm font-medium">Ulasan</div>
          <Textarea
            placeholder="Tulis pengalaman kamu..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            disabled={!canReview}
            className="min-h-[120px]"
          />
          <div className="text-xs text-muted-foreground">Minimal 3 karakter.</div>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
          <Button onClick={submit} disabled={!canSubmit} className="shadow-none">
            {mode === "update" ? "Update Ulasan" : "Kirim Ulasan"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
