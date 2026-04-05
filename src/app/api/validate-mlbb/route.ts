import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { id, server } = await req.json();

  if (!id || !server) {
    return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
  }

  try {
    const formData = new URLSearchParams({
      "attribute_amount": "Weekly Pass",
      "text-5f6f144f8ffee": id,
      "text-1601115253775": server,
      "quantity": "1",
      "add-to-cart": "15145",
      "product_id": "15145",
      "variation_id": "4690783",
    });

    const res = await fetch("https://moogold.com/wp-content/plugins/id-validation-new/id-validation-ajax.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Referer": "https://moogold.com/product/mobile-legends/",
        "Origin": "https://moogold.com",
      },
      body: formData,
    });

    const data = await res.json();
    if (data.icon !== "success") {
      return NextResponse.json({ error: "Invalid ID or Server" }, { status: 400 });
    }

    const parsed: Record<string, string> = {};
    data.message.split("\n").forEach((line: string) => {
      const [key, value] = line.split(":").map(s => s.trim());
      if (key && value) parsed[key] = value;
    });

    return NextResponse.json({ nickname: parsed["In-Game Nickname"], country: parsed["Country"] });
  } catch (error) {
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}