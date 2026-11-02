"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { refreshSite } from "@/app/admin/(panel)/icerik/actions";
import { emptyCampaign, isLive, KINDS, PERCENTS, type Campaign } from "@/lib/campaigns";

const input = "w-full rounded-xl border border-navy/15 bg-white px-3 py-3 text-base outline-none focus:border-turquoise focus:ring-2 focus:ring-turquoise/30";
const lab = "mb-1 block text-xs font-semibold uppercase tracking-wide text-navy/60";
const btn = "rounded-xl border border-navy/15 px-3 py-2 text-sm font-semibold disabled:opacity-40";

export type BoatOpt = { slug: string; name: string };

export function CampaignEditor({ initial, boats }: { initial: Campaign[]; boats: BoatOpt[] }) {
  const supabase = createClient();
  const [items, setItems] = useState<Campaign[]>(initial);
  const toggleBoat = (i: number, slug: string) => setItems((l) => l.map((x, k) => (k === i ? { ...x, boats: x.boats.includes(slug) ? x.boats.filter((b) => b !== slug) : [...x.boats, slug] } : x)));
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const set = (i: number, patch: Partial<Campaign>) => setItems((l) => l.map((x, k) => (k === i ? { ...x, ...patch } : x)));
  const move = (i: number, d: number) => setItems((l) => { const j = i + d; if (j < 0 || j >= l.length) return l; const c = [...l]; [c[i], c[j]] = [c[j], c[i]]; return c; });
  const remove = async (i: number) => {
    if (!confirm("Bu kampanya silinsin mi? Sitedeki kart hemen kalkar.")) return;
    const next = items.filter((_, k) => k !== i);
    setItems(next);
    await save(next, "Kampanya silindi.");
  };
  const [q, setQ] = useState<Record<string, string>>({});

  async function save(list: Campaign[] = items, okText = "Kaydedildi. Ana sayfa bir iki dakika içinde güncellenir.") {
    setBusy(true); setMsg(null);
    const { error } = await supabase.from("site_texts").upsert({ key: "campaigns", data: { items: list }, updated_at: new Date().toISOString() });
    if (error) { setMsg({ ok: false, text: "Kaydedilemedi: " + error.message }); setBusy(false); window.scrollTo({ top: 0, behavior: "smooth" }); return; }
    await refreshSite();
    setMsg({ ok: true, text: okText });
    setBusy(false); window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div className="space-y-5" aria-live="polite">
      {msg && <p role={msg.ok ? "status" : "alert"} className={`rounded-xl p-4 text-sm font-medium ${msg.ok ? "bg-green-50 text-green-800 ring-1 ring-green-200" : "bg-red-50 text-red-700 ring-1 ring-red-200"}`}>{msg.text}</p>}
      <div className="rounded-2xl bg-white p-5 shadow-sm">
        <p className="text-sm text-navy/65">Türü, yüzdeyi ve yatları seçin. Seçilen yatların fotoğrafının sağ üstünde (Mürettebatlı etiketinin altında) ve yat sayfasında indirim etiketi görünür. Bitiş günü geçince etiket kendiliğinden kalkar.</p>
      </div>

            <ul className="space-y-3">
        {items.map((c, i) => {
          const kind = KINDS.find((k) => k.key === c.kind)?.tr ?? "";
          const label = c.title || `${kind} %${c.percent}`;
          return (
            <li key={c.id} className="relative rounded-2xl bg-white shadow-sm ring-1 ring-navy/5">
              <button type="button" onClick={() => remove(i)} disabled={busy} aria-label="Kampanyayı sil" className="absolute right-3 top-3 z-10 rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-700 disabled:opacity-40">Sil</button>
              <details open={i === items.length - 1 && !initial.some((x) => x.id === c.id)}>
                <summary className="cursor-pointer list-none px-5 py-4 pr-20">
                  <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${isLive(c) ? "bg-green-100 text-green-800" : "bg-navy/10 text-navy/60"}`}>
                    {isLive(c) ? "Yayında" : c.active ? "Süresi doldu" : "Kapalı"}
                  </span>
                  <span className="mt-1 block font-medium">{label}</span>
                  <span className="block text-xs text-navy/50">{c.boats.length === 0 ? "Tüm yatlar" : `${c.boats.length} yat`}{c.until ? ` · Bitiş: ${c.until}` : " · Süresiz"}</span>
                </summary>
                <div className="space-y-6 border-t border-navy/10 p-5">
                  <label className="flex items-center gap-3 text-base font-medium">
                    <input type="checkbox" checked={c.active} onChange={(e) => set(i, { active: e.target.checked })} className="h-5 w-5 accent-[#1bb4c4]" />
                    Sitede göster
                  </label>

                  <fieldset>
                    <legend className={lab}>1. Kampanya türü</legend>
                    <div className="grid gap-2 sm:grid-cols-2">
                      {KINDS.map((k) => (
                        <button key={k.key} type="button" onClick={() => set(i, { kind: k.key })} aria-pressed={c.kind === k.key}
                          className={`rounded-xl border px-4 py-3 text-left transition ${c.kind === k.key ? "border-turquoise bg-turquoise/10 ring-2 ring-turquoise/30" : "border-navy/15"}`}>
                          <span className="block font-semibold">{k.tr}</span>
                          <span className="block text-xs text-navy/55">{k.hint}</span>
                        </button>
                      ))}
                    </div>
                  </fieldset>

                  <fieldset>
                    <legend className={lab}>2. İndirim yüzdesi</legend>
                    <div className="flex flex-wrap gap-2">
                      {PERCENTS.map((p) => (
                        <button key={p} type="button" onClick={() => set(i, { percent: p })} aria-pressed={c.percent === p}
                          className={`min-w-16 rounded-full border px-4 py-2.5 text-base font-semibold transition ${c.percent === p ? "border-turquoise bg-turquoise text-white" : "border-navy/15"}`}>%{p}</button>
                      ))}
                    </div>
                  </fieldset>

                  <fieldset>
                    <legend className={lab}>3. Hangi yatlar?</legend>
                    <label className="mb-2 flex items-center gap-3 rounded-xl bg-mist px-4 py-3 font-medium">
                      <input type="checkbox" checked={c.boats.length === 0} onChange={() => set(i, { boats: [] })} className="h-5 w-5 accent-[#1bb4c4]" />
                      Tüm yatlar
                    </label>
                    <input type="search" value={q[c.id] ?? ""} onChange={(e) => setQ((m) => ({ ...m, [c.id]: e.target.value }))} placeholder="Yat adı yazın, listede bulun" aria-label="Yat ara" className={`${input} mb-2`} />
                    {c.boats.length > 0 && <p className="mb-2 text-xs font-semibold text-turquoise-dark">Seçili: {boats.filter((b) => c.boats.includes(b.slug)).map((b) => b.name).join(", ")}</p>}
                    {boats.length === 0 ? <p className="text-sm text-navy/50">Henüz yayında yat yok.</p> : (
                      <ul className="max-h-72 space-y-1 overflow-y-auto rounded-xl border border-navy/10 p-2">
                        {boats.filter((b) => b.name.toLocaleLowerCase("tr").includes((q[c.id] ?? "").trim().toLocaleLowerCase("tr"))).map((b) => (
                          <li key={b.slug}>
                            <label className="flex items-center gap-3 rounded-lg px-3 py-2.5 hover:bg-mist">
                              <input type="checkbox" checked={c.boats.includes(b.slug)} onChange={() => toggleBoat(i, b.slug)} className="h-5 w-5 accent-[#1bb4c4]" />
                              {b.name}
                            </label>
                          </li>
                        ))}
                        {boats.filter((b) => b.name.toLocaleLowerCase("tr").includes((q[c.id] ?? "").trim().toLocaleLowerCase("tr"))).length === 0 && <li className="px-3 py-2 text-sm text-navy/50">Eşleşen yat yok.</li>}
                      </ul>
                    )}
                    <p className="mt-1 text-xs text-navy/50">Tek yat seçerseniz kartın düğmesi doğrudan o yatın sayfasına gider.</p>
                  </fieldset>

                  <div>
                    <label className={lab}>4. Son geçerlilik günü (boşsa süresiz)</label>
                    <input type="date" value={c.until} onChange={(e) => set(i, { until: e.target.value })} className={`${input} sm:max-w-xs`} />
                  </div>

                  <div className="flex flex-wrap gap-2 border-t border-navy/10 pt-4">
                    <button type="button" className={btn} disabled={i === 0} onClick={() => move(i, -1)}>↑ Yukarı</button>
                    <button type="button" className={btn} disabled={i === items.length - 1} onClick={() => move(i, 1)}>↓ Aşağı</button>
                    <button type="button" className={`${btn} text-red-700`} onClick={() => remove(i)}>Kampanyayı sil</button>
                  </div>
                </div>
              </details>
            </li>
          );
        })}
        {items.length === 0 && <li className="rounded-2xl bg-white p-6 text-center text-sm text-navy/55 shadow-sm">Henüz kampanya yok.</li>}
      </ul>

      <div className="flex flex-wrap gap-3">
        <button type="button" onClick={() => setItems((l) => [...l, emptyCampaign()])} className={btn}>+ Yeni kampanya</button>
        <button type="button" onClick={() => save()} disabled={busy} className="rounded-xl bg-turquoise px-6 py-3 text-base font-semibold text-white disabled:opacity-60">{busy ? "Bekleyin…" : "Kaydet"}</button>
      </div>
    </div>
  );
}
