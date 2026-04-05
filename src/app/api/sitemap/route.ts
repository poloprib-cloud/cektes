import { NextResponse } from "next/server";

type SitemapUrl = {
  loc: string;
  lastmod?: string;
};

export const revalidate = 1800;

const escapeXml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");

const safeIso = (candidate?: string) => {
  if (!candidate) return new Date().toISOString();
  const d = new Date(candidate);
  return Number.isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString();
};

export async function GET(request: Request) {
  const origin = new URL(request.url).origin;
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || origin).replace(/\/+$/, "");

  try {
    const res = await fetch(`${siteUrl}/api/sitemap`, {
      next: { revalidate },
    });

    const json = await res.json().catch(() => ({}));
    const urlsRaw = json?.data?.urls;
    const urls: SitemapUrl[] = Array.isArray(urlsRaw) ? urlsRaw : [];

    const rows = urls
      .map((u) => {
        const locRaw = typeof u?.loc === "string" ? u.loc.trim() : "";
        if (!locRaw) return null;

        const loc = /^https?:\/\//i.test(locRaw)
          ? locRaw
          : `${siteUrl}${locRaw.startsWith("/") ? "" : "/"}${locRaw}`;

        const lastmod = safeIso(typeof u?.lastmod === "string" ? u.lastmod : undefined);

        return `  <url>\n    <loc>${escapeXml(loc)}</loc>\n    <lastmod>${escapeXml(lastmod)}</lastmod>\n  </url>`;
      })
      .filter(Boolean)
      .join("\n");

    const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${rows}\n</urlset>\n`;

    return new NextResponse(xml, {
      headers: {
        "Content-Type": "application/xml; charset=UTF-8",
        "Cache-Control": "public, s-maxage=1800, stale-while-revalidate=3600",
      },
    });
  } catch {
    const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n</urlset>\n`;

    return new NextResponse(xml, {
      headers: {
        "Content-Type": "application/xml; charset=UTF-8",
        "Cache-Control": "no-store",
      },
      status: 200,
    });
  }
}