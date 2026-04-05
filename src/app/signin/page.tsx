"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { signIn, useSession } from "next-auth/react";
import { redirect, useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { FcGoogle } from "react-icons/fc";

import { ContentLayout } from "@/components/panel/content-layout";
import AuthCard from "@/components/auth/auth-card";
import MethodToggle from "@/components/auth/method-toggle";
import OtpForm from "@/components/auth/otp-form";
import TurnstileWidget from "@/components/auth/turnstile-widget";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default function SignInPage() {
  return (
    <ContentLayout title="Masuk">
      <Suspense
        fallback={
          <div className="w-full h-[80vh] flex justify-center items-center">
            <LoadingSpinner size={40} />
          </div>
        }
      >
        <SignInForm />
      </Suspense>
    </ContentLayout>
  );
}

function SignInForm() {
  const { data: session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";

  const [settings, setSettings] = useState<Record<string, any>>({});
  const [settingsLoaded, setSettingsLoaded] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetch("/api/settings", { cache: "no-store" });
        const json = await res.json().catch(() => ({}));
        if (!mounted) return;
        setSettings(json?.data || {});
      } catch {
      } finally {
        if (mounted) setSettingsLoaded(true);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const otpLength = useMemo(() => {
    const v = settings?.["otp.length"];
    const n = typeof v === "number" ? v : parseInt(String(v || ""), 10);
    return Number.isFinite(n) && n > 0 ? n : 6;
  }, [settings]);

  const expiryMinutes = useMemo(() => {
    const v = settings?.["otp.expiry_minutes"];
    const n = typeof v === "number" ? v : parseInt(String(v || ""), 10);
    return Number.isFinite(n) && n > 0 ? n : 5;
  }, [settings]);

  const cooldownSeconds = useMemo(() => {
    const v = settings?.["otp.resend_cooldown_seconds"];
    const n = typeof v === "number" ? v : parseInt(String(v || ""), 10);
    return Number.isFinite(n) && n > 0 ? n : 60;
  }, [settings]);

  const turnstileEnabled = useMemo(() => {
    const v = settings?.["turnstile.enabled"];
    return v === true || String(v).toLowerCase() === "true" || String(v) === "1";
  }, [settings]);

  const turnstileSiteKey = useMemo(() => String(settings?.["turnstile.site_key"] || ""), [settings]);

  const [method, setMethod] = useState<"email" | "whatsapp">("email");

  useEffect(() => {
    if (session) redirect("/dashboard");
  }, [session]);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loadingEmail, setLoadingEmail] = useState(false);

  const [turnstileTokenEmail, setTurnstileTokenEmail] = useState("");

  useEffect(() => {
    setTurnstileTokenEmail("");
  }, [method]);

  const captchaReadyEmail = !turnstileEnabled || (turnstileEnabled && turnstileTokenEmail.length > 10);

  const canEmailLogin = captchaReadyEmail && !loadingEmail && isValidEmail(email) && password.length >= 6;

  const handleEmailLogin = async () => {
    if (!canEmailLogin) return;
    setLoadingEmail(true);

    try {
      const result = await signIn("credentials", {
        redirect: false,
        email: email.trim(),
        password,
        ...(turnstileEnabled ? { turnstile_token: turnstileTokenEmail } : {}),
      });

      if (!result?.ok) {
        toast.error("Email atau password salah");
        return;
      }

      toast.success("Berhasil masuk");
      router.push(callbackUrl);
    } catch {
      toast.error("Gagal masuk");
    } finally {
      setLoadingEmail(false);
    }
  };

  return (
    <AuthCard
      title="Masuk"
      description="Pilih metode masuk, lalu lanjutkan proses verifikasi."
      footer={
        <div className="text-sm text-muted-foreground text-center">
          Belum punya akun?{" "}
          <Link href="/signup" className="text-primary underline underline-offset-4">
            Daftar sekarang
          </Link>
        </div>
      }
    >
      <MethodToggle value={method} onChange={setMethod} />

      {method === "email" ? (
        <div className="space-y-4" role="tabpanel">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nama@email.com"
              autoComplete="email"
              inputMode="email"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              <Link
                href="/forgot-password?method=email"
                className="text-xs text-muted-foreground underline underline-offset-4 hover:text-foreground"
              >
                Forgot your password?
              </Link>
            </div>
            <Input
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              type="password"
              autoComplete="current-password"
            />
          </div>

          {turnstileEnabled && turnstileSiteKey ? (
            <div className="pt-1">
              <TurnstileWidget
                siteKey={turnstileSiteKey}
                onToken={(t) => setTurnstileTokenEmail(t)}
                onExpire={() => setTurnstileTokenEmail("")}
                onError={() => setTurnstileTokenEmail("")}
                className="flex justify-center"
              />
              {settingsLoaded && !turnstileTokenEmail ? (
                <div className="text-xs text-muted-foreground text-center mt-2">
                  Selesaikan captcha dulu untuk melanjutkan.
                </div>
              ) : null}
            </div>
          ) : null}

          <Button onClick={handleEmailLogin} disabled={!canEmailLogin} className="w-full h-10">
            {loadingEmail ? "Memproses..." : "Login"}
          </Button>

          <div className="text-xs text-muted-foreground">
            Kesulitan masuk?{" "}
            <Link href="/forgot-password" className="underline underline-offset-4">
              Coba pemulihan akun
            </Link>
          </div>
        </div>
      ) : (
        <OtpForm
          purpose="login"
          otpLength={otpLength}
          expiryMinutes={expiryMinutes}
          defaultCooldownSeconds={cooldownSeconds}
          showHelpLink
          helpLinkHref="/forgot-password?method=whatsapp"
          helpLinkLabel="Lupa akses WhatsApp?"
          turnstileEnabled={turnstileEnabled}
          turnstileSiteKey={turnstileSiteKey}
          onLoggedIn={() => router.push(callbackUrl)}
        />
      )}

      <Separator />

      <Button
        type="button"
        variant="outline"
        onClick={() => signIn("google", { callbackUrl })}
        className="w-full h-10 flex items-center justify-center gap-2"
      >
        <FcGoogle className="text-xl" />
        Masuk dengan Google
      </Button>
    </AuthCard>
  );
}