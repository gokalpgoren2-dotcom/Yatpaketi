"use client";

import { useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { shrink } from "@/lib/shrink";
import { refreshSite } from "@/app/admin/(panel)/icerik/actions";
import { reviewPhotoUrl } from "@/lib/reviews";
import { Stars } from "@/components/Reviews";

export type AdminReview = { id: string; boat_slug: string | null; boat_name: string; author_name: string; rating: number; body: string; photo_path: string | null; tour_label: string | null; status: "pending" | "approved" | "rejected"; source: "customer" | "admin"; created_at: string };
type Boat = { slug: string; name: string };

const input = "w-full rounded-xl border border-navy/15 bg-white px-3 py-3 text-base outline-none focus:border-turquoise focus:ring-2 focus:ring-turquoise/30";
const lab = "mb-1 block text-xs font-semibold uppercase tracking-wide text-navy/60";
const btn = "rounded-xl border border-navy/15 px-4 py-2.5 text-sm font-semibold disabled:opacity-40";
const TABS = [["pending", "Bekleyen"], ["approved", "Yayında"], ["rejected", "Reddedilen"]] as const;

export function ReviewsAdmin({ initial, boats }: { initial: AdminReview[]; boats: Boat[] }) {
  const supabase = createClient();
  const fileRef = useRef<HTMLInputElement>(null);
  const [items, setItems] = useState(initial);
  const [tab, setTab] = useState<"pending" | "approved" | "rejected">(initial.some((r) => r.status === "pending") ? "pending" : "approved");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [adding, setAdding] = useState(false);
  const [f, setF] = useState({ name: "", boat: "", rating: 5, body: "", month: "", photo: null as Blob | null });

  const counts = { pending: 0, approved: 0, rejected: 0 };
  items.forEach((r) => (counts[r.status] += 1));

  async function patch(id: string, p: Partial<AdminReview>, text: string) {
    setBusy(true); setMsg(null);
    const { error } = await supabase.from("reviews").update(p).eq("id", id);
    if (error) setMsg({ ok: false, text: "Olmadı: " + error.message });
    else { setItems((l) => l.map((r) => (r.id === id ? { ...r, ...p } : r))); await refreshSite(); setMsg({ ok: true, text }); }
    setBusy(false);
  }
  const boatPatch = (id: string, slug: string) => {
    const b = boats.find((x) => x.slug === slug);
    setItems((l) => l.map((r) => (r.id === id ? { ...r, boat_slug: slug || null, boat_name: b?.name ?? r.boat_name } : r)));
  };
  async function approve(r: AdminReview) {
    await patch(r.id, { status: "approved", boat_slug: r.boat_slug, boat_name: r.boat_name }, "Yorum yayınlandı.");
  }
  async function remove(r: AdminReview) {
    if (!confirm("Bu yorum kalıcı olarak silinsin mi?")) return;
    setBusy(true);
    const { error } = await supabase.from("reviews").delete().eq("id", r.id);
    if (error) setMsg({ ok: false, text: "Silinemedi: " + error.message });
    else {
      if (r.photo_path) await supabase.storage.from("reviews").remove([r.photo_path]).catch(() => undefined);
      setItems((l) => l.filter((x) => x.id !== r.id)); await refreshSite(); setMsg({ ok: true, text: "Yorum silindi." });
    }
    setBusy(false);
  }

  async function pickPhoto(files: FileList | null) {
    const file = files?.[0];
    if (!file) return;
    try { setF((s) => ({ ...s, photo: null })); const blob = await shrink(file); setF((s) => ({ ...s, photo: blob })); }
    catch { setMsg({ ok: false, text: "Fotoğraf kullanılamadı." }); }
    if (fileRef.current) fileRef.current.value = "";
  }
  async function add() {
    if (f.name.trim().length < 2 || f.body.trim().length < 10) { setMsg({ ok: false, text: "Ad ve en az 10 karakterlik yorum gerekli." }); return; }
    setBusy(true); setMsg(null);
    let path: string | null = null;
    if (f.photo) {
      path = `a/${crypto.randomUUID()}.jpg`;
      const up = await supabase.storage.from("reviews").upload(path, f.photo, { contentType: "image/jpeg" });
      if (up.error) { setMsg({ ok: false, text: "Fotoğraf yüklenemedi: " + up.error.message }); setBusy(false); return; }
    }
    const b = boats.find((x) => x.slug === f.boat);
    const row = { boat_slug: b?.slug ?? null, boat_name: b?.name ?? "", author_name: f.name.trim(), rating: f.rating, body: f.body.trim(), photo_path: path, tour_label: /^\d{4}-\d{2}$/.test(f.month) ? f.month : null, status: "approved", source: "admin" };
    const { data, error } = await supabase.from("reviews").insert(row).select("id,boat_slug,boat_name,author_name,rating,body,photo_path,tour_label,status,source,created_at").single();
    if (error || !data) setMsg({ ok: false, text: "Eklenemedi: " + (error?.message ?? "") });
    else { setItems((l) => [data as AdminReview, ...l]); await refreshSite(); setMsg({ ok: true, text: "Yorum eklendi ve yayınlandı." }); setAdding(false); setF({ name: "", boat: "", rating: 5, body: "", month: "", photo: null }); setTab("approved"); }
    setBusy(false);
  }

  const list = items.filter((r) => r.status === tab);
  return (
    <div className="space-y-5" aria-live="polite">
      {msg && <p role={msg.ok ? "status" : "alert"} className={`rounded-xl p-4 text-sm font-medium ${msg.ok ? "bg-green-50 text-green-800 ring-1 ring-green-200" : "bg-red-50 text-red-700 ring-1 ring-red-200"}`}>{msg.text}</p>}
      <div className="flex flex-wrap items-center gap-2">
        {TABS.map(([k, l]) => (
          <button key={k} type="button" onClick={() => setTab(k)} aria-pressed={tab === k} className={`rounded-full px-4 py-2 text-sm font-semibold ${tab === k ? "bg-navy text-white" : "bg-white ring-1 ring-navy/15"}`}>{l} ({counts[k]})</button>
        ))}
        <button type="button" onClick={() => setAdding((v) => !v)} className={`${btn} ml-auto bg-white`}>{adding ? "Vazgeç" : "+ Yorum ekle"}</button>
      </div>

      {adding && (
        <div className="space-y-4 rounded-2xl bg-white p-5 shadow-sm">
          <p className="text-sm text-navy/65">Gerçek bir misafirin size ilettiği yorumu (ör. WhatsApp'tan) burada ekleyebilirsiniz. Misafirin onayını almayı unutmayın.</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <div><label className={lab}>Misafir adı</label><input className={input} value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} placeholder="Ayşe K." /></div>
            <div><label className={lab}>Yat</label><select className={input} value={f.boat} onChange={(e) => setF({ ...f, boat: e.target.value })}><option value="">Seçilmedi</option>{boats.map((b) => <option key={b.slug} value={b.slug}>{b.name}</option>)}</select></div>
          </div>
          <div><label className={lab}>Puan</label><div className="flex gap-1">{[1, 2, 3, 4, 5].map((n) => <button key={n} type="button" aria-label={`${n} yıldız`} onClick={() => setF({ ...f, rating: n })} className="p-1"><svg viewBox="0 0 24 24" width="32" height="32" fill="currentColor" className={n <= f.rating ? "text-[#f5a623]" : "text-navy/15"}><path d="M12 2.5l2.9 6.1 6.6.8-4.9 4.6 1.3 6.6L12 17.2 6.1 20.6l1.3-6.6L2.5 9.4l6.6-.8z" /></svg></button>)}</div></div>
          <div><label className={lab}>Yorum</label><textarea rows={4} className={input} value={f.body} onChange={(e) => setF({ ...f, body: e.target.value })} maxLength={1200} /></div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div><label className={lab}>Tur ayı (isteğe bağlı)</label><input type="month" className={input} value={f.month} onChange={(e) => setF({ ...f, month: e.target.value })} /></div>
            <div>
              <label className={lab}>Fotoğraf (isteğe bağlı)</label>
              <input ref={fileRef} type="file" accept="image/*" hidden onChange={(e) => pickPhoto(e.target.files)} />
              <button type="button" className={btn} onClick={() => fileRef.current?.click()}>{f.photo ? "Fotoğraf seçildi ✓" : "Fotoğraf seç"}</button>
            </div>
          </div>
          <button type="button" disabled={busy} onClick={add} className="rounded-xl bg-turquoise px-6 py-3 text-base font-semibold text-white disabled:opacity-60">{busy ? "Bekleyin…" : "Ekle ve yayınla"}</button>
        </div>
      )}

      <ul className="space-y-3">
        {list.map((r) => {
          const photo = reviewPhotoUrl(r.photo_path);
          return (
            <li key={r.id} className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-navy/5">
              <div className="flex flex-wrap items-center gap-3">
                <Stars value={r.rating} />
                <b>{r.author_name}</b>
                <span className="text-xs text-navy/50">{r.source === "admin" ? "Elle eklendi" : "Müşteriden"} · {new Date(r.created_at).toLocaleDateString("tr-TR")}</span>
              </div>
              <p className="mt-3 whitespace-pre-line text-navy/80">{r.body}</p>
              {photo && /* eslint-disable-next-line @next/next/no-img-element */ <img src={photo} alt="" className="mt-3 aspect-[4/3] w-full max-w-xs rounded-xl object-cover" />}
              <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
                <div>
                  <label className={lab}>Hangi yat sayfasında görünsün?</label>
                  <select className={input} value={r.boat_slug ?? ""} onChange={(e) => boatPatch(r.id, e.target.value)}>
                    <option value="">Yat seçilmedi (sitede görünmez)</option>
                    {boats.map((b) => <option key={b.slug} value={b.slug}>{b.name}</option>)}
                  </select>
                </div>
                <div className="flex flex-wrap gap-2">
                  {r.status !== "approved" && <button type="button" disabled={busy || !r.boat_slug} onClick={() => approve(r)} className="rounded-xl bg-turquoise px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-40">Onayla</button>}
                  {r.status === "approved" && <button type="button" disabled={busy} onClick={() => approve(r)} className={btn}>Yatı kaydet</button>}
                  {r.status !== "rejected" && <button type="button" disabled={busy} onClick={() => patch(r.id, { status: "rejected" }, "Yorum reddedildi, sitede görünmez.")} className={btn}>{r.status === "approved" ? "Yayından kaldır" : "Reddet"}</button>}
                  <button type="button" disabled={busy} onClick={() => remove(r)} className={`${btn} text-red-700`}>Sil</button>
                </div>
              </div>
              {r.status !== "approved" && !r.boat_slug && <p className="mt-2 text-xs text-navy/55">Onaylamak için önce yatı seçin.</p>}
            </li>
          );
        })}
        {list.length === 0 && <li className="rounded-2xl bg-white p-6 text-center text-sm text-navy/55 shadow-sm">Bu bölümde yorum yok.</li>}
      </ul>
    </div>
  );
}
