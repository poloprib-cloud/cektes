"use client";

import Link from "next/link";
import useSWR from "swr";
import { signIn, useSession } from "next-auth/react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  ArrowRight,
  Copy,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  LockKeyhole,
  RefreshCw,
  ShieldCheck,
  User2,
} from "lucide-react";
import { ContentLayout } from "@/components/panel/content-layout";
import { ApiCodeBlock } from "@/components/api-docs/api-code-block";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";

const fetcher = async (url: string) => {
  const res = await fetch(url, { cache: "no-store" });
  const json = await res.json().catch(() => ({}));

  if (!res.ok) {
    const error: any = new Error(json?.message || "Request gagal");
    error.status = res.status;
    error.payload = json;
    throw error;
  }

  return json;
};

type AccountMe = {
  success?: boolean;
  data?: {
    id: number;
    name: string | null;
    email: string | null;
    whatsapp: string | null;
    role: string | null;
    login_method?: "email" | "whatsapp";
    login_provider?: string | null;
  };
};

type ApiCredential = {
  id: number;
  api_key: string;
  api_key_masked: string;
  secret_key_masked: string;
  is_active: boolean;
  last_used_at: string | null;
  last_used_ip: string | null;
  rotated_at: string | null;
  revoked_at: string | null;
  plain_secret_key?: string | null;
};

type ApiCredentialResponse = {
  success?: boolean;
  message?: string;
  data?: ApiCredential | null;
};

function formatDate(value?: string | null) {
  if (!value) {
    return "Belum ada";
  }

  try {
    return new Intl.DateTimeFormat("id-ID", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(value));
  } catch {
    return value;
  }
}

