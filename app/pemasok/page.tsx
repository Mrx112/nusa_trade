import type { Metadata } from "next";
import { SupplierDirectory } from "@/components/supplier/supplier-directory";
import { suppliers } from "@/lib/data/suppliers";

export const metadata: Metadata = {
  title: "Direktori pemasok",
  description: "Direktori pemasok lokal terverifikasi di seluruh Indonesia lengkap dengan rating, waktu respons, kapasitas produksi, dan sertifikasi.",
};

export default function SuppliersPage() {
  const avgRating = suppliers.reduce((sum, supplier) => sum + supplier.rating, 0) / suppliers.length;
  const avgOnTime = Math.round(suppliers.reduce((sum, supplier) => sum + supplier.onTimeDelivery, 0) / suppliers.length);
  const provinces = new Set(suppliers.map((supplier) => supplier.province)).size;

  return (
    <div className="container-page pt-8">
      <div className="grid gap-8 lg:grid-cols-[1.2fr_1fr] lg:items-end">
        <div className="max-w-2xl">
          <p className="kicker">Mitra bisnis lokal</p>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight md:text-4xl">Direktori pemasok</h1>
          <p className="mt-2 text-muted">Kenali pemasok terverifikasi beserta performanya sebelum mengirim permintaan penawaran.</p>
        </div>
        <dl className="grid grid-cols-3 gap-3">
          {[
            { label: "Rating rata-rata", value: avgRating.toLocaleString("id-ID", { maximumFractionDigits: 1 }) },
            { label: "Tepat waktu", value: `${avgOnTime}%` },
            { label: "Provinsi", value: String(provinces) },
          ].map((stat) => (
            <div key={stat.label} className="card p-4">
              <dt className="text-[11px] text-muted">{stat.label}</dt>
              <dd className="mt-1 text-2xl font-extrabold">{stat.value}</dd>
            </div>
          ))}
        </dl>
      </div>
      <SupplierDirectory />
    </div>
  );
}
