"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { refreshSite } from "@/app/admin/(panel)/icerik/actions";
import type { Field } from "@/lib/text-fields";

type Data = { tr: Record<string, any>; en: Record<string, any> };
type Lang = "tr" | "en";
const input = "w-full rounded-xl border border-navy/15 bg-white px-3 py-3 text-base outline-none focus:border-turquoise focus:ring-2 focus:ring-turquoise/30";
const lab = "mb-1 block text-xs font-semibold uppercase tracking-wide text-navy/60";
const btn = "rounded-xl border border-navy/15 px-3 py-2 text-sm font-semibold disabled:opacity-40";


export function CultureEditor({ initial, saved, storeKey, fields, defaults }: { initial: Data; saved: boolean; storeKey: string; fields: Field[]; defaults: Data }) {
  const supabase = createClient();
  const [data, setData] = useState<Data>(JSON.parse(JSON.stringify(initial)));
  const [lang, setLang] = useState<Lang>("tr");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const d = data[lang] as Record<string, any>;

  const put = (key: string, value: any) => setData((p) => ({ ...p, [lang]: { ...p[lang], [key]: value } }) as Data);

  async function save() {
    setBusy(true); setMsg(null);
    const { error } = await supabase.from("site_texts").upsert({ key: storeKey, data, updated_at: new Date().toISOString() });
    if (error) { setMsg({ ok: false, text: "Kaydedilemedi: " + error.message }); setBusy(false); window.scrollTo({ top: 0, behavior: "smooth" }); return; }
    await refreshSite();
    setMsg({ ok: true, text: "Kaydedildi. Sayfa birkaç dakika içinde güncellenir." });
    setBusy(false); window.scrollTo({ top: 0, behavior: "smooth" });
  }
  async function reset() {
    if (!confirm("Tüm metinler ilk haline dönsün mü? Yaptığınız değişiklikler silinir.")) return;
    setBusy(true);
    const { error } = await supabase.from("site_texts").delete().eq("key", storeKey);
    if (error) { setMsg({ ok: false, text: "Sıfırlanamadı: " + error.message }); setBusy(false); return; }
    await refreshSite();
    setData(JSON.parse(JSON.stringify(defaults)));
    setMsg({ ok: true, text: "İlk haline döndürüldü." });
    setBusy(false);
  }

  return (
    <div className="space-y-5" aria-live="polite">
      {msg && <p role={msg.ok ? "status" : "alert"} className={`rounded-xl p-4 text-sm font-medium ${msg.ok ? "bg-green-50 text-green-800 ring-1 ring-green-200" : "bg-red-50 text-red-700 ring-1 ring-red-200"}`}>{msg.text}</p>}

      <div className="flex gap-2" role="tablist">
        {(["tr", "en"] as Lang[]).map((l) => (
          <button key={l} type="button" role="tab" aria-selected={lang === l} onClick={() => setLang(l)} className={`rounded-full px-5 py-2.5 text-sm font-semibold ring-1 ${lang === l ? "bg-navy text-white ring-navy" : "bg-white text-navy ring-navy/15"}`}>{l === "tr" ? "Türkçe" : "English"}</button>
        ))}
      </div>

      <div className="space-y-4">
        {fields.map((f) => {
          const v = d[f.key];
          return (
            <section key={f.key} className="rounded-2xl bg-white p-5 shadow-sm">
              <h2 className={lab}>{f.label}</h2>
              {f.kind === "line" && <input value={v ?? ""} onChange={(e) => put(f.key, e.target.value)} className={input} />}
              {f.kind === "long" && <textarea rows={3} value={v ?? ""} onChange={(e) => put(f.key, e.target.value)} className={input} />}
              {f.kind === "paras" && (
                <div className="space-y-3">
                  {(v as string[]).map((t, i) => (
                    <div key={i} className="flex gap-2">
                      <textarea rows={4} value={t} onChange={(e) => put(f.key, (v as string[]).map((x, k) => (k === i ? e.target.value : x)))} className={input} />
                      <button type="button" className={`${btn} self-start text-red-700`} onClick={() => put(f.key, (v as string[]).filter((_, k) => k !== i))}>Sil</button>
                    </div>
                  ))}
                  <button type="button" className={btn} onClick={() => put(f.key, [...(v as string[]), ""])}>+ Paragraf ekle</button>
                </div>
              )}
              {(f.kind === "pairs" || f.kind === "fixed") && (
                <div className="space-y-3">
                  {(v as string[][]).map((row, i) => (
                    <div key={i} className="space-y-2 rounded-xl bg-mist p-3">
                      {row.map((cell, j) => {
                        const locked = f.kind === "fixed" && j === row.length - 1 && (f.key === "gu" || f.key === "chips");
                        return (
                          <div key={j}>
                            <label className={lab}>{f.labels?.[j]}</label>
                            {j >= 1 && f.kind === "pairs" ? (
                              <textarea rows={3} value={cell} onChange={(e) => put(f.key, (v as string[][]).map((r, k) => (k === i ? r.map((c, m) => (m === j ? e.target.value : c)) : r)))} className={input} />
                            ) : (
                              <input value={cell} disabled={locked} onChange={(e) => put(f.key, (v as string[][]).map((r, k) => (k === i ? r.map((c, m) => (m === j ? e.target.value : c)) : r)))} className={`${input} ${locked ? "bg-navy/5 text-navy/50" : ""}`} />
                            )}
                          </div>
                        );
                      })}
                      {f.kind === "pairs" && <button type="button" className={`${btn} text-red-700`} onClick={() => put(f.key, (v as string[][]).filter((_, k) => k !== i))}>Bu kartı sil</button>}
                    </div>
                  ))}
                  {f.kind === "pairs" && <button type="button" className={btn} onClick={() => put(f.key, [...(v as string[][]), ["", ""]])}>+ Ekle</button>}
                </div>
              )}
            </section>
          );
        })}
      </div>

      <div className="flex flex-wrap gap-3">
        <button type="button" onClick={save} disabled={busy} className="rounded-xl bg-turquoise px-6 py-3 text-base font-semibold text-white disabled:opacity-60">{busy ? "Bekleyin…" : "Kaydet"}</button>
        {saved && <button type="button" onClick={reset} disabled={busy} className={`${btn} text-red-700`}>İlk haline döndür</button>}
      </div>
      <p className="text-xs text-navy/50">Türkçe ve İngilizce metinler tek seferde kaydedilir. Her iki dili de kontrol edin.</p>
    </div>
  );
}
