"use client";

import { useState, useTransition } from "react";
import { submitReservation } from "@/app/tekneler/[slug]/talep";
import { DateRangePicker } from "./DateRangePicker";

const input = "w-full rounded-xl border border-navy/15 bg-white px-3 py-3 text-base text-navy outline-none focus:border-turquoise focus:ring-2 focus:ring-turquoise/30";
const lab = "mb-1 block text-xs font-semibold uppercase tracking-wide text-navy/60";

export function ReservationForm({ boatSlug, boatName, maxGuests }: { boatSlug: string; boatName: string; maxGuests: number }) {
  const [t0] = useState(() => Date.now());
  const [pending, begin] = useTransition();
  const [result, setResult] = useState<{ ok: boolean; message?: string; debug?: string } | null>(null);
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!start || !end) {
      setResult({ ok: false, message: "Lütfen giriş ve çıkış tarihini seçin." });
      return;
    }
    const fd = new FormData(e.currentTarget);
    fd.set("elapsed", String(Date.now() - t0));
    setResult(null);
    begin(async () => {
      const r = await submitReservation(fd);
      setResult(r.ok ? { ok: true, debug: r.debug } : { ok: false, message: r.message });
    });
  }

  if (result?.ok) {
    return (
      <div role="status" className="rounded-xl bg-green-50 p-5 text-sm text-green-900 ring-1 ring-green-200">
        <p className="font-semibold">Talebiniz alındı.</p>
        <p className="mt-2 leading-relaxed">Bu bir kesin rezervasyon değildir. Müsaitlik ve fiyat teyit edildikten sonra sizinle iletişime geçeceğiz.</p>
        {result.debug && <p className="mt-2 rounded-lg bg-white p-2 font-mono text-xs">{result.debug}</p>}
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3" aria-label={`${boatName} rezervasyon talebi`}>
      <input type="hidden" name="boat" value={boatSlug} />
      {/* Botları yakalamak için gizli alan: gerçek kullanıcılar görmez ve doldurmaz. */}
      <div aria-hidden className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label>Web sitesi<input type="text" name="website" tabIndex={-1} autoComplete="off" /></label>
      </div>
      <div><label className={lab} htmlFor="r-name">Ad soyad *</label>
        <input id="r-name" name="name" required minLength={2} maxLength={100} autoComplete="name" className={input} /></div>
      <div><label className={lab} htmlFor="r-phone">Telefon</label>
        <input id="r-phone" name="phone" type="tel" inputMode="tel" maxLength={40} autoComplete="tel" className={input} /></div>
      <div><label className={lab} htmlFor="r-email">E-posta</label>
        <input id="r-email" name="email" type="email" maxLength={200} autoComplete="email" className={input} /></div>
      <p className="text-xs text-navy/50">Telefon veya e-postadan en az birini yazın.</p>
      <DateRangePicker start={start} end={end} onChange={(a, b) => { setStart(a); setEnd(b); }} />
      <input type="hidden" name="start" value={start} />
      <input type="hidden" name="end" value={end} />
      <div><label className={lab} htmlFor="r-guests">Misafir sayısı *</label>
        <input id="r-guests" name="guests" type="number" required min={1} max={maxGuests} defaultValue={Math.min(2, maxGuests)} inputMode="numeric" className={input} /></div>
      <div><label className={lab} htmlFor="r-msg">Mesaj</label>
        <textarea id="r-msg" name="message" rows={3} maxLength={2000} className={input} /></div>
      <label className="flex items-start gap-3 text-xs leading-relaxed text-navy/70">
        <input type="checkbox" name="consent" required className="mt-0.5 h-5 w-5 shrink-0" />
        Bilgilerimin, bu talebi yanıtlamak amacıyla yatpaketi tarafından işlenmesini kabul ediyorum.
      </label>
      {result && !result.ok && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700 ring-1 ring-red-200">{result.message}</p>}
      <button type="submit" disabled={pending} className="w-full rounded-xl bg-turquoise px-6 py-4 text-base font-semibold text-white transition hover:bg-turquoise-dark disabled:opacity-60">
        {pending ? "Gönderiliyor…" : "Rezervasyon Talebi Gönder"}
      </button>
      <p className="text-xs leading-relaxed text-navy/50">Talebiniz kesin rezervasyon oluşturmaz. Müsaitlik ve fiyat teyit edildikten sonra rezervasyon kesinleşir.</p>
    </form>
  );
}
