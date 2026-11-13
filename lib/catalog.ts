import { products } from "@/lib/data/products";
import { suppliers } from "@/lib/data/suppliers";
import type { PriceTier, Product } from "@/lib/types";

/** Harga satuan sesuai jumlah, mengikuti tier harga grosir. */
export function unitPriceFor(product: Pick<Product, "priceTiers">, quantity: number) {
  const tiers = [...product.priceTiers].sort((a, b) => a.min - b.min);
  let price = tiers[0].price;
  for (const tier of tiers) {
    if (quantity >= tier.min) price = tier.price;
  }
  return price;
}

export function activeTierIndex(tiers: PriceTier[], quantity: number) {
  let index = 0;
  tiers.forEach((tier, i) => {
    if (quantity >= tier.min) index = i;
  });
  return index;
}

export function priceRange(product: Pick<Product, "priceTiers">) {
  const prices = product.priceTiers.map((tier) => tier.price);
  return { min: Math.min(...prices), max: Math.max(...prices) };
}

/** Jumlah tambahan untuk naik ke tier harga berikutnya, atau null bila sudah tier tertinggi. */
export function nextTier(product: Pick<Product, "priceTiers">, quantity: number) {
  const tiers = [...product.priceTiers].sort((a, b) => a.min - b.min);
  const next = tiers.find((tier) => tier.min > quantity);
  return next ? { ...next, needed: next.min - quantity } : null;
}

export function supplierOf(product: Pick<Product, "supplierSlug">) {
  const supplier = suppliers.find((entry) => entry.slug === product.supplierSlug);
  if (!supplier) throw new Error(`Pemasok "${product.supplierSlug}" tidak ditemukan.`);
  return supplier;
}

export function productsBySupplier(slug: string) {
  return products.filter((product) => product.supplierSlug === slug);
}

export function relatedProducts(product: Product, limit = 4) {
  return products
    .filter((entry) => entry.slug !== product.slug)
    .sort((a, b) => Number(b.category === product.category) - Number(a.category === product.category) || b.rating - a.rating)
    .slice(0, limit);
}

/** Kelipatan penambahan jumlah yang wajar berdasarkan MOQ produk. */
export function quantityStep(moq: number) {
  if (moq >= 1000) return 500;
  if (moq >= 100) return 50;
  if (moq >= 20) return 10;
  return 1;
}

export const provinces =Array.from(new Set(suppliers.map((supplier) => supplier.province))).sort((a, b) => a.localeCompare(b, "id"));
