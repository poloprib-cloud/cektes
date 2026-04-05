"use client";

import useSWR from "swr";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSession, signIn } from "next-auth/react";
import { toast } from "sonner";
import { Loader2, Shield, User2, Mail, Phone, KeyRound } from "lucide-react";

import { ContentLayout } from "@/components/panel/content-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

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
  message?: string;
};

const fetcher = async (url: string) => {
  const res = await fetch(url, { cache: "no-store" });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err: any = new Error(json?.message || "Request gagal");
    err.status = res.status;
    err.payload = json;
    throw err;
  }
  return json;
};

export default function AccountSettingsPage() {
  const { data: session, status } = useSession();

  const token =
    (session as any)?.accessToken ||
    (session as any)?.user?.token ||
    (session as any)?.user?.accessToken;

  const isAuthed = status === "authenticated" && Boolean(token);

  const { data: me, isLoading: meLoading, error: meError, mutate } = useSWR<AccountMe>(
    isAuthed ? "/api/account/me" : null,
    fetcher
  );

  const loginMethod = me?.data?.login_method ?? null;
  const role = me?.data?.role ?? "Member";
  const nameValue = me?.data?.name ?? "";
  const emailValue = me?.data?.email ?? "";
  const whatsappValue = me?.data?.whatsapp ?? "";

  const [name, setName] = useState("");
  const [savingName, setSavingName] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);

  const initialName = useMemo(() => (typeof nameValue === "string" ? nameValue : ""), [nameValue]);

  useEffect(() => {
    if (!name && initialName) setName(initialName);
  }, [initialName, name]);

  useEffect(() => {
    if ((meError as any)?.status === 401) {
      toast.error("Sesi kamu sudah habis. Silakan login ulang.");
    }
  }, [meError]);

  const saveProfile = async () => {
    const next = name.trim();
    if (next.length < 2) return toast.error("Nama minimal 2 karakter.");
    setSavingName(true);
    try {
      const res = await fetch("/api/account/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: next }),
      });
      if (!res.ok) throw new Error("Gagal menyimpan profil.");
      toast.success("Profil berhasil diperbarui.");
      await mutate();
    } catch (e: any) {
      toast.error(e.message);
    } finally { setSavingName(false); }
  };

  const savePassword = async () => {
    if (password !== passwordConfirmation) return toast.error("Konfirmasi password tidak sama.");
    setSavingPassword(true);
    try {
      const res = await fetch("/api/account/password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ old_password: oldPassword, password, password_confirmation: passwordConfirmation }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Gagal mengubah password.");
      toast.success("Password diperbarui.");
      setOldPassword(""); setPassword(""); setPasswordConfirmation("");
    } catch (e: any) {
      toast.error(e.message);
    } finally { setSavingPassword(false); }
  };

  if (status === "loading") return <ContentLayout title="Akun"><div className="space-y-6"><Skeleton className="h-24 rounded-2xl" /><Skeleton className="h-64 rounded-2xl" /></div></ContentLayout>;

  if (!isAuthed) {
    return (
      <ContentLayout title="Akun">
        <div className="rounded-2xl border border-dashed p-10 text-center space-y-4">
          <p className="text-muted-foreground">Kamu perlu login untuk mengakses halaman ini.</p>
          <Button onClick={() => signIn()} className="rounded-full px-8">Login Sekarang</Button>
        </div>
      </ContentLayout>
    );
  }

  return (
    <ContentLayout title="Pengaturan Akun">
      <div className="mx-auto w-full max-w-4xl space-y-6">
        <div className="flex flex-col gap-4 rounded-3xl border bg-card p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between border-primary/10">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <User2 className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold">{meLoading ? <Skeleton className="h-6 w-32" /> : (me?.data?.name || "User")}</h2>
              <div className="flex gap-2 mt-1">
                <Badge variant="outline" className="rounded-full font-bold uppercase text-[10px] tracking-wider"><Shield className="mr-1 h-3 w-3" /> {role}</Badge>
                <Badge variant="secondary" className="rounded-full text-[10px] font-bold uppercase tracking-wider">{loginMethod === "whatsapp" ? "WhatsApp" : "Email"}</Badge>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1 space-y-2">
            <h3 className="font-bold">Informasi Pribadi</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">Kelola identitas publik kamu yang akan tampil pada setiap transaksi.</p>
          </div>
          <Card className="md:col-span-2 rounded-2xl border-none shadow-sm">
            <CardContent className="pt-6 space-y-4">
              <div className="space-y-2">
                <Label>Nama Lengkap</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} className="rounded-xl border-muted" />
              </div>
              <Button onClick={saveProfile} disabled={savingName} className="rounded-xl px-6">
                {savingName && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Simpan Perubahan
              </Button>
            </CardContent>
          </Card>
        </div>

        <Separator />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1 space-y-2">
            <h3 className="font-bold">Keamanan Akun</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">Update password secara berkala untuk menjaga akun tetap aman.</p>
          </div>
          <Card className="md:col-span-2 rounded-2xl border-none shadow-sm">
            <CardContent className="pt-6">
              {loginMethod !== "email" ? (
                <div className="bg-muted/50 p-4 rounded-xl text-xs text-muted-foreground border">
                  Akun ini terhubung via WhatsApp OTP. Fitur ubah password tidak tersedia untuk metode login ini.
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-2"><Label>Password Lama</Label><Input type="password" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} className="rounded-xl" /></div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2"><Label>Password Baru</Label><Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="rounded-xl" /></div>
                    <div className="space-y-2"><Label>Konfirmasi</Label><Input type="password" value={passwordConfirmation} onChange={(e) => setPasswordConfirmation(e.target.value)} className="rounded-xl" /></div>
                  </div>
                  <Button onClick={savePassword} disabled={savingPassword} className="rounded-xl px-6">
                    {savingPassword && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Update Password
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </ContentLayout>
  );
}
