"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, Building2, Check, CircleCheck, ClipboardList, Loader2, MapPin, Package, Plus, Send, ShieldCheck, Trash2 } from "lucide-react";
import { getProduct, products } from "@/lib/data/products";
import { getSupplier } from "@/lib/data/suppliers";
import { quantityStep, supplierOf, unitPriceFor } from "@/lib/catalog";
import { formatDate, formatNumber, formatRupiah } from "@/lib/format";
import {
  companySchema,
  deliverySchema,
  indonesianProvinces,
  industries,
  paymentLabels,
  type CompanyInput,
  type DeliveryInput,
} from "@/lib/rfq-schema";
import { useAppStore, useUi, type SubmittedRfq } from "@/lib/store";
import { useMounted } from "@/lib/use-mounted";
import { QuantityInput } from "@/components/ui/quantity-input";
import { cn } from "@/lib/cn";

const steps = [
  { title: "Produk", icon: Package },
  { title: "Perusahaan", icon: Building2 },
  { title: "Pengiriman", icon: MapPin },
  { title: "Tinjau & kirim", icon: Send },
];

const DRAFT_KEY = "nusatrade-rfq-draft-v1";

const emptyContact: CompanyInput = { name: "", email: "", phone: "", company: "", industry: "", npwp: "" };
const emptyDelivery: DeliveryInput = { province: "", city: "", address: "", neededBy: "", paymentPreference: "transfer", note: "" };

type Errors = Record<string, string>;

function toErrors(issues: { path: PropertyKey[]; message: string }[]): Errors {
  return Object.fromEntries(issues.map((issue) => [String(issue.path[0]), issue.message]));
}

