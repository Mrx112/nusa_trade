import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  BarChart3,
  ChevronDown,
  FileText,
  Layers,
  Search,
  Send,
  ShieldCheck,
  Sparkles,
  TrendingDown,
  Truck,
} from "lucide-react";
import { products } from "@/lib/data/products";
import { suppliers } from "@/lib/data/suppliers";
import { categories } from "@/lib/data/categories";
import { priceRange } from "@/lib/catalog";
import { formatNumber, formatRupiah } from "@/lib/format";
import { HeroSearch } from "@/components/home/hero-search";
import { ProductCard } from "@/components/product/product-card";
import { SupplierCard } from "@/components/supplier/supplier-card";
import { CategoryIcon, SectionHeading } from "@/components/ui/misc";

const industries = ["Kafe & restoran", "Hotel & resort", "E-commerce", "Manufaktur", "Kantor & korporasi", "Sekolah & kampus", "Event organizer", "Ritel modern", "Katering", "Instansi"];

const steps = [
  { icon: Search, title: "Cari & filter", text: "Telusuri katalog berdasarkan kategori, harga, MOQ, lokasi pemasok, hingga sertifikasi." },
  { icon: Layers, title: "Bandingkan", text: "Sandingkan hingga 4 produk: harga bertingkat, lead time, kapasitas, dan sertifikasi." },
  { icon: Send, title: "Kirim RFQ", text: "Satu formulir untuk beberapa pemasok sekaligus, lengkap dengan varian dan catatan per produk." },
  { icon: FileText, title: "Terima penawaran", text: "Pemasok mengonfirmasi harga final, ongkir, dan jadwal kirim. Pantau semuanya di dashboard." },
];

const faqs = [
  { q: "Apakah NusaTrade memungut biaya untuk pembeli?", a: "Tidak. Pembeli dapat mencari produk, membandingkan, dan mengirim permintaan penawaran tanpa biaya." },
  { q: "Bagaimana harga bertingkat dihitung?", a: "Setiap produk memiliki beberapa tier harga berdasarkan jumlah pesanan. Semakin besar jumlahnya, semakin rendah harga satuan. Estimasi dihitung otomatis saat Anda mengubah jumlah." },
  { q: "Apa itu MOQ?", a: "Minimum Order Quantity — jumlah pemesanan minimum yang ditetapkan pemasok untuk satu produk. Formulir RFQ otomatis menyesuaikan jumlah agar tidak di bawah MOQ." },
  { q: "Apakah harga di katalog sudah final?", a: "Harga katalog adalah referensi. Harga final, ongkos kirim, dan ketersediaan dikonfirmasi pemasok melalui penawaran resmi setelah RFQ dikirim." },
  { q: "Bagaimana pemasok diverifikasi?", a: "Pemasok berlabel terverifikasi telah melalui pemeriksaan legalitas usaha, kunjungan atau video call fasilitas produksi, serta pengecekan dokumen sertifikasi." },
];

