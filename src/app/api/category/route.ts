import { NextResponse } from "next/server";

export async function GET() {
  const base = process.env.NEXT_PRIVATE_API_URL || process.env.NEXT_PUBLIC_API_URL;
  if (!base) return NextResponse.json({ success: false, message: "API URL belum dikonfigurasi" }, { status: 500 });

  try {
    const res = await fetch(`${base}/api/category`, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "X-API-KEY": process.env.API_ACCESS_KEY ?? "",
      },
      cache: "no-store",
    });

    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json({ success: false, message: "Gagal menghubungi server" }, { status: 500 });
  }
}
