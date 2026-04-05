import { NextResponse } from "next/server";

export const revalidate = 600;

export async function GET(request: Request) {
  const base = process.env.NEXT_PRIVATE_API_URL || process.env.NEXT_PUBLIC_API_URL;
  const apiKey = process.env.API_ACCESS_KEY || process.env.NEXT_PUBLIC_API_ACCESS_KEY;

  if (!base) {
    return NextResponse.json({ success: false, message: "API URL belum dikonfigurasi" }, { status: 500 });
  }

  if (!apiKey) {
    return NextResponse.json({ success: false, message: "API key belum dikonfigurasi" }, { status: 500 });
  }

  const url = new URL(request.url);
  const page = url.searchParams.get("page") || "1";
  const perPage = url.searchParams.get("per_page") || "9";

  try {
    const upstream = new URL(`${base}/api/blogs-lite`);
    upstream.searchParams.set("page", page);
    upstream.searchParams.set("per_page", perPage);

    const res = await fetch(upstream.toString(), {
      method: "GET",
      headers: {
        "Accept": "application/json",
        "X-API-KEY": apiKey,
      },
      next: { revalidate },
    });

    const data = await res.json().catch(() => ({}));

    return NextResponse.json(data, {
      status: res.status,
      headers: {
        "Cache-Control": "public, s-maxage=600, stale-while-revalidate=1200",
      },
    });
  } catch (e: any) {
    return NextResponse.json(
      { success: false, message: "Gagal menghubungi server", error: String(e?.message || e) },
      { status: 500 }
    );
  }
}
