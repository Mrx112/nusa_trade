import Link from "next/link";
import { cn } from "@/lib/cn";

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={cn("size-8", className)} aria-hidden="true">
      <rect width="32" height="32" rx="9" className="fill-brand-600" />
      <path d="M9 22V10l7 7 7-7v12" fill="none" stroke="white" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="23" cy="22" r="2.4" className="fill-saffron-400" />
    </svg>
  );
}

export function Logo({ className }: { className?: string }) {
  return (
    <Link href="/" className={cn("flex items-center gap-2.5 font-extrabold tracking-tight", className)} aria-label="NusaTrade — beranda">
      <LogoMark />
      <span className="text-lg">
        Nusa<span className="text-brand-600 dark:text-brand-400">Trade</span>
      </span>
    </Link>
  );
}
