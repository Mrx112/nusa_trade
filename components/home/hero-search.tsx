"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowRight, Search } from "lucide-react";

const popular = ["Kopi arabika", "Gelas kertas", "Kardus", "Seragam", "Tote bag"];

export function HeroSearch() {
  const router = useRouter();
  const [query, setQuery] = useState("");

  const submit = (value: string) => {
    const q = value.trim();
    router.push(q ? `/produk?q=${encodeURIComponent(q)}` : "/produk");
  };

  return (
    <div>
      <form
        role="search"
        onSubmit={(event) => {
          event.preventDefault();
          submit(query);
        }}
        className="card flex items-center gap-2 p-2 pl-4 shadow-lift"
      >
        <Search className="size-5 shrink-0 text-muted" />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Cari produk, bahan baku, atau pemasok…"
          aria-label="Cari produk"
          className="h-11 min-w-0 flex-1 bg-transparent text-[15px] outline-none placeholder:text-muted"
        />
        <button type="submit" className="btn btn-primary h-11 px-5">
          <span className="hidden sm:inline">Cari</span> <ArrowRight className="size-4" />
        </button>
      </form>
      <div className="mt-4 flex flex-wrap items-center gap-2 text-sm">
        <span className="text-muted">Populer:</span>
        {popular.map((term) => (
          <button key={term} type="button" className="chip" onClick={() => submit(term)}>
            {term}
          </button>
        ))}
      </div>
    </div>
  );
}
