import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(req: Request) {
  const base = process.env.NEXT_PRIVATE_API_URL || process.env.NEXT_PUBLIC_API_URL;
  if (!base) {
    return NextResponse.json({ success: false, message: "API URL belum dikonfigurasi" }, { status: 500 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const page = searchParams.get("page");
    const perPage = searchParams.get("per_page");

    const apiUrl = new URL(`${base}/api/reviews`);
    if (page) apiUrl.searchParams.set("page", page);
    if (perPage) apiUrl.searchParams.set("per_page", perPage);

    const res = await fetch(apiUrl.toString(), {
      headers: {
        "Content-Type": "application/json",
        "X-API-KEY": process.env.API_ACCESS_KEY || "",
      },
      cache: "no-store",
    });

    const json = await res.json().catch(() => ({}));
    return NextResponse.json(json, { status: res.status });
  } catch (e) {
    return NextResponse.json({ success: false, message: "Gagal mengambil ulasan." }, { status: 500 });
  }
}
