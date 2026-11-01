"use client";

import { toggleFavorite, useFavorites } from "@/lib/favorites";
import type { Lang } from "@/lib/i18n";

export function FavButton({ slug, name, lang = "tr", className = "", label = false }: { slug: string; name: string; lang?: Lang; className?: string; label?: boolean }) {
  const on = useFavorites().includes(slug);
  const en = lang === "en";
  const text = on ? (en ? "Saved" : "Favorilerde") : (en ? "Save" : "Favorile");
  return (
    <button
      type="button"
      onClick={() => toggleFavorite(slug)}
      aria-pressed={on}
      aria-label={`${name}: ${on ? (en ? "remove from favorites" : "favorilerden çıkar") : (en ? "add to favorites" : "favorilere ekle")}`}
      className={`inline-flex items-center justify-center gap-2 transition active:scale-95 ${className}`}
    >
      <svg width="20" height="20" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden className={on ? "fill-[#e8453c] stroke-[#e8453c]" : "fill-none stroke-current"}>
        <path d="M12 20.5s-7.5-4.6-9.2-9.4C1.6 7.700 3.700 4.500 7 4.500c2 0 3.500 1.100 5 3 1.500-1.900 3-3 5-3 3.300 0 5.400 3.200 4.200 6.600-1.700 4.800-9.200 9.400-9.200 9.400z" />
      </svg>
      {label && <span className="text-sm font-semibold">{text}</span>}
    </button>
  );
}
