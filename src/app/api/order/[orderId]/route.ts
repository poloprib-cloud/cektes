import { NextResponse } from "next/server";

type Params = { orderId: string };

const pickOrder = (json: any) => {
  return (
    json?.order ??
    json?.data?.order ??
    json?.data?.transaction ??
    json?.data?.invoice ??
    (json?.data && typeof json.data === "object" ? json.data : null)
  );
};

const pickGame = (json: any) => {
  return json?.game ?? json?.data?.game ?? json?.data?.games ?? null;
};

const pickProduct = (json: any) => {
  return json?.product ?? json?.data?.product ?? null;
};

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

    const json = await res.json().catch(() => ({}));

    if (!res.ok) {
      return NextResponse.json(json, { status: res.status });
    }

    if (json?.success) {
      const order = pickOrder(json);
      const game = pickGame(json);
      const product = pickProduct(json);

      return NextResponse.json(
        {
          success: true,
          order: order ?? null,
          game: game ?? null,
          product: product ?? null,
          message: json?.message,
        },
        { status: 200 }
      );
    }

    return NextResponse.json(json, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan saat mengambil invoice", error: error?.message },
      { status: 500 }
    );
  }
}