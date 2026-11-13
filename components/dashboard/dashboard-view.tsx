"use client";

import Image from "next/image";
import Link from "next/link";
import { Fragment, useMemo, useState } from "react";
import { ArrowRight, Building2, ChevronDown, ClipboardList, Download, FileText, Heart, Package, Trash2, Wallet } from "lucide-react";
import { categories } from "@/lib/data/categories";
import { getProduct, products } from "@/lib/data/products";
import { getSupplier } from "@/lib/data/suppliers";
import { priceRange } from "@/lib/catalog";
import { formatCompact, formatDate, formatNumber, formatRupiah } from "@/lib/format";
import { useAppStore, useUi } from "@/lib/store";
import { useMounted } from "@/lib/use-mounted";
import { CategoryIcon } from "@/components/ui/misc";
import { ProductCard } from "@/components/product/product-card";
import type { CategoryId } from "@/lib/types";
import { cn } from "@/lib/cn";

export function DashboardView() {
  const mounted = useMounted();
  const history = useAppStore((state) => state.history);
  const wishlist = useAppStore((state) => state.wishlist);
  const cart = useAppStore((state) => state.cart);
  const clearHistory = useAppStore((state) => state.clearHistory);
  const toggleWishlist = useAppStore((state) => state.toggleWishlist);
  const toast = useUi((state) => state.toast);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [confirmClear, setConfirmClear] = useState(false);

  const stats = useMemo(() => {
    const totalValue = history.reduce((sum, rfq) => sum + rfq.estimatedTotal, 0);
    const lineCount = history.reduce((sum, rfq) => sum + rfq.items.length, 0);
    const supplierSet = new Set(history.flatMap((rfq) => rfq.items.map((item) => item.supplierSlug)));

    const byCategory = categories.map((category) => ({
      id: category.id,
      name: category.name,
      value: history.flatMap((rfq) => rfq.items).filter((item) => item.category === category.id).reduce((sum, item) => sum + item.subtotal, 0),
    }));

    const now = new Date();
    const months = Array.from({ length: 6 }, (_, index) => {
      const date = new Date(now.getFullYear(), now.getMonth() - (5 - index), 1);
      const key = `${date.getFullYear()}-${date.getMonth()}`;
      const value = history
        .filter((rfq) => {
          const created = new Date(rfq.createdAt);
          return `${created.getFullYear()}-${created.getMonth()}` === key;
        })
        .reduce((sum, rfq) => sum + rfq.estimatedTotal, 0);
      return { key, label: date.toLocaleDateString("id-ID", { month: "short" }), value };
    });

    const supplierTotals = [...supplierSet]
      .map((slug) => ({
        slug,
        name: getSupplier(slug)?.name ?? slug,
        value: history.flatMap((rfq) => rfq.items).filter((item) => item.supplierSlug === slug).reduce((sum, item) => sum + item.subtotal, 0),
      }))
      .sort((a, b) => b.value - a.value);

    return { totalValue, lineCount, supplierCount: supplierSet.size, byCategory, months, supplierTotals };
  }, [history]);

  if (!mounted) return <div className="h-[600px] animate-pulse rounded-3xl bg-surface-2" />;

  const exportCsv = () => {
    const header = ["Nomor RFQ", "Tanggal", "Perusahaan", "Kontak", "Tujuan", "Dibutuhkan", "Produk", "Jumlah", "Satuan", "Harga satuan", "Subtotal", "Pemasok"];
    const rows = history.flatMap((rfq) =>
      rfq.items.map((item) => [
        rfq.id,
        formatDate(rfq.createdAt, { year: "numeric", month: "2-digit", day: "2-digit" }),
        rfq.company,
        rfq.contactName,
        rfq.destination,
        rfq.neededBy,
        item.name,
        item.quantity,
        item.unit,
        item.unitPrice,
        item.subtotal,
        getSupplier(item.supplierSlug)?.name ?? item.supplierSlug,
      ]),
    );
    const csv = [header, ...rows].map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")).join("\r\n");
    const url = URL.createObjectURL(new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `nusatrade-rfq-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast({ title: "CSV diunduh", description: `${rows.length} baris item RFQ.` });
  };

  const kpis = [
    { icon: FileText, label: "Total RFQ", value: formatNumber(history.length), hint: history[0] ? `Terakhir ${formatDate(history[0].createdAt)}` : "Belum ada RFQ" },
    { icon: Wallet, label: "Estimasi nilai pengadaan", value: formatRupiah(stats.totalValue), hint: "Berdasarkan harga katalog" },
    { icon: Package, label: "Item produk diminta", value: formatNumber(stats.lineCount), hint: `${cart.length} produk di daftar RFQ aktif` },
    { icon: Building2, label: "Pemasok terlibat", value: formatNumber(stats.supplierCount), hint: `${wishlist.length} produk favorit` },
  ];

  const maxCategory = Math.max(1, ...stats.byCategory.map((entry) => entry.value));
  const maxMonth = Math.max(1, ...stats.months.map((entry) => entry.value));
  const recommendations = products
    .filter((product) => !history.some((rfq) => rfq.items.some((item) => item.slug === product.slug)))
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 4);

  return (
    <div>
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="kicker">Ruang pengadaan</p>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight md:text-4xl">Dashboard pengadaan</h1>
          <p className="mt-2 text-muted">Ringkasan RFQ, nilai pengadaan, dan pemasok — tersimpan aman di perangkat ini.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" className="btn btn-secondary" onClick={exportCsv} disabled={history.length === 0}>
            <Download className="size-4" /> Ekspor CSV
          </button>
          <Link href="/rfq" className="btn btn-primary">
            <ClipboardList className="size-4" /> Buat RFQ
          </Link>
        </div>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((kpi) => (
          <div key={kpi.label} className="card p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted">{kpi.label}</p>
              <span className="grid size-9 place-items-center rounded-xl bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-400">
                <kpi.icon className="size-4" />
              </span>
            </div>
            <p className="mt-3 text-2xl font-extrabold tracking-tight tabular-nums">{kpi.value}</p>
            <p className="mt-1 text-xs text-muted">{kpi.hint}</p>
          </div>
        ))}
      </div>

      {history.length === 0 ? (
        <div className="card mt-6 flex flex-col items-center px-6 py-14 text-center">
          <span className="grid size-16 place-items-center rounded-2xl bg-brand-50 text-brand-600 dark:bg-brand-950 dark:text-brand-400">
            <ClipboardList className="size-7" />
          </span>
          <h2 className="mt-4 text-lg font-bold">Belum ada permintaan penawaran</h2>
          <p className="mt-1 max-w-md text-sm text-muted">Setelah RFQ pertama dikirim, grafik nilai per kategori, tren bulanan, dan riwayat lengkap akan muncul di sini.</p>
          <Link href="/produk" className="btn btn-primary mt-5">
            Mulai dari katalog <ArrowRight className="size-4" />
          </Link>
        </div>
      ) : (
        <>
          <div className="mt-6 grid gap-4 lg:grid-cols-5">
            {/* Category bars */}
            <section className="card p-5 lg:col-span-3" aria-labelledby="chart-category">
              <h2 id="chart-category" className="font-bold">Estimasi nilai per kategori</h2>
              <p className="text-xs text-muted">Akumulasi seluruh RFQ</p>
              <ul className="mt-5 space-y-4">
                {stats.byCategory.map((entry) => (
                  <li key={entry.id} className="group">
                    <div className="flex items-center justify-between gap-3 text-sm">
                      <span className="flex items-center gap-2 font-medium">
                        <CategoryIcon id={entry.id as CategoryId} className="size-4 text-muted" /> {entry.name}
                      </span>
                      <span className="font-semibold tabular-nums">{formatRupiah(entry.value)}</span>
                    </div>
                    <div className="mt-2 h-2.5 rounded bg-surface-2" title={`${entry.name}: ${formatRupiah(entry.value)}`}>
                      <div
                        className="h-full rounded bg-brand-500 transition-[width,background-color] duration-700 group-hover:bg-brand-600"
                        style={{ width: `${(entry.value / maxCategory) * 100}%`, minWidth: entry.value > 0 ? 6 : 0 }}
                      />
                    </div>
                  </li>
                ))}
              </ul>
            </section>

            {/* Monthly columns */}
            <section className="card p-5 lg:col-span-2" aria-labelledby="chart-month">
              <h2 id="chart-month" className="font-bold">Tren 6 bulan</h2>
              <p className="text-xs text-muted">Estimasi nilai RFQ per bulan</p>
              <div className="relative mt-5 flex h-48 items-end gap-2 border-b border-line">
                {[0.5, 1].map((line) => (
                  <span key={line} className="pointer-events-none absolute inset-x-0 border-t border-dashed border-line" style={{ bottom: `${line * 100}%` }} />
                ))}
                {stats.months.map((entry) => (
                  <div key={entry.key} className="group relative flex h-full flex-1 items-end justify-center">
                    <span className="pointer-events-none absolute -top-1 z-10 -translate-y-full whitespace-nowrap rounded-lg bg-fg px-2 py-1 text-[11px] font-semibold text-bg opacity-0 shadow transition group-hover:opacity-100">
                      {formatRupiah(entry.value)}
                    </span>
                    <div
                      className="w-full max-w-8 rounded-t bg-brand-500 transition-colors group-hover:bg-brand-600"
                      style={{ height: `${(entry.value / maxMonth) * 100}%`, minHeight: entry.value > 0 ? 4 : 0 }}
                      aria-label={`${entry.label}: ${formatRupiah(entry.value)}`}
                    />
                  </div>
                ))}
              </div>
              <div className="mt-2 flex gap-2">
                {stats.months.map((entry) => (
                  <span key={entry.key} className="flex-1 text-center text-[11px] text-muted">{entry.label}</span>
                ))}
              </div>
              <p className="mt-3 text-right text-[11px] text-muted">Puncak: {formatCompact(maxMonth === 1 ? 0 : maxMonth)}</p>
            </section>
          </div>

          {/* History table */}
          <section className="card mt-6 overflow-hidden">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-4">
              <div>
                <h2 className="font-bold">Riwayat RFQ</h2>
                <p className="text-xs text-muted">Klik baris untuk melihat rincian item</p>
              </div>
              {confirmClear ? (
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-muted">Hapus semua riwayat?</span>
                  <button type="button" className="btn btn-ghost px-3 py-1.5 text-xs" onClick={() => setConfirmClear(false)}>Batal</button>
                  <button
                    type="button"
                    className="btn bg-red-600 px-3 py-1.5 text-xs text-white hover:bg-red-700"
                    onClick={() => {
                      clearHistory();
                      setConfirmClear(false);
                      toast({ title: "Riwayat RFQ dihapus", tone: "info" });
                    }}
                  >
                    Ya, hapus
                  </button>
                </div>
              ) : (
                <button type="button" className="btn btn-ghost px-3 text-xs" onClick={() => setConfirmClear(true)}>
                  <Trash2 className="size-4" /> Hapus riwayat
                </button>
              )}
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-sm">
                <thead className="bg-surface-2/60 text-left text-xs uppercase tracking-wider text-muted">
                  <tr>
                    <th className="px-5 py-3 font-semibold">Nomor</th>
                    <th className="px-5 py-3 font-semibold">Tanggal</th>
                    <th className="px-5 py-3 font-semibold">Perusahaan</th>
                    <th className="px-5 py-3 font-semibold">Produk</th>
                    <th className="px-5 py-3 text-right font-semibold">Estimasi</th>
                    <th className="px-5 py-3 font-semibold">Status</th>
                    <th className="w-10" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {history.map((rfq) => {
                    const open = expanded === rfq.id;
                    return (
                      <Fragment key={rfq.id}>
                        <tr className="cursor-pointer transition-colors hover:bg-surface-2/50" onClick={() => setExpanded(open ? null : rfq.id)}>
                          <td className="px-5 py-3.5 font-semibold">{rfq.id}</td>
                          <td className="px-5 py-3.5 text-muted">{formatDate(rfq.createdAt)}</td>
                          <td className="px-5 py-3.5">
                            <p className="font-medium">{rfq.company}</p>
                            <p className="text-xs text-muted">{rfq.destination}</p>
                          </td>
                          <td className="px-5 py-3.5 text-muted">{rfq.items.length} produk</td>
                          <td className="px-5 py-3.5 text-right font-semibold tabular-nums">{formatRupiah(rfq.estimatedTotal)}</td>
                          <td className="px-5 py-3.5">
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-2.5 py-1 text-xs font-semibold text-brand-800 dark:bg-brand-950 dark:text-brand-300">
                              <span className="size-1.5 rounded-full bg-brand-500" /> Terkirim
                            </span>
                          </td>
                          <td className="pr-4">
                            <button type="button" aria-expanded={open} aria-label={`Rincian ${rfq.id}`} className="grid size-8 place-items-center rounded-lg text-muted hover:bg-surface-2">
                              <ChevronDown className={cn("size-4 transition", open && "rotate-180")} />
                            </button>
                          </td>
                        </tr>
                        {open && (
                          <tr className="bg-surface-2/40">
                            <td colSpan={7} className="px-5 py-4">
                              <div className="grid gap-4 md:grid-cols-[1fr_240px]">
                                <ul className="space-y-2">
                                  {rfq.items.map((item) => {
                                    const product = getProduct(item.slug);
                                    return (
                                      <li key={item.slug} className="flex items-center gap-3">
                                        {product && (
                                          <span className="relative size-10 shrink-0 overflow-hidden rounded-lg bg-surface-2">
                                            <Image src={product.image} alt="" fill sizes="40px" className="object-cover" />
                                          </span>
                                        )}
                                        <div className="min-w-0 flex-1">
                                          <p className="truncate font-medium">{item.name}</p>
                                          <p className="text-xs text-muted">
                                            {formatNumber(item.quantity)} {item.unit} × {formatRupiah(item.unitPrice)} · {getSupplier(item.supplierSlug)?.name}
                                          </p>
                                        </div>
                                        <span className="font-semibold tabular-nums">{formatRupiah(item.subtotal)}</span>
                                      </li>
                                    );
                                  })}
                                </ul>
                                <dl className="space-y-1.5 rounded-xl border border-line bg-surface p-3 text-xs">
                                  <div className="flex justify-between gap-2"><dt className="text-muted">Kontak</dt><dd className="text-right font-medium">{rfq.contactName}</dd></div>
                                  <div className="flex justify-between gap-2"><dt className="text-muted">Email</dt><dd className="truncate text-right font-medium">{rfq.email}</dd></div>
                                  <div className="flex justify-between gap-2"><dt className="text-muted">Dibutuhkan</dt><dd className="text-right font-medium">{formatDate(rfq.neededBy)}</dd></div>
                                  <div className="flex justify-between gap-2"><dt className="text-muted">Pembayaran</dt><dd className="text-right font-medium">{rfq.paymentPreference}</dd></div>
                                </dl>
                              </div>
                            </td>
                          </tr>
                        )}
                      </Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>

          {stats.supplierTotals.length > 0 && (
            <section className="card mt-6 p-5">
              <h2 className="font-bold">Pemasok teratas</h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {stats.supplierTotals.slice(0, 4).map((supplier, index) => (
                  <Link key={supplier.slug} href={`/pemasok/${supplier.slug}`} className="rounded-xl border border-line p-4 transition hover:border-brand-300">
                    <p className="text-xs text-muted">#{index + 1}</p>
                    <p className="mt-1 truncate font-semibold">{supplier.name}</p>
                    <p className="text-sm font-bold tabular-nums text-brand-700 dark:text-brand-400">{formatRupiah(supplier.value)}</p>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </>
      )}

      {/* Wishlist */}
      <section className="mt-12">
        <div className="flex items-center gap-2">
          <Heart className="size-5 text-rose-500" />
          <h2 className="text-xl font-bold">Produk favorit</h2>
          <span className="text-sm text-muted">({wishlist.length})</span>
        </div>
        {wishlist.length === 0 ? (
          <p className="mt-3 text-sm text-muted">Klik ikon hati di kartu produk untuk menyimpannya di sini.</p>
        ) : (
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {wishlist.map((slug) => {
              const product = getProduct(slug);
              if (!product) return null;
              return (
                <div key={slug} className="card flex items-center gap-3 p-3">
                  <Link href={`/produk/${slug}`} className="relative size-14 shrink-0 overflow-hidden rounded-lg bg-surface-2">
                    <Image src={product.image} alt={product.name} fill sizes="56px" className="object-cover" />
                  </Link>
                  <div className="min-w-0 flex-1">
                    <Link href={`/produk/${slug}`} className="block truncate text-sm font-semibold hover:underline">{product.name}</Link>
                    <p className="text-xs text-muted">Mulai {formatRupiah(priceRange(product).min)}/{product.unit}</p>
                  </div>
                  <button type="button" onClick={() => toggleWishlist(slug)} className="text-rose-500" aria-label={`Hapus ${product.name} dari favorit`}>
                    <Heart className="size-4 fill-current" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {recommendations.length > 0 && (
        <section className="mt-12">
          <h2 className="text-xl font-bold">Rekomendasi untuk Anda</h2>
          <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {recommendations.map((product) => (
              <ProductCard key={product.slug} product={product} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
