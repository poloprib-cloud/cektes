import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const base = process.env.NEXT_PRIVATE_API_URL || process.env.NEXT_PUBLIC_API_URL;
  if (!base) return NextResponse.json({ success: false, message: "API URL belum dikonfigurasi" }, { status: 500 });

  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ success: false, message: "Body tidak valid" }, { status: 422 });

  try {
    const res = await fetch(`${base}/api/auth/otp/request`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "X-API-KEY": process.env.API_ACCESS_KEY ?? "",
      },
      body: JSON.stringify(body),
      cache: "no-store",
    });

    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json({ success: false, message: "Gagal menghubungi server" }, { status: 500 });
  }
}
