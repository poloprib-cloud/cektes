export async function getSettings() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  const url = siteUrl ? `${siteUrl}/api/settings` : "/api/settings";

  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error("Gagal mengambil data settings");

  const json = await res.json();
  return json?.data;
}