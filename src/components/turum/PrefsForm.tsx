"use client";

import { useState } from "react";
import { savePrefs } from "@/app/musteri/actions";
import { ACTIVITIES, CELEBRATIONS, KVKK_HEALTH_CONSENT, MARKETS, SERVICES, type Prefs } from "@/lib/turum";
import { KvkkBox } from "./KvkkBox";

const lab = "text-sm font-semibold text-navy";
const hint = "mt-0.5 text-xs leading-relaxed text-navy/55";
const field = "mt-2 w-full rounded-xl border border-navy/10 bg-mist px-3.5 py-3 text-base text-navy outline-none transition focus:border-turquoise focus:bg-white focus:ring-2 focus:ring-turquoise/25 sm:text-sm";
const pill = (on: boolean) => `rounded-full border px-4 py-2 text-sm font-medium transition ${on ? "border-navy bg-navy text-white" : "border-navy/10 bg-white text-navy/75 hover:border-turquoise/60"}`;

function YesNo({ value, onChange }: { value?: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="mt-2 flex gap-2">
      <button type="button" onClick={() => onChange(false)} className={pill(value === false)} aria-pressed={value === false}>Yok</button>
      <button type="button" onClick={() => onChange(true)} className={pill(value === true)} aria-pressed={value === true}>Var</button>
    </div>
  );
}

