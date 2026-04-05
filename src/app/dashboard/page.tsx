"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSession, signIn } from "next-auth/react";
import { ExternalLink } from "lucide-react";

import { ContentLayout } from "@/components/panel/content-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

type PageMeta = {
  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
};

type ApiPaged<T> = {
  success?: boolean;
  data?: T[];
  meta?: PageMeta;
  message?: string;
};

type TxRow = {
  id?: number;
  order_id: string;
  amount?: number;
  total_price?: number;
  status?: string;
  payment_status?: string;
  buy_status?: string;
  created_at?: string;
};

type Summary = {
  total?: number;
  paid?: number;
  unpaid?: number;
  failed?: number;
  expired?: number;
  failed_expired?: number;
};

function fmtRupiah(n: number) {
  return `Rp ${Math.max(0, Math.floor(n || 0)).toLocaleString("id-ID")}`;
}

function pickStatus(row: TxRow) {
  return row.buy_status || row.payment_status || row.status || "-";
}

function normStatus(s: string) {
  const v = (s || "").toLowerCase();
  if (v.includes("sukses") || v.includes("paid") || v.includes("success")) return "paid";
  if (v.includes("pending") || v.includes("unpaid") || v.includes("menunggu")) return "unpaid";
  if (v.includes("batal") || v.includes("expired") || v.includes("kedaluwarsa")) return "failed";
  if (v.includes("gagal") || v.includes("failed") || v.includes("error")) return "failed";
  return "unpaid";
}

function StatusBadge({ label }: { label: string }) {
  const k = normStatus(label);

  if (k === "paid") {
    return <Badge className="bg-green-600 text-white hover:bg-green-600/90">{label}</Badge>;
  }

  if (k === "failed") {
    return <Badge className="bg-red-600 text-white hover:bg-red-600/90">{label}</Badge>;
  }

  return <Badge className="bg-muted text-foreground hover:bg-muted/90">{label}</Badge>;
}

