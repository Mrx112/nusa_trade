import { BadgeCheck, Coffee, Package, Printer, Shirt, Star } from "lucide-react";
import type { CategoryId } from "@/lib/types";
import { cn } from "@/lib/cn";

const categoryIcons: Record<CategoryId, React.ComponentType<{ className?: string }>> = {
  "makanan-minuman": Coffee,
  kemasan: Package,
  "kebutuhan-kantor": Printer,
  "tekstil-seragam": Shirt,
};

export function CategoryIcon({ id, className }: { id: CategoryId; className?: string }) {
  const Icon = categoryIcons[id];
  return <Icon className={className} />;
}

export function RatingStars({ rating, className, size = "sm" }: { rating: number; className?: string; size?: "sm" | "md" }) {
  return (
    <span className={cn("inline-flex items-center gap-0.5", className)} aria-label={`Rating ${rating.toLocaleString("id-ID")} dari 5`}>
      {[1, 2, 3, 4, 5].map((index) => (
        <Star
          key={index}
          className={cn(
            size === "sm" ? "size-3.5" : "size-4",
            index <= Math.round(rating) ? "fill-saffron-400 text-saffron-400" : "fill-line text-line",
          )}
        />
      ))}
    </span>
  );
}

export function VerifiedBadge({ className, label = "Terverifikasi" }: { className?: string; label?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1 text-xs font-semibold text-brand-700 dark:text-brand-400", className)}>
      <BadgeCheck className="size-3.5" /> {label}
    </span>
  );
}

export function SectionHeading({ kicker, title, description, action, className }: { kicker?: string; title: string; description?: string; action?: React.ReactNode; className?: string }) {
  return (
    <div className={cn("flex flex-col gap-4 md:flex-row md:items-end md:justify-between", className)}>
      <div className="max-w-2xl">
        {kicker && <p className="kicker">{kicker}</p>}
        <h2 className="mt-2 text-3xl font-extrabold tracking-tight md:text-4xl">{title}</h2>
        {description && <p className="mt-3 text-muted">{description}</p>}
      </div>
      {action}
    </div>
  );
}

export function SupplierAvatar({ initials, gradient, className }: { initials: string; gradient: string; className?: string }) {
  return (
    <span className={cn("grid shrink-0 place-items-center rounded-xl bg-gradient-to-br font-bold text-white shadow-inner", gradient, className ?? "size-11 text-sm")}>
      {initials}
    </span>
  );
}