export function PrefsForm({ initial, tourStart, tourEnd, consented, email }: { initial: Prefs; tourStart: string; tourEnd: string; consented: boolean; email: string }) {
  const [consent, setConsent] = useState(consented);
  const [p, setP] = useState<Prefs>(initial ?? {});
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const set = (patch: Partial<Prefs>) => { setP((x) => ({ ...x, ...patch })); setMsg(null); };
  const acts = p.activities ?? [];
  const toggleAct = (a: string) => set({ activities: acts.includes(a) ? acts.filter((x) => x !== a) : [...acts, a] });

  const health = Boolean(p.allergy?.has || p.chronic?.has);
  async function submit() {
    if (health && !consent) { setMsg({ ok: false, text: "Sağlık bilgilerini kaydedebilmemiz için açık rıza kutusunu işaretleyin." }); return; }
    setBusy(true);
    const r = await savePrefs(p, consent).catch(() => ({ ok: false, error: "Bağlantı hatası. Lütfen tekrar deneyin." }));
    setBusy(false);
    setMsg(r.ok ? { ok: true, text: "Tercihleriniz kaydedildi. Ekibimiz hazırlıkları buna göre yapacak." } : { ok: false, text: r.error ?? "Kaydedilemedi." });
  }

  return (
    <div className="mt-5 space-y-6">
      {/* Alışveriş */}
      <div>
        <p className={lab}>Alışveriş nereden yapılsın?</p>
        <p className={hint}>Kumanya alışverişi için tercih ettiğiniz market. Bölgeye göre seçenekler değişebilir; seçtiğiniz market yoksa en yakın alternatifi öneririz.</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {MARKETS.map(([v, l]) => <button key={v} type="button" onClick={() => set({ market: p.market === v ? "" : v })} className={pill(p.market === v)} aria-pressed={p.market === v}>{l}</button>)}
        </div>
      </div>

      {/* Sağlık */}
      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <p className={lab}>Alerji</p>
          <p className={hint}>Yiyecek, ilaç ya da başka bir şeye alerjisi olan misafir var mı?</p>
          <YesNo value={p.allergy?.has} onChange={(has) => set({ allergy: { ...p.allergy, has } })} />
          {p.allergy?.has && <textarea rows={2} value={p.allergy?.text ?? ""} onChange={(e) => set({ allergy: { ...p.allergy, has: true, text: e.target.value } })} placeholder="Kimde, neye alerji var?" className={field} />}
        </div>
        <div>
          <p className={lab}>Kronik hastalık</p>
          <p className={hint}>Mürettebatın bilmesi gereken bir sağlık durumu var mı? Yalnızca ekibimizle paylaşılır.</p>
          <YesNo value={p.chronic?.has} onChange={(has) => set({ chronic: { ...p.chronic, has } })} />
          {p.chronic?.has && <textarea rows={2} value={p.chronic?.text ?? ""} onChange={(e) => set({ chronic: { ...p.chronic, has: true, text: e.target.value } })} placeholder="Kimde, hangi durum? Varsa kullanılan ilaçlar" className={field} />}
        </div>
      </div>

      {health && <KvkkBox checked={consent} onChange={(v) => { setConsent(v); setMsg(null); }} label={KVKK_HEALTH_CONSENT} email={email} />}

      {/* Kutlama */}
      <div>
        <p className={lab}>Özel gün kutlaması</p>
        <p className={hint}>Tur sırasında kutlamak istediğiniz bir gün var mı? Pasta, süsleme gibi hazırlıkları önceden planlayalım.</p>
        <YesNo value={p.celebration?.has} onChange={(has) => set({ celebration: { ...p.celebration, has } })} />
        {p.celebration?.has && (
          <div className="mt-3 space-y-3 rounded-2xl bg-mist p-4">
            <div className="flex flex-wrap gap-2">
              {CELEBRATIONS.map((c) => <button key={c} type="button" onClick={() => set({ celebration: { ...p.celebration, has: true, type: c } })} className={pill(p.celebration?.type === c)} aria-pressed={p.celebration?.type === c}>{c}</button>)}
            </div>
            <div className="grid gap-3 sm:grid-cols-[12rem_1fr]">
              <label className="block text-xs font-semibold text-navy/60">Tarih
                <input type="date" min={tourStart} max={tourEnd} value={p.celebration?.date ?? ""} onChange={(e) => set({ celebration: { ...p.celebration, has: true, date: e.target.value } })} className={`${field} bg-white`} />
              </label>
              <label className="block text-xs font-semibold text-navy/60">Not
                <input value={p.celebration?.note ?? ""} onChange={(e) => set({ celebration: { ...p.celebration, has: true, note: e.target.value } })} placeholder="Kim için, sürpriz mi?" className={`${field} bg-white`} />
              </label>
            </div>
          </div>
        )}
      </div>

      {/* Hizmet tarzı */}
      <div>
        <p className={lab}>Tercih edilen hizmet tarzı</p>
        <p className={hint}>Mürettebatın size nasıl davranmasını istersiniz?</p>
        <div className="mt-2 grid gap-2 sm:grid-cols-3">
          {SERVICES.map(([v, l, d]) => (
            <button key={v} type="button" onClick={() => set({ service: v })} aria-pressed={p.service === v} className={`rounded-2xl border p-3.5 text-left transition ${p.service === v ? "border-navy bg-navy text-white" : "border-navy/10 bg-white text-navy hover:border-turquoise/60"}`}>
              <span className="block text-sm font-semibold">{l}</span>
              <span className={`mt-0.5 block text-xs ${p.service === v ? "text-white/70" : "text-navy/55"}`}>{d}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Aktiviteler */}
      <div>
        <p className={lab}>Aktiviteler</p>
        <p className={hint}>İlginizi çekenlerin hepsini seçebilirsiniz.</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {ACTIVITIES.map((a) => <button key={a} type="button" onClick={() => toggleAct(a)} className={pill(acts.includes(a))} aria-pressed={acts.includes(a)}>{a}</button>)}
        </div>
        {acts.includes("Diğer") && <textarea rows={2} value={p.activitiesOther ?? ""} onChange={(e) => set({ activitiesOther: e.target.value })} placeholder="Diğer varsa açıklayınız" className={field} />}
      </div>

      {/* Not */}
      <div>
        <p className={lab}>Eklemek istedikleriniz</p>
        <textarea rows={3} value={p.notes ?? ""} onChange={(e) => set({ notes: e.target.value })} placeholder="Ekibimizin bilmesini istediğiniz başka bir şey var mı?" className={field} />
      </div>

      {msg && <p role="status" className={`rounded-xl px-4 py-3 text-sm ${msg.ok ? "bg-emerald-50 text-emerald-800" : "bg-red-50 text-red-700"}`}>{msg.text}</p>}
      <button type="button" onClick={submit} disabled={busy} className="w-full rounded-xl bg-navy px-5 py-3.5 text-base font-semibold text-white transition hover:bg-navy-soft disabled:opacity-60 sm:w-auto">
        {busy ? "Kaydediliyor…" : "Tercihleri kaydet"}
      </button>
    </div>
  );
}
