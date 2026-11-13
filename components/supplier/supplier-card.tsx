import Link from "next/link";
import { ArrowUpRight, Clock, MapPin, Star } from "lucide-react";
import type { Supplier } from "@/lib/types";
import { getCategory } from "@/lib/data/categories";
import { productsBySupplier } from "@/lib/catalog";
import { SupplierAvatar, VerifiedBadge } from "@/components/ui/misc";

export function SupplierCard({ supplier }: { supplier: Supplier }) {
  const productCount = productsBySupplier(supplier.slug).length;
  return (
    <article className="card group relative flex flex-col p-5 transition duration-300 hover:-translate-y-0.5 hover:shadow-lift">
      <div className="flex items-start gap-3">
        <SupplierAvatar initials={supplier.initials} gradient={supplier.gradient} />
        <div className="min-w-0 flex-1">
          <h3 className="font-bold leading-snug">
            <Link href={`/pemasok/${supplier.slug}`} className="after:absolute after:inset-0 after:content-['']">
              {supplier.name}
            </Link>
          </h3>
          <p className="mt-0.5 flex items-center gap-1 text-xs text-muted">
            <MapPin className="size-3.5" /> {supplier.city}, {supplier.province}
          </p>
        </div>
        <ArrowUpRight className="size-5 text-muted transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-brand-600" />
      </div>
      <p className="mt-4 line-clamp-2 text-sm text-muted">{supplier.tagline}</p>
      <div className="mt-4 flex flex-wrap gap-1.5">
        <span className="rounded-lg bg-surface-2 px-2 py-1 text-[11px] font-medium text-muted">{getCategory(supplier.category)?.name}</span>
        <span className="rounded-lg bg-surface-2 px-2 py-1 text-[11px] font-medium text-muted">Sejak {supplier.established}</span>
        <span className="rounded-lg bg-surface-2 px-2 py-1 text-[11px] font-medium text-muted">{productCount} produk</span>
      </div>
      <div className="min-h-4 flex-1" />
      <div className="grid grid-cols-3 gap-2 border-t border-line pt-4 text-center">
        <Stat icon={<Star className="size-3.5 fill-saffron-400 text-saffron-400" />} value={supplier.rating.toLocaleString("id-ID")} label="Rating" />
        <Stat value={`${supplier.responseRate}%`} label="Respons" />
        <Stat icon={<Clock className="size-3.5" />} value={supplier.responseTime} label="Balas" />
      </div>
      {supplier.verified && <VerifiedBadge className="mt-3 justify-center" label="Pemasok terverifikasi" />}
    </article>
  );
}

function Stat({ value, label, icon }: { value: string; label: string; icon?: React.ReactNode }) {
  return (
    <div>
      <p className="flex items-center justify-center gap-1 text-sm font-bold">
        {icon}
        {value}
      </p>
      <p className="text-[11px] text-muted">{label}</p>
    </div>
  );
}
