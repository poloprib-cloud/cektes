import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

const apiBase = () => process.env.NEXT_PRIVATE_API_URL || process.env.NEXT_PUBLIC_API_URL;

export const dynamic = "force-dynamic";
export const revalidate = 0;

type Ctx = { params: Promise<{ orderId: string }> };

export async function GET(_: Request, { params }: Ctx) {
  const base = apiBase();
  if (!base) return NextResponse.json({ success: false, message: "API URL belum dikonfigurasi" }, { status: 500 });

  const { orderId } = await params;

  try {
    const url = `${base}/api/invoice/${encodeURIComponent(orderId)}/review`;

    const res = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-API-KEY": process.env.API_ACCESS_KEY || "",
      },
      cache: "no-store",
    });

    const json = await res.json().catch(() => ({}));
    return NextResponse.json(json, { status: res.status });
  } catch {
    return NextResponse.json({ success: false, message: "Gagal mengambil ulasan." }, { status: 500 });
  }
}

export async function POST(req: Request, { params }: Ctx) {
  const base = apiBase();
  if (!base) return NextResponse.json({ success: false, message: "API URL belum dikonfigurasi" }, { status: 500 });

  const { orderId } = await params;

  try {
    const body = await req.json().catch(() => ({}));

    const tokenData = await getToken({ req: req as any, secret: process.env.NEXTAUTH_SECRET });
    const token =
      (tokenData as any)?.jwtToken ||
      (tokenData as any)?.accessToken ||
      (tokenData as any)?.token;

    const url = `${base}/api/invoice/${encodeURIComponent(orderId)}/review`;

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "X-API-KEY": process.env.API_ACCESS_KEY || "",
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const res = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
      cache: "no-store",
    });

    const json = await res.json().catch(() => ({}));
    return NextResponse.json(json, { status: res.status });
  } catch {
    return NextResponse.json({ success: false, message: "Gagal mengirim ulasan." }, { status: 500 });
  }
}