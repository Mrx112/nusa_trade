"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Scale, X } from "lucide-react";
import { getProduct } from "@/lib/data/products";
import { MAX_COMPARE, useAppStore } from "@/lib/store";
import { useMounted } from "@/lib/use-mounted";

export function CompareBar() {
  const mounted = useMounted();
  const pathname = usePathname();
  const compare = useAppStore((state) => state.compare);
  const removeCompare = useAppStore((state) => state.removeCompare);
  const clearCompare = useAppStore((state) => state.clearCompare);

  if (!mounted || compare.length === 0 || pathname === "/bandingkan" || pathname === "/rfq") return null;

  return (
    <div className="fixed inset-x-0 bottom-4 z-30 flex justify-center px-4">
      <div className="card flex w-full max-w-2xl items-center gap-3 px-3 py-2.5 shadow-lift animate-fade-up">
        <span className="hidden size-9 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-700 sm:grid dark:bg-brand-950 dark:text-brand-400">
          <Scale className="size-4" />
        </span>
        <div className="flex min-w-0 flex-1 items-center gap-2">
          {compare.map((slug) => {
            const product = getProduct(slug);
            if (!product) return null;
            return (
              <span key={slug} className="group relative size-10 shrink-0 overflow-hidden rounded-lg border border-line bg-surface-2">
                <Image src={product.image} alt={product.name} fill sizes="40px" className="object-cover" />
                <button
                  type="button"
                  onClick={() => removeCompare(slug)}
                  className="absolute inset-0 grid place-items-center bg-black/50 text-white opacity-0 transition-opacity group-hover:opacity-100 focus:opacity-100"
                  aria-label={`Hapus ${product.name} dari perbandingan`}
                >
                  <X className="size-4" />
                </button>
              </span>
            );
          })}
          <span className="ml-1 truncate text-xs text-muted">
            {compare.length}/{MAX_COMPARE} dipilih
          </span>
        </div>
        <button type="button" onClick={clearCompare} className="btn btn-ghost px-3 text-xs">
          Hapus
        </button>
        <Link href="/bandingkan" className="btn btn-primary px-4">
          Bandingkan
        </Link>
      </div>
    </div>
  );
}
