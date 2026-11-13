import type { Metadata } from "next";
import { CompareView } from "@/components/compare/compare-view";

export const metadata: Metadata = {
  title: "Bandingkan produk",
  description: "Bandingkan hingga 4 produk berdampingan: harga bertingkat, MOQ, lead time, kapasitas, sertifikasi, dan performa pemasok.",
};

export default function ComparePage() {
  return (
    <div className="container-page pt-8">
      <p className="kicker">Perbandingan</p>
      <h1 className="mt-2 text-3xl font-extrabold tracking-tight md:text-4xl">Bandingkan produk</h1>
      <p className="mt-2 max-w-2xl text-muted">Sandingkan hingga 4 produk untuk memilih pemasok yang paling sesuai. Nilai terbaik di setiap baris ditandai hijau.</p>
      <CompareView />
    </div>
  );
}
