import Link from "next/link";
import { Logo } from "@/components/layout/logo";
import { categories } from "@/lib/data/categories";

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-line bg-surface">
      <div className="container-page grid gap-10 py-14 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div className="max-w-sm">
          <Logo />
          <p className="mt-4 text-sm leading-relaxed text-muted">
            Platform pengadaan B2B yang menghubungkan bisnis dengan pemasok lokal terverifikasi di seluruh Indonesia — dari pencarian produk hingga permintaan penawaran.
          </p>
          <a href="mailto:halo@nusatrade.id" className="mt-4 inline-block text-sm font-semibold text-brand-700 hover:underline dark:text-brand-400">
            halo@nusatrade.id
          </a>
        </div>
        <FooterColumn title="Kategori" links={categories.map((category) => ({ href: `/produk?kategori=${category.id}`, label: category.name }))} />
        <FooterColumn
          title="Platform"
          links={[
            { href: "/produk", label: "Katalog produk" },
            { href: "/pemasok", label: "Direktori pemasok" },
            { href: "/bandingkan", label: "Bandingkan produk" },
            { href: "/rfq", label: "Buat RFQ" },
          ]}
        />
        <FooterColumn
          title="Akun bisnis"
          links={[
            { href: "/dashboard", label: "Dashboard pengadaan" },
            { href: "/#cara-kerja", label: "Cara kerja" },
            { href: "/#faq", label: "Pertanyaan umum" },
            { href: "/api/products", label: "API katalog (JSON)" },
          ]}
        />
      </div>
      <div className="border-t border-line">
        <div className="container-page flex flex-col gap-2 py-6 text-xs text-muted md:flex-row md:items-center md:justify-between">
          <span>© {new Date().getFullYear()} NusaTrade. Dibuat untuk bisnis Indonesia.</span>
          <span>Seluruh produk, pemasok, harga, dan ulasan pada situs ini adalah data contoh untuk demonstrasi.</span>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({ title, links }: { title: string; links: { href: string; label: string }[] }) {
  return (
    <div>
      <h3 className="text-sm font-bold">{title}</h3>
      <ul className="mt-4 space-y-2.5">
        {links.map((link) => (
          <li key={link.href}>
            <Link href={link.href} className="text-sm text-muted transition-colors hover:text-fg">
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
