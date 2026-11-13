"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { LayoutGrid, List, Search, SlidersHorizontal, X } from "lucide-react";
import { products } from "@/lib/data/products";
import { categories, getCategory } from "@/lib/data/categories";
import { priceRange, provinces, supplierOf } from "@/lib/catalog";
import { formatNumber } from "@/lib/format";
import { ProductCard } from "@/components/product/product-card";
import { CategoryIcon } from "@/components/ui/misc";
import { cn } from "@/lib/cn";
import type { Product } from "@/lib/types";

const sorts = {
  relevan: { label: "Paling relevan", fn: (a: Product, b: Product) => b.rating * Math.log(b.reviewCount) - a.rating * Math.log(a.reviewCount) },
  "harga-terendah": { label: "Harga terendah", fn: (a: Product, b: Product) => priceRange(a).min - priceRange(b).min },
  "harga-tertinggi": { label: "Harga tertinggi", fn: (a: Product, b: Product) => priceRange(b).min - priceRange(a).min },
  rating: { label: "Rating tertinggi", fn: (a: Product, b: Product) => b.rating - a.rating || b.reviewCount - a.reviewCount },
  terlaris: { label: "Terlaris", fn: (a: Product, b: Product) => b.soldCount - a.soldCount },
  tercepat: { label: "Pengiriman tercepat", fn: (a: Product, b: Product) => a.leadTimeDays[0] - b.leadTimeDays[0] },
} as const;
type SortKey = keyof typeof sorts;

const pricePresets = [
  { label: "< Rp 5.000", min: "", max: "5000" },
  { label: "Rp 5.000 – 50.000", min: "5000", max: "50000" },
  { label: "> Rp 50.000", min: "50000", max: "" },
];

const normalize = (value: string) => value.toLocaleLowerCase("id-ID");

