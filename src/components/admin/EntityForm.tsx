"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { shrink } from "@/lib/shrink";
import { slugify } from "@/lib/slug";
import { refreshSite } from "@/app/admin/(panel)/icerik/actions";

type Table = "destinations" | "categories";
export type EntityRow = {
  id: string; slug: string; name_tr: string; blurb_tr?: string | null; intro_tr: string | null; cover_path: string | null;
  seo_title: string | null; seo_description: string | null; sort_order: number; is_published?: boolean; is_featured?: boolean; is_active?: boolean;
};

const BASE = `${(() => { try { return new URL(process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").origin; } catch { return ""; } })()}/storage/v1/object/public/media/`;
const input = "w-full rounded-xl border border-navy/15 bg-white px-3 py-3 text-base outline-none focus:border-turquoise focus:ring-2 focus:ring-turquoise/30";
const lab = "mb-1 block text-xs font-semibold uppercase tracking-wide text-navy/60";

// Destinasyon ve tekne tipi (kategori) düzenleme formu. Kayıtlar tarayıcıdan, yönetici yetkisiyle yapılır (RLS korur).
export function EntityForm({ table, row, gallery: gallery0 = [] }: { table: Table; row: EntityRow | null; gallery?: string[] }) {
  const supabase = createClient();
  const tbl = table as "destinations";
  const router = useRouter();
  const file = useRef<HTMLInputElement>(null);
  const dest = table === "destinations";
  const back = dest ? "/admin/destinasyonlar" : "/admin/kategoriler";

  const [name, setName] = useState(row?.name_tr ?? "");
  const [slug, setSlug] = useState(row?.slug ?? "");
  const [blurb, setBlurb] = useState(row?.blurb_tr ?? "");
  const [intro, setIntro] = useState(row?.intro_tr ?? "");
  const [cover, setCover] = useState(row?.cover_path ?? "");
  const [seoTitle, setSeoTitle] = useState(row?.seo_title ?? "");
  const [seoDesc, setSeoDesc] = useState(row?.seo_description ?? "");
  const [sort, setSort] = useState(String(row?.sort_order ?? 0));
  const [on, setOn] = useState(dest ? row?.is_published ?? true : row?.is_active ?? true);
  const [featured, setFeatured] = useState(row?.is_featured ?? false);
  const [gallery, setGallery] = useState<string[]>(gallery0);
  const gfile = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const fail = (text: string) => { setMsg({ ok: false, text }); window.scrollTo({ top: 0, behavior: "smooth" }); setBusy(false); };

  async function pickCover(files: FileList | null) {
    const f = files?.[0];
    if (!f) return;
    setBusy(true); setMsg(null);
    try {
      const path = `site/${crypto.randomUUID()}.jpg`;
      const up = await supabase.storage.from("media").upload(path, await shrink(f), { contentType: "image/jpeg", cacheControl: "31536000" });
      if (up.error) throw new Error(up.error.message);
      setCover(path);
      setMsg({ ok: true, text: "Fotoğraf yüklendi. Kaydet'e basınca eklenir." });
    } catch (e) {
      setMsg({ ok: false, text: "Fotoğraf yüklenemedi: " + (e instanceof Error ? e.message : "bilinmeyen hata") });
    }
    setBusy(false);
    if (file.current) file.current.value = "";
  }

  async function pickGallery(files: FileList | null) {
    if (!files || files.length === 0) return;
    setBusy(true); setMsg(null);
    try {
      const added: string[] = [];
      for (const f of Array.from(files).slice(0, 8 - gallery.length)) {
        const path = `site/${crypto.randomUUID()}.jpg`;
        const up = await supabase.storage.from("media").upload(path, await shrink(f), { contentType: "image/jpeg", cacheControl: "31536000" });
        if (up.error) throw new Error(up.error.message);
        added.push(path);
      }
      setGallery((g) => [...g, ...added]);
      setMsg({ ok: true, text: "Fotoğraflar yüklendi. Kaydet'e basınca eklenir." });
    } catch (e) {
      setMsg({ ok: false, text: "Fotoğraf yüklenemedi: " + (e instanceof Error ? e.message : "bilinmeyen hata") });
    }
    setBusy(false);
    if (gfile.current) gfile.current.value = "";
  }
  const moveG = (i: number, d: number) => setGallery((g) => { const a = [...g]; const j = i + d; if (j < 0 || j >= a.length) return a; [a[i], a[j]] = [a[j], a[i]]; return a; });

  async function save() {
    setBusy(true);
    setMsg(null);
    const n = name.trim();
    if (!n) { fail("Ad zorunlu."); return; }
    const s = row ? row.slug : slugify(slug.trim() || n);
    if (!s) { fail("Adres oluşturulamadı."); return; }
    const order = Number(sort.replace(",", "."));
    if (!Number.isFinite(order)) { fail("Sıra bir sayı olmalı."); return; }

    const data: Record<string, unknown> = {
      slug: s, name_tr: n, intro_tr: intro.trim() || null, cover_path: cover || null,
      seo_title: seoTitle.trim() || null, seo_description: seoDesc.trim() || null, sort_order: order,
    };
    if (dest) { data.blurb_tr = blurb.trim() || null; data.is_published = on; data.is_featured = featured; }
    else { data.is_active = on; }

    let newId: string | null = null;
    let errMsg = "";
    let errCode = "";
    if (row) {
      const r = await supabase.from(tbl).update(data).eq("id", row.id);
      if (r.error) { errMsg = r.error.message; errCode = r.error.code ?? ""; }
    } else {
      const r = await supabase.from(tbl).insert(data).select("id").single();
      if (r.error || !r.data) { errMsg = r.error ? r.error.message : "Kayıt oluşturulamadı"; errCode = r.error?.code ?? ""; }
      else newId = String((r.data as { id: string }).id);
    }
    if (errMsg) {
      fail(errCode === "23505" ? "Bu adres başka bir kayıtta kullanılıyor." : "Kaydedilemedi: " + errMsg + (errMsg.includes("column") ? " (Önce Supabase'e kategori SQL kodunu yapıştırın.)" : ""));
      return;
    }
    if (dest) {
      const key = row ? row.slug : s;
      const cur = await supabase.from("site_texts").select("data").eq("key", "port_photos").maybeSingle();
      const all = { ...((cur.data?.data as Record<string, string[]>) ?? {}), [key]: gallery };
      const g = await supabase.from("site_texts").upsert({ key: "port_photos", data: all, updated_at: new Date().toISOString() });
      if (g.error) { fail("Galeri kaydedilemedi: " + g.error.message); return; }
    }
    await refreshSite();
    if (newId) { router.push(back + "/" + newId); return; }
    setMsg({ ok: true, text: "Kaydedildi." });
    window.scrollTo({ top: 0, behavior: "smooth" });
    router.refresh();
    setBusy(false);
  }

  return (
    <div className="space-y-6" aria-live="polite">
      {msg && <p role={msg.ok ? "status" : "alert"} className={`rounded-xl p-4 text-sm font-medium ${msg.ok ? "bg-green-50 text-green-800 ring-1 ring-green-200" : "bg-red-50 text-red-700 ring-1 ring-red-200"}`}>{msg.text}</p>}

      <section className="space-y-4 rounded-2xl bg-white p-5 shadow-sm">
        <div><label htmlFor="name" className={lab}>{dest ? "Liman adı *" : "Tekne tipi adı *"}</label><input id="name" value={name} onChange={(e) => setName(e.target.value)} className={input} /></div>
        <div>
          <label htmlFor="slug" className={lab}>Adres (slug)</label>
          <input id="slug" value={slug} onChange={(e) => setSlug(e.target.value)} disabled={Boolean(row)} className={`${input} disabled:bg-mist disabled:text-navy/60`} />
          <p className="mt-1 text-xs text-navy/50">{row ? "Adres, mevcut bağlantıların bozulmaması için değiştirilemez." : "Boş bırakırsanız addan oluşur."}</p>
        </div>
        {dest && <div><label htmlFor="blurb" className={lab}>Kısa açıklama (kartlarda görünür)</label><input id="blurb" value={blurb} onChange={(e) => setBlurb(e.target.value)} maxLength={80} className={input} /></div>}
        <div>
          <label htmlFor="intro" className={lab}>Tanıtım metni</label>
          <textarea id="intro" rows={9} value={intro} onChange={(e) => setIntro(e.target.value)} className={`${input} text-sm leading-relaxed`} />
          <p className="mt-1 text-xs text-navy/55">Paragraflar arasında boş satır bırakın. Başlık: <code>## </code>, liste: <code>- </code>, kalın: <code>**kalın**</code>.</p>
        </div>
      </section>

      <section className="rounded-2xl bg-white p-5 shadow-sm">
        <h2 className="font-semibold">Fotoğraf</h2>
        <div className="mt-3 overflow-hidden rounded-xl bg-mist">
          {cover ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={BASE + cover} alt="" className="aspect-[16/9] w-full object-cover" />
          ) : <p className="p-8 text-center text-sm text-navy/50">Fotoğraf yok. Renkli bir çizim görünür.</p>}
        </div>
        <input ref={file} type="file" accept="image/*" hidden onChange={(e) => pickCover(e.target.files)} />
        <div className="mt-3 flex gap-2">
          <button type="button" disabled={busy} onClick={() => file.current?.click()} className="rounded-xl border border-navy/15 px-4 py-2.5 text-sm font-semibold disabled:opacity-50">{cover ? "Fotoğrafı değiştir" : "Fotoğraf seç"}</button>
          {cover && <button type="button" disabled={busy} onClick={() => setCover("")} className="rounded-xl border border-navy/15 px-4 py-2.5 text-sm font-semibold text-red-700">Kaldır</button>}
        </div>
      </section>

      {dest && (
        <section className="rounded-2xl bg-white p-5 shadow-sm">
          <h2 className="font-semibold">Galeri (ek fotoğraflar)</h2>
          <p className="mt-1 text-xs text-navy/55">Liman sayfasında, metnin altında görünür. En fazla 8 fotoğraf. İlk fotoğraf büyük gösterilir.</p>
          {gallery.length > 0 && (
            <ul className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {gallery.map((g, i) => (
                <li key={g} className="overflow-hidden rounded-xl bg-mist">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={BASE + g} alt="" className="aspect-[4/3] w-full object-cover" />
                  <div className="flex justify-between gap-1 p-1.5 text-xs">
                    <button type="button" onClick={() => moveG(i, -1)} className="rounded-lg border border-navy/15 px-2 py-1">←</button>
                    <button type="button" onClick={() => setGallery(gallery.filter((x) => x !== g))} className="rounded-lg border border-navy/15 px-2 py-1 text-red-700">Kaldır</button>
                    <button type="button" onClick={() => moveG(i, 1)} className="rounded-lg border border-navy/15 px-2 py-1">→</button>
                  </div>
                </li>
              ))}
            </ul>
          )}
          <input ref={gfile} type="file" accept="image/*" multiple hidden onChange={(e) => pickGallery(e.target.files)} />
          <button type="button" disabled={busy || gallery.length >= 8} onClick={() => gfile.current?.click()} className="mt-3 rounded-xl border border-navy/15 px-4 py-2.5 text-sm font-semibold disabled:opacity-50">Fotoğraf ekle</button>
        </section>
      )}

      <section className="space-y-4 rounded-2xl bg-white p-5 shadow-sm">
        <h2 className="font-semibold">Yayın ve Google</h2>
        <label className="flex items-center gap-3 text-sm"><input type="checkbox" checked={on} onChange={(e) => setOn(e.target.checked)} className="h-5 w-5" /> {dest ? "Sitede yayınla" : "Sitede göster"}</label>
        {dest && <label className="flex items-center gap-3 text-sm"><input type="checkbox" checked={featured} onChange={(e) => setFeatured(e.target.checked)} className="h-5 w-5" /> Öne çıkan</label>}
        <div><label htmlFor="sort" className={lab}>Sıra (küçük sayı önce gelir)</label><input id="sort" value={sort} onChange={(e) => setSort(e.target.value)} inputMode="numeric" className={input} /></div>
        <div><label htmlFor="seot" className={lab}>Google başlığı</label><input id="seot" value={seoTitle} onChange={(e) => setSeoTitle(e.target.value)} maxLength={70} className={input} /></div>
        <div><label htmlFor="seod" className={lab}>Google açıklaması</label><textarea id="seod" rows={2} value={seoDesc} onChange={(e) => setSeoDesc(e.target.value)} maxLength={170} className={input} /></div>
      </section>

      <button type="button" onClick={save} disabled={busy} className="w-full rounded-xl bg-turquoise px-6 py-4 text-base font-semibold text-white disabled:opacity-60 sm:w-auto">{busy ? "Bekleyin…" : "Kaydet"}</button>
    </div>
  );
}
