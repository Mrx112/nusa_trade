"use client";

import { useState } from "react";
import { ClipboardPlus, FlaskConical, Heart, Info, Scale, TrendingDown } from "lucide-react";
import type { Product } from "@/lib/types";
import { activeTierIndex, nextTier, quantityStep, unitPriceFor } from "@/lib/catalog";
import { formatNumber, formatRupiah } from "@/lib/format";
import { useAppStore, useUi } from "@/lib/store";
import { QuantityInput } from "@/components/ui/quantity-input";
import { useProductActions } from "@/components/product/product-actions";
import { cn } from "@/lib/cn";

export function PurchasePanel({ product }: { product: Product }) {
  const [quantity, setQuantity] = useState(product.moq);
  const [variants, setVariants] = useState<Record<string, string>>(() =>
    Object.fromEntries(product.variants.map((variant) => [variant.name, variant.options[0]])),
  );
  const addToCart = useAppStore((state) => state.addToCart);
  const toast = useUi((state) => state.toast);
  const setDrawer = useUi((state) => state.setDrawer);
  const actions = useProductActions(product.slug);

  const tiers = [...product.priceTiers].sort((a, b) => a.min - b.min);
  const unitPrice = unitPriceFor(product, quantity);
  const total = unitPrice * quantity;
  const savings = (tiers[0].price - unitPrice) * quantity;
  const upcoming = nextTier(product, quantity);
  const activeIndex = activeTierIndex(tiers, quantity);

  const add = (note = "") => {
    addToCart({ slug: product.slug, quantity, variants, note });
    toast({ title: note ? "Permintaan sampel ditambahkan" : "Ditambahkan ke daftar RFQ", description: `${product.name} · ${formatNumber(quantity)} ${product.unit}` });
    setDrawer(true);
  };

  return (
    <div className="space-y-6">
      {/* Tier pricing */}
      <div>
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold">Harga grosir bertingkat</h2>
          <span className="text-xs text-muted">per {product.unit}</span>
        </div>
        <div className="mt-3 grid grid-cols-3 gap-2">
          {tiers.map((tier, index) => {
            const upper = tiers[index + 1]?.min;
            const active = index === activeIndex;
            return (
              <button
                key={tier.min}
                type="button"
                onClick={() => setQuantity(Math.max(tier.min, product.moq))}
                className={cn(
                  "rounded-2xl border p-3 text-left transition",
                  active ? "border-brand-500 bg-brand-50 ring-4 ring-brand-500/10 dark:bg-brand-950" : "border-line hover:border-brand-300",
                )}
                aria-pressed={active}
              >
                <p className="text-[11px] text-muted">
                  {formatNumber(tier.min)}
                  {upper ? `–${formatNumber(upper - 1)}` : "+"} {product.unit}
                </p>
                <p className="mt-0.5 text-base font-extrabold tabular-nums sm:text-lg">{formatRupiah(tier.price)}</p>
                {index > 0 && (
                  <p className="text-[11px] font-semibold text-brand-700 dark:text-brand-400">
                    −{Math.round((1 - tier.price / tiers[0].price) * 100)}%
                  </p>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Variants */}
      {product.variants.map((variant) => (
        <div key={variant.name}>
          <p className="text-sm font-bold">
            {variant.name}: <span className="font-medium text-muted">{variants[variant.name]}</span>
          </p>
          <div className="mt-2 flex flex-wrap gap-2" role="radiogroup" aria-label={variant.name}>
            {variant.options.map((option) => (
              <button
                key={option}
                type="button"
                role="radio"
                aria-checked={variants[variant.name] === option}
                onClick={() => setVariants((current) => ({ ...current, [variant.name]: option }))}
                className={cn(
                  "rounded-xl border px-3 py-2 text-sm font-medium transition",
                  variants[variant.name] === option ? "border-brand-600 bg-brand-600 text-white" : "border-line bg-surface hover:border-brand-300",
                )}
              >
                {option}
              </button>
            ))}
          </div>
        </div>
      ))}

      {/* Quantity & total */}
      <div className="rounded-2xl border border-line bg-surface-2/60 p-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-bold">Jumlah</p>
            <p className="text-xs text-muted">
              MOQ {formatNumber(product.moq)} {product.unit}
            </p>
          </div>
          <QuantityInput value={quantity} min={product.moq} step={quantityStep(product.moq)} onChange={setQuantity} label={`jumlah ${product.name}`} />
        </div>
        <div className="mt-4 flex items-end justify-between gap-4 border-t border-line pt-4">
          <div>
            <p className="text-xs text-muted">Estimasi nilai</p>
            <p className="text-2xl font-extrabold tabular-nums">{formatRupiah(total)}</p>
            <p className="text-xs text-muted tabular-nums">
              {formatRupiah(unitPrice)} × {formatNumber(quantity)} {product.unit}
            </p>
          </div>
          {savings > 0 && (
            <span className="flex items-center gap-1 rounded-full bg-brand-100 px-2.5 py-1 text-xs font-bold text-brand-800 dark:bg-brand-900 dark:text-brand-200">
              <TrendingDown className="size-3.5" /> Hemat {formatRupiah(savings)}
            </span>
          )}
        </div>
        {upcoming && (
          <p className="mt-3 flex items-start gap-1.5 text-xs text-muted">
            <Info className="mt-px size-3.5 shrink-0" />
            Tambah {formatNumber(upcoming.needed)} {product.unit} lagi untuk harga {formatRupiah(upcoming.price)}/{product.unit}.
            <button type="button" className="font-semibold text-brand-700 hover:underline dark:text-brand-400" onClick={() => setQuantity(upcoming.min)}>
              Terapkan
            </button>
          </p>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        <button type="button" className="btn btn-primary h-12 flex-1 basis-56 text-[15px]" onClick={() => add()}>
          <ClipboardPlus className="size-5" /> Tambah ke daftar RFQ
        </button>
        <button type="button" className={cn("btn btn-secondary size-12 p-0", actions.inWishlist && "text-rose-600")} onClick={actions.wishlist} aria-pressed={actions.inWishlist} aria-label="Simpan ke favorit">
          <Heart className={cn("size-5", actions.inWishlist && "fill-current")} />
        </button>
        <button type="button" className={cn("btn btn-secondary size-12 p-0", actions.inCompare && "border-brand-500 text-brand-700 dark:text-brand-400")} onClick={actions.compare} aria-pressed={actions.inCompare} aria-label="Bandingkan">
          <Scale className="size-5" />
        </button>
      </div>
      {product.sample.available && (
        <button
          type="button"
          onClick={() => add(`Permintaan sampel: ${product.sample.note}`)}
          className="flex w-full items-center gap-3 rounded-2xl border border-dashed border-line p-3 text-left text-sm transition hover:border-brand-400"
        >
          <FlaskConical className="size-5 shrink-0 text-saffron-500" />
          <span className="flex-1">
            <span className="font-semibold">Minta sampel {product.sample.price ? `· ${formatRupiah(product.sample.price)}` : "· Gratis"}</span>
            <span className="block text-xs text-muted">{product.sample.note}</span>
          </span>
        </button>
      )}
    </div>
  );
}
