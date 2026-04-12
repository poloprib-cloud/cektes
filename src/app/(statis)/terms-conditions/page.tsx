"use client";

import { ContentLayout } from "@/components/panel/content-layout";

export default function TermsConditions() {
  return (
    <ContentLayout title="Syarat & Ketentuan">
      <div className="min-h-screen py-5">
        <div className="max-w-4xl mx-auto">
          <div className="bg-muted p-8 rounded-2xl shadow-md space-y-8 border">
            <div className="space-y-2 border-b pb-4">
              <h1 className="text-3xl font-bold text-primary">Syarat & Ketentuan</h1>
              <p className="text-sm text-muted-foreground">
                Terakhir diperbarui: 12 April 2026
              </p>
            </div>

            <div className="space-y-6 text-foreground/90">
              <section className="space-y-3">
                <h3 className="text-xl font-bold text-primary">1. UMUM</h3>
                <p className="text-sm leading-relaxed">
                  Ketentuan Penggunaan ini mengatur tentang pemanfaatan seluruh layanan yang tersedia di sistem KALLPOLOSTORE 
                  dan berlaku bagi semua Pengguna serta pihak manapun yang mengajukan permintaan atau memberikan informasi 
                  kepada KALLPOLOSTORE.
                </p>
                <p className="text-sm leading-relaxed">
                  Ketentuan ini merupakan perjanjian yang mengikat secara hukum antara Pengguna dan KALLPOLOSTORE ketika 
                  Pengguna memanfaatkan sistem maupun layanan pada KALLPOLOSTORE.
                </p>
              </section>

              <section className="space-y-3">
                <h3 className="text-xl font-bold text-primary">2. DEFINISI</h3>
                <ul className="list-disc list-inside text-sm space-y-2 ml-2">
                  <li><strong>KALLPOLOSTORE</strong> adalah platform penyedia layanan top up voucher game online.</li>
                  <li><strong>Layanan KALLPOLOSTORE</strong> adalah keseluruhan hal yang didalamnya terdapat hubungan timbal balik antara Pengguna dengan KALLPOLOSTORE.</li>
                  <li><strong>Partner Pembayaran</strong> adalah penyedia jasa pembayaran yang bekerja sama dengan KALLPOLOSTORE (Tripay).</li>
                </ul>
              </section>

              <section className="space-y-3">
                <h3 className="text-xl font-bold text-primary">3. TRANSAKSI</h3>
                <p className="text-sm leading-relaxed">
                  Pengguna wajib mengisi data pribadi secara benar, jujur, dan sesuai dengan identitas pribadi saat menggunakan 
                  sistem pada KALLPOLOSTORE. Kesalahan input data (seperti ID Game) sepenuhnya merupakan tanggung jawab Pengguna.
                </p>
              </section>

              <section className="space-y-3">
                <h3 className="text-xl font-bold text-primary">4. PENGEMBALIAN DANA (REFUND)</h3>
                <p className="text-sm leading-relaxed">
                  Pengguna sepakat dan mengakui bahwa KALLPOLOSTORE berhak sepenuhnya untuk tidak memberikan pengembalian dana 
                  (non-refundable). Semua transaksi yang telah berhasil diproses bersifat final.
                </p>
              </section>

              <div className="pt-6 border-t">
                <div className="bg-background/50 p-4 rounded-xl border border-dashed">
                  <h4 className="font-bold mb-1">Hubungi Kami</h4>
                  <p className="text-sm">WhatsApp: +6281310165338</p>
                  <p className="text-sm">Email: cs@kallpolostore.id</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ContentLayout>
  );
}
