import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function PUT(req: Request) {
  const base = process.env.NEXT_PRIVATE_API_URL || process.env.NEXT_PUBLIC_API_URL;
  const apiKey = process.env.API_ACCESS_KEY ?? "";

  if (!base) return NextResponse.json({ error: "API base URL not configured" }, { status: 500 });
  if (!apiKey) return NextResponse.json({ error: "API access key not configured" }, { status: 500 });

  const tokenData = await getToken({ req: req as any, secret: process.env.NEXTAUTH_SECRET });
  const token =
    (tokenData as any)?.jwtToken ||
    (tokenData as any)?.accessToken ||
    (tokenData as any)?.token;

  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));

  const res = await fetch(`${base}/api/account/profile`, {
    method: "PUT",
    cache: "no-store",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      "X-API-KEY": apiKey,
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });

  const data = await res.json().catch(() => null);
  if (!res.ok) return NextResponse.json(data ?? { error: "Failed" }, { status: res.status });

  return NextResponse.json(data);
}
