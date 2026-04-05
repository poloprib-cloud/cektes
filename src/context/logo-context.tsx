"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { useSettings } from "./settings-context";

const LogoContext = createContext<string | null>(null);

export function LogoProvider({ children }: { children: React.ReactNode }) {
  const settings = useSettings();
  const [logoUrl, setLogoUrl] = useState<string | null>(null);

  useEffect(() => {
    const BASE_URL = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") + "/storage/";

    if (settings?.success && settings.data?.general?.logo) {
      setLogoUrl(`${BASE_URL}${settings.data.general.logo}`);
    } else {
      setLogoUrl("");
    }
  }, [settings]);

  // Jika masih loading, jangan tampilkan logo (hindari flashing logo default)
  if (logoUrl === null) return null;

  return <LogoContext.Provider value={logoUrl}>{children}</LogoContext.Provider>;
}

export function useLogo() {
  return useContext(LogoContext);
}