"use client";

import { Minus, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";

type Props = {
  value: number;
  min: number;
  step: number;
  onChange: (value: number) => void;
  label: string;
  size?: "sm" | "md";
};

export function QuantityInput({ value, min, step, onChange, label, size = "md" }: Props) {
  const display = (n: number) => n.toLocaleString("id-ID");
  const [draft, setDraft] = useState(display(value));
  useEffect(() => setDraft(display(value)), [value]);

  const commit = (raw: string) => {
    const parsed = Math.floor(Number(raw.replace(/\D/g, "")));
    const next = Number.isFinite(parsed) && parsed > 0 ? Math.max(parsed, min) : min;
    setDraft(display(next));
    onChange(next);
  };

  const sm = size === "sm";
  return (
    <div className={cn("inline-flex items-center rounded-xl border border-line bg-surface", sm ? "h-9" : "h-11")}>
      <button
        type="button"
        className={cn("grid h-full place-items-center text-muted transition-colors hover:text-fg disabled:opacity-40", sm ? "w-8" : "w-10")}
        onClick={() => onChange(Math.max(min, value - step))}
        disabled={value <= min}
        aria-label={`Kurangi ${label}`}
      >
        <Minus className="size-4" />
      </button>
      <input
        type="text"
        inputMode="numeric"
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        onBlur={(event) => commit(event.target.value)}
        onKeyDown={(event) => event.key === "Enter" && commit(event.currentTarget.value)}
        className={cn("h-full border-x border-line bg-transparent text-center font-semibold tabular-nums outline-none", sm ? "w-16 text-sm" : "w-24")}
        aria-label={label}
      />
      <button
        type="button"
        className={cn("grid h-full place-items-center text-muted transition-colors hover:text-fg", sm ? "w-8" : "w-10")}
        onClick={() => onChange(value + step)}
        aria-label={`Tambah ${label}`}
      >
        <Plus className="size-4" />
      </button>
    </div>
  );
}
