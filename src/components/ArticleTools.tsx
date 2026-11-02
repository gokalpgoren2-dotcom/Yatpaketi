"use client";

import { useEffect, useState } from "react";

// Sayfanın üstünde okudukça dolan ince çubuk.
export function ReadProgress() {
  const [p, setP] = useState(0);
  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const el = document.getElementById("yazi");
      if (!el) return;
      const r = el.getBoundingClientRect();
      const total = r.height - window.innerHeight * 0.6;
      setP(Math.max(0, Math.min(1, (window.innerHeight * 0.3 - r.top) / Math.max(total, 1))));
    };
    const on = () => { if (!raf) raf = requestAnimationFrame(update); };
    update();
    window.addEventListener("scroll", on, { passive: true });
    window.addEventListener("resize", on);
    return () => { window.removeEventListener("scroll", on); window.removeEventListener("resize", on); if (raf) cancelAnimationFrame(raf); };
  }, []);
  return (
    <div className="fixed inset-x-0 top-16 z-40 h-1 bg-transparent lg:top-20" aria-hidden>
      <div className="h-full rounded-r-full bg-gradient-to-r from-turquoise to-[#0b6a86] transition-[width] duration-150" style={{ width: `${p * 100}%` }} />
    </div>
  );
}

// İçindekiler: okunan bölüm vurgulanır.
export function Toc({ items, title }: { items: { t: string; id: string }[]; title: string }) {
  const [act, setAct] = useState(items[0]?.id ?? "");
  useEffect(() => {
    const obs = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) setAct(e.target.id); }), { rootMargin: "-20% 0px -70% 0px" });
    items.forEach(({ id }) => { const el = document.getElementById(id); if (el) obs.observe(el); });
    return () => obs.disconnect();
  }, [items]);
  return (
    <nav aria-label={title}>
      <p className="text-xs font-semibold uppercase tracking-[0.25em] text-navy/45">{title}</p>
      <ol className="mt-4 space-y-1 border-l-2 border-navy/10">
        {items.map(({ t, id }, i) => (
          <li key={id}>
            <a href={`#${id}`} className={`-ml-0.5 flex gap-3 border-l-2 py-1.5 pl-4 text-[13px] font-light leading-snug transition ${act === id ? "border-turquoise font-medium text-navy" : "border-transparent text-navy/55 hover:text-navy"}`}>
              <span className={`text-[11px] font-medium ${act === id ? "text-turquoise-dark" : "text-navy/30"}`}>{String(i + 1).padStart(2, "0")}</span>{t}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}

// Paylaş: WhatsApp ve bağlantıyı kopyala.
export function Share({ title, label, copyLabel, copiedLabel }: { title: string; label: string; copyLabel: string; copiedLabel: string }) {
  const [url, setUrl] = useState("");
  const [copied, setCopied] = useState(false);
  useEffect(() => setUrl(window.location.href), []);
  const copy = async () => {
    try { await navigator.clipboard.writeText(url); setCopied(true); setTimeout(() => setCopied(false), 2000); } catch { /* yok say */ }
  };
  const btn = "flex h-10 items-center gap-2 rounded-full px-4 text-sm font-semibold ring-1 ring-navy/15 transition hover:bg-navy hover:text-white";
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="mr-1 text-xs font-semibold uppercase tracking-[0.25em] text-navy/45">{label}</span>
      <a href={`https://wa.me/?text=${encodeURIComponent(`${title} ${url}`)}`} target="_blank" rel="noopener noreferrer" className={btn}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M4 20l1.3-4A8 8 0 1 1 8 18.7L4 20Z" /></svg>WhatsApp
      </a>
      <button type="button" onClick={copy} className={btn} aria-live="polite">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d={copied ? "M5 12l5 5 9-10" : "M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"} /></svg>
        {copied ? copiedLabel : copyLabel}
      </button>
    </div>
  );
}
