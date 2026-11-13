import type { Metadata } from "next";
import { DashboardView } from "@/components/dashboard/dashboard-view";

export const metadata: Metadata = {
  title: "Dashboard pengadaan",
  description: "Pantau riwayat RFQ, estimasi nilai pengadaan per kategori, tren bulanan, dan produk favorit.",
  robots: { index: false },
};

export default function DashboardPage() {
  return (
    <div className="container-page pt-8">
      <DashboardView />
    </div>
  );
}
