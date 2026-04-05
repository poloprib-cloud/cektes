"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Sparkles } from "lucide-react";

import { ContentLayout } from "@/components/panel/content-layout";
import { useSettings } from "@/context/settings-context";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

const toInt = (v: any, fallback: number) => {
  const n = typeof v === "number" ? v : Number(v);
  if (!Number.isFinite(n)) return fallback;
  return Math.max(0, Math.floor(n));
};

const formatNumber = (n: number) => n.toLocaleString("id-ID");

export default function MagicWheelCalculatorPage() {
  interface Settings {
    data: Record<string, any>;
  }

  const settings = useSettings() as unknown as Settings | null;

  const enabled = Boolean(settings?.data?.["enable_kalkulator_magic_wheel"]);
  const target = Math.max(1, toInt(settings?.data?.["kalkulator.magic_wheel.max_points"], 200));

  const COST_SINGLE = 60;
  const BUNDLE_SIZE = 5;
  const COST_BUNDLE = 270;

  const [points, setPoints] = useState<string>("0");

  const currentPoint = useMemo(() => {
    const v = toInt(points, 0);
    return Math.min(v, target);
  }, [points, target]);

  const helper = useMemo(() => {
    const raw = Number(points);
    if (!Number.isFinite(raw)) return "Masukkan angka yang valid.";
    if (raw < 0) return "Point tidak boleh negatif.";
    if (raw > target) return `Point kamu tidak boleh melebihi maksimal ${target}.`;
    return "";
  }, [points, target]);

  const calc = useMemo(() => {
    const remaining = Math.max(0, target - currentPoint);
    const bundles = Math.floor(remaining / BUNDLE_SIZE);
    const singles = remaining % BUNDLE_SIZE;
    const totalDiamonds = bundles * COST_BUNDLE + singles * COST_SINGLE;

    return { remaining, bundles, singles, totalDiamonds };
  }, [currentPoint, target]);

  return (
    <ContentLayout title="Kalkulator Magic Wheel">
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="mx-auto max-w-2xl text-center">
          <Badge
            className="mb-3 border border-purple-500/30 bg-purple-500/10 text-purple-700 dark:text-purple-200"
            variant="secondary"
          >
            Magic Wheel
          </Badge>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Cek Magic Wheel</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Masukkan point kamu saat ini. Perhitungan memakai paket hemat 5x draw.
          </p>
        </div>

        {!enabled ? (
          <Card className="mx-auto max-w-2xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-purple-500" />
                Kalkulator Magic Wheel
                <Badge variant="secondary" className="ml-auto">
                  Nonaktif
                </Badge>
              </CardTitle>
              <CardDescription>Fitur ini sedang dinonaktifkan oleh admin.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="secondary">
                <Link href="/">Kembali ke Beranda</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-purple-500/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-purple-500" />
                Kalkulator Magic Wheel
                <Badge
                  className="ml-auto border border-purple-500/30 bg-purple-500/10 text-purple-700 dark:text-purple-200"
                  variant="secondary"
                >
                  Max {formatNumber(target)} Point
                </Badge>
              </CardTitle>
              <CardDescription>Input point (0 sampai {formatNumber(target)}).</CardDescription>
            </CardHeader>

            <CardContent className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="points">Point Magic Wheel Kamu</Label>
                <Input
                  id="points"
                  inputMode="numeric"
                  value={points}
                  onChange={(e) => setPoints(e.target.value)}
                  placeholder={`0 - ${target}`}
                />
                {helper && <div className="text-sm text-destructive">{helper}</div>}
              </div>

              <Separator />

              <div className="rounded-lg border border-purple-500/20 p-4 space-y-3">
                <div className="text-sm font-medium">Hasil</div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="rounded-md bg-secondary p-3">
                    <div className="text-xs opacity-70">Point Kamu</div>
                    <div className="text-2xl font-semibold">{formatNumber(currentPoint)}</div>
                  </div>
                  <div className="rounded-md bg-secondary p-3">
                    <div className="text-xs opacity-70">Sisa Point</div>
                    <div className="text-2xl font-semibold">{formatNumber(calc.remaining)}</div>
                  </div>
                  <div className="rounded-md bg-purple-500/10 p-3 border border-purple-500/20">
                    <div className="text-xs text-purple-700 dark:text-purple-200">Membutuhkan Maksimal</div>
                    <div className="text-2xl font-semibold text-purple-700 dark:text-purple-200">
                      {formatNumber(calc.totalDiamonds)} Diamonds
                    </div>
                  </div>
                </div>

                <div className="text-sm text-muted-foreground">
                  Paket hemat: {formatNumber(calc.bundles)}x bundle (5 point = 270 DM) + {formatNumber(calc.singles)}x single (1 point = 60 DM)
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-2">
                <Button variant="secondary" onClick={() => setPoints("0")}>
                  Reset
                </Button>
                <Button asChild>
                  <Link href="/price-list">Topup Sekarang</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </ContentLayout>
  );
}