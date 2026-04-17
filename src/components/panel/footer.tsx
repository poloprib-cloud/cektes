import Link from "next/link";
import { useSettings } from "@/context/settings-context";
import Image from "next/image";
import { Skeleton } from "@/components/ui/skeleton";
import { Facebook, Instagram } from "lucide-react";

export function Footer() {
  const settings = useSettings() as any;
  const data = settings?.data || {};

  const logoUrl = data["general.logo"];
  const logoTitle = data["general.title"];
  const creditText = data["footer.credit_text"] || "Made With ❤️ by Kallpolostore";
  const extraTitle = data["footer.extra_section.title"] || "Sitemap";
  
  const rawLinks = data["footer.extra_section.links"];
  const extraLinks = Array.isArray(rawLinks)
    ? rawLinks
        .map((x: any) => ({
          label: (x?.label || "").trim(),
          url: (x?.url || "").trim(),
        }))
        .filter((x: any) => x.label !== "" && x.url !== "")
    : [];

  return (
    <footer className="bg-secondary print:hidden text-secondary-foreground mt-16">
      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-6">
          
          {/* KOLOM 1: LOGO */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2">
              {logoUrl ? (
                <Image src={logoUrl} alt={logoTitle || "logo"} width={120} height={40} priority className="h-10 w-32" />
              ) : (
                <Skeleton className="h-8 w-32" />
              )}
            </Link>
            <p className="text-sm leading-relaxed opacity-80">
              {data["seo.description"] || "Penyedia layanan top up game & voucher terbaik."}
            </p>
          </div>

          {/* KOLOM 2: MENU & SOSMED */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold">Menu</h3>
              <ul className="mt-3 space-y-2 text-sm opacity-80">
                <li><Link href="/">Beranda</Link></li>
                <li><Link href="/invoices">Cek Transaksi</Link></li>
                <li><Link href="/price-list">Daftar Harga</Link></li>
                <li><Link href="/artikel">Artikel</Link></li>
                <li><Link href="/contact">Hubungi Kami</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold">Ikuti Kami</h3>
              <div className="mt-3 flex space-x-4">
                <Link 
                  href={`https://facebook.com/${data["sosmed.fb"] || ""}`} 
                  target="_blank" 
                  rel="noreferrer"
                >
                  <Facebook className="w-5 h-5" />
                </Link>
                <Link 
                  href={`https://instagram.com/${data["sosmed.ig"] || ""}`} 
                  target="_blank" 
                  rel="noreferrer"
                >
                  <Instagram className="w-5 h-5" />
                </Link>
              </div>
            </div>
          </div>

          {/* KOLOM 3: EXTRA LINKS */}
          {extraLinks.length > 0 && (
            <div>
              <h3 className="font-semibold">{extraTitle}</h3>
              <ul className="mt-3 space-y-2 text-sm opacity-80">
                {extraLinks.map((item: any, idx: number) => (
                  <li key={idx}>
                    <Link 
                      href={item.url} 
                      target={item.url.startsWith("http") ? "_blank" : undefined}
                      rel="noreferrer"
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
          <p>© {new Date().getFullYear()} {logoTitle || "Kallpolo Store"}. All rights reserved.</p>
          <p>{creditText}</p>
        </div>
      </div>
    </footer>
  );
}
