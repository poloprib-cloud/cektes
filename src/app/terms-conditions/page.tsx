"use client";

import { ContentLayout } from "@/components/panel/content-layout";

export default function TermsConditionsPage() {
  return (
    <ContentLayout title="Syarat & Ketentuan">
      <div className="rounded-xl border border-border bg-card p-6 lg:p-10 space-y-6 text-foreground/90">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-primary">Syarat & Ketentuan</h1>
          <p className="text-sm text-muted-foreground">Terakhir diperbarui: 12 April 2026</p>
        </div>
        
        <hr className="border-border" />

        <section className="space-y-4">
          <h3 className="text-xl font-semibold text-primary">1. UMUM</h3>
          <p className="text-sm leading-relaxed">
            Ketentuan Penggunaan ini mengatur tentang pemanfaatan seluruh layanan yang tersedia di sistem KALLPOLOSTORE 
            dan berlaku bagi semua Pengguna. Ketentuan ini merupakan perjanjian yang mengikat secara hukum antara 
            Pengguna dan KALLPOLOSTORE.
          </p>
          <p className="text-sm leading-relaxed">
            Ketentuan Penggunaan ini bisa kami ubah, modifikasi, tambahkan, atau hapus kapan saja sejalan dengan 
            perkembangan KALLPOLOSTORE dan peraturan perundang-undangan yang berlaku.
          </p>
        </section>

        <section className="space-y-4">
          <h3 className="text-xl font-semibold text-primary">2. DEFINISI</h3>
          <ul className="list-disc list-inside text-sm space-y-2">
            <li><strong>KALLPOLOSTORE</strong> adalah platform penyedia layanan top up voucher game online.</li>
            <li><strong>Layanan KALLPOLOSTORE</strong> adalah keseluruhan hubungan timbal balik antara Pengguna dengan KALLPOLOSTORE.</li>
            <li><strong>Partner Pembayaran</strong> adalah penyedia jasa pembayaran yang bekerja sama (Tripay).</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h3 className="text-xl font-semibold text-primary">3. TRANSAKSI & PEMBAYARAN</h3>
          <p className="text-sm leading-relaxed">
            Pengguna wajib mengisi data pribadi (ID Game) secara benar. KALLPOLOSTORE tidak bertanggung jawab atas 
            kesalahan input yang dilakukan oleh Pengguna. Semua transaksi bersifat final dan non-refundable.
          </p>
        </section>

        <div className="mt-8 p-6 rounded-lg bg-muted/50 border border-border">
          <h3 className="text-lg font-bold mb-2">HUBUNGI KAMI</h3>
          <p className="text-sm">WhatsApp: +6281310165338</p>
          <p className="text-sm">Email: cs@kallpolostore.id</p>
        </div>
      </div>
    </ContentLayout>
  );
}
