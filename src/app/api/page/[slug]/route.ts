import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(_request: Request, context: any) {
  const slug = context?.params?.slug;

  if (!slug || typeof slug !== "string") {
    return NextResponse.json({ message: "Slug tidak ditemukan" }, { status: 400 });
  }

  const base = process.env.NEXT_PRIVATE_API_URL || process.env.NEXT_PUBLIC_API_URL;
  const apiKey = process.env.API_ACCESS_KEY ?? "";

  if (!base) {
    return NextResponse.json({ message: "API base URL not configured" }, { status: 500 });
  }

  if (!apiKey) {
    return NextResponse.json({ message: "API access key not configured" }, { status: 500 });
  }

  try {
    const res = await fetch(`${base}/api/pages/${encodeURIComponent(slug)}`, {
      cache: "no-store",
      headers: {
        "X-API-KEY": apiKey,
        "Accept": "application/json",
      },
    });

    const data = await res.json().catch(() => null);

    if (!res.ok) {
      return NextResponse.json(
        { message: data?.message ?? "Halaman tidak ditemukan", raw: data },
        { status: res.status }
      );
    }

    return NextResponse.json(data, {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        "Pragma": "no-cache",
        "Expires": "0",
      },
    });
  } catch (error) {
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
