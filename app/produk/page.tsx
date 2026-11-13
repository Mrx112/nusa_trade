import type { Metadata } from "next";
import { Suspense } from "react";
import { CatalogView } from "@/components/catalog/catalog-view";

export const metadata: Metadata = {
  title: "Katalog produk",
  description: "Katalog produk B2B dari pemasok lokal terverifikasi: filter berdasarkan kategori, harga, MOQ, lokasi, dan sertifikasi.",
};

export default function CatalogPage() {
  return (
    <div className="container-page pt-8">
      <div className="max-w-2xl">
        <p className="kicker">Katalog</p>
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight md:text-4xl">Semua produk</h1>
        <p className="mt-2 text-muted">Harga grosir bertingkat dari pemasok terverifikasi. Tambahkan ke daftar RFQ untuk meminta penawaran resmi.</p>
      </div>
      <Suspense fallback={<div className="mt-10 h-96 animate-pulse rounded-3xl bg-surface-2" />}>
        <CatalogView />
      </Suspense>
    </div>
  );
}
