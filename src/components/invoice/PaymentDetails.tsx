import { Transaction } from "@/types";

interface InvoicePaymentDetailsProps {
  order: Transaction;
}

const money = (value: unknown) => {
  const numeric = Number(value ?? 0);
  if (!Number.isFinite(numeric)) {
    return 0;
  }

  return Math.max(0, Math.floor(numeric));
};

export function InvoicePaymentDetails({ order }: InvoicePaymentDetailsProps) {
  const pricing = order.pricing ?? null;

  const quantity = Math.max(1, Math.floor(Number(pricing?.quantity ?? order.quantity ?? 1) || 1));
  const promoCode = String(pricing?.promo_code ?? order.promo_code ?? "").trim();
  const promoDiscountTotal = money(pricing?.promo_discount ?? order.promo_discount ?? 0);
  const unitPriceBeforePromo = money(pricing?.unit_price_before_promo ?? order.discount_price ?? order.price ?? 0);
  const unitPriceAfterPromo = money(pricing?.unit_price_after_promo ?? order.price ?? 0);
  const subtotalBeforePromo = money(pricing?.subtotal_before_promo ?? unitPriceBeforePromo * quantity);
  const subtotalAfterPromo = money(pricing?.subtotal_after_promo ?? unitPriceAfterPromo * quantity);
  const fee = money(pricing?.payment_fee ?? order.fee ?? 0);
  const total = money(pricing?.total_price ?? order.total_price ?? 0);
  const uniqueCode = money(pricing?.unique_code ?? 0);

  const paymentMethod = String(order.payment_method ?? "");
  const isSmp = paymentMethod.toUpperCase().startsWith("SMP");
  const hasPromo = Boolean((pricing?.has_promo ?? false) || (promoCode !== "" && promoDiscountTotal > 0));
  const showUniqueCode = isSmp && uniqueCode > 0;

  return (
    <div className="space-y-4 rounded-xl border border-border bg-muted/50 p-4 text-sm">
      <div className="space-y-3">
        <div className="flex justify-between gap-4">
          <span className="font-medium text-foreground">Jumlah</span>
          <span className="text-muted-foreground">{quantity}</span>
        </div>

        <div className="flex justify-between gap-4">
          <span className="font-medium text-foreground">Harga Satuan</span>
          <span className="text-muted-foreground">Rp {unitPriceAfterPromo.toLocaleString("id-ID")}</span>
        </div>

        {hasPromo ? (
          <>
            <div className="flex justify-between gap-4">
              <span className="font-medium text-foreground">Subtotal Sebelum Promo</span>
              <span className="text-muted-foreground">Rp {subtotalBeforePromo.toLocaleString("id-ID")}</span>
            </div>

            <div className="flex justify-between gap-4">
              <span className="font-medium text-foreground">Kode Promo</span>
              <span className="font-medium text-muted-foreground">{promoCode}</span>
            </div>

            <div className="flex justify-between gap-4">
              <span className="font-medium text-foreground">Diskon Promo</span>
              <span className="text-muted-foreground">-Rp {promoDiscountTotal.toLocaleString("id-ID")}</span>
            </div>

            <div className="flex justify-between gap-4">
              <span className="font-medium text-foreground">Subtotal Setelah Promo</span>
              <span className="text-muted-foreground">Rp {subtotalAfterPromo.toLocaleString("id-ID")}</span>
            </div>
          </>
        ) : (
          <div className="flex justify-between gap-4">
            <span className="font-medium text-foreground">Subtotal</span>
            <span className="text-muted-foreground">Rp {subtotalAfterPromo.toLocaleString("id-ID")}</span>
          </div>
        )}

        <div className="flex justify-between gap-4">
          <span className="font-medium text-foreground">Payment Fee</span>
          <span className="text-muted-foreground">Rp {fee.toLocaleString("id-ID")}</span>
        </div>

        {showUniqueCode ? (
          <div className="flex justify-between gap-4">
            <span className="font-medium text-foreground">Kode Unik Pembayaran</span>
            <span className="font-semibold text-my-color">{uniqueCode.toLocaleString("id-ID")}</span>
          </div>
        ) : null}
      </div>

      <div className="flex items-center justify-between border-t border-border pt-3">
        <span className="font-semibold text-foreground">Total Pembayaran</span>
        <span className="text-base font-bold text-primary">Rp {total.toLocaleString("id-ID")}</span>
      </div>
    </div>
  );
}