"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

export type SettingsPayload = {
  success: boolean;
  data: Record<string, any>;
};

const SettingsContext = createContext<SettingsPayload>({
  success: false,
  data: {},
});

export const useSettings = () => useContext(SettingsContext);

const isHexColor = (value: string) => /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(value);

const expandShortHex = (hex: string) => {
  if (hex.length !== 4) return hex;
  const r = hex[1];
  const g = hex[2];
  const b = hex[3];
  return `#${r}${r}${g}${g}${b}${b}`;
};

const hexToRgb = (hex: string) => {
  const full = expandShortHex(hex);
  const cleaned = full.replace("#", "");
  const num = Number.parseInt(cleaned, 16);

  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
};

const rgbToHslTriplet = (r: number, g: number, b: number) => {
  const rr = r / 255;
  const gg = g / 255;
  const bb = b / 255;

  const max = Math.max(rr, gg, bb);
  const min = Math.min(rr, gg, bb);
  const delta = max - min;

  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (delta !== 0) {
    s = delta / (1 - Math.abs(2 * l - 1));

    switch (max) {
      case rr:
        h = ((gg - bb) / delta) % 6;
        break;
      case gg:
        h = (bb - rr) / delta + 2;
        break;
      default:
        h = (rr - gg) / delta + 4;
    }

    h *= 60;
    if (h < 0) h += 360;
  }

  const round = (n: number) => Math.round(n * 100) / 100;

  const hOut = round(h);
  const sOut = round(s * 100);
  const lOut = round(l * 100);

  return `${hOut} ${sOut}% ${lOut}%`;
};

const normalizeHslTriplet = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed) return null;

  const lower = trimmed.toLowerCase();
  const cleaned = lower.startsWith("hsl")
    ? lower.replace(/hsla?\(/, "").replace(/\)\s*$/, "")
    : trimmed;

  const matches = cleaned.replace(/,/g, " ").match(/-?\d+(?:\.\d+)?%?/g);
  if (!matches || matches.length < 3) return null;

  const h = Number.parseFloat(matches[0]);
  const s = Number.parseFloat(matches[1]);
  const l = Number.parseFloat(matches[2]);

  if (!Number.isFinite(h) || !Number.isFinite(s) || !Number.isFinite(l)) return null;

  const round = (n: number) => Math.round(n * 100) / 100;
  return `${round(h)} ${round(s)}% ${round(l)}%`;
};

const normalizeMyColor = (raw: unknown) => {
  if (typeof raw !== "string") return null;
  const value = raw.trim();
  if (!value) return null;

  if (isHexColor(value)) {
    const { r, g, b } = hexToRgb(value);
    return rgbToHslTriplet(r, g, b);
  }

  return normalizeHslTriplet(value);
};

const applyCssVarIfPresent = (varName: string, raw: unknown) => {
  const normalized = normalizeMyColor(raw);
  if (!normalized) return;
  document.documentElement.style.setProperty(varName, normalized);
};

export const SettingsProvider = ({
  children,
  initialData,
}: {
  children: React.ReactNode;
  initialData?: SettingsPayload | null;
}) => {
  const initialPayload = useMemo<SettingsPayload>(
    () =>
      initialData && typeof initialData === "object"
        ? { success: Boolean(initialData.success), data: initialData.data ?? {} }
        : { success: false, data: {} },
    [initialData]
  );

  const [settings, setSettings] = useState<SettingsPayload>(initialPayload);

  useEffect(() => {
    applyCssVarIfPresent("--my-color", initialPayload.data?.["ui.my_color"]);
    applyCssVarIfPresent("--my-hover-color", initialPayload.data?.["ui.my_hover_color"]);
  }, [initialPayload]);

  useEffect(() => {
    let cancelled = false;

    async function fetchSettings() {
      try {
        const res = await fetch("/api/settings");
        if (!res.ok) throw new Error("Gagal memuat settings");

        const json = await res.json();
        if (cancelled) return;

        const payload: SettingsPayload = {
          success: Boolean(json?.success),
          data: json?.data ?? {},
        };

        setSettings(payload);

        applyCssVarIfPresent("--my-color", payload.data?.["ui.my_color"]);
        applyCssVarIfPresent("--my-hover-color", payload.data?.["ui.my_hover_color"]);
      } catch (error) {
        console.error("Gagal memuat settings:", error);
      }
    }

    fetchSettings();

    return () => {
      cancelled = true;
    };
  }, []);

  return <SettingsContext.Provider value={settings}>{children}</SettingsContext.Provider>;
};