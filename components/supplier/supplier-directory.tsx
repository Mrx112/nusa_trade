"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { suppliers } from "@/lib/data/suppliers";
import { categories } from "@/lib/data/categories";
import { provinces } from "@/lib/catalog";
import { SupplierCard } from "@/components/supplier/supplier-card";

const normalize = (value: string) => value.toLocaleLowerCase("id-ID");

export function SupplierDirectory() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("semua");
  const [province, setProvince] = useState("semua");
  const [sort, setSort] = useState("rating");

  const visible = useMemo(() => {
    const q = normalize(query.trim());
    return suppliers
      .filter(
        (supplier) =>
          (!q || normalize(`${supplier.name} ${supplier.city} ${supplier.province} ${supplier.tagline} ${supplier.capabilities.join(" ")}`).includes(q)) &&
          (category === "semua" || supplier.category === category) &&
          (province === "semua" || supplier.province === province),
      )
      .sort((a, b) => {
        if (sort === "respons") return b.responseRate - a.responseRate;
        if (sort === "pengalaman") return a.established - b.established;
        if (sort === "tepat-waktu") return b.onTimeDelivery - a.onTimeDelivery;
        return b.rating - a.rating;
      });
  }, [query, category, province, sort]);

  return (
    <div className="mt-10">
      <div className="card flex flex-col gap-3 p-3 md:flex-row md:items-center">
        <label className="relative flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted" />
          <input value={query} onChange={(event) => setQuery(event.target.value)} className="input border-transparent bg-surface-2 pl-10" placeholder="Cari nama, kota, atau kapabilitas (mis. sablon, private label)…" aria-label="Cari pemasok" />
        </label>
        <select value={province} onChange={(event) => setProvince(event.target.value)} className="input md:w-48" aria-label="Filter provinsi">
          <option value="semua">Semua provinsi</option>
          {provinces.map((entry) => (
            <option key={entry} value={entry}>{entry}</option>
          ))}
        </select>
        <select value={sort} onChange={(event) => setSort(event.target.value)} className="input md:w-48" aria-label="Urutkan pemasok">
          <option value="rating">Rating tertinggi</option>
          <option value="respons">Respons tertinggi</option>
          <option value="tepat-waktu">Paling tepat waktu</option>
          <option value="pengalaman">Paling berpengalaman</option>
        </select>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        <button type="button" className="chip" data-active={category === "semua"} onClick={() => setCategory("semua")}>
          Semua <span className="opacity-70">{suppliers.length}</span>
        </button>
        {categories.map((entry) => (
          <button key={entry.id} type="button" className="chip" data-active={category === entry.id} onClick={() => setCategory(entry.id)}>
            {entry.name} <span className="opacity-70">{suppliers.filter((supplier) => supplier.category === entry.id).length}</span>
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <div className="card mt-6 px-6 py-16 text-center">
          <h3 className="text-lg font-bold">Pemasok tidak ditemukan</h3>
          <p className="mt-1 text-sm text-muted">Coba kata kunci atau filter lain.</p>
        </div>
      ) : (
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {visible.map((supplier) => (
            <SupplierCard key={supplier.slug} supplier={supplier} />
          ))}
        </div>
      )}
    </div>
  );
}