export function CatalogView() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [filtersOpen, setFiltersOpen] = useState(false);

  const q = params.get("q") ?? "";
  const selectedCategories = (params.get("kategori") ?? "").split(",").filter(Boolean);
  const selectedProvinces = (params.get("provinsi") ?? "").split(",").filter(Boolean);
  const minPrice = params.get("min") ?? "";
  const maxPrice = params.get("max") ?? "";
  const customOnly = params.get("custom") === "1";
  const sampleOnly = params.get("sampel") === "1";
  const fastOnly = params.get("cepat") === "1";
  const sort = (params.get("urut") as SortKey) in sorts ? (params.get("urut") as SortKey) : "relevan";
  const view = params.get("tampilan") === "list" ? "list" : "grid";

  const update = (patch: Record<string, string | null>) => {
    const next = new URLSearchParams(params.toString());
    for (const [key, value] of Object.entries(patch)) {
      if (value === null || value === "") next.delete(key);
      else next.set(key, value);
    }
    const query = next.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  };

  const toggleList = (key: string, current: string[], value: string) => {
    const next = current.includes(value) ? current.filter((entry) => entry !== value) : [...current, value];
    update({ [key]: next.join(",") || null });
  };

  const results = useMemo(() => {
    const query = normalize(q.trim());
    const min = minPrice ? Number(minPrice) : 0;
    const max = maxPrice ? Number(maxPrice) : Infinity;
    return products
      .filter((product) => {
        const supplier = supplierOf(product);
        const haystack = normalize(`${product.name} ${product.tagline} ${product.tags.join(" ")} ${supplier.name} ${supplier.city} ${getCategory(product.category)?.name}`);
        const range = priceRange(product);
        return (
          (!query || query.split(/\s+/).every((word) => haystack.includes(word))) &&
          (selectedCategories.length === 0 || selectedCategories.includes(product.category)) &&
          (selectedProvinces.length === 0 || selectedProvinces.includes(supplier.province)) &&
          range.max >= min &&
          range.min <= max &&
          (!customOnly || product.customizable) &&
          (!sampleOnly || product.sample.available) &&
          (!fastOnly || product.leadTimeDays[1] <= 7)
        );
      })
      .sort(sorts[sort].fn);
  }, [q, selectedCategories, selectedProvinces, minPrice, maxPrice, customOnly, sampleOnly, fastOnly, sort]);

  const activeFilters: { label: string; clear: () => void }[] = [
    ...(q ? [{ label: `“${q}”`, clear: () => update({ q: null }) }] : []),
    ...selectedCategories.map((id) => ({ label: getCategory(id)?.name ?? id, clear: () => toggleList("kategori", selectedCategories, id) })),
    ...selectedProvinces.map((province) => ({ label: province, clear: () => toggleList("provinsi", selectedProvinces, province) })),
    ...(minPrice || maxPrice
      ? [{ label: `Harga ${minPrice ? `≥ ${formatNumber(Number(minPrice))}` : ""}${minPrice && maxPrice ? " · " : ""}${maxPrice ? `≤ ${formatNumber(Number(maxPrice))}` : ""}`, clear: () => update({ min: null, max: null }) }]
      : []),
    ...(customOnly ? [{ label: "Bisa custom", clear: () => update({ custom: null }) }] : []),
    ...(sampleOnly ? [{ label: "Sampel tersedia", clear: () => update({ sampel: null }) }] : []),
    ...(fastOnly ? [{ label: "Kirim ≤ 7 hari", clear: () => update({ cepat: null }) }] : []),
  ];

  const filterPanel = (
    <div className="space-y-7">
      <FilterGroup title="Kategori">
        {categories.map((category) => {
          const count = products.filter((product) => product.category === category.id).length;
          return (
            <CheckRow
              key={category.id}
              checked={selectedCategories.includes(category.id)}
              onChange={() => toggleList("kategori", selectedCategories, category.id)}
              label={
                <span className="flex items-center gap-2">
                  <CategoryIcon id={category.id} className="size-4 text-muted" /> {category.name}
                </span>
              }
              count={count}
            />
          );
        })}
      </FilterGroup>

      <FilterGroup title="Harga satuan (Rp)">
        <div className="flex items-center gap-2">
          <input
            key={`min-${minPrice}`}
            className="input py-2"
            inputMode="numeric"
            placeholder="Min"
            defaultValue={minPrice}
            onBlur={(event) => update({ min: event.target.value.replace(/\D/g, "") || null })}
            aria-label="Harga minimum"
          />
          <span className="text-muted">–</span>
          <input
            key={`max-${maxPrice}`}
            className="input py-2"
            inputMode="numeric"
            placeholder="Maks"
            defaultValue={maxPrice}
            onBlur={(event) => update({ max: event.target.value.replace(/\D/g, "") || null })}
            aria-label="Harga maksimum"
          />
        </div>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {pricePresets.map((preset) => (
            <button
              key={preset.label}
              type="button"
              className="chip px-2.5 py-1 text-xs"
              data-active={minPrice === preset.min && maxPrice === preset.max}
              onClick={() => update({ min: preset.min || null, max: preset.max || null })}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </FilterGroup>

      <FilterGroup title="Lokasi pemasok">
        {provinces.map((province) => (
          <CheckRow
            key={province}
            checked={selectedProvinces.includes(province)}
            onChange={() => toggleList("provinsi", selectedProvinces, province)}
            label={province}
            count={products.filter((product) => supplierOf(product).province === province).length}
          />
        ))}
      </FilterGroup>

      <FilterGroup title="Layanan">
        <CheckRow checked={customOnly} onChange={() => update({ custom: customOnly ? null : "1" })} label="Bisa custom / private label" />
        <CheckRow checked={sampleOnly} onChange={() => update({ sampel: sampleOnly ? null : "1" })} label="Sampel tersedia" />
        <CheckRow checked={fastOnly} onChange={() => update({ cepat: fastOnly ? null : "1" })} label="Kirim ≤ 7 hari" />
      </FilterGroup>
    </div>
  );

  return (
    <div className="mt-8 grid gap-8 lg:grid-cols-[260px_1fr]">
      <aside className="hidden lg:block">
        <div className="sticky top-24">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="flex items-center gap-2 font-bold">
              <SlidersHorizontal className="size-4" /> Filter
            </h2>
            {activeFilters.length > 0 && (
              <button type="button" className="text-xs font-semibold text-brand-700 hover:underline dark:text-brand-400" onClick={() => router.replace(pathname, { scroll: false })}>
                Reset
              </button>
            )}
          </div>
          {filterPanel}
        </div>
      </aside>

      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-3">
          <label className="relative min-w-0 flex-1 basis-64">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted" />
            <input
              key={`q-${q}`}
              defaultValue={q}
              className="input pl-10"
              placeholder="Cari di katalog…"
              aria-label="Cari di katalog"
              onKeyDown={(event) => event.key === "Enter" && update({ q: event.currentTarget.value.trim() || null })}
              onBlur={(event) => event.target.value.trim() !== q && update({ q: event.target.value.trim() || null })}
            />
          </label>
          <button type="button" className="btn btn-secondary lg:hidden" onClick={() => setFiltersOpen(true)}>
            <SlidersHorizontal className="size-4" /> Filter {activeFilters.length > 0 && `(${activeFilters.length})`}
          </button>
          <select className="input w-auto py-2.5 pr-8" value={sort} onChange={(event) => update({ urut: event.target.value === "relevan" ? null : event.target.value })} aria-label="Urutkan">
            {Object.entries(sorts).map(([key, value]) => (
              <option key={key} value={key}>
                {value.label}
              </option>
            ))}
          </select>
          <div className="flex rounded-xl border border-line bg-surface p-1" role="group" aria-label="Tampilan">
            {(["grid", "list"] as const).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => update({ tampilan: mode === "grid" ? null : "list" })}
                className={cn("grid size-8 place-items-center rounded-lg text-muted", view === mode && "bg-surface-2 text-fg")}
                aria-pressed={view === mode}
                aria-label={mode === "grid" ? "Tampilan grid" : "Tampilan daftar"}
              >
                {mode === "grid" ? <LayoutGrid className="size-4" /> : <List className="size-4" />}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <p className="text-sm text-muted" aria-live="polite">
            <span className="font-semibold text-fg">{results.length}</span> dari {products.length} produk
          </p>
          {activeFilters.map((filter) => (
            <button key={filter.label} type="button" onClick={filter.clear} className="chip px-2.5 py-1 text-xs" data-active="true">
              {filter.label} <X className="size-3" />
            </button>
          ))}
        </div>

        {results.length === 0 ? (
          <div className="card mt-6 flex flex-col items-center px-6 py-16 text-center">
            <Search className="size-10 text-muted" />
            <h3 className="mt-4 text-lg font-bold">Produk tidak ditemukan</h3>
            <p className="mt-1 max-w-sm text-sm text-muted">Coba kata kunci lain atau kurangi filter. Anda juga bisa mengirim RFQ manual untuk produk yang belum ada di katalog.</p>
            <button type="button" className="btn btn-secondary mt-5" onClick={() => router.replace(pathname, { scroll: false })}>
              Reset semua filter
            </button>
          </div>
        ) : (
          <div className={cn("mt-6 grid gap-5", view === "grid" ? "sm:grid-cols-2 xl:grid-cols-3" : "grid-cols-1")}>
            {results.map((product, index) => (
              <ProductCard key={product.slug} product={product} layout={view} priority={index < 3} />
            ))}
          </div>
        )}
      </div>

      {filtersOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setFiltersOpen(false)} />
          <div role="dialog" aria-modal="true" aria-label="Filter produk" className="absolute inset-x-0 bottom-0 max-h-[85dvh] overflow-y-auto rounded-t-3xl bg-bg p-5 animate-fade-up">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-lg font-bold">Filter</h2>
              <button type="button" className="btn btn-ghost size-10 p-0" onClick={() => setFiltersOpen(false)} aria-label="Tutup filter">
                <X className="size-5" />
              </button>
            </div>
            {filterPanel}
            <button type="button" className="btn btn-primary sticky bottom-0 mt-6 w-full" onClick={() => setFiltersOpen(false)}>
              Tampilkan {results.length} produk
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset>
      <legend className="mb-3 text-xs font-bold uppercase tracking-wider text-muted">{title}</legend>
      <div className="space-y-1">{children}</div>
    </fieldset>
  );
}

function CheckRow({ checked, onChange, label, count }: { checked: boolean; onChange: () => void; label: React.ReactNode; count?: number }) {
  return (
    <label className="flex cursor-pointer items-center gap-3 rounded-lg px-2 py-1.5 text-sm hover:bg-surface-2">
      <input type="checkbox" checked={checked} onChange={onChange} className="size-4 rounded accent-brand-600" />
      <span className="flex-1">{label}</span>
      {count !== undefined && <span className="text-xs tabular-nums text-muted">{count}</span>}
    </label>
  );
}
