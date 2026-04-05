"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { signIn } from "next-auth/react";
import { toast } from "sonner";

import TurnstileWidget from "@/components/auth/turnstile-widget";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type Purpose = "login" | "register" | "reset_password";

type Props = {
  purpose: Purpose;
  name?: string;
  disabled?: boolean;
  otpLength?: number;
  expiryMinutes?: number;
  defaultCooldownSeconds?: number;
  onLoggedIn?: () => void;
  onResetLinkReceived?: (resetUrl: string) => void;
  showHelpLink?: boolean;
  helpLinkHref?: string;
  helpLinkLabel?: string;

  turnstileEnabled?: boolean;
  turnstileSiteKey?: string;

  onDuplicateAccount?: () => void;
};

function normalizeWhatsapp(value: string) {
  let v = (value || "").replace(/[^0-9]/g, "");
  if (v.startsWith("0")) v = "62" + v.slice(1);
  if (v.startsWith("8")) v = "62" + v;
  if (!v.startsWith("62")) v = "62" + v;
  return v;
}

function isValidWhatsapp(value: string) {
  const v = normalizeWhatsapp(value);
  return v.startsWith("62") && v.length >= 10 && v.length <= 16;
}

function maskWhatsapp(value: string) {
  const v = normalizeWhatsapp(value);
  if (v.length <= 6) return v;
  return v.slice(0, 4) + "••••" + v.slice(-2);
}

function OtpBoxes({
  length,
  value,
  onChange,
  disabled,
}: {
  length: number;
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
}) {
  const refs = useRef<Array<HTMLInputElement | null>>([]);
  const digits = useMemo(() => {
    const clean = (value || "").replace(/\D/g, "");
    return Array.from({ length }, (_, i) => clean[i] || "");
  }, [value, length]);

  const focusIndex = (i: number) => {
    const el = refs.current[i];
    if (el) el.focus();
  };

  return (
    <div className={cn("grid gap-2", length === 6 ? "grid-cols-6" : "grid-cols-4")}>
      {digits.map((d, i) => (
        <input
          key={i}
          ref={(el) => {
            refs.current[i] = el;
          }}
          inputMode="numeric"
          autoComplete="one-time-code"
          className={cn(
            "h-11 w-full rounded-md border bg-background text-center text-base font-medium outline-none transition",
            "focus:border-ring focus:ring-2 focus:ring-ring focus:ring-offset-2",
            disabled && "opacity-60"
          )}
          value={d}
          disabled={disabled}
          maxLength={1}
          onChange={(e) => {
            const next = e.target.value.replace(/\D/g, "").slice(-1);
            const clean = (value || "").replace(/\D/g, "");
            const arr = clean.split("");
            arr[i] = next;
            const joined = arr.join("").slice(0, length);
            onChange(joined);
            if (next && i < length - 1) focusIndex(i + 1);
          }}
          onKeyDown={(e) => {
            if (e.key === "Backspace") {
              const clean = (value || "").replace(/\D/g, "");
              const arr = clean.split("");
              if (arr[i]) {
                arr[i] = "";
                onChange(arr.join("").slice(0, length));
                return;
              }
              if (i > 0) focusIndex(i - 1);
            }
          }}
          onPaste={(e) => {
            e.preventDefault();
            const pasted = e.clipboardData.getData("text").replace(/\D/g, "");
            if (!pasted) return;
            onChange(pasted.slice(0, length));
            const last = Math.min(length - 1, pasted.length - 1);
            focusIndex(last);
          }}
        />
      ))}
    </div>
  );
}

