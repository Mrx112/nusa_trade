"use client";

import { CircleAlert, CircleCheck, Info, X } from "lucide-react";
import { useUi } from "@/lib/store";
import { cn } from "@/lib/cn";

const icons = { success: CircleCheck, info: Info, error: CircleAlert };

export function Toaster() {
  const toasts = useUi((state) => state.toasts);
  const dismiss = useUi((state) => state.dismissToast);
  // Saat drawer RFQ terbuka, drawer itu sendiri sudah menjadi konfirmasi — jangan tumpuk toast di atasnya.
  const drawerOpen = useUi((state) => state.drawerOpen);
  if (drawerOpen) return null;

  return (
    <div className="pointer-events-none fixed right-4 top-20 z-[70] flex w-[min(24rem,calc(100vw-2rem))] flex-col gap-2" role="status" aria-live="polite">
      {toasts.map((toast) => {
        const Icon = icons[toast.tone ?? "success"];
        return (
          <div key={toast.id} className="card pointer-events-auto flex items-start gap-3 p-3.5 shadow-lift animate-fade-up">
            <Icon
              className={cn(
                "mt-0.5 size-5 shrink-0",
                toast.tone === "error" ? "text-red-600" : toast.tone === "info" ? "text-sky-600" : "text-brand-600",
              )}
            />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold">{toast.title}</p>
              {toast.description && <p className="mt-0.5 text-xs text-muted">{toast.description}</p>}
            </div>
            <button type="button" onClick={() => dismiss(toast.id)} className="text-muted hover:text-fg" aria-label="Tutup notifikasi">
              <X className="size-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
