"use client";

import { useSession } from "next-auth/react";
import { useSearchParams, useRouter, useParams } from "next/navigation";
import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { ContentLayout } from "@/components/panel/content-layout";
import { toast } from "sonner";
import { Product, PaymentMethod } from "@/types";

import GameHeader from "@/components/order/GameHeader";
import GameDescription from "@/components/order/GameDescription";
import ProductSelection from "@/components/order/ProductSelection";
import InputSelection from "@/components/order/InputSelection";
import QuantitySelection from "@/components/order/QuantitySelection";
import PaymentSelection from "@/components/order/PaymentSelection";
import PromoCodeSection from "@/components/order/PromoCodeSection";
import ContactDetails from "@/components/order/ContactDetails";
import GuideDrawer from "@/components/order/GuideDrawer";
import ConfirmDrawer from "@/components/order/ConfirmDrawer";
import OrderSummaryDekstop from "@/components/order/OrderSummaryDekstop";
import OrderSummaryMobile from "@/components/order/OrderSummaryMobile";

const num = (v: any) => {
  const n = Number(v ?? 0);
  return Number.isFinite(n) ? n : 0;
};
const money = (v: any) => Math.max(0, Math.floor(num(v)));

export default function OrderPage() {
  const params = useParams();
  const slugRaw = (params as any)?.slug;
  const slug = Array.isArray(slugRaw) ? String(slugRaw[0] ?? "") : String(slugRaw ?? "");

  const { data: session } = useSession();
  const role = session?.user?.role;
  const token = session?.user?.token;
  const loggedInEmail = session?.user?.email;

  const isAdmin = useMemo(() => {
    if (!session?.user) return false;
    return String(role ?? "").toLowerCase() === "admin";
  }, [session, role]);

  const stepOffset = isAdmin ? 1 : 0;

  const router = useRouter();
  const searchParams = useSearchParams();
  const productId = searchParams.get("product_id");

  const [cfg, setCfg] = useState<any>(null);
  const [cfgLoading, setCfgLoading] = useState(false);
  const [cfgError, setCfgError] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);

  const [inputs, setInputs] = useState({ id: "", server: "" });
  const [email, setEmail] = useState("");
  const [whatsapp, setWhatsapp] = useState("");

  const [quantity, setQuantity] = useState(1);

  const effectiveQuantity = useMemo(() => {
    if (!isAdmin) return 1;
    const q = Math.floor(Number(quantity) || 1);
    return Math.max(1, Math.min(50, q));
  }, [isAdmin, quantity]);

  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
  const [selectedProductDetails, setSelectedProductDetails] = useState<any>(null);

  const [selectedPayment, setSelectedPayment] = useState<string | null>(null);
  const [selectedPaymentDetails, setSelectedPaymentDetails] = useState<any>(null);

  const [promoCode, setPromoCode] = useState<string | null>(null);
  const [promoDiscount, setPromoDiscount] = useState<number>(0);
  const [promoFinalPrice, setPromoFinalPrice] = useState<number | null>(null);

  const [nickname, setNickname] = useState<string | null>(null);
  const [nicknameError, setNicknameError] = useState<string | null>(null);

  const productRef = useRef<HTMLDivElement>(null);
  const idRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef(inputs);
  const serverRef = useRef<HTMLDivElement>(null);
  const paymentRef = useRef<HTMLDivElement>(null);
  const whatsappRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!slug) return;

    let alive = true;
    setCfgLoading(true);
    setCfgError(null);

    fetch(`/api/order-config/${encodeURIComponent(slug)}`, {
      method: "GET",
      headers: { Accept: "application/json" },
      cache: "no-store",
    })
      .then(async (res) => {
        const ct = (res.headers.get("content-type") || "").toLowerCase();
        const isJson = ct.includes("application/json");
        const data = isJson ? await res.json().catch(() => ({})) : null;

        if (!res.ok) {
          const msg = data?.message || `Gagal mengambil data. Status: ${res.status}`;
          throw new Error(msg);
        }

        if (!isJson) {
          throw new Error("Response tidak valid (bukan JSON). Pastikan route /api/order-config berjalan.");
        }

        return data;
      })
      .then((data) => {
        if (!alive) return;
        setCfg(data);
      })
      .catch((e: any) => {
        if (!alive) return;
        setCfgError(String(e?.message || e));
        setCfg(null);
      })
      .finally(() => {
        if (!alive) return;
        setCfgLoading(false);
      });

    return () => {
      alive = false;
    };
  }, [slug]);

  const games = useMemo(() => {
    return cfg?.game ?? null;
  }, [cfg]);

  const products = useMemo<Product[]>(() => {
    if (Array.isArray(cfg?.products)) return cfg.products;
    if (Array.isArray(cfg?.game?.products)) return cfg.game.products;
    return [];
  }, [cfg]);

  const paymentMethods = useMemo<PaymentMethod[]>(() => {
    if (Array.isArray(cfg?.paymentMethod)) return cfg.paymentMethod;
    if (Array.isArray(cfg?.paymentMethods)) return cfg.paymentMethods;
    return [];
  }, [cfg]);

  const gameConfig = useMemo(() => {
    return cfg?.gameConfiguration ?? cfg?.game_configuration ?? null;
  }, [cfg]);

  const guideImagePath = useMemo(() => {
    const value = gameConfig?.guide_image;

    if (typeof value === "string" && value.trim() !== "") {
      return value;
    }

    if (Array.isArray(value)) {
      const first = value.find((item) => typeof item === "string" && item.trim() !== "");
      return typeof first === "string" ? first : undefined;
    }

    return undefined;
  }, [gameConfig]);

  const clearPromo = useCallback(() => {
    setPromoCode(null);
    setPromoDiscount(0);
    setPromoFinalPrice(null);
  }, []);

  useEffect(() => {
    if (productId && products.length > 0) {
      const p = products.find((x) => String(x.id) === String(productId));
      if (p) setSelectedProduct(String(productId));
    }
  }, [productId, products]);

  useEffect(() => {
    if (selectedProduct) {
      const p = products.find((x) => String(x.id) === String(selectedProduct)) || null;
      setSelectedProductDetails(p);
    } else {
      setSelectedProductDetails(null);
    }
  }, [selectedProduct, products]);

  useEffect(() => clearPromo(), [selectedProduct, clearPromo]);
  useEffect(() => clearPromo(), [selectedPayment, clearPromo]);
  useEffect(() => clearPromo(), [effectiveQuantity, clearPromo]);

  const baseProductPrice = useMemo(() => {
    const promo = num(selectedProductDetails?.promo_price);
    if (promo > 0) return money(promo);

    if (role === "gold") return money(selectedProductDetails?.selling_price_gold);
    if (role === "platinum") return money(selectedProductDetails?.selling_price_platinum);
    return money(selectedProductDetails?.selling_price);
  }, [selectedProductDetails, role]);

  const productPrice = useMemo(() => {
    if (promoFinalPrice !== null) return money(promoFinalPrice);
    return baseProductPrice;
  }, [promoFinalPrice, baseProductPrice]);

  const subtotalPrice = useMemo(() => {
    return money(productPrice * effectiveQuantity);
  }, [productPrice, effectiveQuantity]);

  const productName = selectedProductDetails?.title ?? "";

  const { groupedPaymentMethods, outsidePaymentMethods } = useMemo(() => {
    const grouped: Record<string, any[]> = {};
    const outside: any[] = [];

    for (const method of paymentMethods as any[]) {
      const fixedFee = money(method.fee);
      const percentageFee = method.fee_percent ? Math.floor((num(method.fee_percent) / 100) * subtotalPrice) : 0;
      const totalPrice = money(subtotalPrice + fixedFee + percentageFee);
      const enriched = { ...method, totalPrice };

      if (method.is_outside_group) {
        outside.push(enriched);
        continue;
      }

      const group = method.group || "Lainnya";
      if (!grouped[group]) grouped[group] = [];
      grouped[group].push(enriched);
    }

    outside.sort((a, b) => num(a.outside_sort) - num(b.outside_sort));
    for (const k of Object.keys(grouped)) grouped[k].sort((a, b) => num(a.outside_sort) - num(b.outside_sort));

    return { groupedPaymentMethods: grouped, outsidePaymentMethods: outside };
  }, [paymentMethods, subtotalPrice]);

  useEffect(() => {
    if (selectedPayment) {
      const p = (paymentMethods as any[]).find((x) => String(x.id) === String(selectedPayment)) || null;
      setSelectedPaymentDetails(p);
    } else {
      setSelectedPaymentDetails(null);
    }
  }, [selectedPayment, paymentMethods]);

  useEffect(() => {
    if (!selectedPayment) return;
    const method = (paymentMethods as any[]).find((p) => String(p.id) === String(selectedPayment));
    if (!method) return;

    const fixedFee = money(method.fee);
    const percentageFee = method.fee_percent ? Math.floor((num(method.fee_percent) / 100) * subtotalPrice) : 0;
    const computedTotal = money(subtotalPrice + fixedFee + percentageFee);

    const min = num(method.minimum_amount);
    const maxRaw = Number(method.maximum_amount ?? 0);
    const max = Number.isFinite(maxRaw) && maxRaw > 0 ? maxRaw : 0;

    if (min > 0 && computedTotal < min) setSelectedPayment(null);
    if (max > 0 && computedTotal > max) setSelectedPayment(null);
  }, [selectedPayment, paymentMethods, subtotalPrice]);

  const selectedPaymentMethod = useMemo(() => {
    if (!selectedPayment) return null;
    return (paymentMethods as any[]).find((p) => String(p.id) === String(selectedPayment)) || null;
  }, [paymentMethods, selectedPayment]);

  const totalPrice = useMemo(() => {
    const fixedFee = money(selectedPaymentMethod?.fee);
    const percentageFee = selectedPaymentMethod?.fee_percent
      ? Math.floor((num(selectedPaymentMethod.fee_percent) / 100) * subtotalPrice)
      : 0;

    return money(subtotalPrice + fixedFee + percentageFee);
  }, [selectedPaymentMethod, subtotalPrice]);

  const checkNickname = useCallback(async () => {
    try {
      const game = gameConfig?.code_validation_nickname;
      const id = inputs.id || "";
      const server = inputs.server || "";

      const res = await fetch(
        `/api/check-nickname?id=${encodeURIComponent(id)}&server=${encodeURIComponent(server)}&game=${encodeURIComponent(game || "")}`
      );
      const data = await res.json().catch(() => ({}));

      if (data.success && data.name) {
        setNickname(data.name);
        setNicknameError(null);
      } else {
        setNickname(null);
        setNicknameError("Nickname tidak ditemukan atau tidak valid.");
      }
    } catch {
      setNickname(null);
      setNicknameError("Terjadi kesalahan saat memeriksa nickname.");
    }
  }, [inputs, gameConfig]);

  useEffect(() => {
    if (!gameConfig) return;
    if (gameConfig.status_validation_nickname !== "yes") return;

    setNickname("");
    setNicknameError(null);

    const currentInputs = inputRef.current as Record<string, string>;
    const requiredInputsFilled = (gameConfig.required_inputs || []).every((input: string) => currentInputs[input]?.trim() !== "");

    if (requiredInputsFilled) checkNickname();
  }, [gameConfig, checkNickname]);

  const openGuideDrawer = () => setIsGuideOpen(true);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setInputs((prev) => {
      const next: any = { ...prev, [name]: value };
      inputRef.current = next;
      return next;
    });
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isLoading) return;
    setIsLoading(true);

    try {
      if (!gameConfig) return;

      for (const inputName of gameConfig.required_inputs || []) {
        if (inputName in inputs && !(inputs as any)[inputName]) {
          toast.error("Silahkan isi data akun terlebih dahulu.");
          if (inputName === "id") idRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
          if (inputName === "server") serverRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
          return;
        }
      }

      if (!selectedProduct) {
        toast.error("Silahkan pilih nominal yang ingin dibeli terlebih dahulu.");
        productRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
        return;
      }

      if (!selectedPayment) {
        toast.error("Silahkan pilih metode pembayaran terlebih dahulu.");
        paymentRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
        return;
      }

      if (!whatsapp) {
        toast.error("Nomor WhatsApp tidak boleh kosong.");
        whatsappRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
        return;
      }

      if (gameConfig.status_validation_nickname === "yes") {
        await checkNickname();
      }

      setIsConfirmOpen(true);
    } finally {
      setIsLoading(false);
    }
  };

  const submitOrder = async () => {
    if (!gameConfig) return;

    setIsLoading(true);

    const jsonData: Record<string, any> = {
      game: slug,
      product_id: selectedProduct,
      payment_method_id: selectedPayment,
      whatsapp,
      promo_code: promoCode || null,
    };

    if (gameConfig.required_inputs?.includes("id")) jsonData.id = inputs.id;
    if (gameConfig.required_inputs?.includes("server")) jsonData.server = inputs.server;
    if (nickname) jsonData.nickname = nickname;

    if (isAdmin) {
      const q = Math.max(1, Math.min(50, Math.floor(Number(quantity) || 1)));
      jsonData.quantity = q;
    }

    try {
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) headers.Authorization = `Bearer ${token}`;

      const response = await fetch("/api/order", {
        method: "POST",
        headers,
        body: JSON.stringify(jsonData),
      });

      const result = await response.json().catch(() => ({}));

      const orderId = result?.orderId || result?.data?.orderId || result?.data?.order_id || result?.data?.orderID;

      if (response.ok && orderId) {
        toast.success("Pembelian berhasil, silakan lakukan pembayaran.");
        setIsConfirmOpen(false);
        router.push(`/invoices/${orderId}`);
      } else {
        toast.error(result.message || "Pembelian gagal silahkan coba lagi!");
      }
    } catch {
      toast.error("Terjadi kesalahan silahkan coba lagi!");
    } finally {
      setIsLoading(false);
    }
  };

  if (cfgError) {
    return (
      <ContentLayout title="Order">
        <main className="relative pb-28 sm:pb-0">
          <div className="rounded-xl border border-border bg-muted/50 p-4 text-sm">
            <div className="font-semibold text-red-600">Gagal memuat data game</div>
            <div className="mt-1 text-muted-foreground">{cfgError}</div>
            <div className="mt-3">
              <button
                className="rounded-lg bg-my-color px-3 py-2 text-xs font-semibold text-white"
                onClick={() => location.reload()}
              >
                Coba Lagi
              </button>
            </div>
          </div>
        </main>
      </ContentLayout>
    );
  }

  return (
    <ContentLayout title="Order">
      <main className="relative pb-28 sm:pb-0">
        <div>
          <GameHeader games={games} />
        </div>

        <div dir="ltr" data-orientation="horizontal" className="mt-4 lg:mt-8">
          <form onSubmit={handleSubmit} className="relative mt-4 lg:mt-8">
            <div className="sm:flex sm:flex-col sm:space-y-6 lg:grid lg:grid-cols-3 gap-8 lg:items-start">
              <div className="lg:col-span-2 space-y-6 sm:space-y-8">
                <GameDescription isLoading={cfgLoading} description={games?.description} />

                <InputSelection
                  gameConfig={gameConfig}
                  inputs={inputs}
                  handleInputChange={handleInputChange}
                  idRef={idRef}
                  serverRef={serverRef}
                  openGuideDrawer={openGuideDrawer}
                />

                <ProductSelection
                  isLoading={cfgLoading}
                  products={products}
                  role={session?.user?.role}
                  selectedProduct={selectedProduct}
                  setSelectedProduct={setSelectedProduct}
                  productRef={productRef}
                />

                {isAdmin && <QuantitySelection quantity={quantity} setQuantity={setQuantity} min={1} max={50} />}

                <PaymentSelection
                  paymentRef={paymentRef}
                  groupedPaymentMethods={groupedPaymentMethods}
                  outsidePaymentMethods={outsidePaymentMethods}
                  selectedPayment={selectedPayment}
                  setSelectedPayment={setSelectedPayment}
                  stepNumber={3 + stepOffset}
                  sectionId={String(3 + stepOffset)}
                />

                <PromoCodeSection
                  gameSlug={slug || null}
                  productId={selectedProduct ? String(selectedProduct) : null}
                  paymentMethodId={selectedPayment ? String(selectedPayment) : null}
                  whatsapp={whatsapp || ""}
                  quantity={effectiveQuantity}
                  onApplied={({ code, discount, finalPrice }) => {
                    setPromoCode(code);
                    setPromoDiscount(money(discount));
                    setPromoFinalPrice(money(finalPrice));
                  }}
                  onCleared={() => clearPromo()}
                  appliedCode={promoCode}
                  appliedDiscount={money(promoDiscount)}
                  stepNumber={4 + stepOffset}
                  sectionId={String(4 + stepOffset)}
                />

                <ContactDetails
                  whatsappRef={whatsappRef}
                  whatsapp={whatsapp}
                  setWhatsapp={setWhatsapp}
                  stepNumber={5 + stepOffset}
                  sectionId={String(5 + stepOffset)}
                />

                <div className="lg:hidden">
                  <OrderSummaryMobile selectedProductDetails={selectedProductDetails} totalPrice={totalPrice} isLoading={isLoading} />
                </div>
              </div>

              <div className="hidden lg:block sticky top-28">
                <OrderSummaryDekstop
                  selectedProductDetails={selectedProductDetails}
                  totalPrice={totalPrice}
                  isLoading={isLoading}
                  stepNumber={6 + stepOffset}
                />
              </div>
            </div>
          </form>
        </div>
      </main>

      <GuideDrawer
        open={isGuideOpen}
        onOpenChange={setIsGuideOpen}
        guideImage={guideImagePath ? `/api/proxy-image?path=${encodeURIComponent(guideImagePath)}` : undefined}
        guideText={gameConfig?.guide_text}
      />

      <ConfirmDrawer
        isOpen={isConfirmOpen}
        onOpenChange={setIsConfirmOpen}
        gameConfig={gameConfig}
        nicknameError={nicknameError}
        games={games}
        productName={productName}
        productPrice={productPrice}
        totalPrice={totalPrice}
        promoCode={promoCode}
        promoDiscount={promoDiscount}
        quantity={effectiveQuantity}
        inputs={inputs}
        nickname={nickname}
        loggedInEmail={loggedInEmail}
        email={email}
        whatsapp={whatsapp}
        selectedPaymentDetails={selectedPaymentDetails}
        isLoading={isLoading}
        submitOrder={submitOrder}
      />
    </ContentLayout>
  );
}