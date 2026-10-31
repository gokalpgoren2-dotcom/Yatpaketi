"use client";

import { useState } from "react";

const MONTHS = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"];
const DAYS = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"];
const pad = (n: number) => String(n).padStart(2, "0");
const iso = (y: number, m: number, d: number) => `${y}-${pad(m + 1)}-${pad(d)}`;

// Salt okunur müsaitlik takvimi: dolu günler çizili ve gri görünür.
export function AvailabilityCalendar({ ranges }: { ranges: { start: string; end: string }[] }) {
  const n = new Date();
  const today = iso(n.getFullYear(), n.getMonth(), n.getDate());
  const [view, setView] = useState({ y: n.getFullYear(), m: n.getMonth() });
  const first = (new Date(view.y, view.m, 1).getDay() + 6) % 7;
  const days = new Date(view.y, view.m + 1, 0).getDate();
  const cells: (number | null)[] = [...Array(first).fill(null), ...Array.from({ length: days }, (_, i) => i + 1)];
  const busy = (d: string) => ranges.some((r) => d >= r.start && d <= r.end);
  const canPrev = view.y > n.getFullYear() || view.m > n.getMonth();
  const shift = (delta: number) => {
    const d = new Date(view.y, view.m + delta, 1);
    setView({ y: d.getFullYear(), m: d.getMonth() });
  };

  return (
    <div className="max-w-sm rounded-2xl border border-navy/10 p-4">
      <div className="mb-2 flex items-center justify-between">
        <button type="button" onClick={() => shift(-1)} disabled={!canPrev} aria-label="Önceki ay" className="flex h-10 w-10 items-center justify-center rounded-full text-xl hover:bg-mist disabled:opacity-30">‹</button>
        <span className="text-sm font-semibold text-navy" aria-live="polite">{MONTHS[view.m]} {view.y}</span>
        <button type="button" onClick={() => shift(1)} aria-label="Sonraki ay" className="flex h-10 w-10 items-center justify-center rounded-full text-xl hover:bg-mist">›</button>
      </div>
      <div className="grid grid-cols-7 text-center text-[11px] font-semibold uppercase text-navy/45">
        {DAYS.map((d) => <span key={d} className="py-1">{d}</span>)}
      </div>
      <div className="grid grid-cols-7 gap-y-1">
        {cells.map((d, i) => {
          if (d === null) return <span key={"e" + i} />;
          const day = iso(view.y, view.m, d);
          const past = day < today;
          const full = !past && busy(day);
          return (
            <span
              key={day}
              title={full ? "Dolu" : past ? "" : "Müsait"}
              className={`mx-auto flex h-9 w-9 items-center justify-center rounded-full text-sm tabular-nums ${
                full ? "bg-navy/10 text-navy/40 line-through" : past ? "text-navy/25" : "font-medium text-navy"
              }`}
            >
              {d}
            </span>
          );
        })}
      </div>
      <p className="mt-3 flex items-center gap-4 text-xs text-navy/60">
        <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-full border border-navy/30" /> Müsait</span>
        <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-full bg-navy/15" /> Dolu</span>
      </p>
    </div>
  );
}
