import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(req: Request) {
  const base = process.env.NEXT_PRIVATE_API_URL || process.env.NEXT_PUBLIC_API_URL;
  if (!base) return NextResponse.json({ error: "API base URL not configured" }, { status: 500 });

  const url = new URL(req.url);
  const imagePath = url.searchParams.get("path") ?? "";

  if (!imagePath) {
    return NextResponse.json({ error: "Missing path" }, { status: 422 });
  }

  const backendURL = `${base}/storage/${imagePath}`;

  const res = await fetch(backendURL, {
    cache: "no-store",
    headers: {
      Accept: "image/*",
    },
  });

  if (!res.ok) {
    return NextResponse.json({ error: "Failed to fetch image" }, { status: res.status });
  }

  const contentType = res.headers.get("content-type") ?? "application/octet-stream";
  const buf = await res.arrayBuffer();

  return new NextResponse(buf, {
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=86400",
    },
  });
}