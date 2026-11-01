"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { href, langFromPath, t } from "@/lib/i18n";

const items = [
  { href: "/", key: "mbHome" as const, d: "M3 11l9-8 9 8v9a1 1 0 01-1 1h-5v-6H9v6H4a1 1 0 01-1-1z" },
  { href: "/tekneler", key: "mbBoats" as const, d: "M3 17l2 3h14l2-3zM12 3v10M12 5l6 8h-6" },
  { href: "/limanlar", key: "mbDest" as const, d: "M12 21s7-6.2 7-11.5A7 7 0 005 9.5C5 14.8 12 21 12 21zM12 12a2.5 2.5 0 100-5 2.5 2.5 0 000 5z" },
  { href: "/iletisim", key: "mbContact" as const, d: "M4 5h16v11H8l-4 4z" },
];

// Telefonda altta sabit menü.
export function MobileBar() {
  const path = usePathname();
  const lang = langFromPath(path);
  const L = t(lang);
  const bare = lang === "en" ? (path === "/en" ? "/" : path.slice(3)) : path;
  if (path.startsWith("/admin") || path.startsWith("/musteri")) return null;
  return (
    <nav aria-label={L.quickMenu} className="fixed inset-x-0 bottom-0 z-40 border-t border-navy/10 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden">
      <ul className="grid grid-cols-4">
        {items.map((i) => {
          const on = i.href === "/" ? bare === "/" : i.href.startsWith("/#") ? false : bare.startsWith(i.href);
          return (
            <li key={i.key}>
              <Link href={href(lang, i.href)} className={`flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium ${on ? "text-turquoise-dark" : "text-navy/70"}`}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d={i.d} /></svg>
                {L[i.key]}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
