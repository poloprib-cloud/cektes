import { RefObject } from "react";
import { Info } from "lucide-react";

interface ContactDetailsProps {
  whatsappRef: RefObject<HTMLDivElement>;
  whatsapp: string;
  setWhatsapp: (whatsapp: string) => void;
  stepNumber?: number;
  sectionId?: string;
}

export default function ContactDetails({
  whatsappRef,
  whatsapp,
  setWhatsapp,
  stepNumber,
  sectionId,
}: ContactDetailsProps) {
  const step = Number.isFinite(Number(stepNumber)) && Number(stepNumber) > 0 ? Math.floor(Number(stepNumber)) : 5;
  const resolvedSectionId = sectionId ? String(sectionId) : String(step);

  return (
    <section
      id={resolvedSectionId}
      className="relative scroll-mt-20 rounded-xl bg-background shadow-sm ring-1 ring-border md:scroll-mt-[7.5rem]"
    >
      <div className="flex items-center rounded-t-xl bg-muted px-4 py-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-my-color font-semibold text-white">
          {step}
        </div>
        <h2 className="ml-3 text-sm font-semibold text-card-foreground">Detail Kontak</h2>
      </div>

      <div className="p-4 space-y-4">
        <div ref={whatsappRef} className="space-y-1">
          <label htmlFor="whatsapp" className="block text-xs font-medium text-foreground">
            No. WhatsApp
          </label>
          <div className="flex">
            <span className="inline-flex items-center justify-center rounded-s-lg border border-border/50 bg-muted px-3 text-xs">
              <span className="flex h-4 w-6 overflow-hidden rounded-sm bg-foreground/20">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 513 342">
                  <title>ID</title>
                  <path fill="#FFF" d="M0 0h513v342H0z" />
                  <path fill="#E00" d="M0 0h513v171H0z" />
                </svg>
              </span>
            </span>
            <input
              id="whatsapp"
              type="tel"
              placeholder="628XXXXXXXX"
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value.replace(/\D/g, ""))}
              className="w-full rounded-e-lg border border-border bg-muted px-4 py-3 text-xs text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-my-color"
            />
          </div>
          <span className="text-[11px] italic text-muted-foreground">**Nomor ini akan dihubungi jika terjadi masalah</span>
        </div>

        <div className="flex items-center gap-2 w-fit rounded-md border border-border bg-muted/40 px-4 py-2 text-xs text-card-foreground">
          <Info className="h-4 w-4" />
          <span>Bukti transaksi akan dikirim ke whatsapp di atas</span>
        </div>
      </div>
    </section>
  );
}
