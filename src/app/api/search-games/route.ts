import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(req: Request) {
  const base = process.env.NEXT_PRIVATE_API_URL || process.env.NEXT_PUBLIC_API_URL;
  const apiKey = process.env.API_ACCESS_KEY ?? "";

  if (!base) {
    return NextResponse.json({ games: [] }, { status: 500 });
  }

  if (!apiKey) {
    return NextResponse.json({ games: [] }, { status: 500 });
  }

  const url = new URL(req.url);
  const search = url.searchParams.get("search") ?? "";

  if (!search.trim()) {
    return NextResponse.json({ games: [] }, { status: 200 });
  }

  const target = new URL(`${base}/api/search-games`);
  target.searchParams.set("search", search);

  const res = await fetch(target.toString(), {
    cache: "no-store",
    headers: {
      "X-API-KEY": apiKey,
      Accept: "application/json",
    },
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    return NextResponse.json({ games: [] }, { status: res.status });
  }

  if (data && Array.isArray(data.games)) {
    return NextResponse.json({ games: data.games }, { status: 200 });
  }

  return NextResponse.json({ games: [] }, { status: 200 });
}