"use client";

import { useState } from "react";

const SUGGEST = [
  "Kaptan ve mürettebat", "Günlük 4 saatlik seyir yakıtı ücreti", "Bot benzini ücreti", "Motorlu su sporları benzin ücreti",
  "Kamu limanları ücretleri", "Özel marina ücretleri", "Kumanya (yiyecek ve içecek)", "Transit log", "Final temizlik",
  "Nevresim ve havlu", "Su sporları ekipmanı", "Jeneratör", "Klima", "Mürettebat bahşişi", "Yurt dışı seyirlerindeki tüm harcamalar",
];
const input = "w-full rounded-xl border border-navy/15 bg-white px-3 py-3 text-base outline-none focus:border-turquoise focus:ring-2 focus:ring-turquoise/30";

// Fiyata dahil olanlar / olmayanlar ve KDV
export function PriceTerms({ included, excluded, vatMode, vatRate, apa: apaInit = 0 }: { included: string[]; excluded: string[]; vatMode: string; vatRate: number; apa?: number }) {
  const [apa, setApa] = useState(apaInit);
  const [inc, setInc] = useState(included.join("\n"));
  const [exc, setExc] = useState(excluded.join("\n"));
  const [mode, setMode] = useState(vatMode || "none");
  const has = (t: string, x: string) => t.split("\n").map((l) => l.trim().toLocaleLowerCase("tr")).includes(x.toLocaleLowerCase("tr"));
  const add = (t: string, x: string) => (has(t, x) ? t : (t.trim() ? t.trim() + "\n" : "") + x);
  const chip = (on: boolean) => `rounded-full border px-3 py-1.5 text-xs font-medium ${on ? "border-navy bg-navy text-white" : "border-navy/15 bg-white text-navy"}`;

  return (
    <div className="space-y-5">
      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-navy/60">KDV</p>
        <input type="hidden" name="vat_mode" value={mode} />
        <div className="flex flex-wrap items-center gap-2">
          {([["none", "Belirtme"], ["included", "KDV dahil"], ["excluded", "KDV hariç"]] as const).map(([v, l]) => (
            <button key={v} type="button" onClick={() => setMode(v)} className={`rounded-xl border px-4 py-2.5 text-sm font-semibold ${mode === v ? "border-navy bg-navy text-white" : "border-navy/15 bg-white text-navy"}`}>{l}</button>
          ))}
          {mode !== "none" && (
            <label className="flex items-center gap-2 text-sm text-navy">
              KDV oranı %
              <input name="vat_rate" type="number" min={0} max={100} step="0.01" defaultValue={vatRate || 20} className="w-24 rounded-xl border border-navy/15 bg-white px-3 py-2.5 text-base outline-none focus:border-turquoise" />
            </label>
          )}
        </div>
        <p className="mt-1 text-xs text-navy/50">KDV hariçse misafir tarih seçtiğinde KDV ayrıca hesaplanıp KDV dahil toplam gösterilir. Vitrinde fiyatın yanında &quot;+KDV&quot; yazar.</p>
      </div>

      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-navy/60">APA</p>
        <input type="hidden" name="apa" value={apa || ""} />
        <div className="flex flex-wrap gap-2">
          {[0, 5, 15, 20, 30, 35, 40].map((v) => (
            <button key={v} type="button" onClick={() => setApa(v)} className={`rounded-xl border px-4 py-2.5 text-sm font-semibold ${apa === v ? "border-navy bg-navy text-white" : "border-navy/15 bg-white text-navy"}`}>{v ? `%${v}` : "Yok"}</button>
          ))}
        </div>
        <p className="mt-1 text-xs text-navy/50">Seçerseniz yat sayfasında fiyatın altında &quot;+%30 APA&quot; ve kısa açıklaması görünür; tarih seçilince APA tutarı ayrıca hesaplanır.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="included" className="mb-1 block text-xs font-semibold uppercase tracking-wide text-navy/60">Fiyata dahil olanlar</label>
          <textarea id="included" name="included" rows={6} value={inc} onChange={(e) => setInc(e.target.value)} placeholder="Her satıra bir madde" className={input} />
        </div>
        <div>
          <label htmlFor="excluded" className="mb-1 block text-xs font-semibold uppercase tracking-wide text-navy/60">Fiyata dahil olmayanlar</label>
          <textarea id="excluded" name="excluded" rows={6} value={exc} onChange={(e) => setExc(e.target.value)} placeholder="Her satıra bir madde" className={input} />
        </div>
      </div>
      <div>
        <p className="mb-2 text-xs text-navy/55">Hızlı ekle: maddeye dokunup dahil ya da hariç listesine ekleyin. Ayrıntı ekleyebilirsiniz (ör. &quot;Yakıt (günde 4 saat)&quot;).</p>
        <ul className="flex flex-wrap gap-2">
          {SUGGEST.map((x) => (
            <li key={x} className="flex overflow-hidden rounded-full border border-navy/10 bg-mist text-xs">
              <span className="px-3 py-1.5 text-navy">{x}</span>
              <button type="button" onClick={() => setInc(add(inc, x))} className={chip(has(inc, x)) + " rounded-none border-0 border-l"} aria-label={`${x} dahil`}>✓ Dahil</button>
              <button type="button" onClick={() => setExc(add(exc, x))} className={chip(has(exc, x)) + " rounded-none border-0 border-l"} aria-label={`${x} hariç`}>✕ Hariç</button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
