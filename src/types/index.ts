export interface CategoryObj {
  id: number
  title: string
  logo: string | null
  game: string
}

export interface Product {
  id: string
  title: string
  images?: string
  logo?: string
  category?: CategoryObj | null
  selling_price: number
  selling_price_gold: number
  selling_price_platinum: number
  promo_price?: number | null
}

export interface InvoiceMedia {
  id?: number | string
  code?: string | null
  title?: string | null
  brand?: string | null
  slug?: string | null
  image?: string | null
  logo?: string | null
  game_image?: string | null
  banner?: string | null
}

export type PaymentMethod = {
  id: string
  name: string
  images: string
  payment_id: string
  minimum_amount: number
  maximum_amount: number
  fee: number
  fee_percent: number
  totalPrice: number
  type: string
  status: string
  group: string
  is_outside_group?: boolean
  badge_text?: string | null
  outside_sort?: number
}

type PaymentInstruction = {
  title: string
  steps: string[]
}

export type InvoicePricing = {
  quantity: number
  has_promo: boolean
  promo_code?: string | null
  unit_price_before_promo: number
  unit_discount: number
  unit_price_after_promo: number
  subtotal_before_promo: number
  promo_discount: number
  subtotal_after_promo: number
  payment_fee: number
  unique_code: number
  total_price: number
}

export interface Transaction {
  order_id: string
  games: string
  product: string
  id_games: string
  server_games?: string | null
  nickname?: string | null
  quantity?: number
  price: number
  fee: number
  discount_price?: number | null
  promo_price?: number | null
  promo_code?: string | null
  promo_discount?: number | null
  total_price: number
  payment_name: string
  payment_method: string
  payment_code: string
  payment_code_display?: string | null
  qr_string?: string | null
  qr_image_url?: string | null
  payment_status: string
  payment_instructions?: PaymentInstruction[]
  buy_status: string
  serial_number: string
  expired_time: number
  created_at: string
  pricing?: InvoicePricing | null

  whatsapp?: string | null
  email?: string | null

  qrispy_qris_id?: string | null
  qrispy_image_url?: string | null
  qrispy_image_base64?: string | null
  qrispy_expires_at?: string | null
  qrispy_paid_at?: string | null

  dompetx_transaction_id?: string | null
  dompetx_expires_at?: string | null
  dompetx_paid_at?: string | null
}

export type SummaryData = {
  total: number
  pending: number
  proses: number
  sukses: number
  gagal: number
} & Record<string, number>