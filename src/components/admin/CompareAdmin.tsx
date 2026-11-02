"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Curated } from "@/lib/compare";

type Boat = { slug: string; name: string };
const input = "w-full rounded-xl border border-navy/15 bg-white px-3 py-3 text-base outline-none focus:border-turquoise focus:ring-2 focus:ring-turquoise/30";
const lab = "mb-1 block text-xs font-semibold uppercase tracking-wide text-navy/60";
const btn = "rounded-xl border border-navy/15 px-4 py-2.5 text-sm font-semibold disabled:opacity-40";

export function CompareAdmin({ initial, boats }: { initial: Curated[]; boats: Boat[] }) {
  const supabase = createClient();
  const [items, setItems] = useState<Curated[]>(initial);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const name = (s: string) => boats.find((b) => b.slug === s)?.name ?? "—";
  const set = (i: number, p: Partial<Curated>) => setItems((l) => l.map((x, k) => (k === i ? { ...x, ...p } : x)));

  async function persist(list: Curated[], okText: string) {
    setBusy(true); setMsg(null);
    const { error } = await supabase.from("site_texts").upsert({ key: "comparisons", data: { items: list }, updated_at: new Date().toISOString() });
    setBusy(false);
    setMsg(error ? { ok: false, text: "Kaydedilemedi: " + error.message } : { ok: true, text: okText });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  async function remove(i: number) {
    if (!confirm("Bu karşılaştırma notu silinsin mi?")) return;
    const next = items.filter((_, k) => k !== i);
    setItems(next);
    await persist(next, "Silindi.");
  }

  return (
    <div className="space-y-5" aria-live="polite">
      {msg && <p role={msg.ok ? "status" : "alert"} className={`rounded-xl p-4 text-sm font-medium ${msg.ok ? "bg-green-50 text-green-800 ring-1 ring-green-200" : "bg-red-50 text-red-700 ring-1 ring-red-200"}`}>{msg.text}</p>}
      <div className="rounded-2xl bg-white p-5 shadow-sm">
        <p className="text-sm text-navy/65">Ziyaretçi herhangi iki yatı karşılaştırabilir; boy, yaş, kabin, su sporları ve fiyat farkları <b>otomatik</b> yazılır. Burada belirli iki yat için kendi yorumunuzu ekleyebilirsiniz; o ikili karşılaştırılınca “Yatpaketi'nin yorumu” kutusunda görünür. “Sık karşılaştırılanlar”da göstermek için kutuyu işaretleyin.</p>
      </div>
      <ul className="space-y-3">
        {items.map((c, i) => (
          <li key={c.id} className="rounded-2xl bg-white shadow-sm ring-1 ring-navy/5">
            <details open={!c.a || !c.b}>
              <summary className="cursor-pointer list-none px-5 py-4">
                <span className="block font-medium">{c.a && c.b ? `${name(c.a)} karşı ${name(c.b)}` : <em className="text-navy/40">Yeni karşılaştırma</em>}</span>
                <span className="block text-xs text-navy/50">{c.featured ? "Sık karşılaştırılanlarda gösterilir" : "Yalnızca bu ikili seçilince gösterilir"}</span>
              </summary>
              <div className="space-y-4 border-t border-navy/10 p-5">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div><label className={lab}>Birinci yat</label>
                    <select className={input} value={c.a} onChange={(e) => set(i, { a: e.target.value })}><option value="">Seçin</option>{boats.filter((b) => b.slug !== c.b).map((b) => <option key={b.slug} value={b.slug}>{b.name}</option>)}</select></div>
                  <div><label className={lab}>İkinci yat</label>
                    <select className={input} value={c.b} onChange={(e) => set(i, { b: e.target.value })}><option value="">Seçin</option>{boats.filter((b) => b.slug !== c.a).map((b) => <option key={b.slug} value={b.slug}>{b.name}</option>)}</select></div>
                </div>
                <div><label className={lab}>Yorumunuz (Türkçe)</label>
                  <textarea rows={6} className={input} maxLength={1500} value={c.note} onChange={(e) => set(i, { note: e.target.value })} placeholder="Örn: Büyük gruplar ve uzun haftalık turlar için A daha geniş. B daha yeni, daha modern iç mekâna ve daha zengin su sporu ekipmanına sahip…" /></div>
                <div><label className={lab}>Your note (English, optional)</label>
                  <textarea rows={4} className={input} maxLength={1500} value={c.noteEn} onChange={(e) => set(i, { noteEn: e.target.value })} /></div>
                <label className="flex items-center gap-3 font-medium"><input type="checkbox" className="h-5 w-5 accent-[#1bb4c4]" checked={c.featured} onChange={(e) => set(i, { featured: e.target.checked })} />“Sık karşılaştırılanlar”da göster</label>
                <div className="flex flex-wrap gap-2 border-t border-navy/10 pt-4">
                  {c.a && c.b && <a href={`/tekne-karsilastir?a=${c.a}&b=${c.b}`} target="_blank" rel="noopener" className={`${btn} inline-block`}>Sitede aç</a>}
                  <button type="button" className={`${btn} text-red-700`} onClick={() => remove(i)}>Sil</button>
                </div>
              </div>
            </details>
          </li>
        ))}
        {items.length === 0 && <li className="rounded-2xl bg-white p-6 text-center text-sm text-navy/55 shadow-sm">Henüz karşılaştırma notu yok.</li>}
      </ul>
      <div className="flex flex-wrap gap-3">
        <button type="button" className={btn} onClick={() => setItems((l) => [...l, { id: crypto.randomUUID(), a: "", b: "", note: "", noteEn: "", featured: true }])}>+ Yeni karşılaştırma</button>
        <button type="button" disabled={busy} onClick={() => persist(items.filter((c) => c.a && c.b && c.a !== c.b), "Kaydedildi.")} className="rounded-xl bg-turquoise px-6 py-3 text-base font-semibold text-white disabled:opacity-60">{busy ? "Bekleyin…" : "Kaydet"}</button>
      </div>
    </div>
  );
}
