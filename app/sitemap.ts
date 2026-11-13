import type { MetadataRoute } from "next";
import { products } from "@/lib/data/products";
import { suppliers } from "@/lib/data/suppliers";
import { siteUrl } from "@/lib/format";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteUrl();
  const now = new Date();
  return [
    { url: base, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/produk`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${base}/pemasok`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${base}/bandingkan`, lastModified: now, changeFrequency: "monthly", priority: 0.4 },
    ...products.map((product) => ({ url: `${base}/produk/${product.slug}`, lastModified: now, changeFrequency: "weekly" as const, priority: 0.8 })),
    ...suppliers.map((supplier) => ({ url: `${base}/pemasok/${supplier.slug}`, lastModified: now, changeFrequency: "monthly" as const, priority: 0.6 })),
  ];
}
