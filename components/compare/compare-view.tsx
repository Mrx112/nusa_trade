"use client";

import Image from "next/image";
import Link from "next/link";
import { Check, Minus, Plus, Scale, X } from "lucide-react";
import { getProduct, products } from "@/lib/data/products";
import { priceRange, supplierOf } from "@/lib/catalog";
import { formatNumber, formatRupiah } from "@/lib/format";
import { MAX_COMPARE, useAppStore } from "@/lib/store";
import { useMounted } from "@/lib/use-mounted";
import { QuickAddButton } from "@/components/product/product-actions";
import { RatingStars } from "@/components/ui/misc";
import type { Product } from "@/lib/types";
import { cn } from "@/lib/cn";

type Row = {
  label: string;
  render: (product: Product) => React.ReactNode;
  /** Nilai numerik untuk menentukan yang terbaik; semakin kecil semakin baik jika lowerIsBetter. */
  score?: (product: Product) => number;
  lowerIsBetter?: boolean;
};

const rows: Row[] = [
  { label: "Harga mulai", render: (p) => `${formatRupiah(priceRange(p).min)}/${p.unit}`, score: (p) => priceRange(p).min, lowerIsBetter: true },
  { label: "Harga tier", render: (p) => <ul className="space-y-0.5">{p.priceTiers.map((t) => <li key={t.min} className="tabular-nums">≥ {formatNumber(t.min)}: {formatRupiah(t.price)}</li>)}</ul> },
  { label: "Diskon volume maks.", render: (p) => `${Math.round((1 - priceRange(p).min / priceRange(p).max) * 100)}%`, score: (p) => 1 - priceRange(p).min / priceRange(p).max },
  { label: "MOQ", render: (p) => `${formatNumber(p.moq)} ${p.unit}` },
  { label: "Lead time", render: (p) => `${p.leadTimeDays[0]}–${p.leadTimeDays[1]} hari`, score: (p) => p.leadTimeDays[1], lowerIsBetter: true },
  { label: "Rating", render: (p) => <span className="flex items-center gap-1.5"><RatingStars rating={p.rating} /> {p.rating.toLocaleString("id-ID")}</span>, score: (p) => p.rating },
  { label: "Ulasan", render: (p) => formatNumber(p.reviewCount), score: (p) => p.reviewCount },
  { label: "Kapasitas", render: (p) => p.monthlyCapacity },
  { label: "Asal", render: (p) => p.origin },
  { label: "Sertifikasi", render: (p) => p.certifications.join(", ") },
  { label: "Bisa custom", render: (p) => (p.customizable ? <Check className="size-4 text-brand-600" /> : <Minus className="size-4 text-muted" />) },
  { label: "Sampel", render: (p) => (p.sample.available ? (p.sample.price ? formatRupiah(p.sample.price) : "Gratis") : "—") },
  { label: "Pemasok", render: (p) => <Link href={`/pemasok/${p.supplierSlug}`} className="font-semibold hover:underline">{supplierOf(p).name}</Link> },
  { label: "Respons pemasok", render: (p) => `${supplierOf(p).responseRate}% · ${supplierOf(p).responseTime}`, score: (p) => supplierOf(p).responseRate },
  { label: "Kirim tepat waktu", render: (p) => `${supplierOf(p).onTimeDelivery}%`, score: (p) => supplierOf(p).onTimeDelivery },
];