export default function HomePage() {
  const featured = [...products].sort((a, b) => b.rating * Math.log(b.reviewCount) - a.rating * Math.log(a.reviewCount)).slice(0, 4);
  const spotlight = [...suppliers].sort((a, b) => b.rating - a.rating || b.responseRate - a.responseRate).slice(0, 4);
  const coffee = products[0];

  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="bg-grid pointer-events-none absolute inset-0 [mask-image:radial-gradient(ellipse_at_top,black_30%,transparent_70%)]" />
        <div className="pointer-events-none absolute -top-40 left-1/2 h-[480px] w-[880px] -translate-x-1/2 rounded-full bg-brand-300/30 blur-3xl dark:bg-brand-700/20" />
        <div className="container-page relative grid items-center gap-12 pb-16 pt-12 lg:grid-cols-[1.05fr_1fr] lg:pb-24 lg:pt-20">
          <div className="animate-fade-up">
            <span className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-800 dark:border-brand-800 dark:bg-brand-950 dark:text-brand-300">
              <Sparkles className="size-3.5" /> Marketplace pengadaan B2B untuk bisnis Indonesia
            </span>
            <h1 className="mt-5 text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
              Pengadaan bisnis,
              <br />
              <span className="bg-gradient-to-r from-brand-600 via-brand-500 to-saffron-500 bg-clip-text text-transparent">lebih cerdas.</span>
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-muted">
              Temukan pemasok lokal terverifikasi, bandingkan harga grosir bertingkat, dan kirim permintaan penawaran ke banyak pemasok — semua dari satu tempat.
            </p>
            <div className="mt-8 max-w-xl">
              <HeroSearch />
            </div>
            <dl className="mt-10 grid max-w-lg grid-cols-3 gap-6">
              {[
                { value: formatNumber(suppliers.length), label: "Pemasok terverifikasi" },
                { value: formatNumber(categories.length), label: "Kategori industri" },
                { value: "< 3 jam", label: "Rata-rata respons" },
              ].map((stat) => (
                <div key={stat.label}>
                  <dt className="text-xs text-muted">{stat.label}</dt>
                  <dd className="mt-1 text-2xl font-extrabold tracking-tight">{stat.value}</dd>
                </div>
              ))}
            </dl>
          </div>

          {/* Hero visual */}
          <div className="relative mx-auto w-full max-w-lg animate-fade-up [animation-delay:120ms] lg:max-w-none">
            <div className="relative aspect-[4/4.2] overflow-hidden rounded-[2rem] border border-line shadow-lift">
              <Image src={coffee.image} alt={coffee.name} fill priority sizes="(min-width: 1024px) 45vw, 100vw" className="object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
              <div className="absolute inset-x-5 bottom-5 text-white">
                <span className="rounded-full bg-white/20 px-2.5 py-1 text-[11px] font-semibold backdrop-blur">Aceh Tengah · Koperasi Gayo Bersama</span>
                <p className="mt-2 text-xl font-bold">{coffee.name}</p>
                <p className="text-sm text-white/80">Mulai {formatRupiah(priceRange(coffee).min)}/kg untuk ≥ 200 kg</p>
              </div>
            </div>

            <div className="card absolute -left-4 top-8 w-56 p-4 animate-float sm:-left-10">
              <p className="text-xs font-semibold text-muted">Harga bertingkat</p>
              <div className="mt-3 space-y-2">
                {coffee.priceTiers.map((tier, index) => (
                  <div key={tier.min} className="flex items-center gap-2 text-xs">
                    <span className="w-14 text-muted">≥ {tier.min} kg</span>
                    <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-2">
                      <span className="block h-full rounded-full bg-brand-500" style={{ width: `${100 - index * 22}%` }} />
                    </span>
                    <span className="font-bold tabular-nums">{Math.round(tier.price / 1000)}rb</span>
                  </div>
                ))}
              </div>
              <p className="mt-3 flex items-center gap-1 text-[11px] font-semibold text-brand-700 dark:text-brand-400">
                <TrendingDown className="size-3.5" /> Hemat hingga 15%
              </p>
            </div>

            <div className="card absolute -right-3 top-1/2 flex items-center gap-3 p-3.5 animate-float [animation-delay:1.5s] sm:-right-8">
              <span className="grid size-10 place-items-center rounded-xl bg-brand-600 text-white">
                <BadgeCheck className="size-5" />
              </span>
              <div>
                <p className="text-sm font-bold">RFQ terkirim</p>
                <p className="text-xs text-muted">3 pemasok · 4 produk</p>
              </div>
            </div>

            <div className="card absolute -bottom-5 right-8 flex items-center gap-2.5 px-4 py-3 animate-float [animation-delay:3s]">
              <Truck className="size-5 text-saffron-500" />
              <p className="text-xs">
                <span className="font-bold">Kirim 3–7 hari</span>
                <span className="block text-muted">ke seluruh Indonesia</span>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* INDUSTRIES MARQUEE */}
      <section className="border-y border-line bg-surface py-5" aria-label="Industri yang dilayani">
        <div className="relative flex overflow-hidden [mask-image:linear-gradient(90deg,transparent,black_10%,black_90%,transparent)]">
          <div className="flex shrink-0 animate-marquee gap-10 pr-10">
            {[...industries, ...industries].map((industry, index) => (
              <span key={`${industry}-${index}`} className="flex items-center gap-2 whitespace-nowrap text-sm font-semibold text-muted">
                <span className="size-1.5 rounded-full bg-brand-500" /> {industry}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="container-page mt-20">
        <SectionHeading
          kicker="Mulai dari kebutuhan Anda"
          title="Jelajahi kategori"
          description="Empat kategori utama dengan pemasok yang dikurasi untuk kebutuhan operasional bisnis sehari-hari."
          action={
            <Link href="/produk" className="btn btn-secondary">
              Semua produk <ArrowRight className="size-4" />
            </Link>
          }
        />
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((category, index) => {
            const items = products.filter((product) => product.category === category.id);
            const minPrice = Math.min(...items.map((product) => priceRange(product).min));
            const cover = items[0];
            return (
              <Link
                key={category.id}
                href={`/produk?kategori=${category.id}`}
                className={`group relative flex min-h-64 flex-col justify-end overflow-hidden rounded-[1.5rem] border border-line p-5 text-white ${index === 0 ? "lg:row-span-1" : ""}`}
              >
                <Image src={cover.image} alt="" fill sizes="(min-width: 1024px) 25vw, 50vw" className="object-cover transition duration-700 group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/5" />
                <span className="absolute left-5 top-5 grid size-11 place-items-center rounded-xl bg-white/15 backdrop-blur-md">
                  <CategoryIcon id={category.id} className="size-5" />
                </span>
                <div className="relative">
                  <p className="text-xs font-medium text-white/70">{items.length} produk · mulai {formatRupiah(minPrice)}</p>
                  <h3 className="mt-1 text-xl font-bold">{category.name}</h3>
                  <p className="mt-1 text-sm text-white/75">{category.tagline}</p>
                  <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-saffron-300">
                    Lihat produk <ArrowRight className="size-4 transition group-hover:translate-x-1" />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* FEATURED PRODUCTS */}
      <section className="container-page mt-24">
        <SectionHeading
          kicker="Pilihan pembeli bisnis"
          title="Produk unggulan"
          description="Rating tertinggi dari pembeli bisnis, dengan harga grosir bertingkat dan sampel yang bisa dipesan."
          action={
            <Link href="/produk" className="btn btn-secondary">
              Lihat katalog <ArrowRight className="size-4" />
            </Link>
          }
        />
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {featured.map((product) => (
            <ProductCard key={product.slug} product={product} />
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="cara-kerja" className="mt-24 scroll-mt-20">
        <div className="container-page">
          <div className="relative overflow-hidden rounded-[2rem] bg-brand-950 px-6 py-14 text-white sm:px-12">
            <div className="bg-grid pointer-events-none absolute inset-0 opacity-10" />
            <div className="pointer-events-none absolute -right-20 -top-20 size-80 rounded-full bg-brand-500/30 blur-3xl" />
            <div className="relative grid gap-10 lg:grid-cols-[1fr_2fr]">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.12em] text-brand-300">Cara kerja</p>
                <h2 className="mt-2 text-3xl font-extrabold tracking-tight md:text-4xl">Dari pencarian sampai penawaran, tanpa ribet.</h2>
                <p className="mt-4 text-white/70">Alur pengadaan yang dirancang untuk tim purchasing: cepat, terdokumentasi, dan mudah dipantau.</p>
                <Link href="/rfq" className="btn btn-accent mt-6">
                  Mulai RFQ <ArrowRight className="size-4" />
                </Link>
              </div>
              <ol className="grid gap-4 sm:grid-cols-2">
                {steps.map((step, index) => (
                  <li key={step.title} className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur">
                    <div className="flex items-center justify-between">
                      <span className="grid size-11 place-items-center rounded-xl bg-brand-500/20 text-brand-300">
                        <step.icon className="size-5" />
                      </span>
                      <span className="text-3xl font-extrabold text-white/10">0{index + 1}</span>
                    </div>
                    <h3 className="mt-4 font-bold">{step.title}</h3>
                    <p className="mt-1.5 text-sm text-white/65">{step.text}</p>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </section>

      {/* VALUE BENTO */}
      <section className="container-page mt-24">
        <SectionHeading kicker="Kenapa NusaTrade" title="Dibangun untuk tim pengadaan" />
        <div className="mt-10 grid gap-4 md:grid-cols-6">
          <div className="card p-6 md:col-span-4">
            <TrendingDown className="size-6 text-brand-600" />
            <h3 className="mt-4 text-lg font-bold">Harga grosir bertingkat yang transparan</h3>
            <p className="mt-1.5 max-w-lg text-sm text-muted">Lihat langsung berapa harga satuan di setiap volume, dan berapa unit lagi yang dibutuhkan untuk naik ke tier berikutnya.</p>
            <div className="mt-6 grid grid-cols-3 gap-3">
              {products[1].priceTiers.map((tier, index) => (
                <div key={tier.min} className={`rounded-2xl border p-4 ${index === 1 ? "border-brand-500 bg-brand-50 dark:bg-brand-950" : "border-line"}`}>
                  <p className="text-xs text-muted">≥ {formatNumber(tier.min)} pcs</p>
                  <p className="mt-1 text-lg font-extrabold tabular-nums">{formatRupiah(tier.price)}</p>
                  {index === 1 && <p className="mt-1 text-[11px] font-semibold text-brand-700 dark:text-brand-400">Tier aktif</p>}
                </div>
              ))}
            </div>
          </div>
          <div className="card p-6 md:col-span-2">
            <ShieldCheck className="size-6 text-brand-600" />
            <h3 className="mt-4 text-lg font-bold">Pemasok terverifikasi</h3>
            <p className="mt-1.5 text-sm text-muted">Legalitas, fasilitas produksi, dan sertifikasi diperiksa sebelum pemasok tampil di katalog.</p>
          </div>
          <div className="card p-6 md:col-span-2">
            <Layers className="size-6 text-brand-600" />
            <h3 className="mt-4 text-lg font-bold">Satu RFQ, banyak pemasok</h3>
            <p className="mt-1.5 text-sm text-muted">Gabungkan produk dari beberapa pemasok dalam satu permintaan, lengkap dengan varian per produk.</p>
          </div>
          <div className="card p-6 md:col-span-4">
            <BarChart3 className="size-6 text-brand-600" />
            <h3 className="mt-4 text-lg font-bold">Dashboard pengadaan</h3>
            <p className="mt-1.5 max-w-lg text-sm text-muted">Pantau riwayat RFQ, estimasi nilai pengadaan per kategori, serta tren bulanan — siap diekspor ke CSV untuk tim finance.</p>
            <div className="mt-6 flex h-24 items-end gap-2">
              {[38, 52, 44, 70, 58, 86, 74, 96].map((height, index) => (
                <span key={index} className="flex-1 rounded-t-lg bg-gradient-to-t from-brand-600 to-brand-300" style={{ height: `${height}%` }} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* SUPPLIERS */}
      <section className="container-page mt-24">
        <SectionHeading
          kicker="Mitra bisnis lokal"
          title="Pemasok pilihan"
          description="Rating tinggi, respons cepat, dan pengiriman tepat waktu."
          action={
            <Link href="/pemasok" className="btn btn-secondary">
              Semua pemasok <ArrowRight className="size-4" />
            </Link>
          }
        />
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {spotlight.map((supplier) => (
            <SupplierCard key={supplier.slug} supplier={supplier} />
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="container-page mt-24 grid scroll-mt-20 gap-10 lg:grid-cols-[1fr_1.6fr]">
        <div>
          <p className="kicker">Pertanyaan umum</p>
          <h2 className="mt-2 text-3xl font-extrabold tracking-tight md:text-4xl">Ada pertanyaan?</h2>
          <p className="mt-3 text-muted">Hal yang paling sering ditanyakan tim pengadaan sebelum mengirim RFQ pertama.</p>
        </div>
        <div className="space-y-3">
          {faqs.map((faq) => (
            <details key={faq.q} className="card group p-5 [&_summary::-webkit-details-marker]:hidden">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold">
                {faq.q}
                <ChevronDown className="size-5 shrink-0 text-muted transition group-open:rotate-180" />
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-muted">{faq.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="container-page mt-24">
        <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-brand-600 to-brand-800 px-6 py-14 text-center text-white sm:px-12">
          <div className="bg-grid pointer-events-none absolute inset-0 opacity-15" />
          <div className="relative mx-auto max-w-2xl">
            <h2 className="text-3xl font-extrabold tracking-tight md:text-4xl">Siap menyusun pengadaan berikutnya?</h2>
            <p className="mt-3 text-white/80">Tambahkan produk ke daftar RFQ dan dapatkan penawaran dari pemasok terverifikasi.</p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link href="/produk" className="btn btn-accent">
                Jelajahi katalog <ArrowRight className="size-4" />
              </Link>
              <Link href="/rfq" className="btn border border-white/30 text-white hover:bg-white/10">
                Buat RFQ manual
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
