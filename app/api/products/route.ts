import { NextResponse } from "next/server";
import { products } from "@/lib/data/products";
import { priceRange, supplierOf } from "@/lib/catalog";

/**
 * API katalog publik (read-only).
 *   GET /api/products                 → semua produk
 *   GET /api/products?q=kopi          → pencarian teks
 *   GET /api/products?kategori=kemasan
 *   GET /api/products?slug=teh-hijau-melati → satu produk lengkap
 */
export function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get("slug");
  const q = searchParams.get("q")?.toLocaleLowerCase("id-ID").trim();
  const category = searchParams.get("kategori");

  if (slug) {
    const product = products.find((entry) => entry.slug === slug);
    if (!product) return NextResponse.json({ error: "Produk tidak ditemukan." }, { status: 404 });
    return NextResponse.json({ ...product, priceRange: priceRange(product), supplier: supplierOf(product) });
  }

  const data = products
    .filter((product) => (!category || product.category === category) && (!q || `${product.name} ${product.tags.join(" ")}`.toLocaleLowerCase("id-ID").includes(q)))
    .map((product) => {
      const supplier = supplierOf(product);
      return {
        slug: product.slug,
        name: product.name,
        category: product.category,
        image: product.image,
        unit: product.unit,
        moq: product.moq,
        priceTiers: product.priceTiers,
        priceRange: priceRange(product),
        leadTimeDays: product.leadTimeDays,
        rating: product.rating,
        reviewCount: product.reviewCount,
        supplier: { slug: supplier.slug, name: supplier.name, city: supplier.city, province: supplier.province },
      };
    });

  return NextResponse.json(
    { count: data.length, data },
    { headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400" } },
  );
}
