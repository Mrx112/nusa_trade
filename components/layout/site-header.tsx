"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ClipboardList, Menu, Search, X } from "lucide-react";
import { Logo } from "@/components/layout/logo";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { useAppStore, useUi } from "@/lib/store";
import { useMounted } from "@/lib/use-mounted";
import { cn } from "@/lib/cn";

const nav = [
  { href: "/produk", label: "Katalog" },
  { href: "/pemasok", label: "Pemasok" },
  { href: "/bandingkan", label: "Bandingkan" },
  { href: "/dashboard", label: "Dashboard" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const mounted = useMounted();
  const cartCount = useAppStore((state) => state.cart.length);
  const setDrawer = useUi((state) => state.setDrawer);
  const setCommand = useUi((state) => state.setCommand);
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  return (
    <header
      className={cn(
        "sticky top-0 z-40 border-b transition-colors duration-300",
        scrolled ? "border-line bg-bg/80 backdrop-blur-xl" : "border-transparent bg-bg",
      )}
    >
      <div className="container-page flex h-16 items-center gap-4">
        <Logo />

        <nav className="ml-6 hidden items-center gap-1 lg:flex" aria-label="Navigasi utama">
          {nav.map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded-xl px-3.5 py-2 text-sm font-medium transition-colors",
                  active ? "bg-surface-2 text-fg" : "text-muted hover:text-fg",
                )}
                aria-current={active ? "page" : undefined}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setCommand(true)}
            className="hidden h-10 w-64 items-center gap-2 rounded-xl border border-line bg-surface px-3 text-sm text-muted transition-colors hover:border-brand-300 md:flex"
          >
            <Search className="size-4 shrink-0" />
            <span className="truncate whitespace-nowrap text-left">Cari produk, pemasok…</span>
            <kbd className="ml-auto rounded-md border border-line bg-surface-2 px-1.5 py-0.5 font-sans text-[11px] font-semibold">Ctrl K</kbd>
          </button>
          <button type="button" onClick={() => setCommand(true)} className="btn btn-ghost size-10 p-0 md:hidden" aria-label="Cari">
            <Search className="size-[18px]" />
          </button>
          <ThemeToggle />
          <button type="button" onClick={() => setDrawer(true)} className="btn btn-primary relative h-10 px-3.5" aria-label={`Daftar RFQ, ${mounted ? cartCount : 0} produk`}>
            <ClipboardList className="size-4" />
            <span className="hidden sm:inline">Daftar RFQ</span>
            <span className="grid min-w-5 place-items-center rounded-full bg-white/20 px-1.5 text-xs font-bold tabular-nums">{mounted ? cartCount : 0}</span>
          </button>
          <button
            type="button"
            className="btn btn-ghost size-10 p-0 lg:hidden"
            onClick={() => setOpen((value) => !value)}
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? "Tutup menu" : "Buka menu"}
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {open && (
        <nav id="mobile-nav" className="border-t border-line bg-bg px-4 pb-4 pt-2 lg:hidden" aria-label="Navigasi seluler">
          {nav.map((item) => (
            <Link key={item.href} href={item.href} className="block rounded-xl px-3 py-3 text-base font-medium text-fg hover:bg-surface-2">
              {item.label}
            </Link>
          ))}
          <Link href="/rfq" className="btn btn-primary mt-2 w-full">
            Buat permintaan penawaran
          </Link>
        </nav>
      )}
    </header>
  );
}
