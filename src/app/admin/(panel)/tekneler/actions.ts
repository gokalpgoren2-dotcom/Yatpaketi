"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin";
import { slugify } from "@/lib/slug";
import { formatEquipment, formatToy } from "@/lib/boatOptions";

const str = (fd: FormData, k: string) => {
  const v = String(fd.get(k) ?? "").trim();
  return v === "" ? null : v;
};
const num = (fd: FormData, k: string) => {
  const v = str(fd, k);
  if (v === null) return null;
  const n = Number(v.replace(",", "."));
  return Number.isFinite(n) ? n : NaN;
};
const lines = (fd: FormData, k: string) =>
  String(fd.get(k) ?? "").split(/\r?\n/).map((s) => s.trim()).filter(Boolean);

function fail(id: string | null, msg: string): never {
  const base = id ? `/admin/tekneler/${id}` : "/admin/tekneler/yeni";
  redirect(`${base}?error=${encodeURIComponent(msg)}&t=${Date.now()}`);
}

export async function saveBoat(formData: FormData) {
  const { supabase } = await requireAdmin();
  const id = str(formData, "id");

  const name = str(formData, "name");
  if (!name) fail(id, "Yat adı zorunlu.");
  const slug = slugify(str(formData, "slug") ?? name!);
  if (!slug) fail(id, "Adres (slug) oluşturulamadı.");

  const year = num(formData, "year");
  const refit = num(formData, "refit_year");
  const length = num(formData, "length_m");
  const width = num(formData, "width_m");
  const cabins = num(formData, "cabins") ?? 0;
  const guests = num(formData, "guests") ?? 1;
  const crew = num(formData, "crew") ?? 0;
  // Aylık günlük fiyatlar (Nisan–Kasım)
  const monthly: Record<string, number> = {};
  for (const m of [4, 5, 6, 7, 8, 9, 10, 11]) {
    const v = num(formData, `mp_${m}`);
    if (v !== null && !Number.isNaN(v) && v > 0) monthly[String(m)] = v;
  }
  const mvals = Object.values(monthly);
  // Haftalık fiyat farklıysa (kutu işaretli) her ay için haftalık fiyat: "w4".."w11"
  if (formData.get("weekly_on") === "on") {
    for (const m of [4, 5, 6, 7, 8, 9, 10, 11]) {
      const v = num(formData, `mpw_${m}`);
      if (v !== null && !Number.isNaN(v) && v > 0) monthly[`w${m}`] = v;
    }
  }
  // APA yüzdesi (yalnızca 20/30/40)
  const apa = Number(formData.get("apa"));
  if ([5, 15, 20, 30, 35, 40].includes(apa)) (monthly as Record<string, number>).apa = apa;
  const pd = mvals.length ? Math.min(...mvals) : null; // vitrin/eski kod için en düşük günlük fiyat
  const pw = null;
  const sort = num(formData, "sort_order") ?? 0;
  const nums = [year, refit, length, width, cabins, guests, crew, pd, pw, sort];
  if (nums.some((n) => n !== null && Number.isNaN(n))) fail(id, "Sayı alanlarında geçersiz değer var.");
  if ([cabins, guests, crew, pd ?? 0, pw ?? 0, length ?? 0, width ?? 0].some((n) => (n as number) < 0)) fail(id, "Negatif değer girilemez.");
  if (guests < 1) fail(id, "Misafir sayısı en az 1 olmalı.");
  const maxYear = new Date().getFullYear() + 1;
  if (year !== null && (year < 1950 || year > maxYear)) fail(id, "Yapım yılı geçersiz.");
  if (refit !== null && (refit < 1950 || refit > maxYear)) fail(id, "Yenileme yılı geçersiz.");

  const priceMode = str(formData, "price_mode") === "ask" ? "ask" : "show";
  const currencyRaw = str(formData, "currency");
  const currency = currencyRaw === "TRY" || currencyRaw === "USD" ? currencyRaw : "EUR";

  const row = {
    name,
    slug,
    category_id: str(formData, "category_id"),
    brand: str(formData, "brand"),
    model: str(formData, "model"),
    year,
    refit_year: refit,
    length_m: length,
    width_m: width,
    cabins,
    guests,
    crew,
    captain_included: formData.get("captain_included") === "on",
    home_port: str(formData, "home_port"),
    description_tr: str(formData, "description_tr"),
    description_en: str(formData, "description_en"),
    equipment: Array.from(new Set([
      ...formData.getAll("equipment_std").map(String).filter(Boolean).map((n) => formatEquipment(n, String(formData.get(`ed:${n}`) ?? "").slice(0, 80))),
      ...lines(formData, "equipment"),
    ])),
    water_sports: Array.from(new Set([
      ...formData.getAll("water_sports").map(String).filter(Boolean).map((n) => {
        const q = Math.floor(Number(String(formData.get(`wq:${n}`) ?? "").replace(",", ".")));
        return formatToy(n, Number.isFinite(q) && q > 0 ? Math.min(q, 99) : null);
      }),
      ...lines(formData, "water_sports_other"),
    ])),
    price_mode: priceMode,
    currency,
    price_daily: pd,
    price_weekly: pw,
    monthly_prices: monthly,
    included: lines(formData, "included").slice(0, 40),
    excluded: lines(formData, "excluded").slice(0, 40),
    vat_mode: ["included", "excluded"].includes(String(formData.get("vat_mode"))) ? String(formData.get("vat_mode")) : "none",
    vat_rate: Math.min(100, Math.max(0, num(formData, "vat_rate") ?? 20)) || 20,
    is_published: formData.get("is_published") === "on",
    is_featured: formData.get("is_featured") === "on",
    sort_order: sort,
    seo_title: str(formData, "seo_title"),
    seo_description: str(formData, "seo_description"),
  };

  let boatId = id;
  if (id) {
    const { error } = await supabase.from("boats").update(row).eq("id", id);
    if (error) fail(id, error.code === "23505" ? "Bu adres (slug) başka bir yatta kullanılıyor." : error.message.includes("monthly_prices") ? "Önce Supabase'de aylik-fiyat.sql dosyasını çalıştırın." : /included|excluded|vat_/.test(error.message) ? "Önce Supabase'de yat-dahil-kdv.sql dosyasını çalıştırın." : "Kaydedilemedi: " + error.message);
  } else {
    const { data, error } = await supabase.from("boats").insert(row).select("id").single();
    if (error || !data) fail(null, error?.code === "23505" ? "Bu adres (slug) başka bir yatta kullanılıyor." : (error?.message ?? "").includes("monthly_prices") ? "Önce Supabase'de aylik-fiyat.sql dosyasını çalıştırın." : /included|excluded|vat_/.test(error?.message ?? "") ? "Önce Supabase'de yat-dahil-kdv.sql dosyasını çalıştırın." : "Kaydedilemedi: " + (error?.message ?? ""));
    boatId = data!.id as string;
  }

  // Destinasyonları eşitle
  const destIds = formData.getAll("destinations").map(String).filter(Boolean);
  await supabase.from("boat_destinations").delete().eq("boat_id", boatId!);
  if (destIds.length > 0) {
    const { error } = await supabase.from("boat_destinations").insert(destIds.map((d) => ({ boat_id: boatId!, destination_id: d })));
    if (error) fail(boatId, "Yat kaydedildi ama limanlar kaydedilemedi: " + error.message);
  }

  revalidatePath("/");
  revalidatePath("/tekneler");
  revalidatePath("/admin/tekneler");
  redirect(`/admin/tekneler/${boatId}?saved=1&t=${Date.now()}`);
}