export function CompareView() {
  const mounted = useMounted();
  const compare = useAppStore((state) => state.compare);
  const toggleCompare = useAppStore((state) => state.toggleCompare);
  const removeCompare = useAppStore((state) => state.removeCompare);

  if (!mounted) return <div className="mt-10 h-96 animate-pulse rounded-3xl bg-surface-2" />;

  const selected = compare.map((slug) => getProduct(slug)).filter((product): product is Product => Boolean(product));
  const suggestions = products.filter((product) => !compare.includes(product.slug));

  if (selected.length === 0) {
    return (
      <div className="mt-10">
        <div className="card flex flex-col items-center px-6 py-14 text-center">
          <span className="grid size-16 place-items-center rounded-2xl bg-brand-50 text-brand-600 dark:bg-brand-950 dark:text-brand-400">
            <Scale className="size-7" />
          </span>
          <h2 className="mt-4 text-lg font-bold">Belum ada produk untuk dibandingkan</h2>
          <p className="mt-1 max-w-md text-sm text-muted">Klik ikon timbangan di kartu produk, atau pilih langsung dari daftar di bawah.</p>
        </div>
        <Suggestions items={suggestions} onAdd={toggleCompare} disabled={false} />
      </div>
    );
  }

  const best = (row: Row) => {
    if (!row.score || selected.length < 2) return new Set<string>();
    const values = selected.map((product) => row.score!(product));
    const target = row.lowerIsBetter ? Math.min(...values) : Math.max(...values);
    if (values.every((value) => value === target)) return new Set<string>();
    return new Set(selected.filter((product) => row.score!(product) === target).map((product) => product.slug));
  };

  return (
    <div className="mt-8">
      <div className="card overflow-x-auto">
        <table className="w-full min-w-[720px] table-fixed text-sm">
          <thead>
            <tr>
              <th className="sticky left-0 z-10 w-44 bg-surface p-4 text-left align-bottom text-xs font-bold uppercase tracking-wider text-muted">
                {selected.length}/{MAX_COMPARE} produk
              </th>
              {selected.map((product) => (
                <th key={product.slug} className="p-4 text-left align-top font-normal">
                  <div className="relative">
                    <button type="button" onClick={() => removeCompare(product.slug)} className="absolute right-1 top-1 z-10 grid size-7 place-items-center rounded-full bg-black/55 text-white" aria-label={`Hapus ${product.name}`}>
                      <X className="size-4" />
                    </button>
                    <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-surface-2">
                      <Image src={product.image} alt={product.name} fill sizes="220px" className="object-cover" />
                    </div>
                    <Link href={`/produk/${product.slug}`} className="mt-3 block font-bold leading-snug hover:underline">
                      {product.name}
                    </Link>
                    <div className="mt-3 flex items-center gap-2">
                      <QuickAddButton slug={product.slug} name={product.name} className="size-9" />
                      <span className="text-xs text-muted">Tambah ke RFQ</span>
                    </div>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => {
              const winners = best(row);
              return (
                <tr key={row.label} className={cn(index % 2 === 0 && "bg-surface-2/50")}>
                  <th scope="row" className={cn("sticky left-0 z-10 p-4 text-left font-medium text-muted", index % 2 === 0 ? "bg-surface-2" : "bg-surface")}>
                    {row.label}
                  </th>
                  {selected.map((product) => (
                    <td key={product.slug} className={cn("p-4 align-top", winners.has(product.slug) && "font-bold text-brand-700 dark:text-brand-400")}>
                      {row.render(product)}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {selected.length < MAX_COMPARE && <Suggestions items={suggestions} onAdd={toggleCompare} disabled={false} />}
    </div>
  );
}

function Suggestions({ items, onAdd, disabled }: { items: Product[]; onAdd: (slug: string) => void; disabled: boolean }) {
  return (
    <div className="mt-10">
      <h2 className="font-bold">Tambahkan produk</h2>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((product) => (
          <button key={product.slug} type="button" disabled={disabled} onClick={() => onAdd(product.slug)} className="card flex items-center gap-3 p-3 text-left transition hover:border-brand-300">
            <span className="relative size-12 shrink-0 overflow-hidden rounded-lg bg-surface-2">
              <Image src={product.image} alt="" fill sizes="48px" className="object-cover" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-semibold">{product.name}</span>
              <span className="block text-xs text-muted">Mulai {formatRupiah(priceRange(product).min)}</span>
            </span>
            <Plus className="size-4 text-muted" />
          </button>
        ))}
      </div>
    </div>
  );
}
