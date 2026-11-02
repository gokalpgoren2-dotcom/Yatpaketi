"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { answerShopping } from "@/app/musteri/actions";

// Alışveriş listesi altında: Onayla / Değişiklik iste
export function ShoppingAnswer({ id, approvedAt, changeAt, note }: { id: string; approvedAt?: string | null; changeAt?: string | null; note?: string | null }) {
  const router = useRouter();
  const [mode, setMode] = useState<"idle" | "change">("idle");
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const when = (d: string) => new Date(d).toLocaleString("tr-TR", { timeZone: "Europe/Istanbul", day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" });

  async function send(ok: boolean) {
    setBusy(true); setErr("");
    const r = await answerShopping(id, ok, ok ? "" : text).catch(() => ({ ok: false, error: "Bağlantı hatası. Lütfen tekrar deneyin." }));
    setBusy(false);
    if (!r.ok) { setErr(r.error ?? "Kaydedilemedi."); return; }
    setMode("idle"); setText("");
    router.refresh();
  }

  if (approvedAt) {
    return (
      <p className="mt-3 flex items-center gap-2 rounded-xl bg-emerald-50 px-3.5 py-2.5 text-sm font-medium text-emerald-800">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
        {when(approvedAt)} tarihinde onayladınız.
      </p>
    );
  }

  return (
    <div className="mt-3">
      {changeAt && note && (
        <p className="mb-3 rounded-xl bg-amber-50 px-3.5 py-2.5 text-sm text-amber-900"><b>Değişiklik isteğiniz iletildi:</b> {note}<br /><span className="text-xs text-amber-800/80">Ekibimiz listeyi güncelleyince tekrar onayınıza sunulacak.</span></p>
      )}
      {mode === "change" ? (
        <div className="space-y-2">
          <textarea value={text} onChange={(e) => setText(e.target.value)} rows={3} placeholder="Neyin eklenmesini, çıkarılmasını ya da değişmesini istersiniz?" className="w-full rounded-xl border border-navy/10 bg-white px-3.5 py-3 text-base text-navy outline-none focus:border-turquoise focus:ring-2 focus:ring-turquoise/25 sm:text-sm" />
          <div className="flex gap-2">
            <button type="button" onClick={() => send(false)} disabled={busy} className="flex-1 rounded-xl bg-navy px-4 py-3 text-sm font-semibold text-white disabled:opacity-60">{busy ? "Gönderiliyor…" : "İsteği gönder"}</button>
            <button type="button" onClick={() => { setMode("idle"); setErr(""); }} className="rounded-xl border border-navy/15 px-4 py-3 text-sm font-semibold text-navy">Vazgeç</button>
          </div>
        </div>
      ) : (
        <div className="flex gap-2">
          <button type="button" onClick={() => send(true)} disabled={busy} className="flex-1 rounded-xl bg-turquoise px-4 py-3 text-sm font-semibold text-white disabled:opacity-60">{busy ? "Kaydediliyor…" : "Listeyi onaylıyorum"}</button>
          <button type="button" onClick={() => setMode("change")} className="rounded-xl border border-navy/15 bg-white px-4 py-3 text-sm font-semibold text-navy">Değişiklik iste</button>
        </div>
      )}
      {err && <p role="alert" className="mt-2 text-sm text-red-700">{err}</p>}
    </div>
  );
}
