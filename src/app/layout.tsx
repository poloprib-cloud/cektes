import "./globals.css";
import "./embla.css";
import "./custom.css";
import { GeistSans } from "geist/font/sans";
import { SettingsProvider, type SettingsPayload } from "@/context/settings-context";
import PanelLayout from "@/components/panel/panel-layout";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { ProgressBar } from "@/components/progress-bar/progress-bar";
import { Toaster } from "sonner";
import type { Metadata } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3100";

// --- Utility Helpers ---
const resolveSingle = (value: unknown): string | undefined => {
  if (Array.isArray(value)) {
    const first = value[0];
    return typeof first === "string" && first.trim() ? first : undefined;
  }
  return typeof value === "string" && value.trim() ? value : undefined;
};

const safeString = (value: unknown): string => {
  if (typeof value === "string") return value;
  if (value == null) return "";
  return String(value);
};

// --- Fetch Settings ---
async function fetchSettings(): Promise<SettingsPayload | null> {
  try {
    const res = await fetch(`${siteUrl}/api/settings`, { next: { revalidate: 3600 } });
    if (!res.ok) return null;
    const json = await res.json().catch(() => null);
    if (!json) return null;

    return {
      success: Boolean(json?.success),
      data: json?.data ?? {},
    };
  } catch (error) {
    console.error("Layout fetch settings failed:", error);
    return null;
  }
}

// --- Metadata Generator ---
export async function generateMetadata(): Promise<Metadata> {
  const metadataBase = new URL(siteUrl);
  const settings = await fetchSettings();
  const data = settings?.data ?? {};

  // SEO Basics
  const metaTitle = safeString(data["seo.title"] || data["general.title"] || "Top Up Game");
  const metaDescription = safeString(data["seo.description"] || "Top Up Game Murah & Terpercaya");
  const metaKeywords = safeString(data["seo.keywords"] || "topup game, beli diamond, game online");

  // OG & Twitter
  const ogTitle = safeString(data["seo.og_title"] || metaTitle);
  const ogDescription = safeString(data["seo.og_description"] || metaDescription);
  
  const favicon = resolveSingle(data["general.favicon"]);
  const ogImage = resolveSingle(data["seo.og_image"]) || resolveSingle(data["general.logo"]);

  return {
    metadataBase,
    title: metaTitle,
    description: metaDescription,
    keywords: metaKeywords,
    icons: { icon: favicon || "/favicon.ico" },
    openGraph: {
      title: ogTitle,
      description: ogDescription,
      url: metadataBase.origin,
      images: ogImage
        ? [{ url: ogImage, width: 1200, height: 630, alt: ogTitle }]
        : [{ url: "/default-og-image.jpg", width: 1200, height: 630, alt: ogTitle }],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: ogTitle,
      description: ogDescription,
      images: ogImage ? [ogImage] : ["/default-og-image.jpg"],
    },
  };
}

// --- Main Layout Component ---
export default async function Layout({ children }: { children: React.ReactNode }) {
  const settingsPayload = await fetchSettings();
  const data = settingsPayload?.data ?? {};

  // --- Logic Theme (Dari File Kedua) ---
  const rawDefault = typeof data["theme.default_mode"] === "string" ? data["theme.default_mode"] : "light";
  const defaultMode = ["light", "dark", "system"].includes(rawDefault) ? rawDefault : "light";
  const allowToggle = data["theme.allow_toggle"] !== false;
  
  // Jika toggle dimatikan, paksa tema sesuai default (kecuali system dipaksa ke light)
  const forcedTheme = allowToggle ? undefined : (defaultMode === "system" ? "light" : defaultMode);

  // --- Logic Schema.org (Dari File Pertama) ---
  const schemas: any[] = [];
  const enableOrg = data["seo.schema.organization"] === true;
  const enableWebsite = data["seo.schema.website"] === true;
  const brandName = safeString(data["general.title"]);
  const logo = resolveSingle(data["general.logo"]);

  if (enableOrg && brandName) {
    schemas.push({
      "@context": "https://schema.org",
      "@type": "Organization",
      name: brandName,
      url: siteUrl,
      ...(logo ? { logo } : {}),
    });
  }

  if (enableWebsite && brandName) {
    schemas.push({
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: brandName,
      url: siteUrl,
    });
  }

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {schemas.map((schema, index) => (
          <script
            key={`schema-${index}`}
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
          />
        ))}
      </head>
      <body className={GeistSans.className}>
        <ProgressBar className="fixed top-0 h-0.5 bg-indigo-600 z-30">
          <Toaster position="top-center" />
          <ThemeProvider
            attribute="class"
            defaultTheme={defaultMode}
            enableSystem={defaultMode === "system"}
            forcedTheme={forcedTheme}
          >
            <SettingsProvider initialData={settingsPayload}>
              <PanelLayout>{children}</PanelLayout>
            </SettingsProvider>
          </ThemeProvider>
        </ProgressBar>
      </body>
    </html>
  );
}
