"use client";

import { useState } from "react";
import { ReservationForm } from "./ReservationForm";
import { DateRangePicker } from "./DateRangePicker";
import { recordWhatsapp } from "@/app/tekneler/[slug]/talep";

const input = "w-full rounded-xl border border-navy/15 bg-white px-3 py-3 text-base text-navy outline-none focus:border-turquoise focus:ring-2 focus:ring-turquoise/30";
const lab = "mb-1 block text-xs font-semibold uppercase tracking-wide text-navy/60";

const fmt = (d: string) => new Date(d + "T00:00:00").toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" });

type Props = { boatSlug: string; boatName: string; maxGuests: number; whatsapp: string };

// Tekne sayfasındaki talep alanı: ana yol WhatsApp (hazır mesajla), ikinci yol form.
export function RequestPanel({ boatSlug, boatName, maxGuests, whatsapp }: Props) {
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [guests, setGuests] = useState(Math.min(2, maxGuests));
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  if (!whatsapp) return <ReservationForm boatSlug={boatSlug} boatName={boatName} maxGuests={maxGuests} />;

  function message() {
    const url = `${window.location.origin}/tekneler/${boatSlug}`;
    const lines = [
      `Merhaba, ${boatName} teknesi için rezervasyon talebi iletmek istiyorum.`,
      "",
      `Tarih: ${fmt(start)} – ${fmt(end)}`,
      `Misafir sayısı: ${guests}`,
    ];
    if (name.trim()) lines.push(`Ad soyad: ${name.trim()}`);
    lines.push("", `Tekne: ${url}`);
    return lines.join("\n");
  }

  function go(e: React.MouseEvent<HTMLAnchorElement>) {
    if (!start || !end) {
      e.preventDefault();
      setError("Lütfen giriş ve çıkış tarihini seçin.");
    } else if (end < start) {
      e.preventDefault();
      setError("Çıkış tarihi giriş tarihinden önce olamaz.");
    } else {
      setError("");
      void recordWhatsapp({ boat: boatSlug, name, start, end, guests }).catch(() => {}); // panele kayıt; WhatsApp açılışını etkilemez
    }
  }

  const href = start && end ? `https://wa.me/${whatsapp}?text=${encodeURIComponent(message())}` : "#";

  return (
    <div className="space-y-4">
      <DateRangePicker start={start} end={end} onChange={(a, b) => { setStart(a); setEnd(b); setError(""); }} />

      <div className="flex items-center justify-between rounded-xl border border-navy/15 px-4 py-2.5">
        <span className="text-sm font-medium text-navy">Misafir sayısı</span>
        <span className="flex items-center gap-3">
          <button type="button" aria-label="Misafir sayısını azalt" disabled={guests <= 1} onClick={() => setGuests((g) => Math.max(1, g - 1))} className="flex h-9 w-9 items-center justify-center rounded-full bg-mist text-xl font-semibold text-navy disabled:opacity-40">−</button>
          <span className="w-6 text-center text-lg font-semibold tabular-nums text-navy" aria-live="polite">{guests}</span>
          <button type="button" aria-label="Misafir sayısını artır" disabled={guests >= maxGuests} onClick={() => setGuests((g) => Math.min(maxGuests, g + 1))} className="flex h-9 w-9 items-center justify-center rounded-full bg-mist text-xl font-semibold text-navy disabled:opacity-40">+</button>
        </span>
      </div>

      <div><label className={lab} htmlFor="q-name">Adınız (isteğe bağlı)</label>
        <input id="q-name" value={name} onChange={(e) => setName(e.target.value)} maxLength={80} autoComplete="name" className={input} /></div>

      {error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700 ring-1 ring-red-200">{error}</p>}

      <a href={href} onClick={go} target="_blank" rel="noopener"
         className="flex items-center justify-center gap-3 rounded-2xl bg-[#25D366] px-6 py-4 text-base font-semibold text-white shadow-lg shadow-[#25D366]/30 transition hover:brightness-95 active:scale-[0.99]">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M3 21l1.6-4.6A8.5 8.5 0 1 1 8 19.5z" /></svg>
        WhatsApp ile talep gönder
      </a>
      <p className="text-center text-xs leading-relaxed text-navy/55">Hazır mesaj WhatsApp’ta açılır, göndermeden önce düzenleyebilirsiniz. Talebiniz kesin rezervasyon değildir; müsaitlik ve fiyat teyit edilir.</p>

      <details className="group rounded-xl border border-navy/10">
        <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-3 text-sm font-semibold text-navy">
          WhatsApp kullanmıyorsanız formu doldurun
          <span aria-hidden className="text-navy/50 transition group-open:rotate-180">⌄</span>
        </summary>
        <div className="border-t border-navy/10 p-4">
          <ReservationForm boatSlug={boatSlug} boatName={boatName} maxGuests={maxGuests} />
        </div>
      </details>
    </div>
  );
}
