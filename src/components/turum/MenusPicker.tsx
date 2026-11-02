"use client";

import { useState } from "react";
import { saveMenus } from "@/app/musteri/actions";
import type { PortalMenu } from "@/lib/turum";

export function MenusPicker({ menus, urls }: { menus: PortalMenu[]; urls: Record<string, string> }) {
  const [sel, setSel] = useState<string[]>(menus.filter((m) => m.chosen).map((m) => m.id));
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const toggle = (id: string) => { setSel((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id])); setMsg(null); };

  async function submit() {
    setBusy(true);
    const r = await saveMenus(sel).catch(() => ({ ok: false, error: "Bağlantı hatası. Lütfen tekrar deneyin." }));
    setBusy(false);
    setMsg(r.ok ? { ok: true, text: sel.length ? `${sel.length} menü seçildi. Teşekkür ederiz.` : "Seçiminiz kaydedildi." } : { ok: false, text: r.error ?? "Kaydedilemedi." });
  }

  return (
    <div className="mt-5">
      <ul className="space-y-2.5">
        {menus.map((m) => {
          const on = sel.includes(m.id);
          return (
            <li key={m.id} className={`flex items-start gap-3 rounded-2xl p-4 ring-1 transition ${on ? "bg-turquoise/10 ring-turquoise/40" : "bg-mist ring-navy/5"}`}>
              <button type="button" onClick={() => toggle(m.id)} aria-pressed={on} aria-label={`${m.title} seç`} className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border-2 transition ${on ? "border-turquoise bg-turquoise text-white" : "border-navy/25 bg-white"}`}>
                {on && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>}
              </button>
              <div className="min-w-0 flex-1">
                <button type="button" onClick={() => toggle(m.id)} className="block text-left text-[15px] font-semibold text-navy">{m.title}</button>
                {m.description && <p className="mt-1 whitespace-pre-line text-sm leading-relaxed text-navy/65">{m.description}</p>}
                {urls[m.id] && <a href={urls[m.id]} target="_blank" rel="noopener" className="mt-2 inline-block text-sm font-semibold text-turquoise-dark underline underline-offset-4">Menüyü görüntüle</a>}
              </div>
            </li>
          );
        })}
      </ul>
      {msg && <p role="status" className={`mt-4 rounded-xl px-4 py-3 text-sm ${msg.ok ? "bg-emerald-50 text-emerald-800" : "bg-red-50 text-red-700"}`}>{msg.text}</p>}
      <button type="button" onClick={submit} disabled={busy} className="mt-4 w-full rounded-xl bg-navy px-5 py-3.5 text-base font-semibold text-white transition hover:bg-navy-soft disabled:opacity-60 sm:w-auto">
        {busy ? "Kaydediliyor…" : "Menü seçimimi kaydet"}
      </button>
    </div>
  );
}