export async function setPublished(formData: FormData) {
  const { supabase } = await requireAdmin();
  const id = String(formData.get("id"));
  await supabase.from("boats").update({ is_published: formData.get("value") === "true" }).eq("id", id);
  revalidatePath("/tekneler");
  revalidatePath("/admin/tekneler");
  redirect("/admin/tekneler");
}

export async function setFeatured(formData: FormData) {
  const { supabase } = await requireAdmin();
  const id = String(formData.get("id"));
  await supabase.from("boats").update({ is_featured: formData.get("value") === "true" }).eq("id", id);
  revalidatePath("/");
  revalidatePath("/admin/tekneler");
  redirect("/admin/tekneler");
}

export async function deleteBoat(formData: FormData) {
  const { supabase } = await requireAdmin();
  const id = String(formData.get("id"));
  const { data: imgs } = await supabase.from("boat_images").select("path").eq("boat_id", id);
  if (imgs && imgs.length > 0) await supabase.storage.from("media").remove(imgs.map((i: { path: string }) => i.path));
  const { error } = await supabase.from("boats").delete().eq("id", id);
  if (error) redirect(`/admin/tekneler/${id}?error=${encodeURIComponent("Silinemedi: " + error.message)}`);
  revalidatePath("/");
  revalidatePath("/tekneler");
  redirect("/admin/tekneler?deleted=1");
}

export async function bulkSetPublished(formData: FormData) {
  const { supabase } = await requireAdmin();
  const ids = formData.getAll("ids").map(String).filter(Boolean).slice(0, 200);
  const value = String(formData.get("value")) === "true";
  const back = String(formData.get("back") ?? "/admin/tekneler");
  const safeBack = back.startsWith("/admin/tekneler") ? back : "/admin/tekneler";
  const sep = safeBack.includes("?") ? "&" : "?";
  if (ids.length === 0) redirect(`${safeBack}${sep}bulk=none`);
  const { error } = await supabase.from("boats").update({ is_published: value }).in("id", ids);
  revalidatePath("/admin/tekneler");
  revalidatePath("/tekneler");
  if (error) redirect(`${safeBack}${sep}bulk=err`);
  redirect(`${safeBack}${sep}bulk=${value ? "pub" : "unpub"}&n=${ids.length}`);
}

// Filtredeki (arama/durum/kategori/bilgi) tüm yatları yayına alır. En fazla 500 yat.
export async function publishFiltered(formData: FormData) {
  const { supabase } = await requireAdmin();
  const back = String(formData.get("back") ?? "/admin/tekneler");
  const safeBack = back.startsWith("/admin/tekneler") ? back : "/admin/tekneler";
  const sep = safeBack.includes("?") ? "&" : "?";
  if (String(formData.get("onay")) !== "evet") redirect(`${safeBack}${sep}bulk=onay`);
  const q = String(formData.get("q") ?? "").trim().slice(0, 60).replace(/[%,()*]/g, " ").trim();
  const kat = String(formData.get("kat") ?? "");
  const bilgi = String(formData.get("bilgi") ?? "");
  let sel = supabase.from("boats").select("id").eq("is_published", false).limit(500);
  if (q) sel = sel.ilike("name", `%${q}%`);
  if (kat) sel = sel.eq("category_id", kat);
  if (bilgi === "dolu") sel = sel.not("year", "is", null);
  const { data, error } = await sel;
  const ids = (data ?? []).map((r: { id: string }) => r.id);
  if (error || ids.length === 0) redirect(`${safeBack}${sep}bulk=${error ? "err" : "none"}`);
  const { error: e2 } = await supabase.from("boats").update({ is_published: true }).in("id", ids);
  revalidatePath("/admin/tekneler");
  revalidatePath("/tekneler");
  if (e2) redirect(`${safeBack}${sep}bulk=err`);
  redirect(`${safeBack}${sep}bulk=pub&n=${ids.length}`);
}
