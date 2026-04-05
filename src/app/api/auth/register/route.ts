import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const base = process.env.NEXT_PRIVATE_API_URL || process.env.NEXT_PUBLIC_API_URL;
  const apiKey = process.env.API_ACCESS_KEY ?? "";

  if (!base) {
    return NextResponse.json({ success: false, message: "API base URL not configured" }, { status: 500 });
  }
  if (!apiKey) {
    return NextResponse.json({ success: false, message: "API access key not configured" }, { status: 500 });
  }

  const body = await req.json().catch(() => ({}));

  const res = await fetch(`${base}/api/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      "X-API-KEY": apiKey,
    },
    body: JSON.stringify(body),
    cache: "no-store",
  });

  const data = await res.json().catch(() => ({}));
  return NextResponse.json(data, { status: res.status });
}
