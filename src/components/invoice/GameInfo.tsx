import Image from "next/image";
import { InvoiceMedia, Transaction } from "@/types";

interface InvoiceGameInfoProps {
  order: Transaction;
  game: InvoiceMedia | null;
  product: InvoiceMedia | null;
}

export function InvoiceGameInfo({ order, game, product }: InvoiceGameInfoProps) {
  const imageSrc =
    product?.image ||
    product?.logo ||
    game?.image ||
    game?.logo ||
    null;

  const altText =
    product?.title ||
    game?.title ||
    order.games ||
    "Product Image";

  const fallbackLabel = (order.games || product?.title || game?.title || "?")
    .toString()
    .trim()
    .charAt(0)
    .toUpperCase();

  return (
    <div className="flex items-start gap-4 rounded-2xl border border-border bg-muted/50 p-4">
      <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg">
        {imageSrc ? (
          <Image
            alt={altText}
            src={imageSrc}
            fill
            className="object-cover object-center"
            sizes="80px"
            style={{ position: "absolute", inset: 0 }}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-muted text-lg font-semibold text-muted-foreground">
            {fallbackLabel}
          </div>
        )}
      </div>

      <div className="flex-1 space-y-2">
        <div>
          <h3 className="text-md font-semibold text-foreground">{order.games}</h3>
          <p className="text-sm text-muted-foreground">{order.product}</p>
        </div>

        <div className="space-y-1 text-sm">
          {order.nickname && (
            <div className="flex text-sm">
              <span className="w-20 text-muted-foreground">Nickname</span>
              <span className="text-foreground">: {order.nickname}</span>
            </div>
          )}

          <div className="flex text-sm">
            <span className="w-20 text-muted-foreground">ID</span>
            <span className="text-foreground">: {order.id_games}</span>
          </div>

          {order.server_games && (
            <div className="flex text-sm">
              <span className="w-20 text-muted-foreground">Server</span>
              <span className="text-foreground">: {order.server_games}</span>
            </div>
          )}

          <div className="flex text-sm">
            <span className="w-20 text-muted-foreground">Jumlah</span>
            <span className="text-foreground">: {Math.max(1, Math.floor(Number((order as any).quantity ?? 1) || 1))}</span>
          </div>
        </div>
      </div>
    </div>
  );
}