"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";

import { ContentLayout } from "@/components/panel/content-layout";
import AuthCard from "@/components/auth/auth-card";
import MethodToggle from "@/components/auth/method-toggle";
import OtpForm from "@/components/auth/otp-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

const OTP_LENGTH = 6;
const OTP_EXPIRY_MINUTES = 5;
const OTP_COOLDOWN_SECONDS = 60;

export default function ForgotPasswordPage() {
  return (
    <ContentLayout title="Lupa Password">
      <Suspense
        fallback={
          <div className="w-full h-[80vh] flex justify-center items-center">
            <LoadingSpinner size={40} />
          </div>
        }
      >
        <ForgotPasswordForm />
      </Suspense>
    </ContentLayout>
  );
}

function ForgotPasswordForm() {
  const searchParams = useSearchParams();
  const preset = (searchParams.get("method") || "").toLowerCase();
  const [method, setMethod] = useState<"email" | "whatsapp">(preset === "whatsapp" ? "whatsapp" : "email");

  const [email, setEmail] = useState("");
  const [loadingEmail, setLoadingEmail] = useState(false);

  const canSendEmail = !loadingEmail && isValidEmail(email);

  const handleSendEmail = async () => {
    if (!canSendEmail) return;
    setLoadingEmail(true);
    try {
      const res = await fetch("/api/auth/password/forgot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ method: "email", email: email.trim() }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.success) {
        toast.error(data?.message || "Gagal mengirim link reset");
        return;
      }

      toast.success("Jika email terdaftar, link reset akan dikirim");
    } catch {
      toast.error("Gagal menghubungi server");
    } finally {
      setLoadingEmail(false);
    }
  };

  return (
    <AuthCard
      title="Lupa Password"
      description="Pilih metode pemulihan akun, lalu ikuti instruksi yang dikirimkan."
      footer={
        <div className="text-sm text-muted-foreground text-center">
          Ingat password?{" "}
          <Link href="/signin" className="text-primary underline underline-offset-4">
            Masuk
          </Link>
        </div>
      }
    >
      <MethodToggle value={method} onChange={setMethod} emailLabel="Email" whatsappLabel="WhatsApp" />

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

          <Button onClick={handleSendEmail} disabled={!canSendEmail} className="w-full h-10">
            {loadingEmail ? "Mengirim..." : "Kirim Link Reset"}
          </Button>

          <div className="text-xs text-muted-foreground">
            Jika link sudah kamu dapat, lanjutkan ke halaman{" "}
            <Link href="/reset-password" className="underline underline-offset-4">
              reset password
            </Link>
            .
          </div>
        </div>
      ) : (
        <OtpForm
          purpose="reset_password"
          otpLength={OTP_LENGTH}
          expiryMinutes={OTP_EXPIRY_MINUTES}
          defaultCooldownSeconds={OTP_COOLDOWN_SECONDS}
          showHelpLink
          helpLinkHref="/forgot-password?method=email"
          helpLinkLabel="Gunakan email saja"
          onResetLinkReceived={(resetUrl) => {
            window.location.href = resetUrl;
          }}
        />
      )}
    </AuthCard>
  );
}