export default function OtpForm({
  purpose,
  name,
  disabled,
  otpLength = 6,
  expiryMinutes = 5,
  defaultCooldownSeconds = 60,
  onLoggedIn,
  onResetLinkReceived,
  showHelpLink,
  helpLinkHref = "/forgot-password",
  helpLinkLabel = "Butuh bantuan?",
  turnstileEnabled = false,
  turnstileSiteKey = "",
  onDuplicateAccount,
}: Props) {
  const [whatsapp, setWhatsapp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [loadingRequest, setLoadingRequest] = useState(false);
  const [loadingVerify, setLoadingVerify] = useState(false);
  const [cooldownRemaining, setCooldownRemaining] = useState(0);

  const [turnstileToken, setTurnstileToken] = useState("");

  useEffect(() => {
    setTurnstileToken("");
  }, [purpose]);

  useEffect(() => {
    if (cooldownRemaining <= 0) return;
    const t = setInterval(() => setCooldownRemaining((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(t);
  }, [cooldownRemaining]);

  const captchaReady = !turnstileEnabled || (turnstileEnabled && turnstileToken.length > 10);

  const canRequest =
    captchaReady &&
    !disabled &&
    !loadingRequest &&
    isValidWhatsapp(whatsapp) &&
    (purpose !== "register" || (name || "").trim().length > 0);

  const canVerify =
    captchaReady && !disabled && !loadingVerify && otpSent && otp.replace(/\D/g, "").length === otpLength;

  const CaptchaInline =
    turnstileEnabled && turnstileSiteKey ? (
      <div className="pt-1">
        <TurnstileWidget
          siteKey={turnstileSiteKey}
          onToken={(t) => setTurnstileToken(t)}
          onExpire={() => setTurnstileToken("")}
          onError={() => setTurnstileToken("")}
          className="flex justify-center"
        />
        {!turnstileToken ? (
          <div className="text-xs text-muted-foreground text-center mt-2">Selesaikan captcha dulu untuk melanjutkan.</div>
        ) : null}
      </div>
    ) : null;

  const handleRequestOtp = async () => {
    if (!canRequest) return;
    setLoadingRequest(true);

    try {
      const res = await fetch("/api/auth/otp/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          whatsapp: normalizeWhatsapp(whatsapp),
          purpose,
          ...(turnstileEnabled ? { turnstile_token: turnstileToken } : {}),
        }),
      });

      const data = await res.json().catch(() => ({}));
      const msg = String(data?.message || "Gagal mengirim OTP");

      if (!res.ok || !data?.success) {
        if (msg.toLowerCase().includes("sudah terdaftar")) onDuplicateAccount?.();
        else toast.error(msg);

        const metaCooldown = typeof data?.meta?.cooldown_seconds === "number" ? data.meta.cooldown_seconds : 0;
        if (metaCooldown > 0) setCooldownRemaining(metaCooldown);

        return;
      }

      setOtpSent(true);
      setOtp("");
      setCooldownRemaining(
        typeof data?.meta?.cooldown_seconds === "number" ? data.meta.cooldown_seconds : defaultCooldownSeconds
      );
      toast.success(`OTP dikirim ke ${maskWhatsapp(whatsapp)}`);
    } catch {
      toast.error("Gagal menghubungi server");
    } finally {
      setLoadingRequest(false);
    }
  };

  const handleVerify = async () => {
    if (!canVerify) return;
    setLoadingVerify(true);

    try {
      const cleanOtp = otp.replace(/\D/g, "");
      const cleanWhatsapp = normalizeWhatsapp(whatsapp);

      if (purpose === "reset_password") {
        const res = await fetch("/api/auth/otp/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            whatsapp: cleanWhatsapp,
            otp: cleanOtp,
            purpose,
            ...(turnstileEnabled ? { turnstile_token: turnstileToken } : {}),
          }),
        });

        const data = await res.json().catch(() => ({}));
        if (!res.ok || !data?.success) {
          toast.error(data?.message || "Verifikasi OTP gagal");
          return;
        }

        const resetUrl = typeof data?.meta?.reset_url === "string" ? data.meta.reset_url : "";
        if (resetUrl) {
          onResetLinkReceived?.(resetUrl);
          toast.success("Link reset password dibuat");
          return;
        }

        toast.success("Verifikasi berhasil");
        return;
      }

      const result = await signIn("otp", {
        redirect: false,
        whatsapp: cleanWhatsapp,
        otp: cleanOtp,
        purpose,
        name: (name || "").trim() || undefined,
        ...(turnstileEnabled ? { turnstile_token: turnstileToken } : {}),
      });

      if (!result?.ok) {
        toast.error("Verifikasi OTP gagal");
        return;
      }

      toast.success(purpose === "register" ? "Berhasil daftar" : "Berhasil masuk");
      onLoggedIn?.();
    } catch {
      toast.error("Verifikasi OTP gagal");
    } finally {
      setLoadingVerify(false);
    }
  };

  const handleResend = async () => {
    if (cooldownRemaining > 0) return;
    await handleRequestOtp();
  };

  return (
    <div className="space-y-4" role="tabpanel">
      <div className="space-y-2">
        <Label htmlFor="wa">WhatsApp</Label>
        <Input
          id="wa"
          value={whatsapp}
          onChange={(e) => setWhatsapp(e.target.value)}
          placeholder="08xxxx / 62xxxx"
          disabled={disabled || otpSent || loadingRequest || loadingVerify}
          inputMode="numeric"
          autoComplete="tel"
        />
      </div>

      {!otpSent ? (
        <div className="space-y-3">
          {CaptchaInline}

          <Button onClick={handleRequestOtp} disabled={!canRequest} className="w-full h-10">
            {loadingRequest ? "Mengirim..." : "Kirim OTP"}
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="space-y-2">
            <Label>Kode OTP</Label>
            <OtpBoxes length={otpLength} value={otp} onChange={setOtp} disabled={disabled || loadingVerify} />
          </div>

          {CaptchaInline}

          <Button onClick={handleVerify} disabled={!canVerify} className="w-full h-10">
            {loadingVerify ? "Memverifikasi..." : "Verifikasi"}
          </Button>

          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Berlaku {expiryMinutes} menit</span>
            <button
              type="button"
              className={cn(
                "underline underline-offset-4 hover:text-foreground",
                (cooldownRemaining > 0 || loadingRequest || disabled) && "opacity-60 pointer-events-none"
              )}
              onClick={handleResend}
            >
              {cooldownRemaining > 0 ? `Kirim ulang dalam ${cooldownRemaining}s` : "Kirim ulang"}
            </button>
          </div>
        </div>
      )}

      {showHelpLink ? (
        <div className="text-xs text-muted-foreground">
          <a href={helpLinkHref} className="underline underline-offset-4">
            {helpLinkLabel}
          </a>
        </div>
      ) : null}
    </div>
  );
}