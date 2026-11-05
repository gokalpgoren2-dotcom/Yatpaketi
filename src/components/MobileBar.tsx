"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { href, langFromPath, t } from "@/lib/i18n";
import { useFavHint, useFavorites } from "@/lib/favorites";

const items = [
  { href: "/", key: "mbHome" as const, d: "M3 11l9-8 9 8v9a1 1 0 01-1 1h-5v-6H9v6H4a1 1 0 01-1-1z" },
  { href: "/tekneler", key: "mbBoats" as const, d: "M3 17l2 3h14l2-3zM12 3v10M12 5l6 8h-6" },
  { href: "/limanlar", key: "mbDest" as const, d: "M12 21s7-6.2 7-11.5A7 7 0 005 9.5C5 14.8 12 21 12 21zM12 12a2.5 2.5 0 100-5 2.5 2.5 0 000 5z" },
  { href: "/favorilerim", key: "mbFav" as const, d: "M12 20.5s-7.5-4.6-9.2-9.4C1.6 7.7 3.7 4.5 7 4.5c2 0 3.500 1.100 5 3 1.500-1.900 3-3 5-3 3.300 0 5.400 3.200 4.200 6.600-1.700 4.800-9.200 9.400-9.200 9.400z" },
  { href: "/iletisim", key: "mbContact" as const, d: "M4 5h16v11H8l-4 4z" },
];

// Telefonda altta sabit menü.
export function MobileBar() {
  const path = usePathname();
  const lang = langFromPath(path);
  const L = t(lang);
  const favs = useFavorites().length;
  const [hint, hideHint] = useFavHint();
  const bare = lang !== "tr" ? (path === "/en" ? "/" : path.slice(3)) : path;
  if (path.startsWith("/admin") || path.startsWith("/musteri")) return null;
  return (
    <>
    {hint && favs > 0 && (
      <Link href={href(lang, "/favorilerim")} onClick={hideHint} role="status" className="fixed left-[70%] z-[60] w-44 -translate-x-1/2 rounded-xl bg-navy px-4 py-2.5 text-center text-sm font-semibold leading-snug text-white shadow-lg lg:hidden" style={{ bottom: "calc(4.9rem + env(safe-area-inset-bottom))" }}>
        {lang !== "tr" ? "Compare your saved yachts →" : "Favori yatları karşılaştırın →"}
        <span aria-hidden className="absolute -bottom-1.5 left-1/2 h-3 w-3 -translate-x-1/2 rotate-45 bg-navy" />
      </Link>
    )}
    <nav aria-label={L.quickMenu} className="fixed inset-x-0 bottom-0 z-40 border-t border-navy/10 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden">
      <ul className="grid grid-cols-5">
        {items.map((i) => {
          const on = i.href === "/" ? bare === "/" : i.href.startsWith("/#") ? false : bare.startsWith(i.href);
          return (
            <li key={i.key}>
              <Link href={href(lang, i.href)} className={`flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium ${on ? "text-turquoise-dark" : "text-navy/70"}`}>
                <span className="relative"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d={i.d} /></svg>{i.key === "mbFav" && favs > 0 && <span className="absolute -right-2.5 -top-1.5 rounded-full bg-[#e8453c] px-1.5 text-[10px] font-bold leading-4 text-white">{favs}</span>}</span>
                {L[i.key]}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
    </>
  );
}