export function RfqWizard() {
  const mounted = useMounted();
  const cart = useAppStore((state) => state.cart);
  const addToCart = useAppStore((state) => state.addToCart);
  const updateCartItem = useAppStore((state) => state.updateCartItem);
  const removeFromCart = useAppStore((state) => state.removeFromCart);
  const clearCart = useAppStore((state) => state.clearCart);
  const addHistory = useAppStore((state) => state.addHistory);
  const toast = useUi((state) => state.toast);

  const [step, setStep] = useState(0);
  const [contact, setContact] = useState<CompanyInput>(emptyContact);
  const [delivery, setDelivery] = useState<DeliveryInput>(emptyDelivery);
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [submitted, setSubmitted] = useState<(SubmittedRfq & { delivered: boolean }) | null>(null);

  // Muat & simpan draf formulir agar tidak hilang saat berpindah halaman.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (raw) {
        const draft = JSON.parse(raw) as { contact?: CompanyInput; delivery?: DeliveryInput };
        if (draft.contact) setContact({ ...emptyContact, ...draft.contact });
        if (draft.delivery) setDelivery({ ...emptyDelivery, ...draft.delivery });
      }
    } catch {
      /* draf rusak atau penyimpanan tidak tersedia — mulai dari kosong */
    }
  }, []);
  useEffect(() => {
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify({ contact, delivery }));
    } catch {
      /* abaikan */
    }
  }, [contact, delivery]);

  const lines = useMemo(
    () =>
      cart.flatMap((item) => {
        const product = getProduct(item.slug);
        if (!product) return [];
        const unitPrice = unitPriceFor(product, item.quantity);
        return [{ item, product, unitPrice, subtotal: unitPrice * item.quantity, supplier: supplierOf(product) }];
      }),
    [cart],
  );
  const total = lines.reduce((sum, line) => sum + line.subtotal, 0);
  const bySupplier = useMemo(() => {
    const groups = new Map<string, typeof lines>();
    lines.forEach((line) => groups.set(line.supplier.slug, [...(groups.get(line.supplier.slug) ?? []), line]));
    return [...groups.entries()];
  }, [lines]);

  const minDate = useMemo(() => {
    const date = new Date();
    date.setDate(date.getDate() + 3);
    return date.toISOString().slice(0, 10);
  }, []);

  if (!mounted) return <div className="mt-10 h-[480px] animate-pulse rounded-3xl bg-surface-2" />;

  if (submitted) return <SuccessView rfq={submitted} />;

  const validateStep = (index: number) => {
    if (index === 0) {
      if (lines.length === 0) {
        setErrors({ items: "Tambahkan minimal satu produk." });
        return false;
      }
    }
    if (index === 1) {
      const result = companySchema.safeParse(contact);
      if (!result.success) {
        setErrors(toErrors(result.error.issues));
        return false;
      }
    }
    if (index === 2) {
      const result = deliverySchema.safeParse(delivery);
      if (!result.success) {
        setErrors(toErrors(result.error.issues));
        return false;
      }
    }
    setErrors({});
    return true;
  };

  const next = () => {
    if (validateStep(step)) {
      setStep((value) => Math.min(steps.length - 1, value + 1));
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const goTo = (index: number) => {
    for (let i = 0; i < index; i += 1) {
      if (!validateStep(i)) {
        setStep(i);
        return;
      }
    }
    setStep(index);
  };

  const submit = async () => {
    for (let i = 0; i < 3; i += 1) {
      if (!validateStep(i)) {
        setStep(i);
        return;
      }
    }
    setSubmitting(true);
    setServerError("");
    try {
      const response = await fetch("/api/rfq", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: cart.map(({ slug, quantity, variants, note }) => ({ slug, quantity, variants, note })),
          contact,
          delivery,
          website: honeypot,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Permintaan gagal dikirim.");

      const record: SubmittedRfq & { delivered: boolean } = {
        id: data.id,
        createdAt: data.createdAt,
        company: contact.company,
        contactName: contact.name,
        email: contact.email,
        destination: `${delivery.city}, ${delivery.province}`,
        neededBy: delivery.neededBy,
        paymentPreference: paymentLabels[delivery.paymentPreference as keyof typeof paymentLabels],
        estimatedTotal: data.estimatedTotal,
        items: data.items.map((item: SubmittedRfq["items"][number]) => ({
          slug: item.slug,
          name: item.name,
          quantity: item.quantity,
          unit: item.unit,
          unitPrice: item.unitPrice,
          subtotal: item.subtotal,
          supplierSlug: item.supplierSlug,
          category: item.category,
        })),
        status: "terkirim",
        delivered: Boolean(data.delivered),
      };
      addHistory(record);
      clearCart();
      setSubmitted(record);
      toast({ title: `${record.id} terkirim`, description: "Riwayat tersimpan di dashboard Anda." });
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
      setServerError(error instanceof Error ? error.message : "Terjadi kesalahan. Coba lagi.");
    } finally {
      setSubmitting(false);
    }
  };

  const available = products.filter((product) => !cart.some((item) => item.slug === product.slug));

  return (
    <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_340px]">
      <div className="min-w-0">
        {/* Stepper */}
        <ol className="card grid grid-cols-4 gap-1 p-2">
          {steps.map((entry, index) => {
            const done = index < step;
            const current = index === step;
            return (
              <li key={entry.title}>
                <button
                  type="button"
                  onClick={() => goTo(index)}
                  className={cn("flex w-full flex-col items-center gap-1.5 rounded-xl px-2 py-2.5 text-center transition sm:flex-row sm:text-left", current && "bg-surface-2")}
                  aria-current={current ? "step" : undefined}
                >
                  <span
                    className={cn(
                      "grid size-8 shrink-0 place-items-center rounded-full text-xs font-bold",
                      done ? "bg-brand-600 text-white" : current ? "bg-fg text-bg" : "bg-surface-2 text-muted",
                    )}
                  >
                    {done ? <Check className="size-4" /> : index + 1}
                  </span>
                  <span className={cn("text-[11px] font-semibold sm:text-sm", current ? "text-fg" : "text-muted")}>{entry.title}</span>
                </button>
              </li>
            );
          })}
        </ol>

        <div className="card mt-6 p-5 md:p-7">
          {step === 0 && (
            <div>
              <StepTitle title="Produk yang diminta" description="Atur jumlah, varian, dan catatan untuk setiap produk." />
              {errors.items && <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">{errors.items}</p>}
              {lines.length === 0 ? (
                <div className="mt-6 rounded-2xl border border-dashed border-line px-6 py-12 text-center">
                  <ClipboardList className="mx-auto size-8 text-muted" />
                  <p className="mt-3 font-semibold">Daftar RFQ masih kosong</p>
                  <p className="mt-1 text-sm text-muted">Pilih produk dari katalog, atau tambahkan langsung di bawah.</p>
                </div>
              ) : (
                <ul className="mt-6 space-y-4">
                  {lines.map(({ item, product, unitPrice, subtotal, supplier }) => (
                    <li key={item.slug} className="rounded-2xl border border-line p-4">
                      <div className="flex gap-4">
                        <span className="relative size-20 shrink-0 overflow-hidden rounded-xl bg-surface-2">
                          <Image src={product.image} alt={product.name} fill sizes="80px" className="object-cover" />
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <Link href={`/produk/${product.slug}`} className="font-semibold hover:underline">{product.name}</Link>
                              <p className="text-xs text-muted">{supplier.name} · MOQ {formatNumber(product.moq)} {product.unit}</p>
                            </div>
                            <button type="button" onClick={() => removeFromCart(item.slug)} className="text-muted hover:text-red-600" aria-label={`Hapus ${product.name}`}>
                              <Trash2 className="size-4" />
                            </button>
                          </div>
                          <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                            <QuantityInput size="sm" value={item.quantity} min={product.moq} step={quantityStep(product.moq)} onChange={(quantity) => updateCartItem(item.slug, { quantity })} label={`jumlah ${product.name}`} />
                            <p className="text-right text-sm">
                              <span className="font-bold tabular-nums">{formatRupiah(subtotal)}</span>
                              <span className="block text-xs text-muted tabular-nums">{formatRupiah(unitPrice)}/{product.unit}</span>
                            </p>
                          </div>
                        </div>
                      </div>
                      {product.variants.length > 0 && (
                        <div className="mt-4 grid gap-3 sm:grid-cols-3">
                          {product.variants.map((variant) => (
                            <label key={variant.name} className="text-xs font-semibold text-muted">
                              {variant.name}
                              <select
                                className="input mt-1 py-2 text-sm font-normal text-fg"
                                value={item.variants[variant.name] ?? variant.options[0]}
                                onChange={(event) => updateCartItem(item.slug, { variants: { ...item.variants, [variant.name]: event.target.value } })}
                              >
                                {variant.options.map((option) => (
                                  <option key={option}>{option}</option>
                                ))}
                              </select>
                            </label>
                          ))}
                        </div>
                      )}
                      <label className="mt-3 block text-xs font-semibold text-muted">
                        Catatan untuk pemasok
                        <input
                          className="input mt-1 py-2 text-sm font-normal"
                          value={item.note}
                          maxLength={500}
                          placeholder="Mis. spesifikasi cetak, jadwal kirim bertahap, warna logo…"
                          onChange={(event) => updateCartItem(item.slug, { note: event.target.value })}
                        />
                      </label>
                    </li>
                  ))}
                </ul>
              )}
              {available.length > 0 && (
                <div className="mt-6 flex flex-wrap items-center gap-2">
                  <Plus className="size-4 text-muted" />
                  <select
                    className="input w-auto flex-1 py-2"
                    value=""
                    onChange={(event) => {
                      const product = getProduct(event.target.value);
                      if (!product) return;
                      addToCart({ slug: product.slug, quantity: product.moq, variants: Object.fromEntries(product.variants.map((variant) => [variant.name, variant.options[0]])) });
                      setErrors({});
                    }}
                    aria-label="Tambah produk ke RFQ"
                  >
                    <option value="">Tambah produk lain ke RFQ…</option>
                    {available.map((product) => (
                      <option key={product.slug} value={product.slug}>
                        {product.name} — MOQ {formatNumber(product.moq)} {product.unit}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          )}

          {step === 1 && (
            <div>
              <StepTitle title="Informasi perusahaan" description="Pemasok menggunakan data ini untuk mengirim penawaran resmi." />
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <Field label="Nama lengkap" error={errors.name}>
                  <input className="input" autoComplete="name" value={contact.name} onChange={(e) => setContact({ ...contact, name: e.target.value })} aria-invalid={Boolean(errors.name)} placeholder="Nama Anda" />
                </Field>
                <Field label="Nama perusahaan" error={errors.company}>
                  <input className="input" autoComplete="organization" value={contact.company} onChange={(e) => setContact({ ...contact, company: e.target.value })} aria-invalid={Boolean(errors.company)} placeholder="PT / CV / usaha Anda" />
                </Field>
                <Field label="Email bisnis" error={errors.email}>
                  <input className="input" type="email" autoComplete="email" value={contact.email} onChange={(e) => setContact({ ...contact, email: e.target.value })} aria-invalid={Boolean(errors.email)} placeholder="nama@perusahaan.co.id" />
                </Field>
                <Field label="Nomor ponsel / WhatsApp" error={errors.phone}>
                  <input className="input" type="tel" autoComplete="tel" value={contact.phone} onChange={(e) => setContact({ ...contact, phone: e.target.value.replace(/[^\d+]/g, "") })} aria-invalid={Boolean(errors.phone)} placeholder="0812xxxxxxxx" />
                </Field>
                <Field label="Jenis industri" error={errors.industry}>
                  <select className="input" value={contact.industry} onChange={(e) => setContact({ ...contact, industry: e.target.value })} aria-invalid={Boolean(errors.industry)}>
                    <option value="">Pilih industri</option>
                    {industries.map((industry) => (
                      <option key={industry}>{industry}</option>
                    ))}
                  </select>
                </Field>
                <Field label="NPWP perusahaan" optional error={errors.npwp}>
                  <input className="input" inputMode="numeric" value={contact.npwp} onChange={(e) => setContact({ ...contact, npwp: e.target.value })} aria-invalid={Boolean(errors.npwp)} placeholder="Untuk faktur pajak" />
                </Field>
              </div>
              {/* Honeypot — disembunyikan dari pengguna */}
              <input type="text" tabIndex={-1} autoComplete="off" value={honeypot} onChange={(e) => setHoneypot(e.target.value)} className="hidden" aria-hidden="true" name="website" />
            </div>
          )}

          {step === 2 && (
            <div>
              <StepTitle title="Pengiriman & pembayaran" description="Membantu pemasok menghitung ongkos kirim dan jadwal produksi." />
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <Field label="Provinsi tujuan" error={errors.province}>
                  <select className="input" value={delivery.province} onChange={(e) => setDelivery({ ...delivery, province: e.target.value })} aria-invalid={Boolean(errors.province)}>
                    <option value="">Pilih provinsi</option>
                    {indonesianProvinces.map((province) => (
                      <option key={province}>{province}</option>
                    ))}
                  </select>
                </Field>
                <Field label="Kota / kabupaten" error={errors.city}>
                  <input className="input" value={delivery.city} onChange={(e) => setDelivery({ ...delivery, city: e.target.value })} aria-invalid={Boolean(errors.city)} placeholder="Mis. Jakarta Selatan" />
                </Field>
                <Field label="Alamat pengiriman" error={errors.address} className="sm:col-span-2">
                  <textarea className="input min-h-24" value={delivery.address} onChange={(e) => setDelivery({ ...delivery, address: e.target.value })} aria-invalid={Boolean(errors.address)} placeholder="Nama jalan, nomor, kecamatan, kode pos" />
                </Field>
                <Field label="Dibutuhkan paling lambat" error={errors.neededBy}>
                  <input className="input" type="date" min={minDate} value={delivery.neededBy} onChange={(e) => setDelivery({ ...delivery, neededBy: e.target.value })} aria-invalid={Boolean(errors.neededBy)} />
                </Field>
                <fieldset className="sm:col-span-2">
                  <legend className="text-sm font-semibold">Preferensi pembayaran</legend>
                  <div className="mt-2 grid gap-2 sm:grid-cols-3">
                    {(Object.keys(paymentLabels) as (keyof typeof paymentLabels)[]).map((key) => (
                      <label key={key} className={cn("flex cursor-pointer items-center gap-3 rounded-xl border p-3 text-sm transition", delivery.paymentPreference === key ? "border-brand-500 bg-brand-50 dark:bg-brand-950" : "border-line")}>
                        <input type="radio" name="payment" className="accent-brand-600" checked={delivery.paymentPreference === key} onChange={() => setDelivery({ ...delivery, paymentPreference: key })} />
                        <span className="font-medium">{paymentLabels[key]}</span>
                      </label>
                    ))}
                  </div>
                </fieldset>
                <Field label="Catatan tambahan" optional className="sm:col-span-2">
                  <textarea className="input min-h-20" maxLength={1000} value={delivery.note} onChange={(e) => setDelivery({ ...delivery, note: e.target.value })} placeholder="Mis. jam bongkar gudang, kebutuhan dokumen, termin khusus…" />
                </Field>
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <StepTitle title="Tinjau permintaan" description="Pastikan semua data sudah benar sebelum dikirim ke pemasok." />
              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <ReviewBlock title="Perusahaan" onEdit={() => setStep(1)}>
                  <p className="font-semibold">{contact.company}</p>
                  <p>{contact.name} · {contact.industry}</p>
                  <p>{contact.email}</p>
                  <p>{contact.phone}</p>
                  {contact.npwp && <p>NPWP {contact.npwp}</p>}
                </ReviewBlock>
                <ReviewBlock title="Pengiriman" onEdit={() => setStep(2)}>
                  <p className="font-semibold">{delivery.city}, {delivery.province}</p>
                  <p>{delivery.address}</p>
                  <p>Dibutuhkan {delivery.neededBy ? formatDate(delivery.neededBy, { day: "numeric", month: "long", year: "numeric" }) : "—"}</p>
                  <p>{paymentLabels[delivery.paymentPreference as keyof typeof paymentLabels]}</p>
                </ReviewBlock>
              </div>
              <div className="mt-4 space-y-3">
                {bySupplier.map(([supplierSlug, group]) => (
                  <div key={supplierSlug} className="rounded-2xl border border-line">
                    <p className="border-b border-line px-4 py-2.5 text-sm font-semibold">{getSupplier(supplierSlug)?.name}</p>
                    <ul className="divide-y divide-line">
                      {group.map(({ item, product, subtotal }) => (
                        <li key={item.slug} className="flex items-start justify-between gap-3 px-4 py-3 text-sm">
                          <div>
                            <p className="font-medium">{product.name}</p>
                            <p className="text-xs text-muted">
                              {formatNumber(item.quantity)} {product.unit}
                              {Object.values(item.variants).length > 0 && ` · ${Object.values(item.variants).join(" · ")}`}
                            </p>
                            {item.note && <p className="mt-1 text-xs italic text-muted">“{item.note}”</p>}
                          </div>
                          <span className="font-semibold tabular-nums">{formatRupiah(subtotal)}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
              {serverError && <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-950 dark:text-red-300" role="alert">{serverError}</p>}
              <p className="mt-4 text-xs text-muted">Dengan mengirim, Anda setuju dihubungi pemasok terkait permintaan ini. Harga di atas adalah estimasi berdasarkan harga katalog.</p>
            </div>
          )}

          <div className="mt-8 flex items-center justify-between gap-3 border-t border-line pt-5">
            <button type="button" className="btn btn-ghost" onClick={() => setStep((value) => Math.max(0, value - 1))} disabled={step === 0}>
              <ArrowLeft className="size-4" /> Kembali
            </button>
            {step < steps.length - 1 ? (
              <button type="button" className="btn btn-primary" onClick={next}>
                Lanjut <ArrowRight className="size-4" />
              </button>
            ) : (
              <button type="button" className="btn btn-primary" onClick={submit} disabled={submitting}>
                {submitting ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />} Kirim RFQ
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Summary */}
      <aside className="lg:sticky lg:top-24 lg:self-start">
        <div className="card p-5">
          <h2 className="font-bold">Ringkasan</h2>
          <dl className="mt-4 space-y-2.5 text-sm">
            <div className="flex justify-between"><dt className="text-muted">Produk</dt><dd className="font-semibold">{lines.length}</dd></div>
            <div className="flex justify-between"><dt className="text-muted">Pemasok</dt><dd className="font-semibold">{bySupplier.length}</dd></div>
            <div className="flex justify-between"><dt className="text-muted">Total unit</dt><dd className="font-semibold tabular-nums">{formatNumber(lines.reduce((sum, line) => sum + line.item.quantity, 0))}</dd></div>
          </dl>
          <div className="mt-4 border-t border-line pt-4">
            <p className="text-xs text-muted">Estimasi nilai pengadaan</p>
            <p className="text-2xl font-extrabold tabular-nums">{formatRupiah(total)}</p>
            <p className="mt-1 text-[11px] text-muted">Belum termasuk ongkos kirim & pajak.</p>
          </div>
        </div>
        <div className="mt-4 flex gap-3 rounded-2xl border border-brand-200 bg-brand-50 p-4 text-sm dark:border-brand-900 dark:bg-brand-950">
          <ShieldCheck className="size-5 shrink-0 text-brand-600" />
          <p className="text-brand-900 dark:text-brand-200">Data Anda hanya dibagikan kepada pemasok yang ada di RFQ ini.</p>
        </div>
      </aside>
    </div>
  );
}

function StepTitle({ title, description }: { title: string; description: string }) {
  return (
    <div>
      <h2 className="text-xl font-bold">{title}</h2>
      <p className="mt-1 text-sm text-muted">{description}</p>
    </div>
  );
}

function Field({ label, error, optional, className, children }: { label: string; error?: string; optional?: boolean; className?: string; children: React.ReactNode }) {
  return (
    <label className={cn("block", className)}>
      <span className="text-sm font-semibold">
        {label} {optional && <span className="font-normal text-muted">(opsional)</span>}
      </span>
      <div className="mt-1.5">{children}</div>
      {error && <span className="mt-1 block text-xs font-medium text-red-600 dark:text-red-400">{error}</span>}
    </label>
  );
}

function ReviewBlock({ title, onEdit, children }: { title: string; onEdit: () => void; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-line p-4 text-sm">
      <div className="mb-2 flex items-center justify-between">
        <p className="text-xs font-bold uppercase tracking-wider text-muted">{title}</p>
        <button type="button" onClick={onEdit} className="text-xs font-semibold text-brand-700 hover:underline dark:text-brand-400">Ubah</button>
      </div>
      <div className="space-y-0.5 text-muted [&>p:first-child]:text-fg">{children}</div>
    </div>
  );
}

function SuccessView({ rfq }: { rfq: SubmittedRfq & { delivered: boolean } }) {
  const timeline = [
    { title: "RFQ terkirim", text: formatDate(rfq.createdAt, { day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" }), done: true },
    { title: "Ditinjau pemasok", text: "Biasanya dalam 1–4 jam kerja", done: false },
    { title: "Penawaran resmi", text: `Dikirim ke ${rfq.email}`, done: false },
  ];
  return (
    <div className="mx-auto mt-10 max-w-2xl">
      <div className="card p-8 text-center">
        <span className="mx-auto grid size-16 place-items-center rounded-full bg-brand-100 text-brand-700 dark:bg-brand-900 dark:text-brand-300">
          <CircleCheck className="size-8" />
        </span>
        <h2 className="mt-5 text-2xl font-extrabold">Permintaan berhasil dikirim</h2>
        <p className="mt-2 text-muted">
          Nomor RFQ <span className="font-bold text-fg">{rfq.id}</span> untuk {rfq.company}.
        </p>
        <div className="mx-auto mt-6 grid max-w-md grid-cols-2 gap-3 text-left">
          <div className="rounded-2xl bg-surface-2 p-4">
            <p className="text-xs text-muted">Produk</p>
            <p className="text-lg font-bold">{rfq.items.length}</p>
          </div>
          <div className="rounded-2xl bg-surface-2 p-4">
            <p className="text-xs text-muted">Estimasi nilai</p>
            <p className="text-lg font-bold tabular-nums">{formatRupiah(rfq.estimatedTotal)}</p>
          </div>
        </div>
        <ol className="mx-auto mt-8 max-w-sm space-y-4 text-left">
          {timeline.map((entry, index) => (
            <li key={entry.title} className="flex gap-3">
              <span className={cn("mt-0.5 grid size-6 shrink-0 place-items-center rounded-full text-[11px] font-bold", entry.done ? "bg-brand-600 text-white" : "bg-surface-2 text-muted")}>
                {entry.done ? <Check className="size-3.5" /> : index + 1}
              </span>
              <div>
                <p className="text-sm font-semibold">{entry.title}</p>
                <p className="text-xs text-muted">{entry.text}</p>
              </div>
            </li>
          ))}
        </ol>
        {!rfq.delivered && (
          <p className="mx-auto mt-6 max-w-md rounded-xl bg-saffron-300/20 px-4 py-3 text-xs text-fg">
            Mode demo: RFQ divalidasi server dan tersimpan di browser ini. Atur <code className="font-semibold">RFQ_WEBHOOK_URL</code> agar RFQ diteruskan ke sistem Anda.
          </p>
        )}
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/dashboard" className="btn btn-primary">Lihat di dashboard <ArrowRight className="size-4" /></Link>
          <Link href="/produk" className="btn btn-secondary">Lanjut belanja</Link>
        </div>
      </div>
    </div>
  );
}
