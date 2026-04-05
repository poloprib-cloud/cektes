import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  const base = process.env.NEXT_PRIVATE_API_URL || process.env.NEXT_PUBLIC_API_URL;
  const apiKey = process.env.API_ACCESS_KEY ?? "";

  if (!base) return NextResponse.json({ error: "API base URL not configured" }, { status: 500 });
  if (!apiKey) return NextResponse.json({ error: "API access key not configured" }, { status: 500 });

  const res = await fetch(`${base}/api/latest-orders`, {
    cache: "no-store",
    headers: {
      "X-API-KEY": apiKey,
      Accept: "application/json",
    },
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    return NextResponse.json({ error: "Failed to fetch latest orders", raw: data }, { status: res.status });
  }

  return NextResponse.json(data, {
    headers: {
      "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
      Pragma: "no-cache",
      Expires: "0",
    },
  });
}