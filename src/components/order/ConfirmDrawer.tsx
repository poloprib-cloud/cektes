import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { XCircle } from "lucide-react";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

interface ConfirmDrawerProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  gameConfig?: any;
  nicknameError?: string | null;
  games?: any;
  productName?: string;
  productPrice?: number;
  totalPrice?: number;
  promoCode?: string | null;
  promoDiscount?: number;
  quantity?: number;
  inputs: { id?: string; server?: string };
  nickname?: string | null;
  loggedInEmail?: string | null;
  email?: string;
  whatsapp?: string;
  selectedPaymentDetails?: { images: string; name: string; fee?: number; fee_percent?: number };
  isLoading: boolean;
  submitOrder: () => void;
}

const ConfirmDrawer: React.FC<ConfirmDrawerProps> = (props) => {
  return (
    <Dialog open={props.isOpen} onOpenChange={props.onOpenChange}>
      <DialogContent className="max-w-sm rounded-lg">
        <DialogHeader>
          {props.nicknameError ? (
            <VisuallyHidden>
              <DialogTitle>Konfirmasi Pembelian</DialogTitle>
            </VisuallyHidden>
          ) : (
            <>
              <DialogTitle>Konfirmasi Pembelian</DialogTitle>
              <DialogDescription>
                Pastikan semua data sudah benar sebelum melanjutkan.
              </DialogDescription>
            </>
          )}
        </DialogHeader>
        <Content {...props} />
      </DialogContent>
    </Dialog>
  );
};

const Content = ({
  gameConfig,
  nicknameError,
  productName,
  productPrice,
  totalPrice,
  promoCode,
  promoDiscount,
  quantity,
  inputs,
  nickname,
  selectedPaymentDetails,
  isLoading,
  submitOrder,
  onOpenChange,
}: Omit<ConfirmDrawerProps, "isOpen">) => {
  const qty = Math.max(1, Math.floor(Number(quantity ?? 1) || 1));

  const unitAfterPromo = Math.max(0, Number(productPrice ?? 0));
  const discountUnit = Math.max(0, Number(promoDiscount ?? 0));
  const unitBeforePromo = Math.max(0, unitAfterPromo + (promoCode ? discountUnit : 0));

  const subtotalAfterPromo = Math.max(0, unitAfterPromo * qty);
  const discountTotal = Math.max(0, discountUnit * qty);
  const subtotalBeforePromo = Math.max(0, unitBeforePromo * qty);

  const feeFixed = Math.max(0, Number(selectedPaymentDetails?.fee ?? 0));
  const feePercent = Math.max(0, Number(selectedPaymentDetails?.fee_percent ?? 0));
  const percentFee = feePercent > 0 ? Math.floor((feePercent / 100) * subtotalAfterPromo) : 0;
  const paymentFee = feeFixed + percentFee;

  const totalComputed = subtotalAfterPromo + paymentFee;
  const total = typeof totalPrice === "number" ? Math.max(0, Number(totalPrice)) : totalComputed;

  const showPromo = Boolean(promoCode && discountUnit > 0);

  return (
    <div className="max-h-[75vh] space-y-4 overflow-y-auto pt-2 md:max-h-[80vh]">
      {nicknameError ? (
        <div className="flex flex-col items-center rounded-2xl bg-red-50 p-4 text-center shadow-sm dark:bg-red-100/10">
          <XCircle className="h-10 w-10 text-red-500" />
          <h2 className="mt-2 text-xl text-base font-semibold text-red-600">
            Transaksi Dibatalkan
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {nicknameError || "Nickname tidak ditemukan. Pastikan ID benar."}
          </p>
        </div>
      ) : (
        <>
          <div className="space-y-3 rounded-2xl border bg-muted/50 p-4 shadow-sm">
            <h4 className="text-sm font-semibold text-muted-foreground">Detail Produk</h4>

            {gameConfig?.status_validation_nickname === "yes" && (
              <div className="flex justify-between text-sm">
                <span>Nickname</span>
                <span>{nickname}</span>
              </div>
            )}

            {gameConfig?.required_inputs?.includes("id") && (
              <div className="flex justify-between text-sm">
                <span>Id</span>
                <span>{inputs.id}</span>
              </div>
            )}

            {gameConfig?.required_inputs?.includes("server") && (
              <div className="flex justify-between text-sm">
                <span>Server</span>
                <span>{inputs.server}</span>
              </div>
            )}

            <div className="flex justify-between text-sm">
              <span>Items</span>
              <span>{productName}</span>
            </div>

            <div className="flex justify-between text-sm">
              <span>Jumlah</span>
              <span>{qty}</span>
            </div>
          </div>

          <div className="space-y-3 rounded-2xl border bg-muted/50 p-4 shadow-sm">
            <h4 className="text-sm font-semibold text-muted-foreground">Detail Pembayaran</h4>

            <div className="flex justify-between text-sm">
              <span>Metode</span>
              <span>{selectedPaymentDetails?.name ?? "-"}</span>
            </div>

            {showPromo ? (
              <>
                <div className="flex justify-between text-sm">
                  <span>Harga sebelum promo</span>
                  <span>Rp {subtotalBeforePromo.toLocaleString("id-ID")}</span>
                </div>

                <div className="flex justify-between text-sm">
                  <span>Kode Promo</span>
                  <span className="font-medium">{promoCode}</span>
                </div>

                <div className="flex justify-between text-sm">
                  <span>Diskon promo</span>
                  <span>-Rp {discountTotal.toLocaleString("id-ID")}</span>
                </div>

                <div className="flex justify-between text-sm">
                  <span>Harga sesudah promo</span>
                  <span>Rp {subtotalAfterPromo.toLocaleString("id-ID")}</span>
                </div>
              </>
            ) : (
              <div className="flex justify-between text-sm">
                <span>Harga</span>
                <span>Rp {subtotalAfterPromo.toLocaleString("id-ID")}</span>
              </div>
            )}

            <div className="flex justify-between text-sm">
              <span>Payment Fee</span>
              <span>Rp {paymentFee.toLocaleString("id-ID")}</span>
            </div>

            <hr />

            <div className="flex justify-between text-sm font-semibold">
              <span>Total Bayar</span>
              <span className="text-base text-black dark:text-white">
                Rp {total.toLocaleString("id-ID")}
              </span>
            </div>
          </div>
        </>
      )}

      <div className="flex flex-col gap-2 pt-2">
        {!nicknameError && (
          <button
            className="w-full rounded-xl bg-my-color py-2.5 text-sm font-medium text-white shadow-md transition hover:bg-my-hoverColor disabled:cursor-not-allowed disabled:opacity-50"
            onClick={submitOrder}
            disabled={isLoading}
          >
            {isLoading ? "Memproses..." : "Konfirmasi Pembelian"}
          </button>
        )}

        <button
          className="w-full rounded-xl bg-muted py-2.5 text-sm font-medium text-foreground shadow-sm transition hover:bg-muted/80"
          onClick={() => onOpenChange(false)}
          disabled={isLoading}
        >
          {nicknameError ? "Tutup" : "Batal"}
        </button>
      </div>
    </div>
  );
};

export default ConfirmDrawer;