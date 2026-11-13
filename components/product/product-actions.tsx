"use client";

import { Heart, Plus, Scale } from "lucide-react";
import { getProduct } from "@/lib/data/products";
import { MAX_COMPARE, useAppStore, useUi } from "@/lib/store";
import { useMounted } from "@/lib/use-mounted";
import { cn } from "@/lib/cn";

export function useProductActions(slug: string) {
  const mounted = useMounted();
  const inWishlist = useAppStore((state) => state.wishlist.includes(slug));
  const inCompare = useAppStore((state) => state.compare.includes(slug));
  const inCart = useAppStore((state) => state.cart.some((item) => item.slug === slug));
  const toggleWishlist = useAppStore((state) => state.toggleWishlist);
  const toggleCompare = useAppStore((state) => state.toggleCompare);
  const addToCart = useAppStore((state) => state.addToCart);
  const toast = useUi((state) => state.toast);
  const setDrawer = useUi((state) => state.setDrawer);

  return {
    inWishlist: mounted && inWishlist,
    inCompare: mounted && inCompare,
    inCart: mounted && inCart,
    wishlist: () => {
      const saved = toggleWishlist(slug);
      toast({ title: saved ? "Disimpan ke favorit" : "Dihapus dari favorit", tone: saved ? "success" : "info" });
    },
    compare: () => {
      const wasIn = useAppStore.getState().compare.includes(slug);
      const added = toggleCompare(slug);
      if (!wasIn && !added) {
        toast({ title: `Maksimal ${MAX_COMPARE} produk`, description: "Hapus salah satu produk dari perbandingan terlebih dahulu.", tone: "error" });
      } else {
        toast({ title: added ? "Ditambahkan ke perbandingan" : "Dihapus dari perbandingan", tone: added ? "success" : "info" });
      }
    },
    quickAdd: () => {
      const product = getProduct(slug);
      if (!product) return;
      addToCart({ slug, quantity: product.moq, variants: Object.fromEntries(product.variants.map((variant) => [variant.name, variant.options[0]])) });
      toast({ title: "Ditambahkan ke daftar RFQ", description: `${product.name} · ${product.moq} ${product.unit} (MOQ)` });
      setDrawer(true);
    },
  };
}

export function CardIconButtons({ slug, name }: { slug: string; name: string }) {
  const actions = useProductActions(slug);
  return (
    <div className="absolute right-3 top-3 z-10 flex flex-col gap-2">
      <button
        type="button"
        onClick={actions.wishlist}
        className={cn(
          "grid size-9 place-items-center rounded-full bg-white/90 text-slate-700 shadow-sm backdrop-blur transition hover:scale-105 dark:bg-black/60 dark:text-white",
          actions.inWishlist && "text-rose-600 dark:text-rose-400",
        )}
        aria-pressed={actions.inWishlist}
        aria-label={`${actions.inWishlist ? "Hapus" : "Simpan"} ${name} ${actions.inWishlist ? "dari" : "ke"} favorit`}
      >
        <Heart className={cn("size-4", actions.inWishlist && "fill-current")} />
      </button>
      <button
        type="button"
        onClick={actions.compare}
        className={cn(
          "grid size-9 place-items-center rounded-full bg-white/90 text-slate-700 shadow-sm backdrop-blur transition hover:scale-105 dark:bg-black/60 dark:text-white",
          actions.inCompare && "bg-brand-600 text-white dark:bg-brand-600",
        )}
        aria-pressed={actions.inCompare}
        aria-label={`${actions.inCompare ? "Hapus" : "Tambah"} ${name} ${actions.inCompare ? "dari" : "ke"} perbandingan`}
      >
        <Scale className="size-4" />
      </button>
    </div>
  );
}

export function QuickAddButton({ slug, name, className }: { slug: string; name: string; className?: string }) {
  const actions = useProductActions(slug);
  return (
    <button
      type="button"
      onClick={actions.quickAdd}
      className={cn("btn btn-primary size-10 shrink-0 rounded-xl p-0", className)}
      aria-label={`Tambah ${name} ke daftar RFQ`}
      title="Tambah ke daftar RFQ (MOQ)"
    >
      <Plus className="size-5" />
    </button>
  );
}
