"use client";

import { useState } from "react";
import { saveGuests } from "@/app/musteri/actions";
import type { Guest } from "@/lib/turum";

const field = "w-full rounded-xl border border-navy/10 bg-white px-3 py-2.5 text-base text-navy outline-none transition focus:border-turquoise focus:ring-2 focus:ring-turquoise/25 sm:text-sm";
const lab = "block text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-navy/50";
const empty = (): Guest => ({ full_name: "", gender: "", birth_date: "", nationality: "", doc_type: "Pasaport", doc_no: "", phone: "" });

export function GuestsForm({ initial }: { initial: Guest[] }) {
  const [list, setList] = useState<Guest[]>(initial.length ? initial.map((g) => ({ ...empty(), ...g })) : [empty()]);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const upd = (i: number, patch: Partial<Guest>) => { setList((l) => l.map((g, k) => (k === i ? { ...g, ...patch } : g))); setMsg(null); };

  async function submit() {
    const filled = list.filter((g) => g.full_name.trim());
    if (filled.some((g) => !g.doc_no?.trim() || !g.nationality?.trim() || !g.birth_date)) {
      setMsg({ ok: false, text: "Transit log için her misafirin uyruğu, doğum tarihi ve kimlik/pasaport numarası gerekli." });
      return;
    }
    setBusy(true);
    const r = await saveGuests(filled).catch(() => ({ ok: false, error: "Bağlantı hatası. Lütfen tekrar deneyin." }));
    setBusy(false);
    setMsg(r.ok ? { ok: true, text: `${filled.length} misafir kaydedildi. Teşekkür ederiz.` } : { ok: false, text: r.error ?? "Kaydedilemedi." });
  }

  return (
    <div className="mt-5">
      <ol className="space-y-3">
        {list.map((g, i) => (
          <li key={i} className="rounded-2xl bg-mist p-4 ring-1 ring-navy/5">
            <div className="mb-3 flex items-center justify-between">
              <span className="flex items-center gap-2 text-sm font-semibold text-navy">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-navy text-xs text-white">{i + 1}</span>
                {i === 0 ? "Misafir (iletişim kişisi)" : "Misafir"}
              </span>
              {list.length > 1 && <button type="button" onClick={() => setList(list.filter((_, k) => k !== i))} className="text-xs font-semibold text-red-600">Kaldır</button>}
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="sm:col-span-2"><span className={lab}>Ad soyad (kimlikteki gibi)</span><input value={g.full_name} onChange={(e) => upd(i, { full_name: e.target.value })} className={`${field} mt-1`} autoComplete="off" /></label>
              <label><span className={lab}>Uyruk</span><input value={g.nationality ?? ""} onChange={(e) => upd(i, { nationality: e.target.value })} placeholder="örn. T.C." className={`${field} mt-1`} /></label>
              <label><span className={lab}>Doğum tarihi</span><input type="date" value={g.birth_date ?? ""} onChange={(e) => upd(i, { birth_date: e.target.value })} className={`${field} mt-1`} /></label>
              <label><span className={lab}>Belge türü</span>
                <select value={g.doc_type ?? "Pasaport"} onChange={(e) => upd(i, { doc_type: e.target.value })} className={`${field} mt-1`}>
                  <option>Pasaport</option><option>T.C. Kimlik</option>
                </select>
              </label>
              <label><span className={lab}>{g.doc_type === "T.C. Kimlik" ? "T.C. kimlik no" : "Pasaport no"}</span><input value={g.doc_no ?? ""} onChange={(e) => upd(i, { doc_no: e.target.value })} className={`${field} mt-1`} autoComplete="off" /></label>
              <label><span className={lab}>Cinsiyet</span>
                <select value={g.gender ?? ""} onChange={(e) => upd(i, { gender: e.target.value })} className={`${field} mt-1`}>
                  <option value="">Seçin</option><option>Kadın</option><option>Erkek</option>
                </select>
              </label>
              <label><span className={lab}>Telefon (isteğe bağlı)</span><input type="tel" value={g.phone ?? ""} onChange={(e) => upd(i, { phone: e.target.value })} className={`${field} mt-1`} /></label>
            </div>
          </li>
        ))}
      </ol>
      {list.length < 40 && (
        <button type="button" onClick={() => setList([...list, empty()])} className="mt-3 w-full rounded-2xl border-2 border-dashed border-navy/15 px-4 py-3 text-sm font-semibold text-navy/70 transition hover:border-turquoise hover:text-turquoise-dark">
          + Misafir ekle
        </button>
      )}
      {msg && <p role="status" className={`mt-4 rounded-xl px-4 py-3 text-sm ${msg.ok ? "bg-emerald-50 text-emerald-800" : "bg-red-50 text-red-700"}`}>{msg.text}</p>}
      <button type="button" onClick={submit} disabled={busy} className="mt-4 w-full rounded-xl bg-navy px-5 py-3.5 text-base font-semibold text-white transition hover:bg-navy-soft disabled:opacity-60 sm:w-auto">
        {busy ? "Kaydediliyor…" : "Misafir listesini kaydet"}
      </button>
    </div>
  );
}
