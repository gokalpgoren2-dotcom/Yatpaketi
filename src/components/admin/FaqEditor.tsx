"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { refreshSite } from "@/app/admin/(panel)/icerik/actions";
import { FAQ_CATS, FAQ_DEFAULT, type FaqCat, type FaqItem } from "@/lib/faq";

const input = "w-full rounded-xl border border-navy/15 bg-white px-3 py-3 text-base outline-none focus:border-turquoise focus:ring-2 focus:ring-turquoise/30";
const lab = "mb-1 block text-xs font-semibold uppercase tracking-wide text-navy/60";
const btn = "rounded-xl border border-navy/15 px-3 py-2 text-sm font-semibold disabled:opacity-40";

export function FaqEditor({ initial, saved }: { initial: FaqItem[]; saved: boolean }) {
  const supabase = createClient();
  const [items, setItems] = useState<FaqItem[]>(initial);
  const [filter, setFilter] = useState<FaqCat | "all">("all");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const set = (i: number, patch: Partial<FaqItem>) => setItems((l) => l.map((x, k) => (k === i ? { ...x, ...patch } : x)));
  const move = (i: number, d: number) => setItems((l) => { const j = i + d; if (j < 0 || j >= l.length) return l; const c = [...l]; [c[i], c[j]] = [c[j], c[i]]; return c; });
  const remove = (i: number) => setItems((l) => l.filter((_, k) => k !== i));
  const add = () => { setItems((l) => [...l, { cat: filter === "all" ? "choose" : filter, qTr: "", aTr: "", qEn: "", aEn: "" }]); };

  async function save() {
    setBusy(true); setMsg(null);
    const clean = items.filter((x) => x.qTr.trim() || x.qEn.trim());
    const { error } = await supabase.from("site_texts").upsert({ key: "faq", data: { items: clean }, updated_at: new Date().toISOString() });
    if (error) { setMsg({ ok: false, text: "Kaydedilemedi: " + error.message }); setBusy(false); window.scrollTo({ top: 0, behavior: "smooth" }); return; }
    await refreshSite();
    setItems(clean);
    setMsg({ ok: true, text: "Kaydedildi. Sayfa birkaç dakika içinde güncellenir." });
    setBusy(false); window.scrollTo({ top: 0, behavior: "smooth" });
  }
  async function reset() {
    if (!confirm("Tüm sorular ilk haline dönsün mü? Yaptığınız değişiklikler silinir.")) return;
    setBusy(true);
    const { error } = await supabase.from("site_texts").delete().eq("key", "faq");
    if (error) { setMsg({ ok: false, text: "Sıfırlanamadı: " + error.message }); setBusy(false); return; }
    await refreshSite();
    setItems(FAQ_DEFAULT);
    setMsg({ ok: true, text: "İlk haline döndürüldü." });
    setBusy(false);
  }

  return (
    <div className="space-y-5" aria-live="polite">
      {msg && <p role={msg.ok ? "status" : "alert"} className={`rounded-xl p-4 text-sm font-medium ${msg.ok ? "bg-green-50 text-green-800 ring-1 ring-green-200" : "bg-red-50 text-red-700 ring-1 ring-red-200"}`}>{msg.text}</p>}
      <div className="rounded-2xl bg-white p-5 shadow-sm">
        <p className="text-sm text-navy/65">{items.length} soru. Soruya dokunun, açılsın; ok düğmeleriyle sırasını değiştirin. İngilizce alanı boş bırakırsanız o soru İngilizce sitede boş görünür. Cevaplarda bağlantı için <code>[yazı](/rotalar)</code> yazabilirsiniz.</p>
        <label htmlFor="cat" className={`${lab} mt-4`}>Kategoriye göre göster</label>
        <select id="cat" value={filter} onChange={(e) => setFilter(e.target.value as FaqCat | "all")} className={input}>
          <option value="all">Tümü</option>
          {FAQ_CATS.map((c) => <option key={c.key} value={c.key}>{c.tr}</option>)}
        </select>
      </div>

      <ul className="space-y-3">
        {items.map((f, i) => (filter !== "all" && f.cat !== filter) ? null : (
          <li key={i} className="rounded-2xl bg-white shadow-sm ring-1 ring-navy/5">
            <details>
              <summary className="cursor-pointer list-none px-5 py-4">
                <span className="block text-xs font-semibold uppercase tracking-wide text-turquoise-dark">{FAQ_CATS.find((c) => c.key === f.cat)?.tr}</span>
                <span className="mt-0.5 block font-medium">{f.qTr || <em className="text-navy/40">Yeni soru</em>}</span>
              </summary>
              <div className="space-y-4 border-t border-navy/10 p-5">
                <div><label className={lab}>Kategori</label>
                  <select value={f.cat} onChange={(e) => set(i, { cat: e.target.value as FaqCat })} className={input}>{FAQ_CATS.map((c) => <option key={c.key} value={c.key}>{c.tr}</option>)}</select></div>
                <div><label className={lab}>Soru (Türkçe)</label><input value={f.qTr} onChange={(e) => set(i, { qTr: e.target.value })} className={input} /></div>
                <div><label className={lab}>Cevap (Türkçe)</label><textarea rows={5} value={f.aTr} onChange={(e) => set(i, { aTr: e.target.value })} className={input} /></div>
                <div><label className={lab}>Question (English)</label><input value={f.qEn} onChange={(e) => set(i, { qEn: e.target.value })} className={input} /></div>
                <div><label className={lab}>Answer (English)</label><textarea rows={5} value={f.aEn} onChange={(e) => set(i, { aEn: e.target.value })} className={input} /></div>
                <div className="flex flex-wrap gap-2">
                  <button type="button" className={btn} disabled={i === 0} onClick={() => move(i, -1)}>↑ Yukarı</button>
                  <button type="button" className={btn} disabled={i === items.length - 1} onClick={() => move(i, 1)}>↓ Aşağı</button>
                  <button type="button" className={`${btn} text-red-700`} onClick={() => remove(i)}>Sil</button>
                </div>
              </div>
            </details>
          </li>
        ))}
      </ul>

      <div className="flex flex-wrap gap-3">
        <button type="button" onClick={add} className={btn}>+ Yeni soru ekle</button>
        <button type="button" onClick={save} disabled={busy} className="rounded-xl bg-turquoise px-6 py-3 text-base font-semibold text-white disabled:opacity-60">{busy ? "Bekleyin…" : "Kaydet"}</button>
        {saved && <button type="button" onClick={reset} disabled={busy} className={`${btn} text-red-700`}>İlk haline döndür</button>}
      </div>
    </div>
  );
}
