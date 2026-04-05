'use client'

import { Clipboard } from "lucide-react"
import Image from "next/image"
import QRCode from "react-qr-code"
import { useMemo, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Transaction } from "@/types"

interface InvoicePaymentMethodProps {
  order: Transaction
  handleCopyPayCode: () => void
  handleCopyOrderId: () => void
  handleCopySn: () => void
  getBackgroundPayStatusColor: () => string
  getBackgroundBuyStatusColor: () => string
  getBuyStatusMessage: () => string
}

const QRIS_IMAGE_METHODS = ["QRIS", "QRISC", "QRIS2", "11", "17", "20"]
const QRIS_STRING_METHODS = ["SP", "NQ", "DQ", "GQ", "SQ", "SMPQRIS"]
const EWALLET_METHODS = ["GOPAY", "OVO", "DANA", "LINKAJA", "SHOPEEPAY", "12", "13", "14", "OV", "SA", "LF", "LA", "DA", "SL", "OL", "JP"]
const VA_METHODS = [
  "VA_BCA", "VA_BNI", "VA_BRI", "VA_MANDIRI", "VA_PERMATA", "VA_CIMB", "VA_DANAMON",
  "BRIVA", "BCAVA", "MANDIRIVA", "BNIVA", "PERMATAVA",
  "CIMBVA", "MUAMALATVA", "DANAMONVA", "MAYBANKVA",
  "BSIVA", "SEAABVA", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "21", "22", "BC", "M2", "VA", "I1", "B1", "BT", "A1", "AG", "NC", "BR", "S1", "DM", "BV"
]
const RETAIL_METHODS = ["INDOMARET", "ALFAMART", "ALFAMIDI", "18", "19", "FT", "IR"]

const drawRoundedRect = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) => {
  const radius = Math.min(r, w / 2, h / 2)
  ctx.beginPath()
  ctx.moveTo(x + radius, y)
  ctx.arcTo(x + w, y, x + w, y + h, radius)
  ctx.arcTo(x + w, y + h, x, y + h, radius)
  ctx.arcTo(x, y + h, x, y, radius)
  ctx.arcTo(x, y, x + w, y, radius)
  ctx.closePath()
}

