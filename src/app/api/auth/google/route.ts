import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function POST(req: Request) {
  const base = process.env.NEXT_PRIVATE_API_URL || process.env.NEXT_PUBLIC_API_URL;
  const apiKey = process.env.API_ACCESS_KEY ?? "";

  if (!base) {
    return NextResponse.json({ success: false, message: "API URL belum dikonfigurasi" }, { status: 500 });
  }

  if (!apiKey) {
    return NextResponse.json({ success: false, message: "API KEY belum dikonfigurasi" }, { status: 500 });
  }

  try {
    const body = await req.json().catch(() => ({}));

    const res = await fetch(`${base}/api/auth/google`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "X-API-KEY": apiKey,
      },
      body: JSON.stringify(body),
      cache: "no-store",
    });

    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, { status: res.status });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan, coba lagi.", error: error?.message },
      { status: 500 }
    );
  }
}
