"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { href as hrefFor, switchPath, t, type Lang } from "@/lib/i18n";
import { Logo } from "./Logo";
import { BoatIcon } from "./BoatIcon";

export type NavLink = { href: string; label: string; children?: { href: string; label: string; icon?: string }[] };

export function HeaderClient({ links, lang = "tr" }: { links: NavLink[]; lang?: Lang }) {
  const L = t(lang);
  const track = lang === "en" ? "My Tour" : "Turum";
  const path = usePathname() || "/";
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [sub, setSub] = useState<string | null>(null); // açık alt menü

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 bg-white transition-shadow duration-300 ${
        scrolled || open ? "shadow-sm" : ""
      }`}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 lg:h-20 lg:px-8">
        <Link href={hrefFor(lang, "/")} aria-label={L.homeAria}>
          <Logo />
        </Link>

        <nav className="hidden items-center gap-7 lg:flex" aria-label={L.mainMenu}>
          {links.map((l) =>
            l.children ? (
              <div key={l.label} className="relative" onMouseEnter={() => setSub(l.label)} onMouseLeave={() => setSub(null)}>
                <button
                  type="button"
                  aria-expanded={sub === l.label}
                  onClick={() => setSub(sub === l.label ? null : l.label)}
                  className="flex items-center gap-1 text-sm font-medium text-navy transition-colors hover:text-turquoise"
                >
                  {l.label}
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={sub === l.label ? "rotate-180" : ""}><path d="M6 9l6 6 6-6" /></svg>
                </button>
                {sub === l.label && (
                  <div className="absolute left-0 top-full pt-3">
                    <ul className="min-w-52 rounded-2xl bg-white p-2 shadow-xl ring-1 ring-navy/10">
                      {l.children.map((c) => (
                        <li key={c.href}>
                          <Link href={c.href} onClick={() => setSub(null)} className="group flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium text-navy hover:bg-mist hover:text-turquoise-dark"><BoatIcon name={c.icon} className="shrink-0 text-turquoise" />{c.label}</Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <a key={l.label} href={l.href} className="text-sm font-medium text-navy transition-colors hover:text-turquoise">
                {l.label}
              </a>
            ),
          )}
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/musteri"
            aria-label={track}
            title={track}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-navy/20 text-navy transition hover:border-turquoise hover:text-turquoise-dark lg:h-auto lg:w-auto lg:gap-2 lg:px-4 lg:py-2 lg:text-sm lg:font-semibold"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M7 13V5.5A1.5 1.5 0 0 1 8.5 4h7A1.5 1.5 0 0 1 17 5.5V13" /><path d="M7 8h10M10 2.5V5M14 2.5V5" /><path d="M10 10.5h.01M14 10.5h.01" /><path d="M3 13h18v7.5a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 20.5z" /><path d="M10 17h4" /></svg>
            <span className="hidden lg:inline">{track}</span>
          </Link>
          <div
            role="group"
            aria-label={L.langGroup}
            className="flex overflow-hidden rounded-full border border-navy/20 text-xs font-semibold"
          >
            {(["tr", "en"] as const).map((l) => (
              <a
                key={l}
                href={switchPath(path, l)}
                hrefLang={l}
                lang={l}
                aria-current={lang === l ? "true" : undefined}
                className={`px-3 py-1.5 ${lang === l ? "bg-turquoise text-white" : "text-navy"}`}
              >
                {l.toUpperCase()}
              </a>
            ))}
          </div>
          <button
            className="flex h-10 w-10 items-center justify-center rounded-full text-navy lg:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-label={open ? L.menuClose : L.menuOpen}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
            </svg>
          </button>
        </div>
      </div>

      {open && (
        <nav className="border-t border-navy/10 bg-white px-5 pb-6 pt-2 lg:hidden" aria-label={L.mobileMenu}>
          {links.map((l) =>
            l.children ? (
              <div key={l.label} className="border-b border-navy/5">
                <button
                  type="button"
                  aria-expanded={sub === l.label}
                  onClick={() => setSub(sub === l.label ? null : l.label)}
                  className="flex w-full items-center justify-between py-4 text-base font-medium text-navy"
                >
                  {l.label}
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={sub === l.label ? "rotate-180" : ""}><path d="M6 9l6 6 6-6" /></svg>
                </button>
                {sub === l.label && (
                  <ul className="pb-3 pl-3">
                    {l.children.map((c) => (
                      <li key={c.href}>
                        <Link href={c.href} onClick={() => { setOpen(false); setSub(null); }} className="flex items-center gap-3 py-2.5 text-base text-navy/80"><BoatIcon name={c.icon} className="shrink-0 text-turquoise" />{c.label}</Link>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ) : (
              <a key={l.label} href={l.href} onClick={() => setOpen(false)} className="block border-b border-navy/5 py-4 text-base font-medium text-navy">
                {l.label}
              </a>
            ),
          )}
          <Link href="/musteri" onClick={() => setOpen(false)} className="block border-b border-navy/5 py-4 text-base font-medium text-turquoise-dark">{track}</Link>
        </nav>
      )}
    </header>
  );
}
