"use client";

import { useState } from "react";
import { Check, ChevronDown, CreditCard, Package, Truck, Wrench } from "lucide-react";
import type { Product } from "@/lib/types";
import { formatDate } from "@/lib/format";
import { RatingStars } from "@/components/ui/misc";
import { cn } from "@/lib/cn";

export function ProductTabs({ product }: { product: Product }) {
  const tabs = [
    { id: "deskripsi", label: "Deskripsi" },
    { id: "spesifikasi", label: "Spesifikasi" },
    { id: "pengiriman", label: "Pengiriman & pembayaran" },
    { id: "ulasan", label: `Ulasan (${product.reviewCount})` },
    { id: "faq", label: "FAQ" },
  ];
  const [active, setActive] = useState(tabs[0].id);

  const distribution = [5, 4, 3, 2, 1].map((stars) => {
    const weight = stars === 5 ? 0.78 : stars === 4 ? 0.17 : stars === 3 ? 0.04 : 0.005;
    return { stars, count: Math.round(product.reviewCount * weight) };
  });

  return (
    <div>
      <div className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
        <div role="tablist" aria-label="Informasi produk" className="flex min-w-max gap-1 border-b border-line">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              id={`tab-${tab.id}`}
              type="button"
              role="tab"
              aria-selected={active === tab.id}
              aria-controls={`panel-${tab.id}`}
              onClick={() => setActive(tab.id)}
              className={cn(
                "relative px-4 py-3 text-sm font-semibold transition-colors",
                active === tab.id ? "text-fg" : "text-muted hover:text-fg",
              )}
            >
              {tab.label}
              {active === tab.id && <span className="absolute inset-x-3 -bottom-px h-0.5 rounded-full bg-brand-600" />}
            </button>
          ))}
        </div>
      </div>

      <div id={`panel-${active}`} role="tabpanel" aria-labelledby={`tab-${active}`} className="pt-6">
        {active === "deskripsi" && (
          <div className="grid gap-8 lg:grid-cols-[1.5fr_1fr]">
            <div className="space-y-4 leading-relaxed text-muted">
              {product.description.map((paragraph) => (
                <p key={paragraph.slice(0, 24)}>{paragraph}</p>
              ))}
              <p className="text-sm">
                <span className="font-semibold text-fg">Kemasan: </span>
                {product.packaging}
              </p>
            </div>
            <div className="space-y-4">
              <div className="card p-5">
                <h3 className="text-sm font-bold">Keunggulan</h3>
                <ul className="mt-3 space-y-2.5">
                  {product.highlights.map((highlight) => (
                    <li key={highlight} className="flex gap-2 text-sm">
                      <Check className="mt-0.5 size-4 shrink-0 text-brand-600" /> {highlight}
                    </li>
                  ))}
                </ul>
              </div>
              {product.customizable && product.customOptions && (
                <div className="card p-5">
                  <h3 className="flex items-center gap-2 text-sm font-bold">
                    <Wrench className="size-4 text-saffron-500" /> Opsi kustomisasi
                  </h3>
                  <ul className="mt-3 space-y-2 text-sm text-muted">
                    {product.customOptions.map((option) => (
                      <li key={option}>• {option}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}

        {active === "spesifikasi" && (
          <div className="card overflow-hidden">
            <table className="w-full text-sm">
              <tbody>
                {product.specs.map((spec, index) => (
                  <tr key={spec.label} className={cn(index % 2 === 0 && "bg-surface-2/60")}>
                    <th scope="row" className="w-1/3 px-5 py-3.5 text-left font-medium text-muted">
                      {spec.label}
                    </th>
                    <td className="px-5 py-3.5 font-medium">{spec.value}</td>
                  </tr>
                ))}
                <tr>
                  <th scope="row" className="px-5 py-3.5 text-left font-medium text-muted">
                    Sertifikasi
                  </th>
                  <td className="px-5 py-3.5">
                    <div className="flex flex-wrap gap-1.5">
                      {product.certifications.map((cert) => (
                        <span key={cert} className="rounded-lg bg-brand-50 px-2 py-1 text-xs font-semibold text-brand-800 dark:bg-brand-950 dark:text-brand-300">
                          {cert}
                        </span>
                      ))}
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {active === "pengiriman" && (
          <div className="grid gap-4 md:grid-cols-3">
            <InfoList icon={Truck} title="Pengiriman" items={[`Lead time ${product.leadTimeDays[0]}–${product.leadTimeDays[1]} hari kerja`, ...product.shipping]} />
            <InfoList icon={CreditCard} title="Pembayaran" items={product.paymentTerms} />
            <InfoList icon={Package} title="Kemasan & kapasitas" items={[product.packaging, `Kapasitas produksi ${product.monthlyCapacity}`, `Dikirim dari ${product.origin}`]} />
          </div>
        )}

        {active === "ulasan" && (
          <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
            <div className="card h-fit p-5">
              <p className="text-5xl font-extrabold">{product.rating.toLocaleString("id-ID")}</p>
              <RatingStars rating={product.rating} size="md" className="mt-2" />
              <p className="mt-1 text-sm text-muted">{product.reviewCount} ulasan pembeli bisnis</p>
              <div className="mt-5 space-y-2">
                {distribution.map((row) => (
                  <div key={row.stars} className="flex items-center gap-2 text-xs">
                    <span className="w-3 text-muted">{row.stars}</span>
                    <span className="h-2 flex-1 overflow-hidden rounded-full bg-surface-2">
                      <span className="block h-full rounded-full bg-saffron-400" style={{ width: `${(row.count / product.reviewCount) * 100}%` }} />
                    </span>
                    <span className="w-7 text-right tabular-nums text-muted">{row.count}</span>
                  </div>
                ))}
              </div>
            </div>
            <ul className="space-y-4">
              {product.reviews.map((review) => (
                <li key={review.author} className="card p-5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <span className="grid size-10 place-items-center rounded-full bg-surface-2 text-sm font-bold">{review.author[0]}</span>
                      <div>
                        <p className="text-sm font-semibold">{review.author}</p>
                        <p className="text-xs text-muted">{review.role}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <RatingStars rating={review.rating} />
                      <p className="text-[11px] text-muted">{formatDate(review.date)}</p>
                    </div>
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-muted">{review.text}</p>
                </li>
              ))}
            </ul>
          </div>
        )}

        {active === "faq" && (
          <div className="max-w-3xl space-y-3">
            {product.faq.map((item) => (
              <details key={item.q} className="card group p-5 [&_summary::-webkit-details-marker]:hidden">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-semibold">
                  {item.q}
                  <ChevronDown className="size-4 shrink-0 text-muted transition group-open:rotate-180" />
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-muted">{item.a}</p>
              </details>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function InfoList({ icon: Icon, title, items }: { icon: React.ComponentType<{ className?: string }>; title: string; items: string[] }) {
  return (
    <div className="card p-5">
      <h3 className="flex items-center gap-2 text-sm font-bold">
        <Icon className="size-4 text-brand-600" /> {title}
      </h3>
      <ul className="mt-3 space-y-2 text-sm text-muted">
        {items.map((item) => (
          <li key={item} className="flex gap-2">
            <Check className="mt-0.5 size-4 shrink-0 text-brand-600" /> {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
