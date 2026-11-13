import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Award, CalendarDays, Check, ChevronRight, Clock, Factory, MapPin, MessageSquare, Star, Truck, Users } from "lucide-react";
import { getSupplier, suppliers } from "@/lib/data/suppliers";
import { getCategory } from "@/lib/data/categories";
import { productsBySupplier } from "@/lib/catalog";
import { ProductCard } from "@/components/product/product-card";
import { SupplierAvatar, VerifiedBadge } from "@/components/ui/misc";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return suppliers.map((supplier) => ({ slug: supplier.slug }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const supplier = getSupplier(slug);
  if (!supplier) return {};
  return {
    title: supplier.name,
    description: `${supplier.tagline} Berlokasi di ${supplier.city}, ${supplier.province}. Kapasitas ${supplier.productionCapacity}.`,
    alternates: { canonical: `/pemasok/${supplier.slug}` },
  };
}

export default async function SupplierPage({ params }: Props) {
  const { slug } = await params;
  const supplier = getSupplier(slug);
  if (!supplier) notFound();

  const items = productsBySupplier(supplier.slug);
  const years = new Date().getFullYear() - supplier.established;

  const metrics = [
    { icon: Star, label: "Rating", value: supplier.rating.toLocaleString("id-ID"), bar: supplier.rating * 20 },
    { icon: MessageSquare, label: "Tingkat respons", value: `${supplier.responseRate}%`, bar: supplier.responseRate },
    { icon: Truck, label: "Kirim tepat waktu", value: `${supplier.onTimeDelivery}%`, bar: supplier.onTimeDelivery },
  ];

  return (
    <div>
      <section className={`relative overflow-hidden bg-gradient-to-br ${supplier.gradient}`}>
        <div className="bg-grid pointer-events-none absolute inset-0 opacity-10" />
        <div className="container-page relative pb-24 pt-6 text-white">
          <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-sm text-white/70">
            <Link href="/pemasok" className="hover:text-white">Pemasok</Link>
            <ChevronRight className="size-4" />
            <span className="text-white" aria-current="page">{supplier.name}</span>
          </nav>
        </div>
      </section>

      <div className="container-page -mt-16">
        <div className="card relative p-6 md:p-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-start">
            <SupplierAvatar initials={supplier.initials} gradient={supplier.gradient} className="size-20 rounded-2xl text-2xl ring-4 ring-surface" />
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-2xl font-extrabold tracking-tight md:text-3xl">{supplier.name}</h1>
                {supplier.verified && (
                  <span className="rounded-full bg-brand-50 px-2.5 py-1 dark:bg-brand-950">
                    <VerifiedBadge label="Pemasok terverifikasi" />
                  </span>
                )}
              </div>
              <p className="mt-1 text-muted">{supplier.tagline}</p>
              <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted">
                <span className="flex items-center gap-1.5"><MapPin className="size-4" /> {supplier.city}, {supplier.province}</span>
                <span className="flex items-center gap-1.5"><CalendarDays className="size-4" /> Sejak {supplier.established} ({years} tahun)</span>
                <span className="flex items-center gap-1.5"><Users className="size-4" /> {supplier.employees}</span>
                <span className="flex items-center gap-1.5"><Clock className="size-4" /> Balas {supplier.responseTime}</span>
              </div>
            </div>
            <div className="flex gap-2">
              <a href="#produk-pemasok" className="btn btn-primary">Lihat produk</a>
              <Link href="/rfq" className="btn btn-secondary">Kirim RFQ</Link>
            </div>
          </div>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1.6fr_1fr]">
          <div className="space-y-6">
            <section className="card p-6">
              <h2 className="text-lg font-bold">Tentang pemasok</h2>
              <div className="mt-3 space-y-3 leading-relaxed text-muted">
                {supplier.about.map((paragraph) => (
                  <p key={paragraph.slice(0, 24)}>{paragraph}</p>
                ))}
              </div>
              <h3 className="mt-6 text-sm font-bold">Kapabilitas</h3>
              <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                {supplier.capabilities.map((capability) => (
                  <li key={capability} className="flex gap-2 text-sm">
                    <Check className="mt-0.5 size-4 shrink-0 text-brand-600" /> {capability}
                  </li>
                ))}
              </ul>
            </section>
          </div>

          <aside className="space-y-6">
            <section className="card p-6">
              <h2 className="text-lg font-bold">Performa</h2>
              <div className="mt-4 space-y-4">
                {metrics.map((metric) => (
                  <div key={metric.label}>
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2 text-muted"><metric.icon className="size-4" /> {metric.label}</span>
                      <span className="font-bold">{metric.value}</span>
                    </div>
                    <div className="mt-2 h-2 overflow-hidden rounded-full bg-surface-2">
                      <div className="h-full rounded-full bg-gradient-to-r from-brand-500 to-brand-400" style={{ width: `${metric.bar}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </section>
            <section className="card space-y-4 p-6 text-sm">
              <div>
                <h3 className="flex items-center gap-2 font-bold"><Factory className="size-4 text-brand-600" /> Kapasitas produksi</h3>
                <p className="mt-1 text-muted">{supplier.productionCapacity}</p>
              </div>
              <div>
                <h3 className="flex items-center gap-2 font-bold"><Award className="size-4 text-brand-600" /> Sertifikasi</h3>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {supplier.certifications.map((cert) => (
                    <span key={cert} className="rounded-lg bg-brand-50 px-2 py-1 text-xs font-semibold text-brand-800 dark:bg-brand-950 dark:text-brand-300">{cert}</span>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="flex items-center gap-2 font-bold"><Truck className="size-4 text-brand-600" /> Pasar utama</h3>
                <p className="mt-1 text-muted">{supplier.mainMarkets.join(" · ")}</p>
              </div>
              <div>
                <h3 className="font-bold">Kategori</h3>
                <p className="mt-1 text-muted">{getCategory(supplier.category)?.name}</p>
              </div>
            </section>
          </aside>
        </div>

        <section id="produk-pemasok" className="mt-14 scroll-mt-24">
          <h2 className="text-2xl font-extrabold tracking-tight">Produk dari {supplier.name}</h2>
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((product) => (
              <ProductCard key={product.slug} product={product} layout="grid" />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
