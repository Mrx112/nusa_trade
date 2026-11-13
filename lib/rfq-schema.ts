import { z } from "zod";

/** Skema RFQ yang dipakai bersama oleh formulir (klien) dan API route (server). */
export const rfqItemSchema = z.object({
  slug: z.string().min(1),
  quantity: z.number().int().positive(),
  variants: z.record(z.string(), z.string()).default({}),
  note: z.string().max(500).default(""),
});

export const companySchema = z.object({
  name: z.string().trim().min(2, "Nama minimal 2 karakter."),
  email: z.email("Format email belum valid."),
  phone: z
    .string()
    .trim()
    .regex(/^(\+62|62|0)8[0-9]{7,12}$/, "Gunakan nomor ponsel Indonesia, contoh 0812xxxxxxx."),
  company: z.string().trim().min(2, "Nama perusahaan minimal 2 karakter."),
  industry: z.string().trim().min(1, "Pilih jenis industri."),
  npwp: z
    .string()
    .trim()
    .regex(/^$|^[0-9.\-]{15,20}$/, "NPWP berisi 15–16 digit angka.")
    .default(""),
});

export const deliverySchema = z.object({
  province: z.string().trim().min(1, "Pilih provinsi tujuan."),
  city: z.string().trim().min(2, "Isi kota/kabupaten tujuan."),
  address: z.string().trim().min(10, "Alamat minimal 10 karakter."),
  neededBy: z
    .string()
    .min(1, "Tentukan tanggal dibutuhkan.")
    .refine((value) => !Number.isNaN(Date.parse(value)), "Tanggal tidak valid.")
    .refine((value) => Date.parse(value) >= Date.now() - 86_400_000, "Tanggal tidak boleh di masa lalu."),
  paymentPreference: z.enum(["transfer", "tempo", "escrow"]),
  note: z.string().max(1000).default(""),
});

export const rfqSchema = z.object({
  items: z.array(rfqItemSchema).min(1, "Tambahkan minimal satu produk."),
  contact: companySchema,
  delivery: deliverySchema,
  /** Honeypot anti-spam: harus kosong. */
  website: z.string().max(0).optional(),
});

export type RfqPayload = z.infer<typeof rfqSchema>;
export type CompanyInput = z.input<typeof companySchema>;
export type DeliveryInput = z.input<typeof deliverySchema>;

export const industries = [
  "Kafe & restoran",
  "Hotel & hospitality",
  "Ritel & e-commerce",
  "Manufaktur",
  "Kantor & korporasi",
  "Pendidikan",
  "Instansi pemerintah",
  "Event & agensi",
  "Lainnya",
];

export const indonesianProvinces = [
  "Aceh", "Sumatera Utara", "Sumatera Barat", "Riau", "Kepulauan Riau", "Jambi", "Sumatera Selatan", "Bangka Belitung",
  "Bengkulu", "Lampung", "DKI Jakarta", "Banten", "Jawa Barat", "Jawa Tengah", "DI Yogyakarta", "Jawa Timur", "Bali",
  "Nusa Tenggara Barat", "Nusa Tenggara Timur", "Kalimantan Barat", "Kalimantan Tengah", "Kalimantan Selatan",
  "Kalimantan Timur", "Kalimantan Utara", "Sulawesi Utara", "Gorontalo", "Sulawesi Tengah", "Sulawesi Barat",
  "Sulawesi Selatan", "Sulawesi Tenggara", "Maluku", "Maluku Utara", "Papua", "Papua Barat", "Papua Tengah",
  "Papua Pegunungan", "Papua Selatan", "Papua Barat Daya",
];

export const paymentLabels: Record<RfqPayload["delivery"]["paymentPreference"], string> = {
  transfer: "Transfer bank",
  tempo: "Tempo (dengan PO)",
  escrow: "Escrow NusaTrade",
};
