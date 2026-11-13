"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";
import { ArrowRight, ClipboardList, Trash2, X } from "lucide-react";
import { getProduct } from "@/lib/data/products";
import { quantityStep, supplierOf, unitPriceFor } from "@/lib/catalog";
import { formatNumber, formatRupiah } from "@/lib/format";
import { useAppStore, useUi } from "@/lib/store";
import { QuantityInput } from "@/components/ui/quantity-input";
import { cn } from "@/lib/cn";

export function RfqDrawer() {
  const open = useUi((state) => state.drawerOpen);
  const setDrawer = useUi((state) => state.setDrawer);
  const cart = useAppStore((state) => state.cart);
  const updateCartItem = useAppStore((state) => state.updateCartItem);
  const removeFromCart = useAppStore((state) => state.removeFromCart);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && setDrawer(false);
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, setDrawer]);

  const lines = cart.flatMap((item) => {
    const product = getProduct(item.slug);
    if (!product) return [];
    const unitPrice = unitPriceFor(product, item.quantity);
    return [{ item, product, unitPrice, subtotal: unitPrice * item.quantity }];
  });
  const total = lines.reduce((sum, line) => sum + line.subtotal, 0);
  const supplierCount = new Set(lines.map((line) => line.product.supplierSlug)).size;

  return (
    <div className={cn("fixed inset-0 z-50", open ? "pointer-events-auto" : "pointer-events-none")} inert={!open}>
      <div
        className={cn("absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300", open ? "opacity-100" : "opacity-0")}
        onClick={() => setDrawer(false)}
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="rfq-drawer-title"
        className={cn(
          "absolute inset-y-0 right-0 flex w-full max-w-md flex-col bg-bg shadow-2xl transition-transform duration-300 ease-out",
          open ? "translate-x-0" : "translate-x-full",
        )}
      >
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <div>
            <p className="kicker">Daftar permintaan</p>
            <h2 id="rfq-drawer-title" className="text-lg font-bold">
              Daftar RFQ <span className="text-muted">({lines.length})</span>
            </h2>
          </div>
          <button type="button" className="btn btn-ghost size-10 p-0" onClick={() => setDrawer(false)} aria-label="Tutup daftar RFQ">
            <X className="size-5" />
          </button>
        </div>

        {lines.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
            <div className="grid size-16 place-items-center rounded-2xl bg-brand-50 text-brand-600 dark:bg-brand-950 dark:text-brand-400">
              <ClipboardList className="size-7" />
            </div>
            <h3 className="mt-4 font-bold">Belum ada produk</h3>
            <p className="mt-1 text-sm text-muted">Tambahkan produk dari katalog untuk menyusun permintaan penawaran ke beberapa pemasok sekaligus.</p>
            <Link href="/produk" className="btn btn-secondary mt-5" onClick={() => setDrawer(false)}>
              Jelajahi katalog
            </Link>
          </div>
        ) : (
          <>
            <ul className="flex-1 space-y-3 overflow-y-auto p-5">
              {lines.map(({ item, product, unitPrice, subtotal }) => (
                <li key={item.slug} className="card flex gap-3 p-3">
                  <Link href={`/produk/${product.slug}`} onClick={() => setDrawer(false)} className="relative size-20 shrink-0 overflow-hidden rounded-xl bg-surface-2">
                    <Image src={product.image} alt={product.name} fill sizes="80px" className="object-cover" />
                  </Link>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold">{product.name}</p>
                        <p className="truncate text-xs text-muted">{supplierOf(product).name}</p>
                      </div>
                      <button type="button" onClick={() => removeFromCart(item.slug)} className="text-muted transition-colors hover:text-red-600" aria-label={`Hapus ${product.name}`}>
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                    {Object.keys(item.variants).length > 0 && (
                      <p className="mt-1 truncate text-xs text-muted">{Object.values(item.variants).join(" · ")}</p>
                    )}
                    <div className="mt-2 flex items-end justify-between gap-2">
                      <QuantityInput
                        size="sm"
                        value={item.quantity}
                        min={product.moq}
                        step={quantityStep(product.moq)}
                        onChange={(quantity) => updateCartItem(item.slug, { quantity })}
                        label={`jumlah ${product.name}`}
                      />
                      <div className="text-right">
                        <p className="text-sm font-bold tabular-nums">{formatRupiah(subtotal)}</p>
                        <p className="text-[11px] text-muted tabular-nums">
                          {formatRupiah(unitPrice)}/{product.unit}
                        </p>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
            <div className="space-y-3 border-t border-line bg-surface p-5">
              <div className="flex justify-between text-sm text-muted">
                <span>{formatNumber(lines.length)} produk · {supplierCount} pemasok</span>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-sm font-medium">Estimasi nilai</span>
                <span className="text-xl font-extrabold tabular-nums">{formatRupiah(total)}</span>
              </div>
              <Link href="/rfq" className="btn btn-primary w-full" onClick={() => setDrawer(false)}>
                Lanjutkan permintaan <ArrowRight className="size-4" />
              </Link>
              <p className="text-center text-[11px] text-muted">Harga final, ongkir, dan ketersediaan dikonfirmasi oleh pemasok.</p>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}
