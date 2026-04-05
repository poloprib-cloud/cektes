import { Transaction } from "@/types";

interface InvoiceStatusProps {
  order: Transaction | null;
  getBackgroundPayStatusColor: () => string;
  getBackgroundBuyStatusColor: () => string;
}

export function InvoiceStatus({
  order,
  getBackgroundPayStatusColor,
  getBackgroundBuyStatusColor
}: InvoiceStatusProps) {
  if (!order) return null;

  return (
    <div className="flex flex-col md:flex-row md:items-center gap-2">
      <span className="md:w-1/3 text-muted-foreground">Status Pembayaran</span>
      <span className={`inline-flex rounded-md px-2 py-1 text-xs font-semibold uppercase w-fit ${getBackgroundPayStatusColor()}`}>
        {order.payment_status}
      </span>
      <span className="md:w-1/3 text-muted-foreground">Status Transaksi</span>
      <span className={`inline-flex rounded-md px-2 py-1 text-xs font-semibold uppercase w-fit ${getBackgroundBuyStatusColor()}`}>
        {order.buy_status}
      </span>
    </div>
  );
}