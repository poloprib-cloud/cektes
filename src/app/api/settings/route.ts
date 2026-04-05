import { NextResponse } from "next/server";

export async function GET() {
  const base = process.env.NEXT_PRIVATE_API_URL || process.env.NEXT_PUBLIC_API_URL;
  const apiKey = process.env.API_ACCESS_KEY || process.env.NEXT_PUBLIC_API_ACCESS_KEY;

  if (!base) {
    return NextResponse.json({ success: false, message: "API URL belum dikonfigurasi" }, { status: 500 });
  }
  if (!apiKey) {
    return NextResponse.json({ success: false, message: "API key belum dikonfigurasi" }, { status: 500 });
  }

  try {
    const res = await fetch(`${base}/api/settings`, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "X-API-KEY": apiKey,
      },
      cache: "no-store",
    });

    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, { status: res.status });
  } catch (e: any) {
    return NextResponse.json(
      { success: false, message: "Gagal menghubungi server settings", error: String(e?.message || e) },
      { status: 500 }
    );
  }
}