export function InvoicePaymentMethod({
  order,
  handleCopyPayCode,
  handleCopyOrderId,
  handleCopySn,
  getBackgroundPayStatusColor,
  getBackgroundBuyStatusColor,
  getBuyStatusMessage
}: InvoicePaymentMethodProps) {
  const [downloading, setDownloading] = useState(false)
  const qrisSvgWrapRef = useRef<HTMLDivElement | null>(null)

  const paymentMethodCode = String(order.payment_method || "").toUpperCase()
  const rawPaymentCode = String(order.payment_code || "").trim()
  const explicitQrString = String(order.qr_string || "").trim()
  const explicitQrImageUrl = String(order.qr_image_url || "").trim()
  const qrispyImageBase64 = String(order.qrispy_image_base64 || "").trim()
  const qrispyImageUrl = String(order.qrispy_image_url || "").trim()
  const rawSerialNumber = String(order.serial_number || "").trim()
  const rawOrderId = String(order.order_id || "invoice").trim()
  const rawPrice = Number(order.price || 0)
  const rawFee = Number(order.fee || 0)
  const rawQty = Math.max(1, Math.floor(Number(order.quantity ?? 1) || 1))
  const rawPromoDiscount = Math.max(0, Number(order.promo_discount ?? 0))

  const isQrispy = paymentMethodCode === "QRISPY"
  const isQrisImageMethod = QRIS_IMAGE_METHODS.includes(paymentMethodCode)
  const isQrisStringMethod = QRIS_STRING_METHODS.includes(paymentMethodCode)
  const isEwalletMethod = EWALLET_METHODS.includes(paymentMethodCode)
  const isVaMethod = VA_METHODS.includes(paymentMethodCode)
  const isRetailMethod = RETAIL_METHODS.includes(paymentMethodCode)

  const subtotalBeforePromo = useMemo(() => {
    return Math.max(0, rawPrice * rawQty)
  }, [rawPrice, rawQty])

  const subtotalAfterPromo = useMemo(() => {
    return Math.max(0, subtotalBeforePromo - rawPromoDiscount)
  }, [subtotalBeforePromo, rawPromoDiscount])

  const qrImageSrc = useMemo(() => {
    if (explicitQrImageUrl) return explicitQrImageUrl

    if (isQrispy) {
      if (qrispyImageBase64) {
        if (qrispyImageBase64.startsWith("data:image")) return qrispyImageBase64
        return `data:image/png;base64,${qrispyImageBase64}`
      }

      if (qrispyImageUrl) return qrispyImageUrl
    }

    if (
      rawPaymentCode.startsWith("http://") ||
      rawPaymentCode.startsWith("https://") ||
      rawPaymentCode.startsWith("data:image")
    ) {
      return rawPaymentCode
    }

    return null
  }, [explicitQrImageUrl, isQrispy, qrispyImageBase64, qrispyImageUrl, rawPaymentCode])

  const qrString = useMemo(() => {
    if (explicitQrString) return explicitQrString

    if (!rawPaymentCode) return null

    if (isQrisStringMethod) {
      return rawPaymentCode
    }

    const isUrl =
      rawPaymentCode.startsWith("http://") ||
      rawPaymentCode.startsWith("https://") ||
      rawPaymentCode.startsWith("data:image")

    if (!isUrl && isQrisImageMethod) {
      return rawPaymentCode
    }

    return null
  }, [explicitQrString, rawPaymentCode, isQrisStringMethod, isQrisImageMethod])

  const showQrBlock = useMemo(() => {
    if (isQrispy) return true
    if (isQrisImageMethod) return true
    if (isQrisStringMethod) return true
    if (explicitQrString) return true
    if (explicitQrImageUrl) return true
    return false
  }, [isQrispy, isQrisImageMethod, isQrisStringMethod, explicitQrString, explicitQrImageUrl])

  const isQrImageDataUri = useMemo(() => {
    if (!qrImageSrc) return false
    return qrImageSrc.startsWith("data:image")
  }, [qrImageSrc])

  const fileName = useMemo(() => {
    return `${rawOrderId.replace(/\s+/g, "-")}.jpg`
  }, [rawOrderId])

  const snBlocks = useMemo(() => {
    if (!rawSerialNumber) return []

    if (rawQty <= 1) return [rawSerialNumber]

    const parts = rawSerialNumber
      .split(/\n\n(?=Serial Number\s+\d+)/g)
      .map((part) => part.trim())
      .filter(Boolean)

    return parts.length > 0 ? parts : [rawSerialNumber]
  }, [rawSerialNumber, rawQty])

  const priceLine = useMemo(() => {
    if (rawQty <= 1) {
      return `Harga Setelah Promo: Rp ${subtotalAfterPromo.toLocaleString("id-ID")} • Fee: Rp ${rawFee.toLocaleString("id-ID")}`
    }

    return `Subtotal Setelah Promo: Rp ${subtotalAfterPromo.toLocaleString("id-ID")} • Fee: Rp ${rawFee.toLocaleString("id-ID")}`
  }, [rawFee, rawQty, subtotalAfterPromo])

  const isUrlPayCode = useMemo(() => {
    return Boolean(qrImageSrc)
  }, [qrImageSrc])

  const downloadBlob = async (blob: Blob, name: string) => {
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement("a")
    anchor.href = url
    anchor.download = name
    document.body.appendChild(anchor)
    anchor.click()
    anchor.remove()
    URL.revokeObjectURL(url)
  }

  const toJpegBlobFromCanvas = async (canvas: HTMLCanvasElement) => {
    return await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (!blob) {
          reject(new Error("Gagal membuat file"))
          return
        }

        resolve(blob)
      }, "image/jpeg", 0.95)
    })
  }

  const downloadQrisFromImage = async (src: string) => {
    const response = await fetch(src, { cache: "no-store" })
    const blob = await response.blob()
    const bitmap = await createImageBitmap(blob)

    const pad = Math.round(Math.max(24, Math.min(bitmap.width, bitmap.height) * 0.08))
    const radius = Math.round(Math.max(14, pad * 0.5))
    const canvas = document.createElement("canvas")
    canvas.width = bitmap.width + pad * 2
    canvas.height = bitmap.height + pad * 2

    const ctx = canvas.getContext("2d")
    if (!ctx) {
      throw new Error("Canvas tidak tersedia")
    }

    ctx.fillStyle = "#ffffff"
    drawRoundedRect(ctx, 0, 0, canvas.width, canvas.height, radius)
    ctx.fill()

    ctx.drawImage(bitmap, pad, pad, bitmap.width, bitmap.height)

    const jpg = await toJpegBlobFromCanvas(canvas)
    await downloadBlob(jpg, fileName)
  }

  const downloadQrisFromSvg = async () => {
    const wrapper = qrisSvgWrapRef.current
    const svg = wrapper?.querySelector("svg")

    if (!svg) {
      throw new Error("QR belum siap")
    }

    const cloned = svg.cloneNode(true) as SVGSVGElement
    if (!cloned.getAttribute("xmlns")) {
      cloned.setAttribute("xmlns", "http://www.w3.org/2000/svg")
    }

    const serializer = new XMLSerializer()
    const svgString = serializer.serializeToString(cloned)
    const svgBlob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" })
    const svgUrl = URL.createObjectURL(svgBlob)

    const img = new window.Image()
    img.decoding = "async"

    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve()
      img.onerror = () => reject(new Error("Gagal memuat QR"))
      img.src = svgUrl
    })

    const qrSize = 900
    const pad = 64
    const radius = 28
    const canvas = document.createElement("canvas")
    canvas.width = qrSize + pad * 2
    canvas.height = qrSize + pad * 2

    const ctx = canvas.getContext("2d")
    if (!ctx) {
      URL.revokeObjectURL(svgUrl)
      throw new Error("Canvas tidak tersedia")
    }

    ctx.fillStyle = "#ffffff"
    drawRoundedRect(ctx, 0, 0, canvas.width, canvas.height, radius)
    ctx.fill()

    ctx.imageSmoothingEnabled = false
    ctx.drawImage(img, pad, pad, qrSize, qrSize)

    URL.revokeObjectURL(svgUrl)

    const jpg = await toJpegBlobFromCanvas(canvas)
    await downloadBlob(jpg, fileName)
  }

  const downloadFromDataUri = async (dataUri: string) => {
    const match = dataUri.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/)
    const mime = match?.[1] || "image/png"
    const base64 = match?.[2] || ""

    if (!base64) {
      throw new Error("QR tidak valid")
    }

    const binary = atob(base64)
    const bytes = new Uint8Array(binary.length)

    for (let index = 0; index < binary.length; index += 1) {
      bytes[index] = binary.charCodeAt(index)
    }

    const blob = new Blob([bytes], { type: mime })
    await downloadBlob(blob, fileName)
  }

  const handleDownloadQris = async () => {
    if (downloading) return

    setDownloading(true)

    try {
      if (qrImageSrc) {
        if (qrImageSrc.startsWith("data:image")) {
          await downloadFromDataUri(qrImageSrc)
        } else {
          await downloadQrisFromImage(qrImageSrc)
        }

        return
      }

      if (qrString) {
        await downloadQrisFromSvg()
      }
    } finally {
      setDownloading(false)
    }
  }

  const handleDownloadQrispy = async () => {
    if (downloading || !qrImageSrc) return

    setDownloading(true)

    try {
      if (qrImageSrc.startsWith("data:image")) {
        await downloadFromDataUri(qrImageSrc)
      } else {
        await downloadQrisFromImage(qrImageSrc)
      }
    } finally {
      setDownloading(false)
    }
  }

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6">
      <div className="rounded-2xl border bg-background p-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div className="space-y-1">
            <div className="text-sm text-muted-foreground">Nomor Invoice</div>
            <div className="flex items-center gap-2">
              <div className="text-base font-semibold">{order.order_id}</div>
              <Button variant="outline" size="icon" onClick={handleCopyOrderId} aria-label="Copy invoice">
                <Clipboard className="h-4 w-4" />
              </Button>
            </div>
            <div className="text-xs text-muted-foreground">
              Metode: <span className="font-medium text-foreground">{order.payment_name}</span>
            </div>
          </div>

          <div className="space-y-1 text-left md:text-right">
            <div className="text-sm text-muted-foreground">Total Pembayaran</div>
            <div className="text-xl font-bold">
              Rp {Number(order.total_price || 0).toLocaleString("id-ID")}
            </div>
            <div className="text-xs text-muted-foreground">{priceLine}</div>
          </div>
        </div>
      </div>

      <div className={`rounded-2xl border p-5 ${getBackgroundPayStatusColor()}`}>
        <div className="space-y-1">
          <div className="text-sm font-medium">Status Pembayaran</div>
          <div className="text-base font-semibold">{order.payment_status}</div>
        </div>
      </div>

      <div className={`rounded-2xl border p-5 ${getBackgroundBuyStatusColor()}`}>
        <div className="space-y-2">
          <div className="text-sm font-medium">Status Pembelian</div>
          <div className="text-base font-semibold">{order.buy_status}</div>
          <div className="text-sm text-muted-foreground">{getBuyStatusMessage()}</div>
        </div>
      </div>

      {order.payment_status === "UNPAID" && (
        <div className="rounded-2xl border bg-background p-5">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div className="space-y-1">
              <div className="text-sm font-medium">Kode Pembayaran</div>
              <div className="text-sm text-muted-foreground">
                {isQrispy || showQrBlock ? "Silakan scan QR / gunakan QR string di bawah." : "Salin dan gunakan kode berikut."}
              </div>
            </div>

            {!showQrBlock && (
              <div className="flex items-center gap-2">
                <div className="max-w-[220px] truncate rounded-lg border bg-muted px-3 py-2 text-sm">
                  {String(order.payment_code_display || order.payment_code || "-")}
                </div>
                <Button variant="outline" size="icon" onClick={handleCopyPayCode} aria-label="Copy pay code">
                  <Clipboard className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>

          {isEwalletMethod && isUrlPayCode && (
            <div className="mt-4">
              <Button asChild className="w-full">
                <a href={String(order.payment_code)} target="_blank" rel="noreferrer">
                  Bayar Sekarang
                </a>
              </Button>
            </div>
          )}

          {(isRetailMethod || isVaMethod) && (
            <div className="mt-4 flex items-center gap-2">
              <div className="flex-1 rounded-lg border bg-muted px-3 py-2 text-sm break-all">
                {String(order.payment_code_display || order.payment_code || "-")}
              </div>
              <Button variant="outline" size="icon" onClick={handleCopyPayCode} aria-label="Copy pay code">
                <Clipboard className="h-4 w-4" />
              </Button>
            </div>
          )}

          {showQrBlock && (
            <div className="mt-5 space-y-3">
              {isQrispy && qrImageSrc && (
                <div className="flex flex-col items-center gap-3">
                  <div className="relative h-[260px] w-[260px] overflow-hidden rounded-2 border bg-white">
                    <Image
                      src={qrImageSrc}
                      alt="QRIS"
                      fill
                      className="object-contain"
                      unoptimized
                      priority
                    />
                  </div>

                  <Button variant="outline" onClick={handleDownloadQrispy} disabled={downloading}>
                    {downloading ? "Menyiapkan..." : "Download QR"}
                  </Button>
                </div>
              )}

              {!isQrispy && isQrisImageMethod && isUrlPayCode && qrImageSrc && (
                <div className="flex flex-col items-center gap-3">
                  <div className="relative h-[260px] w-[260px] overflow-hidden rounded border bg-white">
                    <Image
                      src={qrImageSrc}
                      alt="QRIS"
                      fill
                      className="object-contain"
                      unoptimized={!isQrImageDataUri}
                      priority
                    />
                  </div>
                  <Button variant="outline" onClick={handleDownloadQris} disabled={downloading}>
                    {downloading ? "Menyiapkan..." : "Download QR"}
                  </Button>
                </div>
              )}

              {(((isQrisStringMethod || Boolean(explicitQrString)) || (isQrisImageMethod && !isUrlPayCode && Boolean(qrString))) && qrString) && (
                <div className="flex flex-col items-center gap-3">
                  <div ref={qrisSvgWrapRef} className="rounded border bg-white p-4">
                    <QRCode value={qrString} size={220} />
                  </div>

                  <div className="w-full rounded border bg-muted p-3 text-xs break-all">
                    {qrString}
                  </div>

                  <div className="flex w-full items-center gap-2">
                    <Button variant="outline" className="flex-1" onClick={handleCopyPayCode}>
                      Salin QR String
                    </Button>
                    <Button variant="outline" className="flex-1" onClick={handleDownloadQris} disabled={downloading}>
                      {downloading ? "Menyiapkan..." : "Download QR"}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {order.payment_status === "PAID" && snBlocks.length > 0 && (
        <div className="rounded-2xl border bg-background p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="text-sm font-medium">Serial Number / Data</div>
            <Button variant="outline" size="icon" onClick={handleCopySn} aria-label="Copy SN">
              <Clipboard className="h-4 w-4" />
            </Button>
          </div>

          <div className="space-y-3">
            {snBlocks.map((block, index) => (
              <pre
                key={`${order.order_id || "sn"}-${index}`}
                className="whitespace-pre-wrap break-words rounded-xl border bg-muted p-3 text-sm"
              >
                {block}
              </pre>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}