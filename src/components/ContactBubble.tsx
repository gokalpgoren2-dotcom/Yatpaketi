"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { langFromPath, t } from "@/lib/i18n";

type Props = { whatsapp: string; phone: string; phoneLabel: string; email: string };

const ic = { width: 20, height: 20, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": true };

// Sağ altta sabit iletişim balonu. İletişim bilgisi girilmemişse hiç görünmez.
export function ContactBubble({ whatsapp, phone, phoneLabel, email }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const path = usePathname();
  const L = t(langFromPath(path));

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    const onDown = (e: PointerEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onDown);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onDown);
    };
  }, [open]);

  useEffect(() => setOpen(false), [path]);

  if (path.startsWith("/admin") || (!whatsapp && !phone && !email)) return null;

  const row = "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-navy transition hover:bg-mist";
  return (
    <div ref={ref} className="fixed right-4 z-50 bottom-[calc(5rem+env(safe-area-inset-bottom))] lg:bottom-6 lg:right-6">
      {open && (
        <div role="dialog" aria-label={L.contactAria} className="menu-rise absolute bottom-[5rem] right-0 w-64 rounded-2xl bg-white p-2 shadow-2xl shadow-navy/25 ring-1 ring-navy/10">
          <p className="px-4 pb-1 pt-2 text-xs font-semibold uppercase tracking-wide text-navy/50">{L.reachUs}</p>
          {whatsapp && (
            <a className={row} href={`https://wa.me/${whatsapp}`} target="_blank" rel="noopener">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#25D366] text-white"><svg {...ic}><path d="M3 21l1.6-4.6A8.5 8.5 0 1 1 8 19.5z" /></svg></span>
              WhatsApp
            </a>
          )}
          {phone && (
            <a className={row} href={`tel:+${phone}`}>
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-turquoise text-white"><svg {...ic}><path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z" /></svg></span>
              <span className="min-w-0"><span className="block">{L.call}</span><span className="block text-xs font-normal text-navy/60">{phoneLabel}</span></span>
            </a>
          )}
          {email && (
            <a className={row} href={`mailto:${email}`}>
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-navy text-white"><svg {...ic}><path d="M3 6h18v12H3zM3 7l9 7 9-7" /></svg></span>
              {L.sendEmail}
            </a>
          )}
        </div>
      )}
      {!open && (
        <span className="bubble-label pointer-events-none absolute right-[5rem] top-1/2 -translate-y-1/2 whitespace-nowrap rounded-full bg-white px-4 py-2 text-sm font-semibold text-navy shadow-lg ring-1 ring-navy/10" aria-hidden>
          {L.writeUs}
        </span>
      )}
      <span className="relative block h-16 w-16">
        {!open && <span className="bubble-ring absolute inset-0 rounded-full bg-turquoise" aria-hidden />}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-label={open ? L.closeContact : L.openContact}
          className="relative flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-[#2ad0e0] via-turquoise to-[#0b6f95] text-white shadow-xl shadow-navy/35 ring-2 ring-white/70 transition active:scale-95"
        >
          {open ? (
            <svg {...ic} width={24} height={24}><path d="M6 6l12 12M18 6L6 18" /></svg>
          ) : (
            <span className="sail-sway relative block">
              <svg width="34" height="34" viewBox="0 0 34 34" aria-hidden>
                <path fill="currentColor" d="M15 4v18H5z" />
                <path fill="currentColor" fillOpacity=".85" d="M17.5 8v14H26z" />
                <path fill="currentColor" d="M3 24h28l-4 6H7z" />
              </svg>
              <svg className="absolute -right-2 -top-2" width="18" height="18" viewBox="0 0 18 18" aria-hidden>
                <path fill="#fff" d="M9 1C4.6 1 1.5 3.7 1.5 7c0 1.7.8 3.2 2.1 4.3L3 15.5l3.5-1.7c.8.2 1.6.3 2.5.3 4.4 0 7.5-2.7 7.5-6.1S13.4 1 9 1z" />
                <circle cx="5.8" cy="7.2" r="1" fill="#0b6f95" /><circle cx="9" cy="7.2" r="1" fill="#0b6f95" /><circle cx="12.2" cy="7.2" r="1" fill="#0b6f95" />
              </svg>
            </span>
          )}
        </button>
      </span>
    </div>
  );
}
