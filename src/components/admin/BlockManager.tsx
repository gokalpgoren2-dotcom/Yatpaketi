"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { DateRangePicker } from "@/components/DateRangePicker";
import { refreshSite } from "@/app/admin/(panel)/icerik/actions";

type Block = { id: string; start_date: string; end_date: string; kind: string; note: string | null };

const input = "w-full rounded-xl border border-navy/15 bg-white px-3 py-3 text-base outline-none focus:border-turquoise focus:ring-2 focus:ring-turquoise/30";
const lab = "mb-1 block text-xs font-semibold uppercase tracking-wide text-navy/60";
const fmt = (d: string) => new Date(d + "T00:00:00").toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" });

export function BlockManager({ boatId, initial }: { boatId: string; initial: Block[] }) {
  const supabase = createClient();
  const [blocks, setBlocks] = useState<Block[]>(initial);
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [kind, setKind] = useState("booked");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [confirm, setConfirm] = useState<string | null>(null);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const isBlocked = (d: string) => blocks.some((b) => d >= b.start_date && d <= b.end_date);

  async function reload() {
    const { data } = await supabase.from("availability_blocks").select("id,start_date,end_date,kind,note").eq("boat_id", boatId).order("start_date");
    setBlocks((data ?? []) as Block[]);
    await refreshSite();
  }

  async function add() {
    if (!start || !end) {
      setMsg({ ok: false, text: "Önce giriş ve çıkış tarihini seçin." });
      return;
    }
    setBusy(true);
    setMsg(null);
    const { error } = await supabase.from("availability_blocks").insert({ boat_id: boatId, start_date: start, end_date: end, kind, note: note.trim() || null });
    if (error) setMsg({ ok: false, text: "Kaydedilemedi: " + error.message });
    else {
      setStart("");
      setEnd("");
      setNote("");
      setMsg({ ok: true, text: "Eklendi. Bu günler sitede artık dolu görünür." });
      await reload();
    }
    setBusy(false);
  }

  async function remove(id: string) {
    setBusy(true);
    setMsg(null);
    const { error } = await supabase.from("availability_blocks").delete().eq("id", id);
    if (error) setMsg({ ok: false, text: "Silinemedi: " + error.message });
    else {
      setMsg({ ok: true, text: "Silindi. Bu günler tekrar müsait görünür." });
      await reload();
    }
    setConfirm(null);
    setBusy(false);
  }

  return (
    <div className="space-y-6" aria-live="polite">
      {msg && (
        <p role={msg.ok ? "status" : "alert"} className={`rounded-xl p-4 text-sm font-medium ${msg.ok ? "bg-green-50 text-green-800 ring-1 ring-green-200" : "bg-red-50 text-red-700 ring-1 ring-red-200"}`}>{msg.text}</p>
      )}

      <section className="space-y-4 rounded-2xl bg-white p-5 shadow-sm">
        <h2 className="font-semibold">Yeni kayıt ekle</h2>
        <DateRangePicker label="Dolu olacak günler" start={start} end={end} blocked={isBlocked} onChange={(a, b) => { setStart(a); setEnd(b); }} />
        <div>
          <label htmlFor="kind" className={lab}>Neden</label>
          <select id="kind" value={kind} onChange={(e) => setKind(e.target.value)} className={input}>
            <option value="booked">Kiralandı (dolu)</option>
            <option value="closed">Kapalı (bakım, sahibi kullanıyor vb.)</option>
          </select>
        </div>
        <div>
          <label htmlFor="note" className={lab}>Not (yalnızca siz görürsünüz)</label>
          <input id="note" value={note} onChange={(e) => setNote(e.target.value)} maxLength={200} placeholder="Örn. Ahmet Bey, haftalık" className={input} />
        </div>
        <button type="button" onClick={add} disabled={busy} className="w-full rounded-xl bg-turquoise px-6 py-4 text-base font-semibold text-white disabled:opacity-60 sm:w-auto">
          {busy ? "Kaydediliyor…" : "Dolu olarak ekle"}
        </button>
      </section>

      <section className="rounded-2xl bg-white p-5 shadow-sm">
        <h2 className="font-semibold">Kayıtlar</h2>
        {blocks.length === 0 ? (
          <p className="mt-3 text-sm text-navy/60">Henüz kayıt yok. Tüm günler müsait görünüyor.</p>
        ) : (
          <ul className="mt-3 divide-y divide-navy/10">
            {blocks.map((b) => (
              <li key={b.id} className="flex flex-wrap items-center justify-between gap-3 py-3 text-sm">
                <span className="min-w-0">
                  <span className="block font-medium">{fmt(b.start_date)} – {fmt(b.end_date)}</span>
                  <span className="block text-xs text-navy/55">{b.kind === "closed" ? "Kapalı" : "Kiralandı"}{b.note ? ` · ${b.note}` : ""}</span>
                </span>
                {confirm === b.id ? (
                  <span className="flex items-center gap-2">
                    <button type="button" disabled={busy} onClick={() => remove(b.id)} className="rounded-lg bg-red-700 px-3 py-2 text-xs font-semibold text-white">Evet, sil</button>
                    <button type="button" onClick={() => setConfirm(null)} className="rounded-lg border border-navy/15 px-3 py-2 text-xs font-semibold">Vazgeç</button>
                  </span>
                ) : (
                  <button type="button" onClick={() => setConfirm(b.id)} className="rounded-lg border border-navy/15 px-3 py-2 text-xs font-semibold text-red-700">Sil</button>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
