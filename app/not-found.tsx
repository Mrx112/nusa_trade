import Link from "next/link";
import { ArrowRight, SearchX } from "lucide-react";

export default function NotFound() {
  return (
    <div className="container-page flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
      <span className="grid size-16 place-items-center rounded-2xl bg-brand-50 text-brand-600 dark:bg-brand-950 dark:text-brand-400">
        <SearchX className="size-7" />
      </span>
      <p className="mt-6 text-sm font-bold text-brand-600">404</p>
      <h1 className="mt-2 text-3xl font-extrabold tracking-tight">Halaman tidak ditemukan</h1>
      <p className="mt-2 max-w-md text-muted">Halaman yang Anda cari mungkin sudah dipindahkan atau tidak tersedia.</p>
      <div className="mt-8 flex gap-3">
        <Link href="/produk" className="btn btn-primary">
          Ke katalog <ArrowRight className="size-4" />
        </Link>
        <Link href="/" className="btn btn-secondary">Beranda</Link>
      </div>
    </div>
  );
}
