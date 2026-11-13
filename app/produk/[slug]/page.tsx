import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Award, ChevronRight, Clock, Factory, MapPin, PackageCheck, Star, Truck } from "lucide-react";
import { getProduct, products } from "@/lib/data/products";
import { getCategory } from "@/lib/data/categories";
import { priceRange, relatedProducts, supplierOf } from "@/lib/catalog";
import { formatCompact, formatNumber, siteUrl } from "@/lib/format";
import { ProductGallery } from "@/components/product/product-gallery";
import { PurchasePanel } from "@/components/product/purchase-panel";
import { ProductTabs } from "@/components/product/product-tabs";
import { ProductCard } from "@/components/product/product-card";
import { RatingStars, SupplierAvatar, VerifiedBadge } from "@/components/ui/misc";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return products.map((product) => ({ slug: product.slug }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) return {};
  return {
    title: product.name,
    description: `${product.tagline} MOQ ${product.moq} ${product.unit}. Harga grosir bertingkat dari ${supplierOf(product).name}.`,
    openGraph: { images: [{ url: product.image, alt: product.name }] },
    alternates: { canonical: `/produk/${product.slug}` },
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) notFound();

  const supplier = supplierOf(product);
  const category = getCategory(product.category);
  const range = priceRange(product);
  const related = relatedProducts(product);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    image: `${siteUrl()}${product.image}`,
    description: product.description[0],
    category: category?.name,
    brand: { "@type": "Organization", name: supplier.name },
    aggregateRating: { "@type": "AggregateRating", ratingValue: product.rating, reviewCount: product.reviewCount },
    offers: {
      "@type": "AggregateOffer",
      priceCurrency: "IDR",
      lowPrice: range.min,
      highPrice: range.max,
      offerCount: product.priceTiers.length,
      availability: "https://schema.org/InStock",
    },
  };

  const facts = [
    { icon: Truck, label: "Lead time", value: `${product.leadTimeDays[0]}–${product.leadTimeDays[1]} hari` },
    { icon: Factory, label: "Kapasitas", value: product.monthlyCapacity },
    { icon: MapPin, label: "Asal", value: product.origin },
    { icon: PackageCheck, label: "MOQ", value: `${formatNumber(product.moq)} ${product.unit}` },
  ];

  return (
    <div className="container-page pt-6">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1 text-sm text-muted">
        <Link href="/" className="hover:text-fg">Beranda</Link>
        <ChevronRight className="size-4" />
        <Link href="/produk" className="hover:text-fg">Katalog</Link>
        <ChevronRight className="size-4" />
        <Link href={`/produk?kategori=${product.category}`} className="hover:text-fg">{category?.name}</Link>
        <ChevronRight className="size-4" />
        <span className="truncate text-fg" aria-current="page">{product.name}</span>
      </nav>

      <div className="mt-6 grid gap-10 lg:grid-cols-2">
        <div className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <ProductGallery src={product.image} alt={product.name} badge={product.badge} />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {facts.map((fact) => (
              <div key={fact.label} className="card p-3">
                <fact.icon className="size-4 text-brand-600" />
                <p className="mt-2 text-[11px] text-muted">{fact.label}</p>
                <p className="text-sm font-semibold leading-snug">{fact.value}</p>
              </div>
            ))}
          </div>
        </div>

        <div>
          <p className="kicker">{category?.name}</p>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight md:text-4xl">{product.name}</h1>
          <p className="mt-3 text-muted">{product.tagline}</p>
          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
            <span className="flex items-center gap-1.5">
              <RatingStars rating={product.rating} />
              <span className="font-semibold">{product.rating.toLocaleString("id-ID")}</span>
              <span className="text-muted">({product.reviewCount} ulasan)</span>
            </span>
            <span className="text-muted">{formatCompact(product.soldCount)} {product.unit} terjual</span>
            {product.certifications.slice(0, 2).map((cert) => (
              <span key={cert} className="flex items-center gap-1 text-xs font-semibold text-brand-700 dark:text-brand-400">
                <Award className="size-3.5" /> {cert}
              </span>
            ))}
          </div>

          <Link href={`/pemasok/${supplier.slug}`} className="card mt-6 flex items-center gap-3 p-3 transition hover:border-brand-300">
            <SupplierAvatar initials={supplier.initials} gradient={supplier.gradient} className="size-10 text-xs" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">{supplier.name}</p>
              <p className="flex items-center gap-2 text-xs text-muted">
                <span>{supplier.city}, {supplier.province}</span>
                <span className="flex items-center gap-0.5"><Star className="size-3 fill-saffron-400 text-saffron-400" /> {supplier.rating.toLocaleString("id-ID")}</span>
                <span className="flex items-center gap-0.5"><Clock className="size-3" /> {supplier.responseTime}</span>
              </p>
            </div>
            <VerifiedBadge label="" />
            <ChevronRight className="size-4 text-muted" />
          </Link>

          <div className="mt-6 border-t border-line pt-6">
            <PurchasePanel product={product} />
          </div>
        </div>
      </div>

      <section className="mt-16">
        <ProductTabs product={product} />
      </section>

      <section className="mt-20">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="kicker">Mungkin Anda butuh</p>
            <h2 className="mt-2 text-2xl font-extrabold tracking-tight md:text-3xl">Produk terkait</h2>
          </div>
          <Link href="/produk" className="btn btn-secondary">
            Katalog <ArrowRight className="size-4" />
          </Link>
        </div>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {related.map((entry) => (
            <ProductCard key={entry.slug} product={entry} />
          ))}
        </div>
      </section>
    </div>
  );
}
