import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(_req: Request, context: any) {
  const base = process.env.NEXT_PRIVATE_API_URL || process.env.NEXT_PUBLIC_API_URL;
  if (!base) {
    return NextResponse.json({ success: false, message: "API URL belum dikonfigurasi" }, { status: 500 });
  }

  const apiKey = process.env.API_ACCESS_KEY || process.env.NEXT_PUBLIC_API_ACCESS_KEY;
  if (!apiKey) {
    return NextResponse.json({ success: false, message: "API KEY belum dikonfigurasi" }, { status: 500 });
  }

  const slug = context?.params?.slug;
  if (!slug || typeof slug !== "string") {
    return NextResponse.json({ success: false, message: "Slug tidak ditemukan" }, { status: 400 });
  }

  try {
    const res = await fetch(`${base}/api/order/${encodeURIComponent(slug)}`, {
      method: "GET",
      cache: "no-store",
      headers: {
        Accept: "application/json",
        "X-API-KEY": apiKey,
      },
    });

    const data = await res.json().catch(() => ({}));

    return NextResponse.json(data, {
      status: res.status,
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan", error: String(error?.message || error) },
      { status: 500 }
    );
  }
}
