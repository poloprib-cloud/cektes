import { NextResponse } from "next/server";

type SitemapUrl = {
  loc: string;
  lastmod?: string;
};

const escapeXml = (value: string) =>
  value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");

export async function GET(request: Request) {
  const origin = new URL(request.url).origin;
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || origin).replace(/\/+$/, "");

  try {
    const res = await fetch(`${siteUrl}/api/sitemap`, { cache: "no-store" });

    if (!res.ok) {
      return NextResponse.json({ error: "Failed to fetch sitemap data" }, { status: 500 });
    }

    const json = await res.json().catch(() => ({}));
    const urlsRaw = json?.data?.urls;
    const urls: SitemapUrl[] = Array.isArray(urlsRaw) ? urlsRaw : [];

    const now = new Date().toISOString();

    const rows = urls
      .map((u) => {
        const locRaw = typeof u?.loc === "string" ? u.loc.trim() : "";
        if (!locRaw) return null;

        const loc = /^https?:\/\//i.test(locRaw) ? locRaw : `${siteUrl}${locRaw.startsWith("/") ? "" : "/"}${locRaw}`;

        const lastmodCandidate = typeof u?.lastmod === "string" ? u.lastmod : "";
        const lastmodDate = lastmodCandidate ? new Date(lastmodCandidate) : new Date(now);
        const lastmod = Number.isNaN(lastmodDate.getTime()) ? now : lastmodDate.toISOString();

        return `  <url>\n    <loc>${escapeXml(loc)}</loc>\n    <lastmod>\n      ${escapeXml(lastmod)}\n    </lastmod>\n  </url>`;
      })
      .filter(Boolean)
      .join("\n");

    const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${rows}\n</urlset>\n`;

    return new NextResponse(xml, {
      headers: {
        "Content-Type": "application/xml; charset=UTF-8",
      },
    });
  } catch (error) {
    console.error("Sitemap generation error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
