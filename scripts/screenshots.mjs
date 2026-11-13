/**
 * Membuat screenshot dokumentasi di docs/screenshots/.
 *
 *   1. npm run build && npm run start      (atau npm run dev)
 *   2. npm run screenshots                 (BASE_URL default http://localhost:3000)
 *
 * Memakai playwright-core dengan browser yang sudah terpasang (Edge/Chrome),
 * jadi tidak perlu mengunduh Chromium. Atur BROWSER_CHANNEL=chrome bila perlu.
 */
import { chromium } from "playwright-core";
import { mkdir } from "node:fs/promises";
import path from "node:path";

const BASE = process.env.BASE_URL ?? "http://localhost:3000";
const OUT = path.resolve("docs/screenshots");
const channel = process.env.BROWSER_CHANNEL ?? (process.platform === "win32" ? "msedge" : "chrome");

await mkdir(OUT, { recursive: true });
const browser = await chromium.launch({ channel, headless: true });

async function newPage(options = {}) {
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1,
    reducedMotion: "reduce",
    colorScheme: "light",
    locale: "id-ID",
    ...options,
  });
  const page = await context.newPage();
  return { context, page };
}

async function shot(page, name, options = {}) {
  await page.waitForLoadState("networkidle");
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(400);
  await page.screenshot({ path: path.join(OUT, `${name}.png`), ...options });
  console.log("✓", name);
}

const go = (page, url) => page.goto(`${BASE}${url}`, { waitUntil: "networkidle" });

/* ---------- Desktop, mode terang ---------- */
const { context, page } = await newPage();

await go(page, "/");
await shot(page, "01-beranda");
await shot(page, "02-beranda-lengkap", { fullPage: true });

await go(page, "/produk");
await shot(page, "03-katalog");
await go(page, "/produk?kategori=kemasan,tekstil-seragam&tampilan=list&urut=harga-terendah");
await shot(page, "04-katalog-filter-list");

await go(page, "/produk/kopi-arabika-gayo-premium");
await shot(page, "05-detail-produk");
await page.getByRole("tab", { name: "Spesifikasi" }).click();
await page.locator("#tab-spesifikasi").scrollIntoViewIfNeeded();
await page.evaluate(() => window.scrollBy(0, -120));
await shot(page, "06-detail-spesifikasi");

// Command palette
await page.keyboard.press("Control+k");
await page.getByPlaceholder("Cari produk, pemasok, atau halaman…").fill("kemasan");
await shot(page, "07-command-palette");
await page.keyboard.press("Escape");

// Tambah ke RFQ dari halaman detail (tier 50 kg) → drawer terbuka
await page.evaluate(() => window.scrollTo(0, 0));
await page.getByRole("button", { name: /50–199 kg/ }).click();
await page.getByRole("radio", { name: "Roasted bean" }).click();
await page.getByRole("button", { name: "Tambah ke daftar RFQ" }).click();
await go(page, "/produk");
await page.getByRole("button", { name: "Tambah Gelas Kertas Kraft 12 oz ke daftar RFQ" }).click();
await page.keyboard.press("Escape");
await page.getByRole("button", { name: "Tambah Tas Kanvas Promosi Custom ke daftar RFQ" }).click();
await page.waitForTimeout(500);
await shot(page, "08-daftar-rfq");
await page.keyboard.press("Escape");

// Perbandingan
for (const name of ["Gelas Kertas Kraft 12 oz", "Botol Minum Tritan Custom 600 ml", "Kardus Pengiriman Double Wall"]) {
  await page.getByRole("button", { name: `Tambah ${name} ke perbandingan` }).click();
}
await page.waitForTimeout(300);
await shot(page, "09-compare-bar");
await go(page, "/bandingkan");
await shot(page, "10-bandingkan");

// Wizard RFQ
await go(page, "/rfq");
await shot(page, "11-rfq-produk");
await page.getByRole("button", { name: "Lanjut" }).click();
await page.getByRole("button", { name: "Lanjut" }).click(); // memicu validasi
await shot(page, "12-rfq-validasi");
await page.getByPlaceholder("Nama Anda").fill("Rina Andayani");
await page.getByPlaceholder("PT / CV / usaha Anda").fill("PT Kopi Senja Nusantara");
await page.getByPlaceholder("nama@perusahaan.co.id").fill("procurement@kopisenja.co.id");
await page.getByPlaceholder("0812xxxxxxxx").fill("081234567890");
await page.locator("select").filter({ has: page.locator("option", { hasText: "Pilih industri" }) }).selectOption("Kafe & restoran");
await page.getByRole("button", { name: "Lanjut" }).click();
await page.locator("select").filter({ has: page.locator("option", { hasText: "Pilih provinsi" }) }).selectOption("DKI Jakarta");
await page.getByPlaceholder("Mis. Jakarta Selatan").fill("Jakarta Selatan");
await page.getByPlaceholder("Nama jalan, nomor, kecamatan, kode pos").fill("Jl. Kemang Raya No. 18, Mampang Prapatan, 12730");
const needed = new Date(Date.now() + 14 * 86_400_000).toISOString().slice(0, 10);
await page.locator('input[type="date"]').fill(needed);
await page.getByText("Escrow NusaTrade").click();
await page.getByRole("button", { name: "Lanjut" }).click();
await shot(page, "13-rfq-tinjau");
await page.getByRole("button", { name: "Kirim RFQ" }).click();
await page.getByText("Permintaan berhasil dikirim").waitFor();
await shot(page, "14-rfq-sukses");

