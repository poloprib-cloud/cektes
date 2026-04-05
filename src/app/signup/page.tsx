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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const DUPLICATE_MESSAGE =
  "Akun Dengan Email/WhatsApp Tersebut Sudah Terdaftar, Silahkan Masuk Dengan Email Tersebut.";

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default function SignupPage() {
  return (
    <ContentLayout title="Daftar">
      <Suspense
        fallback={
          <div className="w-full h-[80vh] flex justify-center items-center">
            <LoadingSpinner size={40} />
          </div>
        }
      >
        <SignupForm />
      </Suspense>
    </ContentLayout>
  );
}

function SignupForm() {
  const { data: session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";

  const [method, setMethod] = useState<"email" | "whatsapp">("email");

  const [settings, setSettings] = useState<Record<string, any>>({});
  const [settingsLoaded, setSettingsLoaded] = useState(false);

  const [turnstileTokenEmail, setTurnstileTokenEmail] = useState("");

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

  useEffect(() => {
    if (session) redirect("/dashboard");
  }, [session]);

  const [signupError, setSignupError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loadingEmail, setLoadingEmail] = useState(false);

  useEffect(() => {
    setSignupError(null);
    setTurnstileTokenEmail("");
  }, [method]);

  const captchaReadyEmail = !turnstileEnabled || (turnstileEnabled && turnstileTokenEmail.length > 10);

  const canRegisterEmail =
    captchaReadyEmail && !loadingEmail && name.trim().length >= 2 && isValidEmail(email) && password.length >= 6;

  const showDuplicateAlert = () => setSignupError(DUPLICATE_MESSAGE);

  const handleRegisterEmail = async () => {
    if (!canRegisterEmail) return;
    setLoadingEmail(true);
    setSignupError(null);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          password,
          ...(turnstileEnabled ? { turnstile_token: turnstileTokenEmail } : {}),
        }),
      });

      const data = await res.json().catch(() => ({}));
      const msg = String(data?.message || "Gagal mendaftar");

      if (!res.ok || !data?.success) {
        if (msg.toLowerCase().includes("sudah terdaftar")) showDuplicateAlert();
        else setSignupError(msg);
        return;
      }

      const result = await signIn("credentials", {
        redirect: false,
        email: email.trim(),
        password,
        ...(turnstileEnabled ? { turnstile_token: turnstileTokenEmail } : {}),
      });

      if (!result?.ok) {
        toast.success("Berhasil daftar. Silakan masuk.");
        router.push(`/signin?callbackUrl=${encodeURIComponent(callbackUrl)}`);
        return;
      }

      toast.success("Berhasil daftar");
      router.push(callbackUrl);
    } catch {
      setSignupError("Gagal menghubungi server");
    } finally {
      setLoadingEmail(false);
    }
  };

  return (
    <AuthCard
      title="Daftar"
      description="Buat akun baru dengan Email atau WhatsApp."
      footer={
        <div className="text-sm text-muted-foreground text-center">
          Sudah punya akun?{" "}
          <Link href="/signin" className="text-primary underline underline-offset-4">
            Masuk sekarang
          </Link>
        </div>
      }
    >
      {signupError ? (
        <Alert variant="destructive">
          <AlertTitle>Gagal Mendaftar</AlertTitle>
          <AlertDescription>{signupError}</AlertDescription>
        </Alert>
      ) : null}

      <MethodToggle value={method} onChange={setMethod} />

      {method === "email" ? (
        <div className="space-y-4" role="tabpanel">
          <div className="space-y-2">
            <Label htmlFor="name">Nama</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nama kamu"
              autoComplete="name"
            />
          </div>

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
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimal 6 karakter"
              type="password"
              autoComplete="new-password"
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

          <Button onClick={handleRegisterEmail} disabled={!canRegisterEmail} className="w-full h-10">
            {loadingEmail ? "Memproses..." : "Daftar"}
          </Button>
        </div>
      ) : (
        <div className="space-y-4" role="tabpanel">
          <div className="space-y-2">
            <Label htmlFor="name_wa">Nama</Label>
            <Input
              id="name_wa"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nama kamu"
              autoComplete="name"
            />
          </div>

          <OtpForm
            purpose="register"
            name={name.trim()}
            otpLength={otpLength}
            expiryMinutes={expiryMinutes}
            defaultCooldownSeconds={cooldownSeconds}
            showHelpLink
            helpLinkHref="/signin"
            helpLinkLabel="Sudah punya akun?"
            turnstileEnabled={turnstileEnabled}
            turnstileSiteKey={turnstileSiteKey}
            onDuplicateAccount={showDuplicateAlert}
            onLoggedIn={() => router.push(callbackUrl)}
          />
        </div>
      )}

      <Separator />

      <Button
        type="button"
        variant="outline"
        onClick={() => signIn("google", { callbackUrl })}
        className="w-full h-10 flex items-center justify-center gap-2"
      >
        <FcGoogle className="text-xl" />
        Daftar dengan Google
      </Button>
    </AuthCard>
  );
}