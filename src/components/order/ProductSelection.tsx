'use client'

import React, { useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import LogoInstan from '@/components/logo/instan'
import { Product } from '@/types'

interface ProductSelectionProps {
  isLoading: boolean
  products: Product[]
  selectedProduct: string | null
  setSelectedProduct: (productId: string) => void
  productRef: React.RefObject<HTMLElement>
  role?: string | null
}

const getPriceByRole = (p: Product, role?: string | null) =>
  role === 'gold'
    ? p.selling_price_gold
    : role === 'platinum'
    ? p.selling_price_platinum
    : p.selling_price

const displayCategoryName = (title: string) => {
  if (title === 'Top Up') return 'Umum'
  return title
}

const isUmumCategory = (title: string) => title === 'Top Up' || title === 'Umum'

const ProductSelection: React.FC<ProductSelectionProps> = ({
  isLoading,
  products,
  selectedProduct,
  setSelectedProduct,
  productRef,
  role,
}) => {
  const grouped = useMemo(() => {
    return products.reduce((acc, product) => {
      const raw = product.category?.title || 'Top Up'
      const key = isUmumCategory(raw) ? 'Top Up' : raw
      if (!acc[key]) {
        acc[key] = {
          items: [],
          logo: product.category?.logo || null,
        }
      }
      acc[key].items.push(product)
      return acc
    }, {} as Record<string, { items: Product[]; logo: string | null }>)
  }, [products])

  const categories = useMemo(() => {
    return Object.keys(grouped).sort((a, b) => {
      const aUmum = isUmumCategory(a)
      const bUmum = isUmumCategory(b)
      if (aUmum && !bUmum) return -1
      if (!aUmum && bUmum) return 1
      return a.localeCompare(b)
    })
  }, [grouped])

  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const current = activeCategory || categories[0]

  useEffect(() => {
    if (!activeCategory && categories.length) {
      setActiveCategory(categories[0])
    }
  }, [categories, activeCategory])

  const renderProductCard = (product: Product) => {
    const isSelected = String(selectedProduct) === String(product.id)
    const price = getPriceByRole(product, role)
    const promoPrice = product.promo_price ?? null
    const isPromo = promoPrice !== null && promoPrice !== undefined
    const disc =
      isPromo && price > promoPrice
        ? Math.round(((price - promoPrice) / price) * 100)
        : 0

    return (
      <label
        key={product.id}
        className={`relative flex min-h-[85px] cursor-pointer gap-4 rounded-xl bg-muted shadow-sm ${
          isSelected ? 'ring-2 ring-my-color' : ''
        }`}
      >
        <input
          type="radio"
          name="productId"
          value={product.id}
          className="sr-only"
          checked={isSelected}
          onChange={() => setSelectedProduct(String(product.id))}
        />

        <span className="flex w-full flex-col justify-between divide-y">
          <span className="space-y-1 p-3">
            <span className="text-xs font-semibold">{product.title}</span>
            <div className="flex items-center gap-2">
              {(product.logo || product.images) && (
                <Image
                  src={(product.logo || product.images) as string}
                  alt={product.title}
                  width={24}
                  height={24}
                  className="h-6 w-6 object-contain"
                />
              )}
              {isPromo ? (
                <div>
                  <div className="text-xs text-my-hoverColor line-through">
                    Rp {price.toLocaleString('id-ID')}
                  </div>
                  <div className="font-semibold text-my-color">
                    Rp {promoPrice!.toLocaleString('id-ID')}
                  </div>
                </div>
              ) : (
                <div className="font-semibold text-my-color">
                  Rp {price.toLocaleString('id-ID')}
                </div>
              )}
            </div>
          </span>

          <span className="flex items-center justify-end gap-2 rounded-b-xl bg-muted/40 p-2">
            {disc > 0 && (
              <span className="rounded bg-my-color px-2 py-0.5 text-[10px] font-semibold text-white">
                Disc {disc}%
              </span>
            )}
            <div className="rounded bg-white p-1">
              <LogoInstan className="h-3 w-12" />
            </div>
          </span>
        </span>
      </label>
    )
  }

  return (
    <section
      ref={productRef}
      className="rounded-xl bg-background shadow-sm ring-1 ring-border"
    >
      <div className="flex items-center rounded-t-xl bg-muted px-4 py-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-my-color font-semibold text-white">
          2
        </div>
        <h2 className="ml-3 text-sm font-semibold text-card-foreground">
          Pilih Produk
        </h2>
      </div>

      <div className="space-y-4 p-4">
        {!isLoading && categories.length > 1 && (
          <div className="hide-scrollbar flex gap-3 overflow-x-auto">
            {categories.map((cat) => {
              const active = current === cat
              const logo = cat !== 'Top Up' ? grouped[cat]?.logo : null
              const label = displayCategoryName(cat)

              return (
                <button
                  key={cat}
                  type="button"
                  onClick={(e) => {
                    e.preventDefault()
                    setActiveCategory(cat)
                  }}
                  className={`flex h-[90px] w-[120px] flex-none flex-col items-center justify-center gap-2 rounded-lg border transition ${
                    active
                      ? 'border-my-color bg-my-color/10'
                      : 'border-transparent bg-muted'
                  }`}
                >
                  {cat === 'Top Up' ? (
                    <Image
                      src="/logo-topup.webp"
                      alt={label}
                      width={32}
                      height={32}
                      className="h-8 w-8 object-contain"
                    />
                  ) : logo ? (
                    <Image
                      src={logo}
                      alt={label}
                      width={32}
                      height={32}
                      className="h-8 w-8 object-contain"
                    />
                  ) : (
                    <Image
                      src="/logo-topup.webp"
                      alt={label}
                      width={32}
                      height={32}
                      className="h-8 w-8 object-contain"
                    />
                  )}

                  <span
                    className={`text-xs font-medium ${
                      active ? 'text-my-color' : 'text-gray'
                    }`}
                  >
                    {label}
                  </span>
                </button>
              )
            })}
          </div>
        )}

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-3">
          {isLoading
            ? Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="min-h-[85px] animate-pulse rounded-xl bg-muted"
                />
              ))
            : grouped[current]?.items.map(renderProductCard)}
        </div>
      </div>
    </section>
  )
}

export default ProductSelection