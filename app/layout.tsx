import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { RfqDrawer } from "@/components/layout/rfq-drawer";
import { CommandPalette } from "@/components/layout/command-palette";
import { Toaster } from "@/components/layout/toaster";
import { CompareBar } from "@/components/layout/compare-bar";
import { siteUrl } from "@/lib/format";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: {
    default: "NusaTrade — Marketplace pengadaan B2B Indonesia",
    template: "%s · NusaTrade",
  },
  description:
    "Temukan pemasok lokal terverifikasi, bandingkan harga grosir bertingkat, dan kirim permintaan penawaran (RFQ) dalam satu platform pengadaan B2B.",
  keywords: ["B2B", "pengadaan", "procurement", "grosir", "pemasok", "supplier Indonesia", "RFQ", "marketplace"],
  applicationName: "NusaTrade",
  openGraph: {
    type: "website",
    locale: "id_ID",
    siteName: "NusaTrade",
    title: "NusaTrade — Marketplace pengadaan B2B Indonesia",
    description: "Pemasok terverifikasi, harga grosir bertingkat, dan RFQ dalam satu platform.",
  },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f5f7f3" },
    { media: "(prefers-color-scheme: dark)", color: "#080d0a" },
  ],
};

const themeScript = `(function(){try{var t=localStorage.getItem('nt-theme');var d=t?t==='dark':window.matchMedia('(prefers-color-scheme: dark)').matches;if(d)document.documentElement.classList.add('dark');}catch(e){}})();`;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id" className={jakarta.variable} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-dvh font-sans antialiased">
        <a href="#konten" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-brand-600 focus:px-4 focus:py-2 focus:text-white">
          Lewati ke konten
        </a>
        <SiteHeader />
        <main id="konten" className="min-h-[60vh]">{children}</main>
        <SiteFooter />
        <RfqDrawer />
        <CommandPalette />
        <CompareBar />
        <Toaster />
      </body>
    </html>
  );
}
