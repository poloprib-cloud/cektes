interface OrderSummaryDekstopProps {
  selectedProductDetails: { title: string } | null;
  totalPrice: number;
  isLoading: boolean;
  stepNumber?: number;
}

export default function OrderSummaryDekstop({
  selectedProductDetails,
  totalPrice,
  isLoading,
  stepNumber,
}: OrderSummaryDekstopProps) {
  const step = Number.isFinite(Number(stepNumber)) && Number(stepNumber) > 0 ? Math.floor(Number(stepNumber)) : 6;

  return (
    <section className="relative mt-6 hidden lg:block rounded-xl bg-background shadow-sm ring-1 ring-border">
      <div className="flex items-center rounded-t-xl bg-muted px-4 py-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-my-color font-semibold text-white">
          {step}
        </div>
        <h2 className="ml-3 text-sm font-semibold text-card-foreground">Detail Pesanan</h2>
      </div>

      <div className="p-4">
        {selectedProductDetails ? (
          <div className="flex flex-col gap-4 rounded-xl border border-border bg-muted/40 p-4 shadow-sm">
            <div className="text-sm text-card-foreground">
              <p className="font-medium">{selectedProductDetails.title}</p>
              <span className="font-semibold text-lg">Rp {totalPrice.toLocaleString("id-ID")}</span>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex items-center justify-center rounded-md bg-my-color px-6 py-2 text-sm font-medium text-white shadow transition-all duration-300 hover:bg-my-hoverColor disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin mr-2 h-5 w-5 text-white" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25"></circle>
                    <path
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z"
                      className="opacity-75"
                    ></path>
                  </svg>
                  Memproses...
                </>
              ) : (
                <>
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 25 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="mr-2"
                  >
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M16.5209 6.87109H8.47891C5.67599 6.87109 3.91895 8.8558 3.91895 11.6636V16.206C3.91895 19.0148 5.66724 20.9985 8.47891 20.9985H16.5199C19.3316 20.9985 21.0818 19.0148 21.0818 16.206V11.6636C21.0818 8.8558 19.3316 6.87109 16.5209 6.87109Z"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    ></path>
                    <path
                      opacity="0.4"
                      d="M9.38477 11.1445C9.45871 11.8684 9.79338 12.5173 10.275 13.0096C10.8509 13.5748 11.639 13.928 12.5019 13.928C14.116 13.928 15.443 12.7119 15.6191 11.1445"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    ></path>
                    <path
                      opacity="0.4"
                      d="M16.3702 6.87115C16.3702 4.7337 14.6375 3 12.4991 3C10.3616 3 8.62891 4.7337 8.62891 6.87115"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    ></path>
                  </svg>
                  Pesan Sekarang!
                </>
              )}
            </button>
          </div>
        ) : (
          <div className="flex h-24 items-center justify-center rounded-xl border border-dashed bg-muted/40 text-sm text-muted-foreground">
            Belum ada item produk yang dipilih.
          </div>
        )}
      </div>
    </section>
  );
}
