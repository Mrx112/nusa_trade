import Image from "next/image";
import Link from "next/link";
import { MapPin, Truck } from "lucide-react";
import type { Product } from "@/lib/types";
import { getCategory } from "@/lib/data/categories";
import { priceRange, supplierOf } from "@/lib/catalog";
import { formatCompact, formatNumber, formatRupiah } from "@/lib/format";
import { RatingStars, VerifiedBadge } from "@/components/ui/misc";
import { CardIconButtons, QuickAddButton } from "@/components/product/product-actions";
import { cn } from "@/lib/cn";

export function ProductCard({ product, layout = "grid", priority = false }: { product: Product; layout?: "grid" | "list"; priority?: boolean }) {
  const supplier = supplierOf(product);
  const range = priceRange(product);
  const list = layout === "list";

  return (
    <article
      className={cn(
        "card group relative flex overflow-hidden transition duration-300 hover:-translate-y-0.5 hover:shadow-lift",
        list ? "flex-col sm:flex-row" : "flex-col",
      )}
    >
      <div className={cn("relative overflow-hidden bg-surface-2", list ? "aspect-[4/3] sm:aspect-auto sm:w-64 sm:shrink-0" : "aspect-[4/3]")}>
        <Image
          src={product.image}
          alt={product.name}
          fill
          priority={priority}
          sizes={list ? "(min-width: 640px) 256px, 100vw" : "(min-width: 1280px) 25vw, (min-width: 768px) 33vw, (min-width: 640px) 50vw, 100vw"}
          className="object-cover transition duration-500 group-hover:scale-105"
        />
        {product.badge && (
          <span className="absolute left-3 top-3 rounded-full bg-saffron-400 px-2.5 py-1 text-[11px] font-bold text-[#241703] shadow-sm">{product.badge}</span>
        )}
        <CardIconButtons slug={product.slug} name={product.name} />
      </div>

      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-center justify-between gap-2 text-xs">
          <span className="font-medium text-muted">{getCategory(product.category)?.name}</span>
          <span className="flex items-center gap-1 text-muted">
            <RatingStars rating={product.rating} />
            <span className="font-semibold text-fg">{product.rating.toLocaleString("id-ID")}</span>
          </span>
        </div>

        <h3 className="mt-2 font-bold leading-snug">
          <Link href={`/produk/${product.slug}`} className="after:absolute after:inset-0 after:content-[''] focus:outline-none">
            {product.name}
          </Link>
        </h3>
        {list && <p className="mt-1.5 line-clamp-2 text-sm text-muted">{product.tagline}</p>}

        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted">
          <span className="flex items-center gap-1">
            <MapPin className="size-3.5" /> {supplier.city}
          </span>
          <VerifiedBadge label={supplier.name} className="font-medium" />
        </div>

        {list && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {product.highlights.slice(0, 3).map((highlight) => (
              <span key={highlight} className="rounded-lg bg-surface-2 px-2 py-1 text-[11px] font-medium text-muted">
                {highlight}
              </span>
            ))}
          </div>
        )}

        <div className="min-h-3 flex-1" />
        <div className="flex items-end justify-between gap-3 border-t border-dashed border-line pt-3">
          <div className="min-w-0">
            <p className="text-lg font-extrabold leading-tight tabular-nums">
              {formatRupiah(range.min)}
              <span className="text-xs font-medium text-muted"> – {formatRupiah(range.max)}</span>
            </p>
            <p className="mt-0.5 text-xs text-muted">
              per {product.unit} · MOQ {formatNumber(product.moq)} {product.unit}
            </p>
            <p className="mt-1 flex items-center gap-1 text-[11px] text-muted">
              <Truck className="size-3.5" /> {product.leadTimeDays[0]}–{product.leadTimeDays[1]} hari · {formatCompact(product.soldCount)} terjual
            </p>
          </div>
          <QuickAddButton slug={product.slug} name={product.name} className="relative z-10" />
        </div>
      </div>
    </article>
  );
}
