import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

async function fetchFromBackend(slug: string) {
  const base = process.env.NEXT_PRIVATE_API_URL || process.env.NEXT_PUBLIC_API_URL;
  const apiKey = process.env.API_ACCESS_KEY ?? "";

  if (!base) {
    return { ok: false, status: 500, data: { message: "API base URL not configured" } };
  }

  if (!apiKey) {
    return { ok: false, status: 500, data: { message: "API access key not configured" } };
  }

  const headers = {
    "X-API-KEY": apiKey,
    Accept: "application/json",
  };

  const u1 = `${base}/api/games/${encodeURIComponent(slug)}`;
  const r1 = await fetch(u1, { cache: "no-store", headers });
  const j1 = await r1.json().catch(() => null);

  if (r1.ok) return { ok: true, status: 200, data: j1 };
  if (r1.status !== 404) return { ok: false, status: r1.status, data: j1 ?? { message: "Failed to fetch game" } };

  const u2 = `${base}/api/game/${encodeURIComponent(slug)}`;
  const r2 = await fetch(u2, { cache: "no-store", headers });
  const j2 = await r2.json().catch(() => null);

  if (r2.ok) return { ok: true, status: 200, data: j2 };
  return { ok: false, status: r2.status, data: j2 ?? { message: "Game not found" } };
}

export async function GET(_request: Request, context: any) {
  const slug = context?.params?.slug;

  if (!slug || typeof slug !== "string") {
    return NextResponse.json({ message: "Slug tidak ditemukan" }, { status: 400 });
  }

  const res = await fetchFromBackend(slug);

  if (!res.ok) {
    return NextResponse.json(
      { success: false, message: res.data?.message ?? "Gagal mengambil data game", raw: res.data },
      { status: res.status }
    );
  }

  return NextResponse.json(res.data, {
    headers: {
      "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
      Pragma: "no-cache",
      Expires: "0",
    },
  });
}