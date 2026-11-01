"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { shrink } from "@/lib/shrink";
import { slugify } from "@/lib/slug";
import { refreshSite } from "@/app/admin/(panel)/icerik/actions";

export type PostRow = {
  id: string; kind: string; slug: string; title_tr: string; excerpt_tr: string | null; content_tr: string | null;
  cover_path: string | null; seo_title: string | null; seo_description: string | null; status: string; sort_order: number; published_at: string | null;
};

const BASE = `${(() => { try { return new URL(process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").origin; } catch { return ""; } })()}/storage/v1/object/public/media/`;
const input = "w-full rounded-xl border border-navy/15 bg-white px-3 py-3 text-base outline-none focus:border-turquoise focus:ring-2 focus:ring-turquoise/30";
const lab = "mb-1 block text-xs font-semibold uppercase tracking-wide text-navy/60";
// Sabit sayfa adresleri, sitedeki gerçek bölümlerle çakışmasın.
const RESERVED = ["admin", "tekneler", "destinasyonlar", "limanlar", "rotalar", "tur-paketleri", "kiralama-sureci", "rehber", "blog", "api", "sitemap", "robots", "login"];

export function PostForm({ post }: { post: PostRow | null }) {
  const supabase = createClient();
  const router = useRouter();
  const file = useRef<HTMLInputElement>(null);
  const [kind, setKind] = useState(post?.kind ?? "guide");
  const [title, setTitle] = useState(post?.title_tr ?? "");
  const [slug, setSlug] = useState(post?.slug ?? "");
  const [excerpt, setExcerpt] = useState(post?.excerpt_tr ?? "");
  const [content, setContent] = useState(post?.content_tr ?? "");
  const [cover, setCover] = useState(post?.cover_path ?? "");
  const [seoTitle, setSeoTitle] = useState(post?.seo_title ?? "");
  const [seoDesc, setSeoDesc] = useState(post?.seo_description ?? "");
  const [sort, setSort] = useState(String(post?.sort_order ?? 0));
  const [published, setPublished] = useState(post?.status === "published");
  const [busy, setBusy] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const fail = (text: string) => { setMsg({ ok: false, text }); window.scrollTo({ top: 0, behavior: "smooth" }); setBusy(false); };

  async function pickCover(files: FileList | null) {
    const f = files?.[0];
    if (!f) return;
    setBusy(true); setMsg(null);
    try {
      const path = `posts/${crypto.randomUUID()}.jpg`;
      const up = await supabase.storage.from("media").upload(path, await shrink(f), { contentType: "image/jpeg", cacheControl: "31536000" });
      if (up.error) throw new Error(up.error.message);
      setCover(path);
      setMsg({ ok: true, text: "Kapak fotoğrafı yüklendi. Kaydet'e basınca yazıya eklenir." });
    } catch (e) {
      setMsg({ ok: false, text: "Fotoğraf yüklenemedi: " + (e instanceof Error ? e.message : "bilinmeyen hata") });
    }
    setBusy(false);
    if (file.current) file.current.value = "";
  }

  async function save() {
    setBusy(true); setMsg(null);
    const t = title.trim();
    if (!t) return fail("Başlık zorunlu.");
    const s = slugify(slug.trim() || t);
    if (!s) return fail("Adres oluşturulamadı.");
    if (kind === "page" && RESERVED.includes(s)) return fail("Bu adres sitenin başka bir bölümünde kullanılıyor, başka bir adres yazın.");
    const n = Number(sort.replace(",", "."));
    if (!Number.isFinite(n)) return fail("Sıra bir sayı olmalı.");

    const row = {
      kind, slug: s, title_tr: t, excerpt_tr: excerpt.trim() || null, content_tr: content.trim() || null,
      cover_path: cover || null, seo_title: seoTitle.trim() || null, seo_description: seoDesc.trim() || null,
      status: published ? "published" : "draft", sort_order: n,
      published_at: published ? post?.published_at ?? new Date().toISOString() : null,
    };
    const res = post
      ? await supabase.from("blog_posts").update(row).eq("id", post.id).select("id").single()
      : await supabase.from("blog_posts").insert(row).select("id").single();
    if (res.error || !res.data) return fail(res.error?.code === "23505" ? "Bu adres başka bir yazıda kullanılıyor." : "Kaydedilemedi: " + (res.error?.message ?? ""));
    await refreshSite();
    if (!post) { router.push(`/admin/yazilar/${res.data.id}?saved=1`); return; }
    setSlug(s);
    setMsg({ ok: true, text: published ? "Kaydedildi. Yazı sitede yayında." : "Kaydedildi. Yazı taslak olarak duruyor, sitede görünmez." });
    window.scrollTo({ top: 0, behavior: "smooth" });
    router.refresh();
    setBusy(false);
  }

  async function remove() {
    if (!post) return;
    setBusy(true);
    const { error } = await supabase.from("blog_posts").delete().eq("id", post.id);
    if (error) { setConfirm(false); return fail("Silinemedi: " + error.message); }
    await refreshSite();
    router.push("/admin/yazilar");
  }

  return (
    <div className="space-y-6" aria-live="polite">
      {msg && <p role={msg.ok ? "status" : "alert"} className={`rounded-xl p-4 text-sm font-medium ${msg.ok ? "bg-green-50 text-green-800 ring-1 ring-green-200" : "bg-red-50 text-red-700 ring-1 ring-red-200"}`}>{msg.text}</p>}

      <section className="space-y-4 rounded-2xl bg-white p-5 shadow-sm">
        <div>
          <label htmlFor="kind" className={lab}>Yazı türü</label>
          <select id="kind" value={kind} onChange={(e) => setKind(e.target.value)} className={input}>
            <option value="guide">Rehber yazısı (Yatpaketi Rehberi)</option>
            <option value="blog">Blog yazısı</option>
            <option value="page">Sabit sayfa (Hakkımızda, SSS gibi)</option>
            <option value="destination">Destinasyon tanıtımı (Yatpaketi Rehberi)</option>
            <option value="route">Klasik rota (Yatpaketi Rehberi)</option>
            <option value="package">Tur paketi (Yatpaketi Rehberi)</option>
            <option value="process">Kiralama süreci adımı (Yatpaketi Rehberi)</option>
          </select>
        </div>
        <div><label htmlFor="title" className={lab}>Başlık *</label><input id="title" value={title} onChange={(e) => setTitle(e.target.value)} className={input} /></div>
        <div>
          <label htmlFor="slug" className={lab}>Adres (slug)</label>
          <input id="slug" value={slug} onChange={(e) => setSlug(e.target.value)} className={input} />
          <p className="mt-1 text-xs text-navy/50">Boş bırakırsanız başlıktan otomatik oluşur. Örnek: mavi-yolculuk-nedir. Kiralama süreci adımları “Sıra” numarasına göre dizilir.</p>
        </div>
        <div><label htmlFor="excerpt" className={lab}>Kısa özet</label><textarea id="excerpt" rows={2} value={excerpt} onChange={(e) => setExcerpt(e.target.value)} maxLength={300} className={input} /></div>
      </section>

      <section className="space-y-3 rounded-2xl bg-white p-5 shadow-sm">
        <label htmlFor="content" className={lab}>Metin</label>
        <textarea id="content" rows={16} value={content} onChange={(e) => setContent(e.target.value)} className={`${input} font-mono text-sm leading-relaxed`} />
        <p className="text-xs leading-relaxed text-navy/55">
          Paragraflar arasında bir boş satır bırakın. Başlık için satırın başına <code>## </code>, alt başlık için <code>### </code> yazın. Liste için her satırın başına <code>- </code> koyun.
          Kalın yazı: <code>**kalın**</code>. Bağlantı: <code>[yazı](/tekneler)</code>.
        </p>
      </section>

      <section className="rounded-2xl bg-white p-5 shadow-sm">
        <h2 className="font-semibold">Kapak fotoğrafı</h2>
        <div className="mt-3 overflow-hidden rounded-xl bg-mist">
          {cover ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={BASE + cover} alt="Kapak" className="aspect-[16/9] w-full object-cover" />
          ) : <p className="p-8 text-center text-sm text-navy/50">Fotoğraf yok. Renkli bir çizim görünür.</p>}
        </div>
        <input ref={file} type="file" accept="image/*" hidden onChange={(e) => pickCover(e.target.files)} />
        <div className="mt-3 flex gap-2">
          <button type="button" disabled={busy} onClick={() => file.current?.click()} className="rounded-xl border border-navy/15 px-4 py-2.5 text-sm font-semibold disabled:opacity-50">{cover ? "Fotoğrafı değiştir" : "Fotoğraf seç"}</button>
          {cover && <button type="button" disabled={busy} onClick={() => setCover("")} className="rounded-xl border border-navy/15 px-4 py-2.5 text-sm font-semibold text-red-700">Kaldır</button>}
        </div>
      </section>

      <section className="space-y-4 rounded-2xl bg-white p-5 shadow-sm">
        <h2 className="font-semibold">Yayın ve Google</h2>
        <label className="flex items-center gap-3 text-sm"><input type="checkbox" checked={published} onChange={(e) => setPublished(e.target.checked)} className="h-5 w-5" /> Sitede yayınla (kapalıysa taslaktır)</label>
        <div><label htmlFor="sort" className={lab}>Sıra (küçük sayı önce gelir)</label><input id="sort" value={sort} onChange={(e) => setSort(e.target.value)} inputMode="numeric" className={input} /></div>
        <div><label htmlFor="seot" className={lab}>Google başlığı</label><input id="seot" value={seoTitle} onChange={(e) => setSeoTitle(e.target.value)} maxLength={70} className={input} /></div>
        <div><label htmlFor="seod" className={lab}>Google açıklaması</label><textarea id="seod" rows={2} value={seoDesc} onChange={(e) => setSeoDesc(e.target.value)} maxLength={170} className={input} /></div>
      </section>

      <button type="button" onClick={save} disabled={busy} className="w-full rounded-xl bg-turquoise px-6 py-4 text-base font-semibold text-white disabled:opacity-60 sm:w-auto">{busy ? "Bekleyin…" : "Kaydet"}</button>

      {post && (
        <details className="rounded-2xl border border-red-200 bg-white p-5">
          <summary className="cursor-pointer text-sm font-semibold text-red-700">Yazıyı sil</summary>
          <p className="mt-3 text-sm text-navy/70">Bu işlem yazıyı kalıcı olarak siler. Sadece sitede göstermek istemiyorsanız “Sitede yayınla”yı kapatın.</p>
          {confirm ? (
            <div className="mt-4 flex gap-2">
              <button type="button" onClick={remove} disabled={busy} className="rounded-xl bg-red-700 px-5 py-3 text-sm font-semibold text-white">Evet, kalıcı olarak sil</button>
              <button type="button" onClick={() => setConfirm(false)} className="rounded-xl border border-navy/15 px-5 py-3 text-sm font-semibold">Vazgeç</button>
            </div>
          ) : <button type="button" onClick={() => setConfirm(true)} className="mt-4 rounded-xl border border-red-300 px-5 py-3 text-sm font-semibold text-red-700">Sil</button>}
        </details>
      )}
    </div>
  );
}
