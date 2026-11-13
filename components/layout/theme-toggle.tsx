"use client";

import { Moon, Sun } from "lucide-react";

export function ThemeToggle() {
  const toggle = () => {
    const dark = !document.documentElement.classList.contains("dark");
    document.documentElement.classList.toggle("dark", dark);
    try {
      localStorage.setItem("nt-theme", dark ? "dark" : "light");
    } catch {
      /* penyimpanan tidak tersedia — tema tetap berlaku untuk sesi ini */
    }
  };

  return (
    <button type="button" onClick={toggle} className="btn btn-ghost size-10 p-0" aria-label="Ganti tema terang/gelap">
      <Sun className="size-[18px] dark:hidden" />
      <Moon className="hidden size-[18px] dark:block" />
    </button>
  );
}
