import { NextResponse } from "next/server";
import { rfqSchema } from "@/lib/rfq-schema";
import { getProduct } from "@/lib/data/products";
import { supplierOf, unitPriceFor } from "@/lib/catalog";

export const runtime = "nodejs";

/* Pembatas laju sederhana per IP (best-effort; setiap instance serverless punya memori sendiri). */
const WINDOW_MS = 60_000;
const MAX_REQUESTS = 8;
const hits = new Map<string, number[]>();

function rateLimited(ip: string) {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((time) => now - time < WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 5_000) hits.clear();
  return recent.length > MAX_REQUESTS;
}

function makeId() {
  const date = new Date().toISOString().slice(2, 10).replace(/-/g, "");
  const random = crypto.randomUUID().replace(/-/g, "").slice(0, 5).toUpperCase();
  return `RFQ-${date}-${random}`;
}

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (rateLimited(ip)) {
    return NextResponse.json({ error: "Terlalu banyak permintaan. Coba lagi dalam satu menit." }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Format data tidak valid." }, { status: 400 });
  }

  const parsed = rfqSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Data permintaan belum lengkap.", issues: parsed.error.issues.map((issue) => ({ path: issue.path.join("."), message: issue.message })) },
      { status: 422 },
    );
  }

  const { items, contact, delivery } = parsed.data;
  const priced = [];
  for (const item of items) {
    const product = getProduct(item.slug);
    if (!product) {
      return NextResponse.json({ error: `Produk "${item.slug}" tidak ditemukan.` }, { status: 422 });
    }
    if (item.quantity < product.moq) {
      return NextResponse.json({ error: `Jumlah ${product.name} minimal ${product.moq} ${product.unit}.` }, { status: 422 });
    }
    for (const [name, option] of Object.entries(item.variants)) {
      const variant = product.variants.find((entry) => entry.name === name);
      if (!variant || !variant.options.includes(option)) {
        return NextResponse.json({ error: `Varian "${name}: ${option}" tidak tersedia untuk ${product.name}.` }, { status: 422 });
      }
    }
    const unitPrice = unitPriceFor(product, item.quantity);
    const supplier = supplierOf(product);
    priced.push({
      slug: product.slug,
      name: product.name,
      unit: product.unit,
      category: product.category,
      supplierSlug: supplier.slug,
      supplierName: supplier.name,
      quantity: item.quantity,
      variants: item.variants,
      note: item.note,
      unitPrice,
      subtotal: unitPrice * item.quantity,
    });
  }

  const rfq = {
    id: makeId(),
    createdAt: new Date().toISOString(),
    contact,
    delivery,
    items: priced,
    estimatedTotal: priced.reduce((sum, item) => sum + item.subtotal, 0),
    supplierCount: new Set(priced.map((item) => item.supplierSlug)).size,
  };

  let delivered = false;
  const webhook = process.env.RFQ_WEBHOOK_URL;
  if (webhook) {
    try {
      const response = await fetch(webhook, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ event: "rfq.created", data: rfq }),
        signal: AbortSignal.timeout(8_000),
      });
      if (!response.ok) throw new Error(`Webhook merespons ${response.status}`);
      delivered = true;
    } catch (error) {
      console.error("[rfq] Gagal meneruskan RFQ ke webhook:", error);
      return NextResponse.json({ error: "Permintaan belum dapat diteruskan ke pemasok. Silakan coba lagi beberapa saat lagi." }, { status: 502 });
    }
  } else {
    console.info(`[rfq] ${rfq.id} diterima (${priced.length} produk). RFQ_WEBHOOK_URL belum diatur, RFQ tidak diteruskan.`);
  }

  return NextResponse.json({ ...rfq, delivered }, { status: 201 });
}
