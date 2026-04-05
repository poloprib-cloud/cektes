import { Transaction } from "@/types";

interface PaymentInstruction {
  title: string;
  steps: string[];
}

interface InvoicePaymentInstructionsProps {
  order: Transaction;
}

const buildSmpQrisInstructions = (): PaymentInstruction[] => [
  {
    title: "Petunjuk Pembayaran QRIS",
    steps: [
      "Masuk ke aplikasi dompet digital / mobile banking yang mendukung QRIS",
      "Pilih menu Scan QR / QRIS",
      "Pindai QR Code yang tersedia pada halaman ini",
      "Pastikan detail transaksi sudah sesuai (nama merchant & nominal)",
      "Selesaikan pembayaran sampai berhasil",
      "Transaksi selesai. Simpan bukti pembayaran Anda",
    ],
  },
];

const isSmpQrisOrder = (order: any) => {
  const v = String(
    order?.payment_method ||
      order?.payment_name ||
      order?.payment_channel ||
      order?.payment_provider ||
      ""
  ).toLowerCase();
  return v.includes("smpqris") || v.includes("smp qris") || v.includes("qris");
};

export function InvoicePaymentInstructions({
  order,
}: InvoicePaymentInstructionsProps) {
  const fallback =
    !order.payment_instructions?.length && isSmpQrisOrder(order)
      ? buildSmpQrisInstructions()
      : [];

  const instructions = (order.payment_instructions?.length
    ? order.payment_instructions
    : fallback) as PaymentInstruction[];

  if (!instructions.length) return null;

  return (
    <div className="col-span-12">
      <div className="flex flex-col gap-2">
        <div className="mt-2 rounded-lg border border-border/25 bg-secondary/50 p-4 text-sm">
          <h2 className="pb-5 text-sm font-bold">Instruksi Pembayaran</h2>
          {instructions.map((instruction, index) => (
            <div key={index} className="mb-4">
              <h3 className="font-semibold">{instruction.title}</h3>
              <ol className="list-decimal pl-5">
                {instruction.steps.map((step, i) => (
                  <li
                    key={i}
                    className="mt-1"
                    dangerouslySetInnerHTML={{ __html: step }}
                  />
                ))}
              </ol>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}