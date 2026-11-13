import type { Category } from "@/lib/types";

export const categories: Category[] = [
  {
    id: "makanan-minuman",
    name: "Makanan & Minuman",
    tagline: "Bahan baku dan produk siap jual",
    description: "Kopi, teh, dan bahan baku F&B langsung dari koperasi serta perkebunan lokal.",
  },
  {
    id: "kemasan",
    name: "Kemasan",
    tagline: "Solusi untuk setiap produk",
    description: "Gelas kertas, botol, dan kardus pengiriman — polos maupun cetak logo merek Anda.",
  },
  {
    id: "kebutuhan-kantor",
    name: "Kebutuhan Kantor",
    tagline: "Lengkapi ruang kerja",
    description: "Kertas dan perlengkapan kerja dengan stok gudang dan pengiriman cepat.",
  },
  {
    id: "tekstil-seragam",
    name: "Tekstil & Seragam",
    tagline: "Dibuat untuk tim Anda",
    description: "Seragam kerja dan produk kanvas promosi dari konveksi lokal berpengalaman.",
  },
];

export function getCategory(id: string) {
  return categories.find((category) => category.id === id);
}
