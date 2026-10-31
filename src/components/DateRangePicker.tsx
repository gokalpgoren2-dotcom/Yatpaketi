"use client";

import { useState } from "react";

const MONTHS = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"];
const DAYS = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"];
const pad = (n: number) => String(n).padStart(2, "0");
const iso = (y: number, m: number, d: number) => `${y}-${pad(m + 1)}-${pad(d)}`;

export function todayIso() {
  const n = new Date();
  return iso(n.getFullYear(), n.getMonth(), n.getDate());
}

const short = (s: string) => new Date(s + "T00:00:00").toLocaleDateString("tr-TR", { day: "numeric", month: "short", year: "numeric" });

type Props = {
  start: string;
  end: string;
  onChange: (start: string, end: string) => void;
  label?: string;
  // Sonradan müsaitlik takvimi için: true dönen günler seçilemez.
  blocked?: (isoDate: string) => boolean;
};

// Tek takvimde giriş ve çıkış seçimi: önce girişe, sonra çıkışa dokunulur. Aradaki günler renklenir.
export function DateRangePicker({ start, end, onChange, label = "Tarih", blocked }: Props) {
  const today = todayIso();
  const base = start || today;
  const [open, setOpen] = useState(false);
  const [note, setNote] = useState("");
  const [view, setView] = useState({ y: Number(base.slice(0, 4)), m: Number(base.slice(5, 7)) - 1 });

  const first = (new Date(view.y, view.m, 1).getDay() + 6) % 7; // hafta Pazartesi başlar
  const days = new Date(view.y, view.m + 1, 0).getDate();
  const cells: (number | null)[] = [...Array(first).fill(null), ...Array.from({ length: days }, (_, i) => i + 1)];
  const canPrev = view.y > Number(today.slice(0, 4)) || view.m > Number(today.slice(5, 7)) - 1;

  function shift(delta: number) {
    const d = new Date(view.y, view.m + delta, 1);
    setView({ y: d.getFullYear(), m: d.getMonth() });
  }

  function anyBlocked(a: string, b: string) {
    if (!blocked) return false;
    const d = new Date(a + "T00:00:00");
    const e = new Date(b + "T00:00:00");
    for (; d <= e; d.setDate(d.getDate() + 1)) {
      if (blocked(iso(d.getFullYear(), d.getMonth(), d.getDate()))) return true;
    }
    return false;
  }

  function pick(day: string) {
    setNote("");
    if (!start || end || day < start) {
      onChange(day, "");
    } else if (anyBlocked(start, day)) {
      setNote("Bu aralıkta dolu günler var. Lütfen başka bir aralık seçin.");
      onChange(day, "");
    } else {
      onChange(start, day);
      setOpen(false);
    }
  }

  const summary = start && end ? `${short(start)} – ${short(end)}` : start ? `${short(start)} – çıkış tarihini seçin` : "Giriş ve çıkış tarihini seçin";

  return (
    <div>
      <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-navy/60">{label}</span>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-3 rounded-xl border border-navy/15 bg-white px-3 py-3 text-left text-base text-navy outline-none focus:border-turquoise focus:ring-2 focus:ring-turquoise/30"
      >
        <span className={start ? "font-medium" : "text-navy/50"}>{summary}</span>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-navy/60" aria-hidden>
          <rect x="3" y="5" width="18" height="16" rx="2" /><path d="M3 10h18M8 3v4M16 3v4" />
        </svg>
      </button>

      {open && (
        <div className="mt-2 rounded-2xl border border-navy/10 bg-white p-3 shadow-lg" role="group" aria-label="Takvim">
          <div className="mb-2 flex items-center justify-between">
            <button type="button" onClick={() => shift(-1)} disabled={!canPrev} aria-label="Önceki ay" className="flex h-10 w-10 items-center justify-center rounded-full text-xl text-navy hover:bg-mist disabled:opacity-30">‹</button>
            <span className="text-sm font-semibold text-navy" aria-live="polite">{MONTHS[view.m]} {view.y}</span>
            <button type="button" onClick={() => shift(1)} aria-label="Sonraki ay" className="flex h-10 w-10 items-center justify-center rounded-full text-xl text-navy hover:bg-mist">›</button>
          </div>
          <div className="grid grid-cols-7 text-center text-[11px] font-semibold uppercase text-navy/45">
            {DAYS.map((d) => <span key={d} className="py-1">{d}</span>)}
          </div>
          <div className="grid grid-cols-7 gap-y-1">
            {cells.map((d, i) => {
              if (d === null) return <span key={"e" + i} />;
              const day = iso(view.y, view.m, d);
              const off = day < today || Boolean(blocked?.(day));
              const isStart = day === start;
              const isEnd = day === end;
              const inRange = Boolean(start && end && day > start && day < end);
              return (
                <button
                  key={day}
                  type="button"
                  disabled={off}
                  onClick={() => pick(day)}
                  aria-pressed={isStart || isEnd}
                  aria-label={short(day)}
                  className={`mx-auto flex h-10 w-10 items-center justify-center text-sm tabular-nums transition ${
                    isStart || isEnd
                      ? "rounded-full bg-turquoise font-semibold text-white"
                      : inRange
                        ? "w-full rounded-none bg-turquoise/15 font-medium text-navy"
                        : off
                          ? "text-navy/25 line-through"
                          : day === today
                            ? "rounded-full font-semibold text-turquoise-dark ring-1 ring-turquoise/50 hover:bg-mist"
                            : "rounded-full text-navy hover:bg-mist"
                  }`}
                >
                  {d}
                </button>
              );
            })}
          </div>
          {note && <p role="alert" className="mt-2 rounded-lg bg-amber-50 px-3 py-2 text-xs font-medium text-amber-900">{note}</p>}
          <div className="mt-2 flex items-center justify-between px-1 text-xs text-navy/60">
            <span>{start && !end ? "Şimdi çıkış tarihine dokunun." : "Önce giriş, sonra çıkış tarihine dokunun."}</span>
            {start && <button type="button" onClick={() => { setNote(""); onChange("", ""); }} className="font-semibold text-turquoise-dark">Temizle</button>}
          </div>
        </div>
      )}
    </div>
  );
}