// Tambah riwayat contoh dari bulan-bulan sebelumnya (harga tetap dihitung oleh API) untuk grafik tren.
await page.evaluate(async () => {
  const samples = [
    { months: 1, company: "PT Kopi Senja Nusantara", items: [{ slug: "teh-hijau-melati", quantity: 30 }, { slug: "kardus-pengiriman-double-wall", quantity: 2000 }] },
    { months: 2, company: "PT Kopi Senja Nusantara", items: [{ slug: "kertas-hvs-a4-80gsm", quantity: 120 }, { slug: "seragam-kerja-oxford", quantity: 48 }] },
    { months: 3, company: "PT Kopi Senja Nusantara", items: [{ slug: "botol-tritan-custom-600ml", quantity: 300 }] },
    { months: 4, company: "PT Kopi Senja Nusantara", items: [{ slug: "gelas-kertas-kraft-12oz", quantity: 8000 }, { slug: "kopi-arabika-gayo-premium", quantity: 30 }] },
  ];
  const key = "nusatrade-store-v2";
  const store = JSON.parse(localStorage.getItem(key));
  for (const sample of samples) {
    const neededBy = new Date(Date.now() + 20 * 86_400_000).toISOString().slice(0, 10);
    const response = await fetch("/api/rfq", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: sample.items.map((item) => ({ ...item, variants: {}, note: "" })),
        contact: { name: "Rina Andayani", email: "procurement@kopisenja.co.id", phone: "081234567890", company: sample.company, industry: "Kafe & restoran", npwp: "" },
        delivery: { province: "DKI Jakarta", city: "Jakarta Selatan", address: "Jl. Kemang Raya No. 18, Mampang Prapatan", neededBy, paymentPreference: "tempo", note: "" },
      }),
    });
    const data = await response.json();
    const created = new Date();
    created.setMonth(created.getMonth() - sample.months, 12);
    store.state.history.push({
      id: data.id,
      createdAt: created.toISOString(),
      company: sample.company,
      contactName: "Rina Andayani",
      email: "procurement@kopisenja.co.id",
      destination: "Jakarta Selatan, DKI Jakarta",
      neededBy,
      paymentPreference: "Tempo (dengan PO)",
      estimatedTotal: data.estimatedTotal,
      items: data.items.map(({ slug, name, quantity, unit, unitPrice, subtotal, supplierSlug, category }) => ({ slug, name, quantity, unit, unitPrice, subtotal, supplierSlug, category })),
      status: "terkirim",
    });
  }
  store.state.wishlist = ["teh-hijau-melati", "tas-kanvas-promosi-custom"];
  store.state.compare = [];
  localStorage.setItem(key, JSON.stringify(store));
});
await go(page, "/dashboard");
await shot(page, "15-dashboard");
await page.locator("tbody tr").first().click();
await page.locator("tbody").scrollIntoViewIfNeeded();
await shot(page, "16-dashboard-riwayat");

await go(page, "/pemasok");
await shot(page, "17-direktori-pemasok");
await go(page, "/pemasok/koperasi-gayo-bersama");
await shot(page, "18-profil-pemasok");
await context.close();

/* ---------- Mode gelap ---------- */
{
  const { context, page } = await newPage({ colorScheme: "dark" });
  await go(page, "/");
  await shot(page, "19-mode-gelap-beranda");
  await go(page, "/produk/gelas-kertas-kraft-12oz");
  await shot(page, "20-mode-gelap-detail");
  await context.close();
}

/* ---------- Seluler ---------- */
{
  const { context, page } = await newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  await go(page, "/");
  await shot(page, "21-seluler-beranda");
  await go(page, "/produk");
  await page.getByRole("button", { name: /^Filter/ }).click();
  await shot(page, "22-seluler-filter");
  await go(page, "/produk/teh-hijau-melati");
  await shot(page, "23-seluler-detail");
  await context.close();
}

await browser.close();
console.log(`Selesai → ${OUT}`);
