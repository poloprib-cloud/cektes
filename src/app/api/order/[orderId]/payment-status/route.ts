import { NextResponse } from "next/server";

type Params = { orderId: string };

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(req: Request, context: { params: Promise<Params> }) {
  const base = process.env.NEXT_PRIVATE_API_URL || process.env.NEXT_PUBLIC_API_URL;
  const apiKey = process.env.API_ACCESS_KEY ?? "";

  if (!base) {
    return NextResponse.json({ success: false, message: "API URL belum dikonfigurasi" }, { status: 500 });
  }

  if (!apiKey) {
    return NextResponse.json({ success: false, message: "API access key belum dikonfigurasi" }, { status: 500 });
  }

  try {
    const { orderId } = await context.params;

    if (!orderId) {
      return NextResponse.json({ success: false, message: "Order ID tidak ditemukan" }, { status: 400 });
    }

    const res = await fetch(`${base}/api/invoice/${orderId}/payment-status`, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "X-API-KEY": apiKey,
      },
      cache: "no-store",
    });

    const json = await res.json().catch(() => ({}));

    if (!res.ok) {
      return NextResponse.json(json, { status: res.status });
    }

    return NextResponse.json(json, {
      status: 200,
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan saat mengecek status pembayaran", error: error?.message },
      { status: 500 }
    );
  }
}
