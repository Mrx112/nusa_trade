# NusaTrade — Marketplace Pengadaan B2B

Platform pengadaan B2B berbahasa Indonesia untuk menemukan pemasok lokal terverifikasi, membandingkan harga grosir bertingkat, dan mengirim **permintaan penawaran (RFQ)** ke banyak pemasok sekaligus.

Dibangun dengan **Next.js 16 (App Router)**, **React 19**, **TypeScript**, dan **Tailwind CSS v4**. Siap di-deploy ke **Vercel** tanpa konfigurasi tambahan.

![Beranda NusaTrade](docs/screenshots/01-beranda.png)

> **Catatan:** seluruh produk, pemasok, harga, sertifikasi, dan ulasan adalah **data contoh** untuk demonstrasi. Foto produk berasal dari Unsplash dan bersifat ilustratif.

---

## Daftar isi

- [Fitur utama](#fitur-utama)
- [Screenshot](#screenshot)
- [Menjalankan secara lokal](#menjalankan-secara-lokal)
- [Deploy ke Vercel](#deploy-ke-vercel)
- [Variabel lingkungan](#variabel-lingkungan)
- [Arsitektur & struktur proyek](#arsitektur--struktur-proyek)
- [API](#api)
- [Mengelola data produk & pemasok](#mengelola-data-produk--pemasok)
- [Membuat ulang screenshot](#membuat-ulang-screenshot)
- [Batasan & langkah lanjut](#batasan--langkah-lanjut)

---

## Fitur utama

| Area | Fitur |
|---|---|
| **Katalog** | Pencarian teks multi-kata, filter kategori, rentang harga (input & preset), lokasi pemasok, layanan (bisa custom, sampel tersedia, kirim ≤ 7 hari), 6 opsi pengurutan, tampilan grid/daftar. **Semua filter tersimpan di URL** sehingga hasil pencarian bisa dibagikan atau di-bookmark. |
| **Detail produk** | Harga grosir bertingkat interaktif (tier aktif menyesuaikan jumlah), kalkulator estimasi & penghematan, petunjuk "tambah X unit untuk harga berikutnya", pilihan varian, validasi MOQ, permintaan sampel, zoom gambar, tab Deskripsi / Spesifikasi / Pengiriman & pembayaran / Ulasan / FAQ, produk terkait, dan **JSON-LD `Product`** untuk SEO. |
| **Pemasok** | Direktori dengan pencarian (nama, kota, kapabilitas), filter kategori & provinsi, pengurutan berdasarkan rating/respons/ketepatan kirim/pengalaman. Halaman profil berisi performa, kapabilitas, sertifikasi, kapasitas, pasar utama, dan produk pemasok. |
| **Bandingkan** | Sandingkan hingga 4 produk; nilai terbaik di tiap baris (harga, diskon volume, lead time, rating, respons pemasok, dll.) otomatis ditandai. Bar perbandingan mengambang di setiap halaman. |
| **Daftar RFQ** | Drawer samping untuk mengatur jumlah tiap produk (minimal MOQ), dengan harga per tier dan estimasi total yang dihitung ulang secara langsung. |
| **Wizard RFQ** | 4 langkah: Produk → Perusahaan → Pengiriman → Tinjau & kirim. Validasi dengan **Zod** (skema yang sama dipakai di klien dan server), draf formulir tersimpan otomatis, ringkasan dikelompokkan per pemasok, honeypot anti-spam. |
| **API RFQ** | `POST /api/rfq` memvalidasi ulang semua data, **menghitung ulang harga di server** (tidak percaya harga dari klien), memeriksa MOQ & varian, memberi nomor RFQ unik, membatasi laju per IP, dan meneruskan RFQ ke **webhook** pilihan Anda (Slack, Discord, Make, Zapier, n8n, CRM). |
| **Dashboard** | KPI (total RFQ, estimasi nilai, item, pemasok), grafik nilai per kategori, tren 6 bulan, riwayat RFQ dengan rincian item, pemasok teratas, produk favorit, rekomendasi, dan **ekspor CSV** (kompatibel Excel). |
| **Pengalaman pengguna** | Command palette (**Ctrl + K** atau **/**), mode gelap/terang tanpa kedipan, desain responsif hingga 360 px, notifikasi toast, aksesibilitas (skip link, peran ARIA, navigasi keyboard, `prefers-reduced-motion`). |
| **SEO & produksi** | Metadata per halaman, `sitemap.xml`, `robots.txt`, web manifest, gambar Open Graph dinamis, header keamanan, halaman statis (SSG) untuk semua produk & pemasok, `next/image` (AVIF/WebP). |

---

## Screenshot

Semua screenshot dibuat otomatis oleh [`scripts/screenshots.mjs`](scripts/screenshots.mjs) dari build produksi, dengan menjalankan alur pengguna yang sebenarnya (menambah produk, mengisi wizard RFQ, mengirim ke API, lalu membuka dashboard).

### Beranda

| Hero & pencarian | Halaman lengkap |
|---|---|
| ![Beranda](docs/screenshots/01-beranda.png) | ![Beranda lengkap](docs/screenshots/02-beranda-lengkap.png) |

Hero dengan pencarian dan kata kunci populer, statistik platform, kategori bento, produk unggulan, alur kerja, keunggulan, pemasok pilihan, FAQ, dan CTA.

### Katalog

| Grid dengan filter samping | Filter aktif + tampilan daftar |
|---|---|
| ![Katalog](docs/screenshots/03-katalog.png) | ![Katalog filter](docs/screenshots/04-katalog-filter-list.png) |

URL contoh tampilan kanan: `/produk?kategori=kemasan,tekstil-seragam&tampilan=list&urut=harga-terendah`.

### Detail produk

| Panel pembelian & harga bertingkat | Tab spesifikasi |
|---|---|
| ![Detail produk](docs/screenshots/05-detail-produk.png) | ![Spesifikasi](docs/screenshots/06-detail-spesifikasi.png) |

### Pencarian cepat, daftar RFQ, dan perbandingan

| Command palette (Ctrl + K) | Drawer daftar RFQ |
|---|---|
| ![Command palette](docs/screenshots/07-command-palette.png) | ![Daftar RFQ](docs/screenshots/08-daftar-rfq.png) |

| Bar perbandingan | Tabel perbandingan |
|---|---|
| ![Compare bar](docs/screenshots/09-compare-bar.png) | ![Bandingkan](docs/screenshots/10-bandingkan.png) |

### Wizard RFQ

| 1. Produk | 2. Validasi formulir |
|---|---|
| ![RFQ produk](docs/screenshots/11-rfq-produk.png) | ![RFQ validasi](docs/screenshots/12-rfq-validasi.png) |

| 4. Tinjau | Berhasil dikirim |
|---|---|
| ![RFQ tinjau](docs/screenshots/13-rfq-tinjau.png) | ![RFQ sukses](docs/screenshots/14-rfq-sukses.png) |

### Dashboard

| Ringkasan & grafik | Riwayat RFQ (rincian item) |
|---|---|
| ![Dashboard](docs/screenshots/15-dashboard.png) | ![Riwayat](docs/screenshots/16-dashboard-riwayat.png) |

Pada screenshot dashboard, empat RFQ tambahan dikirim melalui API lalu tanggalnya dimundurkan ke bulan-bulan sebelumnya agar grafik tren terisi.

### Pemasok

| Direktori | Profil pemasok |
|---|---|
| ![Direktori pemasok](docs/screenshots/17-direktori-pemasok.png) | ![Profil pemasok](docs/screenshots/18-profil-pemasok.png) |

### Mode gelap

| Beranda | Detail produk |
|---|---|
| ![Gelap beranda](docs/screenshots/19-mode-gelap-beranda.png) | ![Gelap detail](docs/screenshots/20-mode-gelap-detail.png) |

### Seluler (390 px)

| Beranda | Filter (bottom sheet) | Detail produk |
|---|---|---|
| ![Seluler beranda](docs/screenshots/21-seluler-beranda.png) | ![Seluler filter](docs/screenshots/22-seluler-filter.png) | ![Seluler detail](docs/screenshots/23-seluler-detail.png) |

---

## Menjalankan secara lokal

Prasyarat: **Node.js 20.9+** (disarankan Node 22/24) dan npm.

```bash
git clone https://github.com/Mrx112/nusa_trade.git
cd nusa_trade
npm install
npm run dev          # http://localhost:3000
```

Perintah lain:

| Perintah | Fungsi |
|---|---|
| `npm run dev` | Server pengembangan (Turbopack, hot reload) |
| `npm run build` | Build produksi + pemeriksaan TypeScript |
| `npm run start` | Menjalankan hasil build produksi |
| `npm run typecheck` | Pemeriksaan tipe saja |
| `npm run screenshots` | Membuat ulang screenshot dokumentasi |

---

## Deploy ke Vercel

### Opsi A — lewat dashboard (paling mudah)

1. Buka [vercel.com/new](https://vercel.com/new) dan login dengan GitHub.
2. Pilih **Import** pada repositori `nusa_trade`.
3. Vercel otomatis mendeteksi **Next.js** — biarkan semua pengaturan build default.
4. (Opsional) Tambahkan variabel lingkungan dari bagian di bawah.
5. Klik **Deploy**. Setiap `git push` ke `main` akan otomatis memicu deploy baru, dan setiap pull request mendapat URL preview.

### Opsi B — lewat CLI

```bash
npm i -g vercel
vercel           # deploy preview
vercel --prod    # deploy produksi
```

Tidak diperlukan `vercel.json`. Halaman produk & pemasok dirender statis saat build; `/api/rfq` dan `/api/products` berjalan sebagai Vercel Functions (runtime Node.js).

### Hosting lain

Aplikasi juga bisa berjalan di server Node.js mana pun (VPS, Railway, Render, Docker):

```bash
npm ci && npm run build && npm run start   # port 3000, ubah dengan PORT=8080
```

---

## Variabel lingkungan

Salin `.env.example` menjadi `.env.local` (lokal) atau isi di **Vercel → Project → Settings → Environment Variables**.

| Variabel | Wajib | Keterangan |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | Tidak | URL publik situs untuk sitemap, robots, dan Open Graph. Di Vercel otomatis memakai domain produksi bila kosong. |
| `RFQ_WEBHOOK_URL` | Tidak | Endpoint yang menerima setiap RFQ baru (POST JSON). Jika kosong, aplikasi berjalan dalam **mode demo**: RFQ tetap divalidasi server dan tersimpan di browser pengguna, tetapi tidak diteruskan ke mana pun. |

Contoh payload webhook:

```json
{
  "event": "rfq.created",
  "data": {
    "id": "RFQ-261113-5C8AD",
    "createdAt": "2026-11-13T17:02:11.000Z",
    "contact": { "name": "…", "email": "…", "phone": "…", "company": "…", "industry": "…", "npwp": "" },
    "delivery": { "province": "DKI Jakarta", "city": "Jakarta Selatan", "address": "…", "neededBy": "2026-11-27", "paymentPreference": "escrow", "note": "" },
    "items": [
      { "slug": "kopi-arabika-gayo-premium", "name": "Kopi Arabika Gayo Premium", "quantity": 50, "unit": "kg",
        "unitPrice": 79000, "subtotal": 3950000, "supplierSlug": "koperasi-gayo-bersama", "supplierName": "Koperasi Gayo Bersama",
        "variants": { "Bentuk": "Roasted bean" }, "note": "" }
    ],
    "estimatedTotal": 7400000,
    "supplierCount": 3
  }
}
```

Jika webhook gagal merespons (bukan 2xx atau lewat 8 detik), API mengembalikan galat 502 sehingga pengguna dapat mencoba lagi — RFQ tidak dianggap terkirim.

---

## Arsitektur & struktur proyek

```text
nusa_trade/
├── app/                          Next.js App Router
│   ├── layout.tsx                Layout global: font, tema, header, footer, overlay
│   ├── page.tsx                  Beranda
│   ├── produk/page.tsx           Katalog (filter tersinkron URL)
│   ├── produk/[slug]/page.tsx    Detail produk (SSG + JSON-LD)
│   ├── pemasok/page.tsx          Direktori pemasok
│   ├── pemasok/[slug]/page.tsx   Profil pemasok (SSG)
│   ├── bandingkan/page.tsx       Perbandingan produk
│   ├── rfq/page.tsx              Wizard RFQ
│   ├── dashboard/page.tsx        Dashboard pengadaan
│   ├── api/rfq/route.ts          POST — validasi, harga server-side, webhook
│   ├── api/products/route.ts     GET — API katalog JSON
│   ├── sitemap.ts · robots.ts · manifest.ts · opengraph-image.tsx · icon.svg
│   └── globals.css               Design token (terang/gelap) & komponen dasar Tailwind v4
├── components/
│   ├── layout/                   Header, footer, drawer RFQ, command palette, compare bar, toast
│   ├── catalog/                  Tampilan katalog & filter
│   ├── product/                  Kartu, galeri, panel pembelian, tab, aksi produk
│   ├── supplier/                 Kartu & direktori pemasok
│   ├── compare/ · rfq/ · dashboard/ · home/ · ui/
├── lib/
│   ├── data/                     products.ts · suppliers.ts · categories.ts (sumber data)
│   ├── catalog.ts                Logika harga bertingkat, tier berikutnya, relasi data
│   ├── rfq-schema.ts             Skema Zod bersama klien & server
│   ├── store.ts                  State Zustand (daftar RFQ, banding, favorit, riwayat) + persist
│   ├── format.ts                 Format Rupiah, angka, tanggal, URL situs
│   └── types.ts                  Tipe domain
├── public/products/              Foto produk
├── scripts/screenshots.mjs       Pembuat screenshot otomatis (Playwright + Edge/Chrome)
└── docs/screenshots/             Hasil screenshot
```

**Keputusan desain penting**

- **Server Components secara default.** Halaman beranda, detail produk, dan profil pemasok dirender di server dan di-prerender statis; hanya bagian interaktif (panel pembelian, filter, drawer, wizard) yang menjadi Client Components.
- **Satu sumber kebenaran untuk harga.** `unitPriceFor()` di `lib/catalog.ts` dipakai oleh kartu, drawer, wizard, dan API — sehingga estimasi di layar selalu sama dengan yang dihitung server.
- **State klien dengan Zustand + `persist`.** Daftar RFQ, perbandingan, favorit, dan riwayat disimpan di `localStorage` (kunci `nusatrade-store-v2`), dengan sanitasi saat dimuat agar data rusak/usang tidak membuat aplikasi error.
- **Tanpa hydration mismatch.** Data yang hanya ada di browser ditampilkan setelah komponen ter-mount (`useMounted`), dan tema diterapkan oleh skrip inline sebelum render pertama.

---

## API

### `GET /api/products`

| Query | Contoh | Keterangan |
|---|---|---|
| `q` | `?q=kopi` | Pencarian nama & tag |
| `kategori` | `?kategori=kemasan` | `makanan-minuman`, `kemasan`, `kebutuhan-kantor`, `tekstil-seragam` |
| `slug` | `?slug=teh-hijau-melati` | Satu produk lengkap beserta data pemasok |

### `POST /api/rfq`

```bash
curl -X POST http://localhost:3000/api/rfq \
  -H "Content-Type: application/json" \
  -d '{
    "items": [{ "slug": "gelas-kertas-kraft-12oz", "quantity": 6000, "variants": { "Dinding": "Double wall" } }],
    "contact": { "name": "Budi", "email": "budi@contoh.co.id", "phone": "081234567890", "company": "PT Contoh", "industry": "Kafe & restoran" },
    "delivery": { "province": "Jawa Barat", "city": "Bandung", "address": "Jl. Contoh No. 1, Coblong", "neededBy": "2026-12-20", "paymentPreference": "transfer" }
  }'
```

| Status | Arti |
|---|---|
| `201` | RFQ diterima; respons berisi `id`, item dengan harga server, `estimatedTotal`, `delivered` |
| `422` | Validasi gagal (field kosong, di bawah MOQ, varian tidak tersedia) — lihat `error` / `issues` |
| `429` | Terlalu banyak permintaan dari IP yang sama (8/menit) |
| `502` | Webhook tujuan gagal menerima RFQ |

---

## Mengelola data produk & pemasok

Data berada di `lib/data/*.ts` dan sepenuhnya bertipe (`lib/types.ts`), sehingga kesalahan struktur langsung tertangkap saat `npm run build`.

**Menambah produk**

1. Simpan foto di `public/products/nama-file.jpg` (rasio 4:3 atau 1:1, lebar ≥ 1200 px).
2. Tambahkan objek baru ke array `products` di `lib/data/products.ts` — salin produk yang ada sebagai templat. Field penting: `slug` (unik, untuk URL), `supplierSlug` (harus ada di `suppliers.ts`), `priceTiers` (urut dari `min` terkecil; `min` pertama sebaiknya sama dengan `moq`), `variants`, `specs`.
3. Halaman detail, sitemap, katalog, filter, API, dan command palette akan otomatis menyertakannya.

**Menambah pemasok** — tambahkan ke `lib/data/suppliers.ts`; provinsi baru otomatis muncul di filter lokasi.

**Menambah kategori** — perbarui tipe `CategoryId` di `lib/types.ts`, daftar di `lib/data/categories.ts`, dan ikon di `components/ui/misc.tsx`.

---

## Membuat ulang screenshot

Skrip memakai `playwright-core` dengan browser yang sudah terpasang (Microsoft Edge di Windows, Chrome di macOS/Linux), jadi tidak perlu mengunduh Chromium.

```bash
npm run build
npm run start                       # terminal 1
npm run screenshots                 # terminal 2 → docs/screenshots/
# opsi: BASE_URL=http://localhost:3100 BROWSER_CHANNEL=chrome npm run screenshots
```

---

## Batasan & langkah lanjut

Yang sudah siap produksi: seluruh UI, validasi, perhitungan harga, API, SEO, dan deploy. Hal-hal berikut sengaja belum disertakan dan perlu ditambahkan sesuai kebutuhan bisnis:

- **Database & panel admin.** Katalog saat ini berupa file TypeScript. Untuk katalog yang dikelola tim non-teknis, pindahkan ke database (mis. Vercel Postgres/Neon + Prisma, atau Supabase) atau headless CMS.
- **Akun pengguna.** Riwayat RFQ, favorit, dan daftar RFQ tersimpan per-browser. Tambahkan autentikasi (mis. Auth.js atau Clerk) agar data tersinkron antar perangkat dan dapat dibagikan dengan tim.
- **Portal pemasok.** Pemasok belum dapat membalas penawaran di dalam platform; saat ini RFQ diteruskan melalui webhook.
- **Rate limiting terdistribusi.** Pembatas laju bawaan bersifat per-instance. Untuk lalu lintas tinggi gunakan Upstash Redis / Vercel KV atau Vercel Firewall.
- **Pembayaran & escrow.** Pilihan "Escrow NusaTrade" saat ini hanya preferensi yang dicatat pada RFQ, belum terhubung ke penyedia pembayaran.

---

Dibuat untuk bisnis Indonesia · Next.js · Tailwind CSS · Vercel
