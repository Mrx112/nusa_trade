import type { Metadata } from "next";
import { RfqWizard } from "@/components/rfq/rfq-wizard";

export const metadata: Metadata = {
  title: "Buat permintaan penawaran (RFQ)",
  description: "Kirim satu permintaan penawaran ke beberapa pemasok sekaligus, lengkap dengan varian, jumlah, dan detail pengiriman.",
  robots: { index: false },
};

export default function RfqPage() {
  return (
    <div className="container-page pt-8">
      <p className="kicker">Permintaan penawaran</p>
      <h1 className="mt-2 text-3xl font-extrabold tracking-tight md:text-4xl">Buat RFQ</h1>
      <p className="mt-2 max-w-2xl text-muted">Lengkapi empat langkah singkat. Pemasok akan mengirim penawaran resmi berisi harga final, ongkos kirim, dan jadwal pengiriman.</p>
      <RfqWizard />
    </div>
  );
}
