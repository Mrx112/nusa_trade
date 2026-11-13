"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { Building2, CornerDownLeft, FileText, LayoutDashboard, Package, Scale, Search } from "lucide-react";
import { products } from "@/lib/data/products";
import { suppliers } from "@/lib/data/suppliers";
import { getCategory } from "@/lib/data/categories";
import { priceRange } from "@/lib/catalog";
import { formatRupiah } from "@/lib/format";
import { useUi } from "@/lib/store";
import { cn } from "@/lib/cn";

type Result = {
  id: string;
  group: "Produk" | "Pemasok" | "Halaman";
  title: string;
  subtitle: string;
  href: string;
  image?: string;
  icon?: React.ComponentType<{ className?: string }>;
};

const pages: Result[] = [
  { id: "p-katalog", group: "Halaman", title: "Katalog produk", subtitle: "Semua produk & filter", href: "/produk", icon: Package },
  { id: "p-pemasok", group: "Halaman", title: "Direktori pemasok", subtitle: "Pemasok terverifikasi", href: "/pemasok", icon: Building2 },
  { id: "p-rfq", group: "Halaman", title: "Buat permintaan penawaran", subtitle: "Formulir RFQ multi-langkah", href: "/rfq", icon: FileText },
  { id: "p-bandingkan", group: "Halaman", title: "Bandingkan produk", subtitle: "Hingga 4 produk berdampingan", href: "/bandingkan", icon: Scale },
  { id: "p-dashboard", group: "Halaman", title: "Dashboard pengadaan", subtitle: "Riwayat RFQ & analitik", href: "/dashboard", icon: LayoutDashboard },
];

const normalize = (value: string) => value.toLocaleLowerCase("id-ID");

export function CommandPalette() {
  const open = useUi((state) => state.commandOpen);
  const setCommand = useUi((state) => state.setCommand);
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setCommand(!useUi.getState().commandOpen);
      }
      if (event.key === "/" && !(event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement)) {
        event.preventDefault();
        setCommand(true);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [setCommand]);

  useEffect(() => {
    if (open) {
      setQuery("");
      setActive(0);
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open]);

  const results = useMemo<Result[]>(() => {
    const q = normalize(query.trim());
    const productResults: Result[] = products
      .filter((product) => !q || normalize(`${product.name} ${product.tags.join(" ")} ${getCategory(product.category)?.name}`).includes(q))
      .map((product) => ({
        id: product.slug,
        group: "Produk",
        title: product.name,
        subtitle: `Mulai ${formatRupiah(priceRange(product).min)}/${product.unit} · MOQ ${product.moq} ${product.unit}`,
        href: `/produk/${product.slug}`,
        image: product.image,
      }));
    const supplierResults: Result[] = suppliers
      .filter((supplier) => !q || normalize(`${supplier.name} ${supplier.city} ${supplier.province} ${supplier.tagline}`).includes(q))
      .map((supplier) => ({
        id: supplier.slug,
        group: "Pemasok",
        title: supplier.name,
        subtitle: `${supplier.city}, ${supplier.province}`,
        href: `/pemasok/${supplier.slug}`,
        icon: Building2,
      }));
    const pageResults = pages.filter((page) => !q || normalize(`${page.title} ${page.subtitle}`).includes(q));
    return [...productResults.slice(0, q ? 8 : 4), ...supplierResults.slice(0, q ? 6 : 3), ...pageResults];
  }, [query]);

  useEffect(() => setActive(0), [query]);

  if (!open) return null;

  const go = (result: Result | undefined) => {
    if (!result) return;
    setCommand(false);
    router.push(result.href);
  };

  const onKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActive((index) => Math.min(results.length - 1, index + 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActive((index) => Math.max(0, index - 1));
    } else if (event.key === "Enter") {
      event.preventDefault();
      go(results[active]);
    } else if (event.key === "Escape") {
      setCommand(false);
    }
  };

  let lastGroup = "";
  return (
    <div className="fixed inset-0 z-[60] flex items-start justify-center px-4 pt-[12vh]" onKeyDown={onKeyDown}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-[fade-up_0.2s_ease-out]" onClick={() => setCommand(false)} />
      <div role="dialog" aria-modal="true" aria-label="Pencarian cepat" className="card relative w-full max-w-xl overflow-hidden shadow-2xl animate-fade-up">
        <div className="flex items-center gap-3 border-b border-line px-4">
          <Search className="size-5 text-muted" />
          <input
            ref={inputRef}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Cari produk, pemasok, atau halaman…"
            className="h-14 flex-1 bg-transparent text-base outline-none placeholder:text-muted"
            role="combobox"
            aria-expanded="true"
            aria-controls="command-results"
            aria-activedescendant={results[active] ? `cmd-${results[active].id}` : undefined}
          />
          <kbd className="rounded-md border border-line bg-surface-2 px-1.5 py-0.5 text-[11px] font-semibold text-muted">Esc</kbd>
        </div>
        <ul id="command-results" role="listbox" className="max-h-[55vh] overflow-y-auto p-2">
          {results.length === 0 && <li className="px-3 py-10 text-center text-sm text-muted">Tidak ada hasil untuk “{query}”.</li>}
          {results.map((result, index) => {
            const header = result.group !== lastGroup ? result.group : null;
            lastGroup = result.group;
            const Icon = result.icon;
            return (
              <li key={`${result.group}-${result.id}`} role="presentation">
                {header && <p className="px-3 pb-1 pt-3 text-[11px] font-bold uppercase tracking-wider text-muted">{header}</p>}
                <button
                  id={`cmd-${result.id}`}
                  type="button"
                  role="option"
                  aria-selected={index === active}
                  onMouseEnter={() => setActive(index)}
                  onClick={() => go(result)}
                  className={cn("flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left", index === active && "bg-surface-2")}
                >
                  {result.image ? (
                    <span className="relative size-10 shrink-0 overflow-hidden rounded-lg bg-surface-2">
                      <Image src={result.image} alt="" fill sizes="40px" className="object-cover" />
                    </span>
                  ) : (
                    <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-400">
                      {Icon && <Icon className="size-5" />}
                    </span>
                  )}
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold">{result.title}</span>
                    <span className="block truncate text-xs text-muted">{result.subtitle}</span>
                  </span>
                  {index === active && <CornerDownLeft className="size-4 text-muted" />}
                </button>
              </li>
            );
          })}
        </ul>
        <div className="flex items-center gap-4 border-t border-line px-4 py-2.5 text-[11px] text-muted">
          <span><kbd className="font-semibold">↑↓</kbd> navigasi</span>
          <span><kbd className="font-semibold">Enter</kbd> buka</span>
          <span className="ml-auto">Pintasan: <kbd className="font-semibold">Ctrl K</kbd> atau <kbd className="font-semibold">/</kbd></span>
        </div>
      </div>
    </div>
  );
}
