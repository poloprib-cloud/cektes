import Link from "next/link";
import { useSettings } from "@/context/settings-context";
import Image from "next/image";
import { Skeleton } from "@/components/ui/skeleton";
import { Facebook, Instagram } from "lucide-react";

export function Footer() {
  interface Settings {
    data: {
      ["general.logo"]?: string;
      ["general.title"]?: string;
      ["seo.description"]?: string;
      ["sosmed.fb"]?: string;
      ["sosmed.ig"]?: string;
      ["footer.credit_text"]?: string;
      ["footer.extra_section.title"]?: string;
      ["footer.extra_section.links"]?: Array<{ label?: string; url?: string }>;
    };
  }

  const settings = useSettings() as unknown as Settings | null;

  const logoUrl = settings?.data?.["general.logo"];
  const logoTitle = settings?.data?.["general.title"];

  const creditText = settings?.data?.["footer.credit_text"] || "Made With ❤️ by Kallpolostore";

  const extraTitle = settings?.data?.["footer.extra_section.title"] || "";
  const rawLinks = settings?.data?.["footer.extra_section.links"];
  const extraLinks = Array.isArray(rawLinks)
    ? rawLinks
        .map((x) => ({
          label: (x?.label || "").trim(),
          url: (x?.url || "").trim(),
        }))
        .filter((x) => x.label && x.url)
    : [];

  const isExternal = (url: string) => /^https?:\/\//i.test(url);

  return (
    <footer className="bg-secondary print:hidden text-secondary-foreground mt-16">
      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-6">
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2">
              {logoUrl ? (
                <Image src={logoUrl} alt={logoTitle || "logo"} width={120} height={40} priority className="h-10 w-32" />
              ) : (
                <Skeleton className="h-8 w-32" />
              )}
            </Link>
            <p className="text-sm leading-relaxed opacity-80">
              {settings?.data?.["seo.description"] || "Penyedia layanan top up game & voucher terbaik."}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold">Menu</h3>
              <ul className="mt-3 space-y-2 text-sm opacity-80">
                <li>
                  <Link href="/">Beranda</Link>
                </li>
                <li>
                  <Link href="/invoices">Cek Transaksi</Link>
                </li>
                <li>
                  <Link href="/price-list">Daftar Harga</Link>
                </li>
                <li>
                  <Link href="/artikel">Artikel</Link>
                </li>
                <li>
                  <Link href="/ulasan-produk">Ulasan Produk</Link>
                </li>
                <li>
                  <Link href="/contact">Hubungi Kami</Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold">Ikuti Kami</h3>
              <div className="mt-3 flex space-x-4">
                <Link href={settings?.data?.["sosmed.fb"] || "https://m.facebook.com/"} target="_blank" rel="noreferrer">
                  <Facebook />
                </Link>
                <Link href={settings?.data?.["sosmed.ig"] || "https://instagram.com/"} target="_blank" rel="noreferrer">
                  <Instagram />
                </Link>
              </div>
            </div>
          </div>

          {extraLinks.length > 0 && (
            <div>
              <h3 className="font-semibold">{extraTitle || "Lainnya"}</h3>
              <ul className="mt-3 space-y-2 text-sm opacity-80">
                {extraLinks.map((item, idx) => (
                  <li key={`${item.url}-${idx}`}>
                    <Link
                      href={item.url}
                      target={isExternal(item.url) ? "_blank" : undefined}
                      rel={isExternal(item.url) ? "noreferrer" : undefined}
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="border-t border-white/20 my-6" />

        <div className="flex flex-col md:flex-row justify-between items-center text-xs opacity-70">
          <p>
            © {new Date().getFullYear()} {settings?.data?.["general.title"] || "Penyedia layanan top up game & voucher terbaik."}. All rights reserved.
          </p>
          <p>{creditText}.</p>
        </div>
      </div>
    </footer>
  );
}
