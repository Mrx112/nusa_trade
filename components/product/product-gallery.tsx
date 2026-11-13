"use client";

import Image from "next/image";
import { useState } from "react";
import { ZoomIn } from "lucide-react";

export function ProductGallery({ src, alt, badge }: { src: string; alt: string; badge?: string }) {
  const [origin, setOrigin] = useState<string | null>(null);

  return (
    <div
      className="card relative aspect-square cursor-zoom-in overflow-hidden"
      onMouseMove={(event) => {
        const rect = event.currentTarget.getBoundingClientRect();
        setOrigin(`${((event.clientX - rect.left) / rect.width) * 100}% ${((event.clientY - rect.top) / rect.height) * 100}%`);
      }}
      onMouseLeave={() => setOrigin(null)}
    >
      <Image
        src={src}
        alt={alt}
        fill
        priority
        sizes="(min-width: 1024px) 50vw, 100vw"
        className="object-cover transition-transform duration-200"
        style={origin ? { transform: "scale(1.8)", transformOrigin: origin } : undefined}
      />
      {badge && <span className="absolute left-4 top-4 rounded-full bg-saffron-400 px-3 py-1 text-xs font-bold text-[#241703]">{badge}</span>}
      <span className="pointer-events-none absolute bottom-4 right-4 flex items-center gap-1.5 rounded-full bg-black/55 px-3 py-1.5 text-xs font-medium text-white backdrop-blur">
        <ZoomIn className="size-3.5" /> Arahkan untuk zoom
      </span>
    </div>
  );
}
