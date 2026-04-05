"use client";

import { ContentLayout } from "@/components/panel/content-layout";
import { useCallback, useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { motion } from "framer-motion";
import usePusher from "@/hooks/use-pusher";
import { InvoiceMedia, Transaction } from "@/types";

import { InvoiceHeader } from "@/components/invoice/Header";
import { InvoiceGameInfo } from "@/components/invoice/GameInfo";
import { InvoicePaymentDetails } from "@/components/invoice/PaymentDetails";
import { InvoicePaymentMethod } from "@/components/invoice/PaymentMethod";
import { InvoiceCountdown } from "@/components/invoice/Countdown";
import { InvoicePaymentInstructions } from "@/components/invoice/PaymentInstructions";
import { InvoiceReviewPayload, ReviewSection } from "@/components/invoice/ReviewSection";

import animationWaitingPayment from "@/data/lottie/payment-waiting.json";
import animationBuyProcess from "@/data/lottie/buy-process.json";
import animationBuySuccess from "@/data/lottie/buy-success.json";
import animationFailed from "@/data/lottie/failed.json";

export default function InvoicePage() {
  const { orderId } = useParams();
  const orderIdValue = Array.isArray(orderId) ? orderId[0] : orderId;

  const safeOrderId = (() => {
    const raw = typeof orderIdValue === "string" ? orderIdValue : "";
    if (!raw) return "";
    try {
      return decodeURIComponent(raw).trim();
    } catch {
      return raw.trim();
    }
  })();

  const [game, setGame] = useState<InvoiceMedia | null>(null);
  const [product, setProduct] = useState<InvoiceMedia | null>(null);
  const [order, setOrder] = useState<Transaction | null>(null);
  const [review, setReview] = useState<InvoiceReviewPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });
  const transactions = usePusher();
  const lastNotifiedPaymentStatusRef = useRef<string | null>(null);

  const loadInvoice = useCallback(
    async (opts?: { silent?: boolean }) => {
      if (!safeOrderId) return;

      if (!opts?.silent) {
        setLoading(true);
      }

      try {
        const res = await fetch(`/api/order/${encodeURIComponent(safeOrderId)}`, { cache: "no-store" });
        const data = await res.json().catch(() => ({} as any));

        if (!res.ok || !data?.success) {
          const msg = data?.message || `Gagal memuat invoice (HTTP ${res.status}).`;
          if (!opts?.silent) toast.error(msg);
          setOrder(null);
          setGame(null);
          setProduct(null);
          return;
        }

        setOrder(data.order || null);
        setGame(data.game || null);
        setProduct(data.product || null);
      } catch (error) {
        if (!opts?.silent) toast.error("Gagal memuat invoice.");
        setOrder(null);
        setGame(null);
        setProduct(null);
      } finally {
        if (!opts?.silent) {
          setLoading(false);
        }
      }
    },
    [safeOrderId]
  );

  const loadReview = useCallback(async () => {
    if (!safeOrderId) return;

    try {
      const res = await fetch(`/api/order/${encodeURIComponent(safeOrderId)}/review`, { cache: "no-store" });
      const json = await res.json().catch(() => ({} as any));

      if (!res.ok || !json?.success) {
        setReview(null);
        return;
      }

      setReview(json?.review ?? null);
    } catch {
      setReview(null);
    }
  }, [safeOrderId]);

  useEffect(() => {
    if (!safeOrderId) return;
    loadInvoice();
  }, [safeOrderId, loadInvoice]);

  useEffect(() => {
    if (!safeOrderId) return;
    if (!order) return;

    if (order.buy_status !== "Sukses") {
      setReview(null);
      return;
    }

    loadReview();
  }, [safeOrderId, order, loadReview]);

  useEffect(() => {
    if (!order?.order_id || transactions.length === 0) return;

    const updatedTransaction = transactions.find((t) => t.order_id === order.order_id);

    if (updatedTransaction) {
      const { payment_status, buy_status } = updatedTransaction;
      if (payment_status !== order.payment_status || buy_status !== order.buy_status) {
        setOrder((prev: Transaction | null) => {
          if (!prev) return null;
          return {
            ...prev,
            payment_status,
            buy_status,
          };
        });
      }
    }
  }, [transactions, order]);

  useEffect(() => {
    if (!order?.expired_time) return;

    const calculateTimeLeft = () => {
      const now = Math.floor(Date.now() / 1000);
      const difference = order.expired_time - now;

      if (difference <= 0) {
        return { hours: 0, minutes: 0, seconds: 0 };
      }

      return {
        hours: Math.floor(difference / 3600),
        minutes: Math.floor((difference % 3600) / 60),
        seconds: difference % 60,
      };
    };

    setTimeLeft(calculateTimeLeft());
    const interval = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(interval);
  }, [order]);

  useEffect(() => {
    if (!safeOrderId) return;
    if (!order) return;

    const isQrispy = String(order.payment_method || "").toUpperCase() === "QRISPY";
    const isDompetX = Boolean(order.dompetx_transaction_id);
    if (!isQrispy && !isDompetX) return;
    if (order.payment_status !== "UNPAID") return;

    let cancelled = false;
    let interval: ReturnType<typeof setInterval> | null = null;

    const check = async () => {
      if (cancelled) return;

      try {
        const res = await fetch(`/api/order/${encodeURIComponent(safeOrderId)}/payment-status`, { cache: "no-store" });
        const json = await res.json().catch(() => null);

        if (!res.ok || !json?.success) {
          return;
        }

        const data = json?.data ?? json;
        const nextPaymentStatus = String(data?.payment_status ?? order.payment_status);
        const nextBuyStatus = String(data?.buy_status ?? order.buy_status);

        if (nextPaymentStatus !== order.payment_status || nextBuyStatus !== order.buy_status) {
          setOrder((prev) => {
            if (!prev) return prev;
            return {
              ...prev,
              payment_status: nextPaymentStatus,
              buy_status: nextBuyStatus,
            };
          });
        }

        if (nextPaymentStatus !== "UNPAID" && lastNotifiedPaymentStatusRef.current !== nextPaymentStatus) {
          lastNotifiedPaymentStatusRef.current = nextPaymentStatus;

          if (nextPaymentStatus === "PAID") {
            toast.success("Pembayaran berhasil diterima.");
            await loadInvoice({ silent: true });
          } else if (nextPaymentStatus === "EXPIRED") {
            toast.error("Pembayaran kadaluarsa.");
            await loadInvoice({ silent: true });
          } else if (nextPaymentStatus === "FAILED") {
            toast.error("Pembayaran gagal.");
            await loadInvoice({ silent: true });
          }
        }
      } catch {
        return;
      }
    };

    check();
    interval = setInterval(check, 8000);

    return () => {
      cancelled = true;
      if (interval) clearInterval(interval);
    };
  }, [safeOrderId, order, loadInvoice]);

  const getPayStatusMessage = () => {
    if (!order) return "Pesanan tidak ditemukan.";

    switch (order.payment_status) {
      case "UNPAID":
        return "Menunggu Pembayaran";
      case "PAID":
        return "Pembayaran Berhasil";
      case "EXPIRED":
        return "Pembayaran Kadaluarsa";
      case "FAILED":
        return "Pembayaran Gagal";
      default:
        return "Status Pembayaran Tidak Diketahui.";
    }
  };

  const getBuyStatusMessage = () => {
    if (!order) return "Pesanan tidak ditemukan.";

    if (order.payment_status === "UNPAID") {
      return "Silakan lakukan pembayaran dengan metode yang kamu pilih.";
    }

    switch (order.buy_status) {
      case "Proses":
        return "Pembelian sedang dalam proses.";
      case "Sukses":
        return "Transaksi telah berhasil dilakukan.";
      case "Gagal":
        return "Pembelian gagal, hubungi layanan pelanggan.";
      case "Batal":
        return "Batas waktu pembayaran telah berakhir. Silakan lakukan pembelian ulang.";
      default:
        return "Status Pesanan Tidak Diketahui.";
    }
  };

  const getLottieAnimation = () => {
    if (!order) return animationWaitingPayment;

    if (order.payment_status === "UNPAID") return animationWaitingPayment;
    if (["EXPIRED", "FAILED"].includes(order.payment_status)) return animationFailed;
    if (order.buy_status === "Proses") return animationBuyProcess;
    if (order.buy_status === "Sukses") return animationBuySuccess;
    if (["Batal", "Gagal"].includes(order.buy_status)) return animationFailed;

    return animationWaitingPayment;
  };

  const getBackgroundColor = () => {
    if (!order) return "bg-gray-500";
    switch (order.buy_status) {
      case "Pending":
        return "bg-yellow-500";
      case "Proses":
        return "bg-blue-500";
      case "Sukses":
        return "bg-green-500";
      case "Gagal":
      case "Batal":
        return "bg-red-600";
      default:
        return "bg-gray-500";
    }
  };

  const getBackgroundBuyStatusColor = () => {
    if (!order) return "bg-muted";
    switch (order.buy_status) {
      case "Pending":
        return "bg-yellow-100 text-yellow-800";
      case "Proses":
        return "bg-blue-100 text-blue-800";
      case "Sukses":
        return "bg-green-100 text-green-800";
      case "Gagal":
      case "Batal":
        return "bg-red-100 text-red-800";
      default:
        return "bg-muted";
    }
  };

  const getBackgroundPayStatusColor = () => {
    if (!order) return "bg-muted";
    switch (order.payment_status) {
      case "UNPAID":
        return "bg-yellow-100 text-yellow-800";
      case "EXPIRED":
      case "FAILED":
        return "bg-red-100 text-red-800";
      case "PAID":
        return "bg-green-100 text-green-800";
      default:
        return "bg-muted";
    }
  };

  const handleCopyPayCode = () => {
    const paymentValue = (order?.qr_string ?? order?.payment_code ?? "").toString();
    navigator.clipboard.writeText(paymentValue);
    toast.success((order?.qr_string ? "QR string" : "Kode pembayaran") + " berhasil disalin!");
  };

  const handleCopyOrderId = () => {
    navigator.clipboard.writeText(order?.order_id ?? "");
    toast.success("Nomor Invoice berhasil disalin!");
  };

  const handleCopySn = () => {
    navigator.clipboard.writeText((order?.serial_number ?? "").toString());
    toast.success("SN berhasil disalin!");
  };

  if (loading) {
    return (
      <ContentLayout title="Invoices">
        <div className="w-full h-[80vh] flex justify-center items-center">
          <LoadingSpinner size={40} />
        </div>
      </ContentLayout>
    );
  }

  if (!order) {
    return (
      <ContentLayout title="Invoices">
        <p className="text-red-500 text-lg font-semibold">Invoice tidak ditemukan.</p>
      </ContentLayout>
    );
  }

  const identifier = ((order as any)?.whatsapp ?? (order as any)?.email ?? null) as string | null;

  return (
    <ContentLayout title="Invoices">
      <main className="relative">
        <InvoiceHeader
          order={order}
          getLottieAnimation={getLottieAnimation}
          getPayStatusMessage={getPayStatusMessage}
          getBuyStatusMessage={getBuyStatusMessage}
          getBackgroundColor={getBackgroundColor}
        />

        <div className="mt-8 space-y-4 lg:mt-12 lg:space-y-12">
          <div className="flex w-full flex-col gap-4">
            {order.payment_status === "UNPAID" ? (
              <InvoiceCountdown timeLeft={timeLeft} />
            ) : (
              <div className="mt-4">
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                >
                  {new Date(order.created_at).toLocaleString()}
                </motion.p>
              </div>
            )}

            <div className="grid grid-cols-12 gap-y-8 md:gap-8">
              <div className="col-span-12 sm:col-span-8 md:col-span-6 space-y-4">
                <InvoiceGameInfo order={order} game={game} product={product} />
                <InvoicePaymentDetails order={order} />
              </div>

              <div className="col-span-12 sm:col-span-6">
                <InvoicePaymentMethod
                  order={order}
                  handleCopyPayCode={handleCopyPayCode}
                  handleCopyOrderId={handleCopyOrderId}
                  handleCopySn={handleCopySn}
                  getBackgroundPayStatusColor={getBackgroundPayStatusColor}
                  getBackgroundBuyStatusColor={getBackgroundBuyStatusColor}
                  getBuyStatusMessage={getBuyStatusMessage}
                />
              </div>

              {order.payment_status === "UNPAID" && <InvoicePaymentInstructions order={order} />}
            </div>

            {order.buy_status === "Sukses" && safeOrderId !== "" && (
              <ReviewSection
                orderId={safeOrderId}
                canReview={true}
                identifier={identifier}
                initialReview={review}
                onSaved={(next) => setReview(next)}
              />
            )}
          </div>
        </div>
      </main>
    </ContentLayout>
  );
}