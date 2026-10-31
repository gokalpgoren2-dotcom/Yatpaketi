"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type Item = { href: string; label: string; icon: string; badge?: number };
type Group = { title: string; items: Item[] };

function Ic({ d }: { d: string }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d={d} />
    </svg>
  );
}

// Yönetim menüsü: masaüstünde sol kenar çubuğu (gruplu), telefonda yatay kaydırılan çipler. Açık sayfa vurgulanır.
export function AdminNav({ groups, variant }: { groups: Group[]; variant: "chips" | "sidebar" }) {
  const path = usePathname();
  const on = (h: string) => (h === "/admin" ? path === "/admin" : path === h || path.startsWith(h + "/"));
  const flat = groups.flatMap((g) => g.items);

  if (variant === "chips") return (
      <nav aria-label="Yönetim menüsü" className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 pb-3 lg:hidden">
        {flat.map((l) => (
          <Link key={l.href} href={l.href} aria-current={on(l.href) ? "page" : undefined}
            className={`relative flex shrink-0 items-center gap-2 whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition ${on(l.href) ? "bg-white text-navy shadow" : "bg-white/10 text-white/85"}`}>
            <Ic d={l.icon} />{l.label}
            {l.badge ? <span className="rounded-full bg-red-500 px-1.5 text-[11px] font-bold leading-5 text-white">{l.badge}</span> : null}
          </Link>
        ))}
      </nav>
  );

  return (
      <nav aria-label="Yönetim menüsü" className="hidden w-60 shrink-0 lg:block">
        <div className="sticky top-4 space-y-5 rounded-3xl bg-white p-4 shadow-sm ring-1 ring-navy/5">
          {groups.map((g) => (
            <div key={g.title}>
              <p className="px-3 text-[11px] font-semibold uppercase tracking-wider text-navy/40">{g.title}</p>
              <ul className="mt-1.5 space-y-0.5">
                {g.items.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} aria-current={on(l.href) ? "page" : undefined}
                      className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${on(l.href) ? "bg-navy text-white" : "text-navy/75 hover:bg-mist"}`}>
                      <Ic d={l.icon} />{l.label}
                      {l.badge ? <span className="ml-auto rounded-full bg-red-500 px-2 text-[11px] font-bold leading-5 text-white">{l.badge}</span> : null}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </nav>
  );
}
