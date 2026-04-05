"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Percent } from "lucide-react";

import { ContentLayout } from "@/components/panel/content-layout";
import { useSettings } from "@/context/settings-context";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));

const calculateWR = (totalMatch: number, currentWR: number, targetWR: number) => {
  if (targetWR >= 100 || targetWR <= currentWR) return 0;

  const totalWin = (currentWR / 100) * totalMatch;
  const result = (targetWR * totalMatch - 100 * totalWin) / (100 - targetWR);

  if (!Number.isFinite(result)) return 0;

  return Math.max(0, Math.ceil(result));
};

export default function WinrateCalculatorPage() {
  const settings = useSettings() as any;
  const enabled = Boolean(settings?.data?.["enable_kalkulator_winrate"]);

  const [totalMatch, setTotalMatch] = useState<string>("");
  const [currentWR, setCurrentWR] = useState<string>("");
  const [targetWR, setTargetWR] = useState<string>("60");

  const parsed = useMemo(() => {
    const tm = Number(totalMatch);
    const cwr = Number(currentWR);
    const twr = Number(targetWR);

    return {
      totalMatch: Number.isFinite(tm) ? Math.floor(tm) : NaN,
      currentWR: Number.isFinite(cwr) ? cwr : NaN,
      targetWR: Number.isFinite(twr) ? twr : NaN,
    };
  }, [totalMatch, currentWR, targetWR]);

  const validation = useMemo(() => {
    if (!Number.isFinite(parsed.totalMatch) || parsed.totalMatch <= 0) return "Total match harus lebih dari 0.";
    if (!Number.isFinite(parsed.currentWR)) return "Winrate saat ini harus angka.";
    if (parsed.currentWR < 0 || parsed.currentWR > 100) return "Winrate saat ini harus 0 - 100.";
    if (!Number.isFinite(parsed.targetWR)) return "Target winrate harus angka.";
    if (parsed.targetWR <= 0) return "Target winrate harus lebih dari 0.";
    if (parsed.targetWR > 100) return "Target winrate tidak boleh lebih dari 100.";
    return "";
  }, [parsed]);

  const computed = useMemo(() => {
    if (validation) return null;

    const totalMatchNum = parsed.totalMatch;
    const currentWRNum = clamp(parsed.currentWR, 0, 100);
    const targetWRNum = clamp(parsed.targetWR, 0, 100);

    const needed = calculateWR(totalMatchNum, currentWRNum, targetWRNum);

    let note = "";
    if (targetWRNum >= 100) {
      note = "Target 100% tidak bisa dihitung dengan rumus ini.";
    } else if (targetWRNum <= currentWRNum) {
      note = "Target sudah tercapai. Minimal win beruntun: 0.";
    }

    const totalWin = (currentWRNum / 100) * totalMatchNum;
    const afterWr = ((totalWin + needed) / (totalMatchNum + needed)) * 100;

    return {
      totalMatch: totalMatchNum,
      currentWR: currentWRNum,
      targetWR: targetWRNum,
      needed,
      afterWr: Number.isFinite(afterWr) ? afterWr : currentWRNum,
      note,
    };
  }, [parsed, validation]);

  return (
    <ContentLayout title="Kalkulator Winrate">
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="mx-auto max-w-2xl text-center">
          <Badge variant="secondary" className="mb-3">
            Kalkulator
          </Badge>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Cek Winrate</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Hitung minimal kemenangan beruntun untuk mencapai target winrate.
          </p>
        </div>

        {!enabled ? (
          <Card className="mx-auto max-w-2xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Percent className="h-5 w-5" />
                Kalkulator Winrate
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
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Percent className="h-5 w-5" />
                Kalkulator Winrate
              </CardTitle>
              <CardDescription>Masukkan total match, winrate saat ini, dan target winrate.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="totalMatch">Total Match</Label>
                  <Input
                    id="totalMatch"
                    inputMode="numeric"
                    value={totalMatch}
                    onChange={(e) => setTotalMatch(e.target.value)}
                    placeholder="Contoh: 120"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currentWR">Winrate Saat Ini (%)</Label>
                  <Input
                    id="currentWR"
                    inputMode="decimal"
                    value={currentWR}
                    onChange={(e) => setCurrentWR(e.target.value)}
                    placeholder="Contoh: 58.5"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="targetWR">Target Winrate (%)</Label>
                  <Input
                    id="targetWR"
                    inputMode="decimal"
                    value={targetWR}
                    onChange={(e) => setTargetWR(e.target.value)}
                    placeholder="Contoh: 60"
                  />
                </div>
              </div>

              {validation ? <div className="text-sm text-destructive">{validation}</div> : null}

              <Separator />

              <div className="rounded-lg border p-4 space-y-3">
                <div className="text-sm font-medium">Hasil</div>

                {!computed ? (
                  <div className="text-sm text-muted-foreground">Isi data di atas untuk melihat hasil.</div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div className="rounded-md bg-secondary p-3">
                        <div className="text-xs opacity-70">WR Saat Ini</div>
                        <div className="text-2xl font-semibold">{computed.currentWR.toFixed(2)}%</div>
                      </div>
                      <div className="rounded-md bg-secondary p-3">
                        <div className="text-xs opacity-70">Target WR</div>
                        <div className="text-2xl font-semibold">{computed.targetWR.toFixed(2)}%</div>
                      </div>
                      <div className="rounded-md bg-secondary p-3">
                        <div className="text-xs opacity-70">Minimal Win Beruntun</div>
                        <div className="text-2xl font-semibold">{computed.needed}</div>
                      </div>
                    </div>

                    <div className="text-sm text-muted-foreground">
                      Estimasi WR setelah {computed.needed} win beruntun:{" "}
                      <span className="font-medium">{computed.afterWr.toFixed(2)}%</span>
                    </div>

                    {computed.note ? <div className="text-sm text-muted-foreground">{computed.note}</div> : null}
                  </>
                )}
              </div>

              <div className="flex flex-col sm:flex-row gap-2">
                <Button
                  variant="secondary"
                  onClick={() => {
                    setTotalMatch("");
                    setCurrentWR("");
                    setTargetWR("60");
                  }}
                >
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