function CredentialValue({
  label,
  value,
  visible,
  onToggle,
  onCopy,
}: {
  label: string;
  value: string;
  visible: boolean;
  onToggle: () => void;
  onCopy: () => void;
}) {
  return (
    <div className="space-y-2 rounded-2xl border border-primary/10 bg-muted/20 p-4">
      <div className="flex items-center justify-between gap-3">
        <Label>{label}</Label>
        <div className="flex items-center gap-2">
          <Button type="button" variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={onToggle}>
            {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </Button>
          <Button type="button" variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={onCopy}>
            <Copy className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <Input readOnly value={visible ? value : "••••••••••••••••••••••••••••••••"} className="rounded-xl font-mono text-xs" />
    </div>
  );
}

export default function AccountSettingsApiPage() {
  const { data: session, status } = useSession();
  const token =
    (session as any)?.accessToken ||
    (session as any)?.user?.token ||
    (session as any)?.user?.accessToken;
  const isAuthed = status === "authenticated" && Boolean(token);

  const {
    data: me,
    isLoading: meLoading,
    error: meError,
  } = useSWR<AccountMe>(isAuthed ? "/api/account/me" : null, fetcher);

  const {
    data: credentialResponse,
    isLoading: credentialLoading,
    error: credentialError,
    mutate: mutateCredential,
  } = useSWR<ApiCredentialResponse>(isAuthed ? "/api/account/api-credential" : null, fetcher);

  const credential = credentialResponse?.data ?? null;
  const [showApiKey, setShowApiKey] = useState(false);
  const [showPlainSecret, setShowPlainSecret] = useState(false);
  const [plainSecret, setPlainSecret] = useState("");
  const [secretInput, setSecretInput] = useState("");
  const [generating, setGenerating] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [savingSecret, setSavingSecret] = useState(false);
  const [togglingStatus, setTogglingStatus] = useState(false);

  const displayRole = me?.data?.role ?? "basic";
  const loginMethod = me?.data?.login_method ?? "email";
  const displayIdentity = me?.data?.whatsapp || me?.data?.email || "Akun terautentikasi";

  useEffect(() => {
    if ((meError as any)?.status === 401 || (credentialError as any)?.status === 401) {
      toast.error("Sesi kamu sudah habis. Silakan login ulang.");
    }
  }, [credentialError, meError]);

  const credentialStatusText = useMemo(() => {
    if (!credential) {
      return "Belum dibuat";
    }

    return credential.is_active ? "Aktif" : "Nonaktif";
  }, [credential]);

  const copyText = async (value: string, message: string) => {
    try {
      await navigator.clipboard.writeText(value);
      toast.success(message);
    } catch {
      toast.error("Gagal menyalin ke clipboard.");
    }
  };

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const res = await fetch("/api/account/api-credential", {
        method: "POST",
      });
      const json = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(json?.message || "Gagal membuat credential API.");
      }

      const nextSecret = typeof json?.data?.plain_secret_key === "string" ? json.data.plain_secret_key : "";
      setPlainSecret(nextSecret);
      setShowPlainSecret(Boolean(nextSecret));
      setShowApiKey(true);
      toast.success(json?.message || "Credential API berhasil dibuat.");
      await mutateCredential();
    } catch (error: any) {
      toast.error(error.message || "Gagal membuat credential API.");
    } finally {
      setGenerating(false);
    }
  };

  const handleRegenerateKey = async () => {
    setRegenerating(true);
    try {
      const res = await fetch("/api/account/api-credential/regenerate-key", {
        method: "POST",
      });
      const json = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(json?.message || "Gagal regenerate API key.");
      }

      setShowApiKey(true);
      toast.success(json?.message || "API key berhasil diregenerate.");
      await mutateCredential();
    } catch (error: any) {
      toast.error(error.message || "Gagal regenerate API key.");
    } finally {
      setRegenerating(false);
    }
  };

  const handleSaveSecret = async () => {
    const nextSecret = secretInput.trim();
    if (nextSecret.length < 24) {
      toast.error("Secret key minimal 24 karakter.");
      return;
    }

    setSavingSecret(true);

    try {
      const res = await fetch("/api/account/api-credential/secret", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ secret_key: nextSecret }),
      });
      const json = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(json?.message || "Gagal memperbarui secret key.");
      }

      setPlainSecret(nextSecret);
      setShowPlainSecret(true);
      setSecretInput("");
      toast.success(json?.message || "Secret key berhasil diperbarui.");
      await mutateCredential();
    } catch (error: any) {
      toast.error(error.message || "Gagal memperbarui secret key.");
    } finally {
      setSavingSecret(false);
    }
  };

  const handleToggleStatus = async (checked: boolean) => {
    if (!credential) {
      return;
    }

    setTogglingStatus(true);

    try {
      const res = await fetch("/api/account/api-credential/status", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ is_active: checked }),
      });
      const json = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(json?.message || "Gagal mengubah status credential.");
      }

      toast.success(json?.message || "Status credential berhasil diperbarui.");
      await mutateCredential();
    } catch (error: any) {
      toast.error(error.message || "Gagal mengubah status credential.");
    } finally {
      setTogglingStatus(false);
    }
  };

  if (status === "loading") {
    return (
      <ContentLayout title="Pengaturan API">
        <div className="space-y-6">
          <Skeleton className="h-44 rounded-3xl" />
          <Skeleton className="h-80 rounded-3xl" />
        </div>
      </ContentLayout>
    );
  }

  if (!isAuthed) {
    return (
      <ContentLayout title="Pengaturan API">
        <div className="rounded-3xl border border-dashed border-primary/20 bg-card p-10 text-center shadow-sm">
          <Badge className="rounded-full border border-primary/15 bg-primary/10 px-3 py-1 text-primary hover:bg-primary/10">
            Pengaturan API
          </Badge>
          <h1 className="mt-5 text-2xl font-bold tracking-tight">Masuk untuk mengelola credential API partner</h1>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-muted-foreground">
            Halaman ini dipakai untuk membuat API key per user, mengatur secret key custom, dan mengaktifkan Client API v1.
          </p>
          <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
            <Button onClick={() => signIn()} className="rounded-full px-6">
              Login Sekarang
            </Button>
            <Button asChild variant="outline" className="rounded-full border-primary/10 px-6">
              <Link href="/developer/api">Buka Dokumentasi API</Link>
            </Button>
          </div>
        </div>
      </ContentLayout>
    );
  }

  return (
    <ContentLayout title="Pengaturan API">
      <div className="mx-auto w-full max-w-6xl space-y-6">
        <section className="relative overflow-hidden rounded-3xl border border-primary/10 bg-card p-6 shadow-sm sm:p-8">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,hsl(var(--primary)/0.12),transparent_35%),radial-gradient(circle_at_bottom_left,hsl(var(--primary)/0.08),transparent_30%)]" />
          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <Badge className="rounded-full border border-primary/15 bg-primary/10 px-3 py-1 text-primary hover:bg-primary/10">
                  Pengaturan API
                </Badge>
                <Badge variant="outline" className="rounded-full px-3 py-1">
                  Credential per user
                </Badge>
                <Badge variant="outline" className="rounded-full px-3 py-1">
                  Client API v1
                </Badge>
              </div>
              <div className="space-y-3">
                <h1 className="text-3xl font-bold tracking-tight">Kelola API key, secret key, dan status akses partner langsung dari akun kamu.</h1>
                <p className="max-w-2xl text-sm leading-7 text-muted-foreground">
                  Source code terbaru sudah menyediakan credential API per user. Dari sini kamu bisa generate credential, rotate key, membuat secret custom, dan mengaktifkan atau menonaktifkan akses Client API v1.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Button asChild className="rounded-full px-6">
                  <Link href="/developer/api">
                    Buka Dokumentasi API
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" className="rounded-full border-primary/10 px-6">
                  <Link href="/account-settings">Kembali ke Pengaturan Akun</Link>
                </Button>
              </div>
            </div>

            <Card className="rounded-3xl border-primary/10 bg-background/80 shadow-none lg:min-w-[320px]">
              <CardContent className="space-y-4 p-5">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <User2 className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="font-semibold">{meLoading ? "Memuat..." : me?.data?.name || "User"}</div>
                    <div className="text-xs text-muted-foreground">{displayIdentity}</div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className="rounded-full px-3 py-1 uppercase">
                    {displayRole}
                  </Badge>
                  <Badge variant="secondary" className="rounded-full px-3 py-1">
                    Login via {loginMethod}
                  </Badge>
                  <Badge variant={credential?.is_active ? "default" : "outline"} className="rounded-full px-3 py-1">
                    {credentialStatusText}
                  </Badge>
                </div>
                <div className="rounded-2xl border border-primary/10 bg-muted/30 p-4 text-sm leading-7 text-muted-foreground">
                  Gunakan credential ini hanya di backend server kamu. Jangan expose secret key atau algoritma signature ke browser publik dan mobile client.
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          <Card className="rounded-3xl border-primary/10 shadow-sm">
            <CardHeader>
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <KeyRound className="h-5 w-5" />
              </div>
              <CardTitle>Credential status</CardTitle>
              <CardDescription>Status aktif dan timestamp rotasi terakhir.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm leading-7 text-muted-foreground">
              <div className="rounded-2xl border border-primary/10 bg-muted/20 p-4">Status: <span className="font-semibold text-foreground">{credentialStatusText}</span></div>
              <div className="rounded-2xl border border-primary/10 bg-muted/20 p-4">Rotated at: <span className="font-semibold text-foreground">{formatDate(credential?.rotated_at)}</span></div>
              <div className="rounded-2xl border border-primary/10 bg-muted/20 p-4">Revoked at: <span className="font-semibold text-foreground">{formatDate(credential?.revoked_at)}</span></div>
            </CardContent>
          </Card>

          <Card className="rounded-3xl border-primary/10 shadow-sm">
            <CardHeader>
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <CardTitle>Aktivitas terakhir</CardTitle>
              <CardDescription>Metadata penggunaan credential terakhir.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm leading-7 text-muted-foreground">
              <div className="rounded-2xl border border-primary/10 bg-muted/20 p-4">Last used at: <span className="font-semibold text-foreground">{formatDate(credential?.last_used_at)}</span></div>
              <div className="rounded-2xl border border-primary/10 bg-muted/20 p-4">Last used IP: <span className="font-semibold text-foreground">{credential?.last_used_ip || "Belum ada"}</span></div>
              <div className="rounded-2xl border border-primary/10 bg-muted/20 p-4">Scope: <span className="font-semibold text-foreground">Client API v1 signed request</span></div>
            </CardContent>
          </Card>

          <Card className="rounded-3xl border-primary/10 shadow-sm">
            <CardHeader>
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <LockKeyhole className="h-5 w-5" />
              </div>
              <CardTitle>Keamanan</CardTitle>
              <CardDescription>Aturan minimum agar credential aman dipakai.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm leading-7 text-muted-foreground">
              <div className="rounded-2xl border border-primary/10 bg-muted/20 p-4">Simpan API key dan secret key hanya di environment backend atau vault.</div>
              <div className="rounded-2xl border border-primary/10 bg-muted/20 p-4">Setiap create order partner wajib memakai Idempotency-Key unik.</div>
              <div className="rounded-2xl border border-primary/10 bg-muted/20 p-4">Jika credential bocor, regenerate API key dan update secret secepat mungkin.</div>
            </CardContent>
          </Card>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <Card className="rounded-3xl border-primary/10 shadow-sm">
            <CardHeader>
              <CardTitle>Kelola credential</CardTitle>
              <CardDescription>Generate, tampilkan, copy, rotate, dan update credential sesuai implementasi backend terbaru.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              {credentialLoading ? (
                <Skeleton className="h-72 rounded-3xl" />
              ) : !credential ? (
                <div className="space-y-4 rounded-2xl border border-dashed border-primary/20 bg-muted/20 p-6">
                  <div className="text-lg font-semibold">Credential belum dibuat</div>
                  <p className="text-sm leading-7 text-muted-foreground">
                    Generate credential untuk mengaktifkan Client API v1. Secret asli hanya akan tampil sekali setelah proses generate berhasil.
                  </p>
                  <Button onClick={handleGenerate} disabled={generating} className="rounded-full px-6">
                    {generating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <KeyRound className="mr-2 h-4 w-4" />}
                    Generate Credential API
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <CredentialValue
                    label="API key"
                    value={credential.api_key}
                    visible={showApiKey}
                    onToggle={() => setShowApiKey((state) => !state)}
                    onCopy={() => copyText(credential.api_key, "API key berhasil disalin.")}
                  />

                  <div className="space-y-2 rounded-2xl border border-primary/10 bg-muted/20 p-4">
                    <Label>Secret key</Label>
                    <Input readOnly value={credential.secret_key_masked} className="rounded-xl font-mono text-xs" />
                    <p className="text-xs leading-6 text-muted-foreground">
                      Backend hanya mengembalikan versi masked setelah credential tersimpan. Simpan plain secret di tempat aman saat pertama kali generate atau saat kamu membuat secret custom baru.
                    </p>
                  </div>

                  {plainSecret ? (
                    <div className="space-y-3 rounded-2xl border border-primary/10 bg-background/70 p-4">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <div className="font-semibold">Plain secret terbaru</div>
                          <p className="text-xs leading-6 text-muted-foreground">Tampilkan hanya di lingkungan aman. Setelah halaman ditutup, nilai ini tidak akan muncul lagi dari backend.</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button type="button" variant="outline" size="sm" className="rounded-full" onClick={() => setShowPlainSecret((state) => !state)}>
                            {showPlainSecret ? <EyeOff className="mr-2 h-4 w-4" /> : <Eye className="mr-2 h-4 w-4" />}
                            {showPlainSecret ? "Sembunyikan" : "Tampilkan"}
                          </Button>
                          <Button type="button" variant="outline" size="sm" className="rounded-full" onClick={() => copyText(plainSecret, "Secret key berhasil disalin.")}>Salin</Button>
                        </div>
                      </div>
                      {showPlainSecret ? <ApiCodeBlock code={plainSecret} /> : null}
                    </div>
                  ) : null}

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="rounded-2xl border border-primary/10 bg-background/70 p-4">
                      <div className="font-semibold">Rotate API key</div>
                      <p className="mt-2 text-sm leading-7 text-muted-foreground">Mengganti api_key tanpa mengubah secret key saat ini.</p>
                      <Button onClick={handleRegenerateKey} disabled={regenerating} variant="outline" className="mt-4 rounded-full px-6">
                        {regenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
                        Regenerate API Key
                      </Button>
                    </div>
                    <div className="rounded-2xl border border-primary/10 bg-background/70 p-4">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <div className="font-semibold">Status akses</div>
                          <p className="mt-2 text-sm leading-7 text-muted-foreground">Nonaktifkan credential saat tidak dipakai atau saat ada indikasi kebocoran.</p>
                        </div>
                        <Switch checked={credential.is_active} disabled={togglingStatus} onCheckedChange={handleToggleStatus} />
                      </div>
                      <div className="mt-4 text-xs text-muted-foreground">
                        {togglingStatus ? "Memperbarui status..." : credential.is_active ? "Credential aktif dan bisa dipakai signed request." : "Credential nonaktif dan akan ditolak middleware."}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="rounded-3xl border-primary/10 shadow-sm">
            <CardHeader>
              <CardTitle>Custom secret key</CardTitle>
              <CardDescription>Buat secret baru agar pola penamaan mengikuti standar tim kamu.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="secret_key">Secret key baru</Label>
                <Input
                  id="secret_key"
                  value={secretInput}
                  onChange={(event) => setSecretInput(event.target.value)}
                  placeholder="ferdi.secret.2026-abc1234567890"
                  className="rounded-xl"
                />
                <p className="text-xs leading-6 text-muted-foreground">
                  Minimal 24 karakter, maksimal 120 karakter, hanya huruf, angka, titik, garis bawah, dan strip, serta wajib mengandung huruf dan angka.
                </p>
              </div>
              <Button onClick={handleSaveSecret} disabled={savingSecret || !credential} className="rounded-full px-6">
                {savingSecret ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <LockKeyhole className="mr-2 h-4 w-4" />}
                Simpan Secret Key
              </Button>

              <Separator />

              <div className="space-y-3 text-sm leading-7 text-muted-foreground">
                <div className="rounded-2xl border border-primary/10 bg-muted/20 p-4">Gunakan secret yang berbeda antara production dan sandbox.</div>
                <div className="rounded-2xl border border-primary/10 bg-muted/20 p-4">Setelah secret diubah, semua signer di backend partner wajib ikut diperbarui sebelum request baru dikirim.</div>
                <div className="rounded-2xl border border-primary/10 bg-muted/20 p-4">Jika kamu baru generate credential dan belum pernah menyimpan secret, salin plain secret terbaru sekarang juga.</div>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </ContentLayout>
  );
}
