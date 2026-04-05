import { NextResponse } from "next/server";

type Params = { orderId: string };

export async function GET(req: Request, context: { params: Promise<Params> }) {
  const base = process.env.NEXT_PRIVATE_API_URL || process.env.NEXT_PUBLIC_API_URL;
  if (!base) return NextResponse.json({ success: false, message: "API URL belum dikonfigurasi" }, { status: 500 });

  try {
    const { orderId } = await context.params;
    if (!orderId) return NextResponse.json({ success: false, message: "Order ID tidak ditemukan" }, { status: 400 });

    const res = await fetch(`${base}/api/invoice/${orderId}`, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "X-API-KEY": process.env.API_ACCESS_KEY ?? "",
      },
      cache: "no-store",
    });

    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, { status: res.status });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: "Terjadi kesalahan saat mengambil invoice", error: error?.message }, { status: 500 });
  }
}
