"use client";

import { useEffect, useMemo, useState } from "react";
import { FaWhatsapp } from "react-icons/fa";

import { useSettings } from "@/context/settings-context";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const CLOSED_KEY = "ultratopup:wa_bubble_closed_v2";

const toString = (v: unknown) => (typeof v === "string" ? v : v == null ? "" : String(v));
const toBool = (v: unknown) => v === true || v === "true" || v === 1 || v === "1";

const sanitizePhone = (raw: string) => raw.replace(/\D/g, "");

const buildWaUrl = (phone: string, text: string) => {
  const p = sanitizePhone(phone);
  const t = encodeURIComponent(text || "");
  return `https://api.whatsapp.com/send?phone=${p}${t ? `&text=${t}` : ""}`;
};

export function WhatsAppBubble() {
  const settings = useSettings();
  const data = settings?.data ?? {};

  const enabled = toBool(data["whatsapp.bubble.enabled"] ?? true);
  const phone = toString(data["whatsapp.bubble.phone"] || data["sosmed.wa"]);
  const brand = toString(data["whatsapp.bubble.brand"] || data["general.title"] || "WhatsApp");
  const status = toString(data["whatsapp.bubble.status"] || "Online");
  const message = toString(data["whatsapp.bubble.message"] || "Halo, ada yang bisa kami bantu?");
  const buttonText = toString(data["whatsapp.bubble.button_text"] || "Mulai Obrolan");
  const prefill = toString(data["whatsapp.bubble.prefill"] || "Halo admin, saya mau tanya.");

  const usable = enabled && sanitizePhone(phone).length >= 8;

  const [dismissed, setDismissed] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    try {
      const v = localStorage.getItem(CLOSED_KEY);
      if (v === "1") setDismissed(true);
    } catch {
      setDismissed(false);
    }
  }, []);

  const waUrl = useMemo(() => buildWaUrl(phone, prefill), [phone, prefill]);

  const dismissForever = () => {
    setOpen(false);
    setDismissed(true);
    try {
      localStorage.setItem(CLOSED_KEY, "1");
    } catch {
      void 0;
    }
  };

  if (!usable || dismissed) return null;

  return (
    <div className="fixed right-4 bottom-20 md:bottom-6 z-50">
      {open ? (
        <div className="w-[320px]">
          <Card className="overflow-hidden shadow-xl border-border/60">
            <CardHeader className="p-4 pb-3 bg-muted/30">
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-sm">
                  <FaWhatsapp className="h-5 w-5" />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="font-semibold leading-tight truncate">{brand}</div>
                      <div className="mt-1">
                        <Badge className="text-[11px] font-semibold bg-emerald-600/10 text-emerald-700 border border-emerald-600/20 dark:text-emerald-400">
                          {status}
                        </Badge>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={dismissForever}
                      className={cn(
                        "h-8 w-8 rounded-full flex items-center justify-center",
                        "text-muted-foreground hover:text-foreground hover:bg-accent transition"
                      )}
                      aria-label="Tutup"
                      title="Tutup"
                    >
                      <span className="text-xl leading-none select-none">×</span>
                    </button>
                  </div>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-4 pt-3">
              <p className="text-sm text-muted-foreground leading-relaxed">{message}</p>
            </CardContent>

            <CardFooter className="p-4 pt-0">
              <Button
                type="button"
                onClick={() => window.open(waUrl, "_blank", "noopener,noreferrer")}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
              >
                <FaWhatsapp className="mr-2 h-4 w-4" />
                {buttonText}
              </Button>
            </CardFooter>
          </Card>

          <div className="mt-2 flex justify-end">
            <Button type="button" variant="ghost" size="sm" onClick={() => setOpen(false)} className="h-8 px-3">
              Minimalkan
            </Button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Chat WhatsApp"
          className={cn(
            "h-14 w-14 rounded-full shadow-xl",
            "bg-emerald-600 hover:bg-emerald-700 text-white",
            "flex items-center justify-center transition"
          )}
        >
          <FaWhatsapp className="h-7 w-7" />
        </button>
      )}
    </div>
  );
}