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
export function EntityForm({ table, row }: { table: Table; row: EntityRow | null }) {
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

  async function save() {
    setBusy(true); setMsg(null);
    const n = name.trim();
    if (!n) return fail("Ad zorunlu.");
    const s = row ? row.slug : slugify(slug.trim() || n);
    if (!s) return fail("Adres oluşturulamadı.");
    const order = Number(sort.replace(",", "."));
    if (!Number.isFinite(order)) return fail("Sıra bir sayı olmalı.");

    const common = { slug: s, name_tr: n, intro_tr: intro.trim() || null, cover_path: cover || null, seo_title: seoTitle.trim() || null, seo_description: seoDesc.trim() || null, sort_order: order };
    const data = dest
      ? { ...common, blurb_tr: blurb.trim() || null, is_published: on, is_featured: featured }
      : { ...common, is_active: on };
    const res = row
      ? await supabase.from(tbl).update(data).eq("id", row.id).select("id").single()
      : await supabase.from(tbl).insert(data).select("id").single();
    if (res.error || !res.data) {
      const m = res.error?.message ?? "";
      return fail(res.error?.code === "23505" ? "Bu adres başka bir kayıtta kullanılıyor." : "Kaydedilemedi: " + m + (m.includes("column") ? " (Önce Supabase'e kategori SQL kodunu yapıştırın.)" : ""));
    }
    await refreshSite();
    if (!row) { router.push(`${back}/${res.data.id}`); return; }
    setMsg({ ok: true, text: "Kaydedildi." });
    window.scrollTo({ top: 0, behavior: "smooth" });
    router.refresh();
    setBusy(false);
  }

  return null;
}
