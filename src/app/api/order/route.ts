import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request) {
  const base = process.env.NEXT_PRIVATE_API_URL || process.env.NEXT_PUBLIC_API_URL;
  if (!base) return NextResponse.json({ success: false, message: "API URL belum dikonfigurasi" }, { status: 500 });

  try {
    const session = await getServerSession(authOptions);
    const token = (session as any)?.accessToken || (session as any)?.user?.token || null;

    const body = await req.json();

    const headers: HeadersInit = {
      Accept: "application/json",
      "Content-Type": "application/json",
      "X-API-KEY": process.env.API_ACCESS_KEY ?? "",
    };

    if (token) headers["Authorization"] = `Bearer ${token}`;

    const res = await fetch(`${base}/api/order`, {
      method: "POST",
      headers,
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
