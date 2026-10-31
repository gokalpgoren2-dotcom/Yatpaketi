"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

type Props = { whatsapp: string; phone: string; phoneLabel: string; email: string };

const ic = { width: 20, height: 20, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": true };

// Sağ altta sabit iletişim balonu. İletişim bilgisi girilmemişse hiç görünmez.
export function ContactBubble({ whatsapp, phone, phoneLabel, email }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const path = usePathname();

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
        <div role="dialog" aria-label="İletişim" className="absolute bottom-[4.5rem] right-0 w-64 rounded-2xl bg-white p-2 shadow-2xl shadow-navy/25 ring-1 ring-navy/10">
          <p className="px-4 pb-1 pt-2 text-xs font-semibold uppercase tracking-wide text-navy/50">Bize ulaşın</p>
          {whatsapp && (
            <a className={row} href={`https://wa.me/${whatsapp}`} target="_blank" rel="noopener">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#25D366] text-white"><svg {...ic}><path d="M3 21l1.6-4.6A8.5 8.5 0 1 1 8 19.5z" /></svg></span>
              WhatsApp
            </a>
          )}
          {phone && (
            <a className={row} href={`tel:+${phone}`}>
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-turquoise text-white"><svg {...ic}><path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z" /></svg></span>
              <span className="min-w-0"><span className="block">Ara</span><span className="block text-xs font-normal text-navy/60">{phoneLabel}</span></span>
            </a>
          )}
          {email && (
            <a className={row} href={`mailto:${email}`}>
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-navy text-white"><svg {...ic}><path d="M3 6h18v12H3zM3 7l9 7 9-7" /></svg></span>
              E-posta gönder
            </a>
          )}
        </div>
      )}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label={open ? "İletişim menüsünü kapat" : "İletişim menüsünü aç"}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-turquoise text-white shadow-xl shadow-navy/30 transition hover:bg-turquoise-dark active:scale-95"
      >
        {open ? (
          <svg {...ic} width={24} height={24}><path d="M6 6l12 12M18 6L6 18" /></svg>
        ) : (
          <svg {...ic} width={26} height={26}><path d="M4 5h16v11H9l-5 4z" /></svg>
        )}
      </button>
    </div>
  );
}