export default function DashboardPage() {
  const { data: session, status } = useSession();

  const [q, setQ] = useState("");
  const [loadingTx, setLoadingTx] = useState(false);
  const [loadingSummary, setLoadingSummary] = useState(false);

  const [tx, setTx] = useState<TxRow[]>([]);
  const [meta, setMeta] = useState<PageMeta | null>(null);
  const [summary, setSummary] = useState<Summary | null>(null);

  const [errorTx, setErrorTx] = useState<string | null>(null);
  const [errorSummary, setErrorSummary] = useState<string | null>(null);

  const token =
    (session as any)?.accessToken ||
    (session as any)?.user?.token ||
    (session as any)?.user?.accessToken;

  const isAuthed = status === "authenticated" && Boolean(token);

  const fetchSummary = async () => {
    setLoadingSummary(true);
    setErrorSummary(null);

    try {
      const res = await fetch("/api/transactions/transaction-summary", { cache: "no-store" });

      if (res.status === 401) {
        setErrorSummary("Sesi kamu sudah habis. Silakan login ulang.");
        return;
      }

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        setErrorSummary(data?.error ?? data?.message ?? `Gagal memuat ringkasan. Status: ${res.status}`);
        return;
      }

      setSummary(data?.data ?? data ?? null);
    } catch (e: any) {
      setErrorSummary(e?.message ?? "Gagal memuat ringkasan transaksi.");
    } finally {
      setLoadingSummary(false);
    }
  };

  const fetchTx = async () => {
    setLoadingTx(true);
    setErrorTx(null);

    try {
      const url = new URL("/api/transactions", window.location.origin);
      if (q.trim()) url.searchParams.set("q", q.trim());

      const res = await fetch(url.toString(), { cache: "no-store" });

      if (res.status === 401) {
        setErrorTx("Sesi kamu sudah habis. Silakan login ulang.");
        return;
      }

      const data: ApiPaged<TxRow> = await res.json().catch(() => ({} as any));

      if (!res.ok) {
        setErrorTx(data?.message ?? `Gagal memuat transaksi. Status: ${res.status}`);
        return;
      }

      setTx(Array.isArray(data?.data) ? data.data : []);
      setMeta(data?.meta ?? null);
    } catch (e: any) {
      setErrorTx(e?.message ?? "Gagal memuat transaksi.");
    } finally {
      setLoadingTx(false);
    }
  };

  useEffect(() => {
    if (!isAuthed) return;
    fetchSummary();
    fetchTx();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthed]);

  const filtered = useMemo(() => {
    if (!q.trim()) return tx;
    const s = q.trim().toLowerCase();
    return tx.filter((r) => (r.order_id || "").toLowerCase().includes(s));
  }, [q, tx]);

  const failedExpiredCount = summary?.failed_expired ?? ((summary?.failed ?? 0) + (summary?.expired ?? 0));

  if (status === "loading") {
    return (
      <ContentLayout title="Dashboard">
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-24 rounded-2xl" />
            ))}
          </div>
          <Skeleton className="h-10 rounded-2xl" />
          <Skeleton className="h-64 rounded-2xl" />
        </div>
      </ContentLayout>
    );
  }

  if (!isAuthed) {
    return (
      <ContentLayout title="Dashboard">
        <div className="rounded-2xl border border-border bg-muted/30 p-6">
          <div className="text-sm font-semibold">Kamu belum login</div>
          <div className="mt-1 text-xs text-muted-foreground">
            Silakan login untuk melihat riwayat transaksi dan ringkasan akun.
          </div>
          <div className="mt-4 flex gap-2">
            <Button type="button" onClick={() => signIn()}>
              Login
            </Button>
            <Button type="button" variant="outline" asChild>
              <Link href="/">Kembali ke Home</Link>
            </Button>
          </div>
        </div>
      </ContentLayout>
    );
  }

  return (
    <ContentLayout title="Dashboard">
      <div className="space-y-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Card className="rounded-2xl">
            <CardHeader className="pb-2">
              <div className="text-xs text-muted-foreground">Total</div>
              <CardTitle className="text-2xl">{summary?.total ?? 0}</CardTitle>
            </CardHeader>
            <CardContent className="pt-0 text-xs text-muted-foreground">Semua transaksi</CardContent>
          </Card>

          <Card className="rounded-2xl">
            <CardHeader className="pb-2">
              <div className="text-xs text-muted-foreground">Paid</div>
              <CardTitle className="text-2xl">{summary?.paid ?? 0}</CardTitle>
            </CardHeader>
            <CardContent className="pt-0 text-xs text-muted-foreground">Berhasil dibayar</CardContent>
          </Card>

          <Card className="rounded-2xl">
            <CardHeader className="pb-2">
              <div className="text-xs text-muted-foreground">Unpaid</div>
              <CardTitle className="text-2xl">{summary?.unpaid ?? 0}</CardTitle>
            </CardHeader>
            <CardContent className="pt-0 text-xs text-muted-foreground">Menunggu pembayaran</CardContent>
          </Card>

          <Card className="rounded-2xl">
            <CardHeader className="pb-2">
              <div className="text-xs text-muted-foreground">Failed/Expired</div>
              <CardTitle className="text-2xl">{failedExpiredCount}</CardTitle>
            </CardHeader>
            <CardContent className="pt-0 text-xs text-muted-foreground">Gagal / Kadaluarsa</CardContent>
          </Card>
        </div>

        {loadingSummary ? (
          <Skeleton className="h-12 rounded-2xl" />
        ) : errorSummary ? (
          <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-4 text-sm">{errorSummary}</div>
        ) : null}

        <div className="flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-between">
          <div className="text-sm font-semibold">Riwayat Transaksi</div>
          <div className="flex gap-2">
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cari INV..." className="sm:w-64" />
            <Button type="button" variant="outline" onClick={() => fetchTx()} disabled={loadingTx}>
              Refresh
            </Button>
          </div>
        </div>

        {errorTx ? (
          <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-4 text-sm">{errorTx}</div>
        ) : null}

        <div className="rounded-2xl border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loadingTx ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell colSpan={4}>
                      <Skeleton className="h-6 w-full" />
                    </TableCell>
                  </TableRow>
                ))
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-sm text-muted-foreground py-8">
                    Belum ada transaksi.
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((row) => (
                  <TableRow key={row.order_id}>
                    <TableCell className="font-medium">{row.order_id}</TableCell>
                    <TableCell>
                      <StatusBadge label={pickStatus(row)} />
                    </TableCell>
                    <TableCell className="text-right">{fmtRupiah((row.total_price ?? row.amount ?? 0) as any)}</TableCell>
                    <TableCell className="text-right">
                      <Button asChild size="sm" variant="outline" className="h-8">
                        <Link href={`/invoices/${row.order_id}`} className="inline-flex items-center gap-1">
                          Detail <ExternalLink className="h-4 w-4" />
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {meta ? (
          <div className="text-xs text-muted-foreground">
            Menampilkan {filtered.length} dari {meta.total} transaksi
          </div>
        ) : null}
      </div>
    </ContentLayout>
  );
}
