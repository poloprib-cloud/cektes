"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { PaymentMethod } from "@/types";
import { cn } from "@/lib/utils";

interface PaymentSelectionProps {
  paymentRef: React.RefObject<HTMLDivElement>;
  groupedPaymentMethods: Record<string, PaymentMethod[]>;
  outsidePaymentMethods: PaymentMethod[];
  selectedPayment: string | null;
  setSelectedPayment: (id: string) => void;
  stepNumber?: number;
  sectionId?: string;
}

const normalizeAmount = (v: any) => {
  const n = Number(v ?? 0);
  return Number.isFinite(n) ? n : 0;
};

const isDisabledByLimit = (method: PaymentMethod) => {
  const total = normalizeAmount(method.totalPrice);
  const min = normalizeAmount(method.minimum_amount);
  const maxRaw = Number(method.maximum_amount ?? 0);
  const max = Number.isFinite(maxRaw) && maxRaw > 0 ? maxRaw : 0;

  if (min > 0 && total < min) return true;
  if (max > 0 && total > max) return true;
  return false;
};

export default function PaymentSelection({
  paymentRef,
  groupedPaymentMethods,
  outsidePaymentMethods,
  selectedPayment,
  setSelectedPayment,
  stepNumber,
  sectionId,
}: PaymentSelectionProps) {
  const [openAccordion, setOpenAccordion] = useState<string | null>(null);

  const step = useMemo(() => {
    const n = Number(stepNumber);
    return Number.isFinite(n) && n > 0 ? Math.floor(n) : 3;
  }, [stepNumber]);

  const resolvedSectionId = sectionId ? String(sectionId) : String(step);

  return (
    <section
      ref={paymentRef}
      className="relative scroll-mt-20 rounded-xl bg-background shadow-sm ring-1 ring-border md:scroll-mt-[7.5rem]"
      id={resolvedSectionId}
    >
      <div className="flex items-center rounded-t-xl bg-muted px-4 py-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-my-color font-semibold text-white">
          {step}
        </div>
        <h2 className="ml-3 text-sm font-semibold text-card-foreground">Pilih Pembayaran</h2>
      </div>

      <div className="space-y-4 p-4">
        {outsidePaymentMethods.length > 0 && (
          <div className="space-y-3">
            {outsidePaymentMethods.map((method) => {
              const isDisabled = isDisabledByLimit(method);
              const isSelected = selectedPayment === method.id;

              return (
                <label
                  key={method.id}
                  className={cn(
                    "relative flex w-full cursor-pointer items-center justify-between rounded-xl bg-muted/40 px-4 py-4 ring-1 ring-border",
                    !isDisabled &&
                      "hover:ring-2 hover:ring-my-color hover:ring-offset-2 hover:ring-offset-background",
                    isDisabled && "cursor-not-allowed opacity-50",
                    isSelected && "ring-2 ring-my-color"
                  )}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value={method.id}
                    className="sr-only"
                    disabled={isDisabled}
                    checked={isSelected}
                    onChange={() => setSelectedPayment(method.id)}
                  />

                  {method.badge_text && (
                    <div className="absolute right-0 top-0 overflow-hidden rounded-bl-xl rounded-tr-xl">
                      <div className="bg-my-color px-3 py-1 text-[11px] font-semibold text-white">
                        {method.badge_text}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-16 items-center justify-center rounded-md bg-white p-1">
                      {method.images && method.images !== "noimage.png" && (
                        <Image
                          alt={method.name}
                          width={120}
                          height={60}
                          className="h-full w-full object-contain"
                          src={method.images}
                        />
                      )}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[13px] font-semibold text-foreground">{method.name}</span>
                    </div>
                  </div>

                  <div className="text-sm font-semibold text-primary">
                    Rp {(method.totalPrice ?? 0).toLocaleString("id-ID")}
                  </div>
                </label>
              );
            })}
          </div>
        )}

        {Object.entries(groupedPaymentMethods).map(([group, methods]) => {
          const isOpen = openAccordion === group;

          return (
            <div key={group} className="rounded-xl border bg-muted/40">
              <button
                type="button"
                className="flex w-full items-center justify-between rounded-t-xl bg-muted px-4 py-3 font-medium"
                onClick={() => setOpenAccordion(isOpen ? null : group)}
              >
                <span>{group}</span>
                <svg
                  className={cn("h-5 w-5 transition-transform duration-300", isOpen ? "rotate-180" : "rotate-0")}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              <div
                className={cn(
                  "transition-all duration-300",
                  isOpen ? "max-h-[90vh] overflow-y-auto py-4 opacity-100" : "max-h-0 overflow-hidden opacity-0"
                )}
              >
                <div className="grid grid-cols-2 gap-4 px-4 sm:grid-cols-3">
                  {methods.map((method) => {
                    const isDisabled = isDisabledByLimit(method);
                    const isSelected = selectedPayment === method.id;

                    return (
                      <label
                        key={method.id}
                        className={cn(
                          "group/variant relative flex min-h-[85px] cursor-pointer gap-4 rounded-xl border border-transparent bg-muted text-muted-foreground shadow-sm",
                          !isDisabled &&
                            "hover:ring-2 hover:ring-my-color hover:ring-offset-2 hover:ring-offset-background",
                          isDisabled && "cursor-not-allowed opacity-50",
                          isSelected && "ring-2 ring-my-color"
                        )}
                      >
                        <input
                          type="radio"
                          name="paymentMethod"
                          value={method.id}
                          className="sr-only"
                          disabled={isDisabled}
                          checked={isSelected}
                          onChange={() => setSelectedPayment(method.id)}
                        />

                        <span className="w-full">
                          <span className="flex h-full flex-col justify-between divide-y divide-muted-foreground/10">
                            <div className="flex flex-col justify-start gap-1 p-3">
                              <span className="block text-[11px] font-semibold">{method.name}</span>

                              <div className="flex w-full flex-col">
                                <div className="flex aspect-square h-12 w-16 items-center">
                                  {method.images && method.images !== "noimage.png" && (
                                    <Image
                                      alt={method.name}
                                      priority
                                      width={300}
                                      height={300}
                                      className="object-contain object-right"
                                      sizes="80vh"
                                      src={method.images}
                                    />
                                  )}
                                </div>

                                <div>
                                  <span className="flex items-center text-[14px] font-semibold text-primary md:text-[16px]">
                                    Rp {(method.totalPrice ?? 0).toLocaleString("id-ID")}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </span>
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {!isOpen && (
                <button
                  type="button"
                  onClick={() => setOpenAccordion(group)}
                  className="hide-scrollbar flex w-full items-center gap-2 overflow-x-auto rounded-b-xl bg-muted/10 px-3 py-2"
                >
                  {methods.map(
                    (method) =>
                      method.images &&
                      method.images !== "noimage.png" && (
                        <div key={method.id} className="flex min-h-[36px] min-w-[36px] items-center justify-center">
                          <Image
                            alt={method.name}
                            src={method.images}
                            width={36}
                            height={36}
                            className="h-6 w-16 rounded-md bg-white p-1 object-contain"
                          />
                        </div>
                      )
                  )}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
