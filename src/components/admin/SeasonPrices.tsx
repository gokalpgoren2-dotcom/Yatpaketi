"use client";

import { useState } from "react";
import { SEASONS, monthName } from "@/lib/pricing";

const input = "w-full rounded-xl border border-navy/15 bg-white px-3 py-3 text-base outline-none focus:border-turquoise focus:ring-2 focus:ring-turquoise/30";

// Nisan–Kasım her ay için günlük fiyat. Sezon kutusuna yazıp "Aylara uygula" deyince o sezonun aylarını doldurur.
export function SeasonPrices({ initial }: { initial: Record<string, number> }) {
  const [vals, setVals] = useState<Record<number, string>>(() => Object.fromEntries(Object.entries(initial ?? {}).map(([k, v]) => [Number(k), String(v)])));
  const [quick, setQuick] = useState<Record<string, string>>({});
  return (
    <div className="space-y-4">
      {SEASONS.map((se) => (
        <div key={se.key} className="rounded-2xl bg-mist p-4">
          <div className="flex flex-wrap items-end gap-2">
            <p className="mr-auto text-sm font-semibold text-navy">{se.tr} <span className="font-normal text-navy/50">({se.months.map((m) => monthName(m)).join(", ")})</span></p>
            <input type="number" inputMode="decimal" min={0} step="0.01" placeholder="Sezon fiyatı" value={quick[se.key] ?? ""} onChange={(e) => setQuick({ ...quick, [se.key]: e.target.value })} className="w-32 rounded-xl border border-navy/15 bg-white px-3 py-2 text-sm outline-none focus:border-turquoise" aria-label={`${se.tr} için tek fiyat`} />
            <button type="button" onClick={() => { const v = quick[se.key]; if (!v) return; setVals((x) => ({ ...x, ...Object.fromEntries(se.months.map((m) => [m, v])) })); }} className="rounded-xl border border-navy/15 bg-white px-3 py-2 text-xs font-semibold text-navy">Aylara uygula</button>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {se.months.map((m) => (
              <label key={m} className="block">
                <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-navy/60">{monthName(m)}</span>
                <input name={`mp_${m}`} type="number" inputMode="decimal" min={0} step="0.01" value={vals[m] ?? ""} onChange={(e) => setVals({ ...vals, [m]: e.target.value })} placeholder="Günlük" className={input} />
              </label>
            ))}
          </div>
        </div>
      ))}
      <p className="text-xs leading-relaxed text-navy/55">Fiyatlar günlüktür. Misafir tarih seçince her gece o ayın fiyatıyla toplanır, çıkış günü hesaba katılmaz. Vitrinde en düşük günlük fiyat görünür. Boş bıraktığınız aylar için misafire &quot;fiyat için bize yazın&quot; denir.</p>
    </div>
  );
}
